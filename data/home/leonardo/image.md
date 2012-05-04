---
  title: image
  subtitle: leonardo.image(src, x, y, w, h, [attrs])
  weight: 105
  render-file: false
---

Imports image into canvas.

**Parameters**


<table>
  <tr>
    <td>src</td>
    <td class="type string">String</td>
    <td>image source (URI)</td>
  </tr>
  <tr>
    <td>x</td>
    <td class="type number">Number</td>
    <td>x coordinate</td>
  </tr>
  <tr>
    <td>y</td>
    <td class="type number">Number</td>
    <td>y coordinate</td>
  </tr>
  <tr>
    <td>w</td>
    <td class="type number">Number</td>
    <td>width</td>
  </tr>
  <tr>
    <td>h</td>
    <td class="type number">Number</td>
    <td>height</td>
  </tr>
  <tr>
    <td>attrs</td>
    <td class="type object">Object</td>
    <td>attributes</td>
  </tr>
</table>


**Usage**

    // load image into canvas
    var image = leo.image("image.png", 10, 10, 90, 90);

**Example**

<canvas id="image" width="110" height="110"></canvas
