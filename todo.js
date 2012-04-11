
// http://stackoverflow.com/questions/4576724/dotted-stroke-in-canvas
/*
var CP = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
if (CP.lineTo) {
  CP.dashedLine = function(x, y, x2, y2, da) {
    var da = (!da) ? [10,5] : da
      , dx = (x2 - x), dy = (y2 - y)
      , len = Math.sqrt(dx * dx + dy * dy)
      , rot = Math.atan2(dy, dx)
      , dc = da.length
      , di = 0
      , draw = true;

    this.save();
    this.translate(x, y);
    this.moveTo(0, 0);
    this.rotate(rot);

    x = 0;

    while (len > x) {
      x += da[di++ % dc];
      if (x > len) x = len;
      draw ? this.lineTo(x, 0) : this.moveTo(x, 0);
      draw = !draw;
    }

    this.restore();
  }
}
*/


    /*
    else if (el.type == "rect")  {
      var x1 = el.attrs.x
        , x2 = el.attrs.x + el.attrs.w
        , y1 = el.attrs.y
        , y2 = el.attrs.y + el.attrs.h;

      return (x1 <= pt.x && pt.x <= x2) && (y1 <= pt.y && pt.y <= y2);
    }
    */

