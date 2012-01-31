(function (L) {

  var events = "mouseover mouseout mousedown mouseup click".split(" ")
      // path commands
    , pathCommands = {
        // move
        M: function (v) {
          this.ctx.moveTo(v[0], v[1]);
          this.updateBbox({x: v[0], y: v[1]});
        },
        // line
        L: function (v) {
          for (var i = 0, l = v.length; i < l; i += 2) {
            this.ctx.lineTo(v[i], v[i + 1]);
            this.updateBbox({x: v[i], y: v[i + 1]});
          }
        },
        // vertical line
        V: function (v) {
          this.ctx.lineTo(this.bbox.x, v);
        },
        // horizontal line
        H: function (v) {
          this.ctx.lineTo(v, this.bbox.y);
        },
        // quadratric curves
        Q: function (v) {
          for (var i = 0, l = v.length; i < l; i += 4) {
            this.ctx.quadraticCurveTo(v[i], v[i + 1], v[i + 2], v[i + 3]);
            this.updateBbox({x: v[i + 2], y: v[i + 3]});
          }
        },
        // bezier curves
        B: function (v) {
          for (var i = 0, l = v.length; i < l; i += 6) {
            this.ctx.bezierCurveTo(v[i], v[i + 1], v[i + 2], v[i + 3], v[i + 4], v[i + 5]);
            this.updateBbox({x: v[i + 4], y: v[i + 5]});
          }
        }
      }
      // transformation commands executed in the context of the element
    , transCommands = {
        rotate: function (t) {
          this.m.rotate(t.angle);
          this.ctx.rotate(t.angle * Math.PI / 180);
        },
        scale: function (t) {
          this.m.scale(t.sx, t.sy);
          this.ctx.scale(t.sx, t.sy);
        }
      }
    // draw commands which executed in the context of the element
    , drawCommmands = {
        circle: function (a) {
          this.ctx.arc(a.tx, a.ty, a.r, 0, Math.PI * 2, true);
          this.updateBbox({x: a.tx - a.r, y: a.ty - a.r, w: 2 * a.r, h: 2 * a.r});
        },
        rect: function (a) {
          this.ctx.rect(a.tx, a.ty, a.w, a.h);
          this.updateBbox({x: a.tx, y: a.ty, w: a.w, h: a.h});
        },
        path: function () {
          this.attrs.path.forEach(this.processPath, this);
        },
        image: function (a) {
          this.processImage();
          this.updateBbox({x: a.x, y: a.y, w: a.w, h: a.h});
        }
      };

  // element constructor
  var E = function (type, attrs, leonardo, options) {

    if (!(this instanceof E)) {
      return new E(type, attrs, leonardo, options);
    }

    this.type = type;
    this.attrs = attrs;
    this.attrs.dx = 0;
    this.attrs.dy = 0;
    this.flags = {}; // event related flags
    this.l = leonardo;
    this.ctx = this.l.ctx;
    this.m = new L.Matrix(); // transformation matrix
    this.t = []; // tansformations
    this.bbox = {x: Infinity, y: Infinity, w: 0, h: 0}; // bbox
    var options = options || {};

    if (options.back) {
      this.l.elements.unshift(this);
    }
    else {
      this.l.elements.push(this);
    }

    this.updateCoords();
    this.id = L.uuid();
  }

  E.prototype = {
    constructor: E,

    attr: function (args, options) {

      if (L.is('String', args)) {
        return this.attrs[args];
      }

      if (L.is('Array', args)) {
        var result = [];
        for (var i = 0, l = args.length; i < l; i++) {
          result.push(this.attrs[args[i]]);
        }
        return result;
      }

      var options = options || {};

      for (key in args) {
        this.attrs[key] = args[key];
      }

      if (!options.silent) {
        // redraw all elements
        this.redraw();
      }

      return this;
    },

    redraw: function () {
      this.l.redraw();
    },

    draw: function () {
      var a = this.attrs;

      this.ctx.save();
      this.ctx.beginPath();

      if (a.fill) {
        this.ctx.fillStyle = this.createStyle();
      }

      a.stroke = a.stroke || '#000000';
      this.ctx.strokeStyle = L.C.toColor(a.stroke, a['stroke-opacity']);
      this.ctx.lineWidth = a['stroke-width'] || 1.0;

      if (this.t.length) {
        this.transform();
      }

      this.updateCoords();
      if (drawCommmands[this.type]) {
        drawCommmands[this.type].call(this, a);
      }

      if (a.fill) {
        this.ctx.fill();
      }

      // text
      if (a.text) {
        this.processText();
      }

      this.ctx.stroke();

      if (L.debug) {
        this.ctx.rect(this.bbox.x, this.bbox.y, this.bbox.w, this.bbox.h);
        this.ctx.stroke();
      }

      this.ctx.closePath();
      this.ctx.restore();
    },

    createStyle: function () {
      var a = this.attrs;

      if (E.isGradient(a.fill)) {
        return this.parseGradient(a.fill);
      }

      return L.C.toColor(a.fill, a.opacity);
    },

    processText: function () {
      var attrs = this.attrs
        , pos = attrs['text-position'] || "center:middle"
        , color = attrs['font-color'] || 'rgba(0,0,0,1.0)'
        , font = attrs.font || "10px sans-serif"
        , align = pos.split(':');

      if (align.length == 1) {
        align.push('middle');
      }

      this.ctx.textAlign = aligns[0];
      this.ctx.textBaseline = aligns[1];
      this.ctx.fillStyle = color;
      this.ctx.font = font;
      this.ctx.fillText(attrs.text, attrs.x - attrs.dx, attrs.y - attrs.dy);
    },

    processImage: function () {
      var attrs = this.attrs;

      if (!this.img) {
        this.img = new Image();
        this.img.onload = L.proxy(function () {
          this.ctx.drawImage(this.img, attrs.x, attrs.y, attrs.w, attrs.h);
        }, this);

        this.img.src = attrs.src;
      }
      else {
        this.ctx.drawImage(this.img, attrs.x, attrs.y, attrs.w, attrs.h);
      }
    },

    parseGradient: function (str) {
      var g = str.split(":")
        , a = this.attrs
        , type = g.shift()
        , last = g[g.length - 1]
        , args, gr;

      if (last.indexOf('-') == -1) {
        args = g.pop().split(',');
      }

      // radial
      if (type === "r") {
        args = (args) ? args : [a.x - a.dx, a.y - a.dy, 0, a.x - a.dx, a.y - a.dy, a.r];
        gr = this.ctx.createRadialGradient.apply(this.ctx, args);
      }
      // linear
      else {
        args = (args) ? args : [a.x, a.y, a.w, a.h];
        gr = this.ctx.createLinearGradient.apply(this.ctx, args);
      }

      // process position-color
      for (var i = 0, l = g.length; i < l; i++) {
        var pc = g[i].split('-');
        gr.addColorStop(pc[0], C.toColor(pc[1]));
      }

      return gr;
    },

    drag: function (start, move, end) {
      this.on("dragstart", start || true);
      this.on("dragmove", move || true);
      this.on("dragend", end || true);
      return this;
    },

    touch: function (start, move, end) {
      this.on("touchstart", start || true);
      this.on("touchmove", move || true);
      this.on("touchend", end || true);
      return this;
    },

    on: function (name, callback) {
      this[name] = callback;
      this.l.on(name, this);
      return this;
    },

    off: function (name, callback) {
      this[name] = callback;
      this.l.off(name, this);
      return this;
    },

    toFront: function () {
      var index = this.l.elements.indexOf(this)
        , elems = this.l.elements;

      if (index < elems.length - 1) {
        elems.splice(index, 1);
        elems.push(this);

        events.forEach(function (name) {
          var e = this.l.events[name];
          if (e) {
            var i = e.indexOf(this);
            if (i > -1 && i != e.length - 1) {
              e.splice(i, 1);
              e.push(this);
            }
          }
        }, this);

        this.l.flags.mouseover = index;
        this.redraw();
      }
    },

    toBack: function () {
      var index = this.l.elements.indexOf(this)
        , elems = this.l.elements;

      elems.splice(index, 1);
      elems.unshift(this);
      this.redraw();
    },

    processPath: function (p) {
      for (c in p) {
        pathCommands[c].call(this, p[c]);
      }
    },

    rotate: function (angle, cx, cy) {
      var a = this.attrs;

      if (cx == undefined) {
        cx = a.w/2;
        cy = a.h/2;
      }

      a.cx = cx;
      a.cy = cy;
      a.tx = -cx;
      a.ty = -cy;

      this.t.push({c: 'rotate', angle: angle, cx: cx, cy: cy});
      this.redraw();
      return this;
    },

    scale: function (sx, sy, cx, cy) {
      var a = this.attrs;

      if (cx == undefined) {
        cx = a.w/2;
        cy = a.h/2;
      }

      a.cx = cx;
      a.cy = cy;
      a.tx = -cx;
      a.ty = -cy;

      this.t.push({c:"scale", sx: sx, sy: sy, cx: cx, cy: cy});
      this.redraw();
      return this;
    },

    transform: function () {
      var a = this.attrs;
      this.m.reset();
      this.m.translate(a.x + a.cx, a.y + a.cy);
      this.ctx.translate(a.x + a.cx, a.y + a.cy);

      this.t.forEach(function (t) {
        transCommands[t.c].call(this, t);
      }, this);
    },

    updateBbox: function (a) {
      var b = this.bbox;

      if (a.w && a.h) {
        this.bbox = a;
      }
      else if (a.x && a.y) {
        if (a.x < b.x) b.x = a.x;
        if (a.x > b.x + b.w) b.w = a.x - b.x;
        if (a.y < b.y) b.y = a.y;
        if (a.y > b.y + b.h) b.h = a.y - b.y;
      }
    },

    getBbox: function () {
      return this.bbox;
    },

    updateCoords: function () {
      var a = this.attrs;
      // transformation present
      if (this.t.length) {
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
  }

  E.isGradient = function (str) {
    return str[0] == "r" || str[0] == "l";
  }

  L.E = E;

  // setup element events api
  for (var i = 0, l = events.length; i < l; i++) {
    (function (n) {
      E.prototype[n] = function (c) {
        this.on(n, c);
        return this;
      }

      E.prototype["un" + n] = function (c) {
        this.off(n, c);
        return this;
      }
    })(events[i]);
  }
})(Leonardo);
