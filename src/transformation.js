(function (L) {

  // Element
  var E = L.E;

  function center(attrs, cx, cy) {
    var a = attrs;

    if (typeof cx == "undefined") {
      cx = a.w/2;
      cy = a.h/2;
    }

    a.cx = cx;
    a.cy = cy;
    a.tx = -cx;
    a.ty = -cy;
  }

  // transformation commands
  var transCommands = {
    r: function (angle, cx, cy) {
      var a = this.attrs;
      this.trans = this.trans || {};
      center(a, cx, cy);
      this.trans.r = { angle: angle, cx: a.cx, cy: a.cy };
    },
    s: function (sx, sy, cx, cy) {
      var a = this.attrs;
      this.trans = this.trans || {};
      center(a, cx, cy);
      this.trans.s = { sx: sx, sy: sy, cx: a.cx, cy: a.cy };
    }
  }

  // draw transformation commands
  var ctxCommands = {
    r: function (t) {
      this.m.rotate(t.angle);
      this.ctx.rotate(t.angle * Math.PI / 180);
    },
    s: function (t) {
      this.m.scale(t.sx, t.sy);
      this.ctx.scale(t.sx, t.sy);
    }
  };

  // Element transformation API
  E.fn.rotate = function (angle, cx, cy) {
    this.transform({r: [angle, cx, cy]});
    return this;
  },

  E.fn.scale = function (sx, sy, cx, cy) {
    this.transform({s: [sx, sy, cx, cy]});
    return this;
  },

  /**
   * Transforms element
   * attrs - represents transformation object
   *
   * format:
   *
   * {r:[90,0,0],s:[10,10,0,0],R:[90, 0,0]}
   */
  E.fn.transform = function (attrs) {
    for (key in attrs) {
      if (attrs.hasOwnProperty(key)) {
        transCommands[key].apply(this, attrs[key]);
      }
    }
  }

  E.fn.processTransform = function () {
    var a = this.attrs;
    this.m.reset();
    this.m.translate(a.x + a.cx, a.y + a.cy);
    this.ctx.translate(a.x + a.cx, a.y + a.cy);

    for (key in this.trans) {
      if (this.trans.hasOwnProperty(key)) {
        ctxCommands[key].call(this, this.trans[key]);
      }
    }
  }

  E.init(function () {
    this.m = new L.Matrix(); // transformation matrix
  });

})(Leonardo);
