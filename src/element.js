(function (L) {

  // path commands
  var pathCommands = {
        // move
        M: function (v) {
          this.ctx.moveTo(v[0], v[1]);
          this.updateBbox({x: v[0], y: v[1]});
        }
        // line
      , L: function (v) {
          for (var i = 0, l = v.length; i < l; i += 2) {
            this.ctx.lineTo(v[i], v[i + 1]);
            this.updateBbox({x: v[i], y: v[i + 1]});
          }
        }
        // vertical line
      , V: function (v) { this.ctx.lineTo(this.bbox.x, v); }
        // horizontal line
      , H: function (v) { this.ctx.lineTo(v, this.bbox.y); }
        // quadratric curves
      , Q: function (v) {
          for (var i = 0, l = v.length; i < l; i += 4) {
            this.ctx.quadraticCurveTo(v[i], v[i + 1], v[i + 2], v[i + 3]);
            this.updateBbox({x: v[i + 2], y: v[i + 3]});
          }
        }
        // bezier curves
      , B: function (v) {
          for (var i = 0, l = v.length; i < l; i += 6) {
            this.ctx.bezierCurveTo(v[i], v[i + 1], v[i + 2], v[i + 3], v[i + 4], v[i + 5]);
            this.updateBbox({x: v[i + 4], y: v[i + 5]});
          }
        }
      }

    // transformation commands execute in the context of the element
     , transCommands = {
        r: function (t) {
          this.m.rotate(t.angle);
          this.ctx.rotate(t.angle * Math.PI / 180);
        }
      , s: function (t) {
          this.m.scale(t.sx, t.sy);
          this.ctx.scale(t.sx, t.sy);
        }
      }

    // draw commands which execute in the context of the element
    , drawCommmands = {
        circle: function (a) {
          this.ctx.arc(a.tx, a.ty, a.r, 0, Math.PI * 2, true);
          this.updateBbox({x: a.tx - a.r, y: a.ty - a.r, w: 2 * a.r, h: 2 * a.r});
        }
      , rect: function (a) {
          this.ctx.rect(a.tx, a.ty, a.w, a.h);
          this.updateBbox({x: a.tx, y: a.ty, w: a.w, h: a.h});
        }
      , path: function () {
          this.attrs.path.forEach(this.processPath, this);
        }
      , image: function (a) {
          this.processImage();
          this.updateBbox({x: a.x, y: a.y, w: a.w, h: a.h});
        }
      };

  // element constructor
  var E = function (type, attrs, leonardo, options) {

    if (!(this instanceof E)) {
      return new E(type, attrs, leonardo, options);
    }

    options = options || {};

    this.type = type;
    this.attrs = attrs;
    this.attrs.dx = 0;
    this.attrs.dy = 0;
    this.l = leonardo;
    this.ctx = this.l.ctx;
    this.m = new L.Matrix(); // transformation matrix
    this.trans = {}; // tansformations
    this.bbox = {x: Infinity, y: Infinity, w: 0, h: 0}; // bbox

    if (options.back) {
      this.l.elements.unshift(this);
    }
    else {
      this.l.elements.push(this);
    }

    this.updateCoords();
    this.id = L.uuid();
    E.init.call(this);
  }

  E.init = L.init;

  // Element API
  E.fn = {
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

      for (var key in args) {
        this.attrs[key] = args[key];
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

      if (this.trans) {
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

      this.ctx.textAlign = align[0];
      this.ctx.textBaseline = align[1];
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

    processPath: function (p) {
      for (var c in p) {
        pathCommands[c].call(this, p[c]);
      }
    },

    rotate: function (angle, options) {
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

    scale: function (sx, sy, cx, cy) {
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

    transform: function () {
      var a = this.attrs;
      this.m.reset();
      this.m.translate(a.x + a.cx, a.y + a.cy);
      this.ctx.translate(a.x + a.cx, a.y + a.cy);

      for (key in this.trans) {
        transCommands[key].call(this, this.trans[key]);
      }
    },

    updateBbox: function (a) {
      var b = this.bbox;

      if (a.w && a.h) {
        this.bbox = a;
      }
      else if (a.x && a.y) {
        if (a.x < b.x) { b.x = a.x; }
        if (a.x > b.x + b.w) { b.w = a.x - b.x; }
        if (a.y < b.y) { b.y = a.y; }
        if (a.y > b.y + b.h) { b.h = a.y - b.y; }
      }
    },

    getBbox: function () {
      return this.bbox;
    },

    updateCoords: function () {
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
  }

  E.isGradient = function (str) {
    return str[0] == "r" || str[0] == "l";
  }

  E.prototype = E.fn;
  L.E = E;

})(Leonardo);
