---
  title: leonardo
  subtitle: leonardo(...)
  weight: 100
  render-file: false
---


Creates Leonardo object. Leonardo object contains a reference to canvas element.
Canvas element will be created or referenced from DOM based on given paramenters during Leonardo initialization.
All calls to drawing methods depend on Leonardo object so intialization has to happen first.

** Parameter types **

<table>
  <tr>
    <td>container</td>
    <td class="type string">String</td>
    <td>DOM element or the ID of the canvas</td>
  </tr>
  <tr><td colspan="3">or</td></tr>
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
    <td>width</td>
    <td class="type number">Number</td>
    <td>canvas width</td>
  </tr>
  <tr>
    <td>height</td>
    <td class="type number">Number</td>
    <td>canvas height</td>
  </tr>
</table>

**Usage**

    // creates new leonardo object with 200px x 300px canvas at 50, 100
    var leo = leonardo(50, 100, 200, 300);

    // creates new leonardo object with a reference to canvas with id = #paper
    var leo = leonardo("#paper");

    // or if you are a fun of new
    var leo = new Leonardo("#paper");
