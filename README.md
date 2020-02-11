autocrop.js
===========

`autocrop` crops transparency area of the given image.

Demo site: <https://lqez.github.io/autocrop.js/>


Usage
-----

```javascript
autocrop(<original_image_element>, (target_image_element), (options));
```

If `target_image_element` is omitted, it will replace `original_image_element` with the cropped result.

Parameter
---------

```javascript
const autoCropDefaultOptions = {
  bgColor: '#FFFFFF',       // Background color.
  alphaTolerance: 20,       // Pixels that are transparent than this value are considered transparent.
  colorTolerance: 20,       // Pixels similar to the background color are considered as the background.
  invertTolerance: 0.90,    // Invert the image if most of non-transparent pixels are background color.
  margin: '2%',             // Margin
  allowInvert: true,        // Allow invert if needed.
  marker: 'cropped'         // Add a marker attribute to prevent duplicated cropping.
};
```

Example
-------

![Example image of autocrop.js](./example.png)


License
-------

MIT
