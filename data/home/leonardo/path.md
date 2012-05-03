---
  title: path
  subtitle: leonardo.path(command, [options])
  weight: 104
  render-file: false
---

Creates and draws path element based on given command(s).

**Parameters**

<table>
  <tr>
    <td>command</td>
    <td class="type object">Object</td>
    <td>single path command</td>
  </tr>
  <tr>
    <td>options</td>
    <td class="type object">Object</td>
    <td>options</td>
  </tr>
  <tr>
    <td colspan="3">OR</td>
  </tr>
  <tr>
    <td>commands</td>
    <td class="type array">Array</td>
    <td>array of multiple path commands</td>
  </tr>
  <tr>
    <td>options</td>
    <td class="type object">Object</td>
    <td>options</td>
  </tr>
</table>

Single path command is a JSON object where the key represents the type of the command 
and the value represents command's argument(s).

**Available Commands**

<table>
  <tr>
    <td>M</td>
    <td>{M: [x, y, ...]}</td>
    <td>move to point with x, y coordinates</td>
  </tr>
  <tr>
    <td>L</td>
    <td>{L: [x, y, ...]}</td>
    <td>draw line to x, y</td>
  </tr>
  <tr>
    <td>V</td>
    <td>{V: x}</td>
    <td>draw vertical line to x</td>
  </tr>
  <tr>
    <td>H</td>
    <td>{H: y}</td>
    <td>draw horizontal line to y</td>
  </tr>
  <tr>
    <td>Q</td>
    <td>{Q: [cp1x, cp1y, x1, y1, cp2x, cp2y, x2, y2, ...]}</td>
    <td>draw quadratric curve</td>
  </tr>
  <tr>
    <td>B</td>
    <td>{B: [cp1x, cp1y, x1, y1, cp2x, cp2y, x2, y2, ...]}</td>
    <td>draw bezier curve</td>
  </tr>
</table>

**Usage**
    
    // draw quadratic curve
    leo.path([
      {M: [200, 30]},
      {Q: [300, 0, 288, 120]}]);

    // draw heart
    leo.path([
      {M:[75, 40]},
      {B:[75,37,70,25,50,25, 20,25,20,62.5,20,62.5,
          20,80,40,102,75,120, 110,102,130,80,130,62.5,
          130,62.5,130,25,100,25, 85,25,75,37,75,40]}]);


**Example**

<canvas id="path" width="300" height="130"></canvas>
