(function (L) {

  // Element
  var E = L.E;

  // TODO find centroid
  function findCenter(el) {
    var a = el.attrs;
    return  [a.w / 2, a.h / 2];
  }

  // transformation commands
  var ctxCommands = {
    // rotate
    r: function (angle, cx, cy) {
      this.m.rotate(angle);
      this.ctx.rotate(angle * Math.PI / 180);
    },
    // scale
    s: function (sx, sy, cx, cy) {
      this.m.scale(sx, sy);
      this.ctx.scale(sx, sy);
    },
    // translate
    t: function (x, y) {
      var a = this.attrs;
      this.m.translate(a.x + x, a.y + y);
      this.ctx.translate(a.x + x, a.y + y);
      a.tx = -x;
      a.ty = -y;
    }
  };

  E.fn.rotate = function (angle, cx, cy) {
    var args = [angle];
    if (cx && cy) { args.push(cx, cy); }
    this.transform({r: args});

    return this;
  }

  E.fn.scale = function (sx, sy, cx, cy) {
    var args = [sx, sy];
    if (cx && cy) { args.push(cx, cy); }
    this.transform({s: args});

    return this;
  }

  /**
   * Transforms element
   * attrs - represents transformation object
   *
   * format:
   *
   * {r:[90,0,0], s:[10,10,0,0], R:[90, 0,0]}
   */
  E.fn.transform = function (attrs) {
    this.trans = this.trans || {};

    for (var key in attrs) {
      if (attrs.hasOwnProperty(key)) {
        // find center
        if (attrs[key].length < 3) {
          attrs[key] = attrs[key].concat(findCenter(this));
        }
        this.trans[key] = attrs[key];
      }
    }

    return this;
  }

  E.fn.processTransform = function () {
    var a = this.attrs;
    this.m.reset();

    for (var key in this.trans) {
      if (this.trans.hasOwnProperty(key)) {
        var t = this.trans[key];
        ctxCommands.t.apply(this, t.slice(-2));
        ctxCommands[key].apply(this, t);
      }
    }
  }

  E.init(function () {
    this.m = new L.Matrix(); // transformation matrix
  });

})(Leonardo);
