;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.autocrop = factory()
}(this, (function () {
  const autoCropDefaultOptions = {
    bgColor: '#FFFFFF',
    alphaTolerance: 20,
    colorTolerance: 20,
    invertTolerance: 0.90,
    margin: '2%',
    allowInvert: true,
    marker: 'cropped'
  };

  function getIsBgColorFunc(bgColor, colorTolerance) {
    const tr = parseInt(bgColor.substring(1, 3), 16);
    const tg = parseInt(bgColor.substring(3, 5), 16);
    const tb = parseInt(bgColor.substring(5, 7), 16);

    return (pixel) => {
      return (Math.abs(tr - pixel[0]) + Math.abs(tg - pixel[1]) + Math.abs(tb - pixel[2]) <= colorTolerance);
    }
  }

  function getIsTransparentFunc(alphaTolerance) {
    return (pixel) => {
      return (pixel[3] <= alphaTolerance);
    }
  }

  function autoCrop(original, target, options) {
    options = Object.assign(autoCropDefaultOptions, options);
    if (original.getAttribute(options.marker)) return;

    // If target is null, replace the original image
    if (target === undefined) {
      target = original
    }

    // Prepare new image object for per-pixel testing
    let image = new Image();
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');

    image.onload = () => {
      let width = image.width;
      let height = image.height;

      // Fit canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw the original image
      context.drawImage(image, 0, 0);

      // Get raw pixel data
      let pixels = context.getImageData(0, 0, width, height).data;

      // Prepare functions
      const isBgColor = getIsBgColorFunc(options.bgColor, options.colorTolerance);
      const isTransparent = getIsTransparentFunc(options.alphaTolerance);

      // Loop over to get corner coordinates
      let bgRect = {
        sx: -1, sy: -1, ex: -1, ey: -1,
      };
      let trRect = {
        sx: -1, sy: -1, ex: -1, ey: -1,
      };

      // We will run two worksets
      const workSet = [
        {func: isBgColor, r: bgRect, c: 0},     // Crop by background color
        {func: isTransparent, r: trRect, c: 0}, // Crop by transparency
      ];

      let c = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const pixel = pixels.slice(c, c + 4);

          workSet.forEach((w) => {
            if (!w.func(pixel)) {
              if (w.r.sx === -1 || w.r.sx > x) { w.r.sx = x }
              if (w.r.sy === -1) { w.r.sy = y }
              if (w.r.ex < x) { w.r.ex = x }
              if (w.r.ey < y) { w.r.ey = y }
              w.c += 1;
            }
          });
          c += 4;
        }
      }

      // Choose a result from worksets
      let r, needInvert = false;
      if (workSet[0].c < workSet[1].c) {
        r = workSet[0].r;
      } else {
        r = workSet[1].r;
        // If most of non-transparent pixels are background color, then it may need to be inverted
        if ((width * height - workSet[0].c) >= (workSet[1].c * options.invertTolerance)) {
          needInvert = true;
        }
      }

      // Apply given margin
      let margin = 0;
      if (options.margin.slice(-1) === '%') {
        // Regard margin as percentage
        margin = parseInt(Math.max(width, height) * parseInt(options.margin) / 100.0);
      } else {
        // Regard margin as pixel
        margin = parseInt(options.margin);
      }
      width = r.ex - r.sx + margin * 2;
      height = r.ey - r.sy + margin * 2;

      // Redraw with the calculated rectangle
      context.clearRect(0, 0, width, height);
      canvas.width = width;
      canvas.height = height;

      // Invert if possible and needed
      if (options.allowInvert && needInvert) {
        context.filter = 'invert(1)';
      }
      context.drawImage(image, r.sx, r.sy, r.ex - r.sx, r.ey - r.sy, margin, margin, r.ex - r.sx, r.ey - r.sy);

      // Draw back to the target element
      target.src = canvas.toDataURL();
      target.width = width;
      target.height = height;

      // Mark as processed
      original.setAttribute(options.marker, 'true');
    };

    // Load image from the original element
    image.crossOrigin = 'anonymous';
    image.src = original.src;
  }

  return autoCrop;
})));
