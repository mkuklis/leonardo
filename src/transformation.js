(function (L) {

  // Element
  var E = L.E;

  // transformation commands
  var transCommands = {
        r: function (t) {
          this.m.rotate(t.angle);
          this.ctx.rotate(t.angle * Math.PI / 180);
        }
      , s: function (t) {
          this.m.scale(t.sx, t.sy);
          this.ctx.scale(t.sx, t.sy);
        }
      };

  /**
   * Initialize a new `Transformation`.
   */
  function Transformation () {
  }

  Transformation.prototype = {

  };

  /*
  var updateCoords: function () {
      var a = this.attrs;
      // transformation present
      if (this.trans.r) {
        this.coords = [[a.tx, a.ty], [a.tx + a.w, a.ty],
          [a.tx + a.w, a.ty + a.h], [a.tx, a.ty + a.h]];

        this.coords.forEach(function (c, i) {
          this.coords[i] = this.m.xy(c[0], c[1]);
        }, this);
      }
      else {
        var x = a.x
          , y = a.y
          , w = a.w
          , h = a.h;

        a.tx = x;
        a.ty = y;
        this.coords = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
      }
    }
 */

  // Element transformation API
  E.fn.rotate: function (angle, options) {
    var a = this.attrs, cx, cy
      , o = options || {};

    if (typeof o.cx == "undefined") {
      cx = a.w/2;
      cy = a.h/2;
    }

    a.cx = cx;
    a.cy = cy;
    a.tx = -cx;
    a.ty = -cy;

    this.trans.r = { angle: angle, cx: cx, cy: cy };
    return this;
  },

  E.fn.scale: function (sx, sy, cx, cy) {
    var a = this.attrs;

    if (typeof cx == "undefined") {
      cx = a.w/2;
      cy = a.h/2;
    }

    a.cx = cx;
    a.cy = cy;
    a.tx = -cx;
    a.ty = -cy;

    this.trans.s = { sx: sx, sy: sy, cx: cx, cy: cy };
    return this;
  },

  E.fn.transform: function () {
    var a = this.attrs;
    this.m.reset();
    this.m.translate(a.x + a.cx, a.y + a.cy);
    this.ctx.translate(a.x + a.cx, a.y + a.cy);

    for (key in this.trans) {
      transCommands[key].call(this, this.trans[key]);
    }
  }

  E.init(function () {
    this.m = new L.Matrix(); // transformation matrix
    this.trans = {}; // tansformations
  });


})(Leonardo);
