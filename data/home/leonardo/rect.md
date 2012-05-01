---
  title: rect
  subtitle: leonardo.rect(x, y, w, h, [r], [attrs])
  weight: 103
  render-file: false
---

Draws a rectangle.

**Parameters**

<table>
  <tr>
    <td>x</td>
    <td class="type number">Number</td>
    <td>x coordinate of the centre</td>
  </tr>
  <tr>
    <td>y</td>
    <td class="type number">Number</td>
    <td>y coordinate of the centre</td>
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
    <td>r</td>
    <td class="type number">Number</td>
    <td>border radius</td>
  </tr>
  <tr>
    <td>attrs</td>
    <td class="type object">Object</td>
    <td>attributes</td>
  </tr>
</table>

**Usage**

    // creates and draws rectangle filled with color
    var rect = leo.rect(25, 30, 40, 30, 0, {fill: '#247bc7'});

**Example**

<canvas id="rect" width="100" height="100"></canvas>
