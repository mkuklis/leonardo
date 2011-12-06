(function (L) {

  var events = "mouseover mouseout mousedown mouseup click".split(" ");

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
    this.m = new L.Matrix();

    var options = options || {};

    if (options.back) {
      this.l.elements.unshift(this);
    }
    else {
      this.l.elements.push(this);
    }

    this.id = L.uuid();
    this.updateCoords();

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

      this.ctx.beginPath();

      if (a.fill) {
        this.ctx.fillStyle = this.createStyle();
      }

      a.stroke = a.stroke || '#000000';
      this.ctx.strokeStyle = L.C.toColor(a.stroke, a['stroke-opacity']);
      this.ctx.lineWidth = a['stroke-width'] || 1.0;

      if (this.type == "circle") {
        this.ctx.arc(a.x - a.dx, a.y - a.dy, a.r, 0, Math.PI * 2, true);
      }

      if (this.type == "rect") {
        this.ctx.rect(a.x - a.dx, a.y - a.dy, a.w, a.h);
      }

      if (this.type == "path") {
        this.attrs.path.forEach(this.processPath, this);
      }

      this.ctx.stroke();
      this.ctx.fill();

      // text
      if (a.text) {
        this.processText();
      }

      this.ctx.closePath();
    },

    createStyle: function () {
      var a = this.attrs;

      if (E.isGradient(a.fill)) {
        return this.parseGradient(a.fill);
      }

      return C.toColor(a.fill, a.opacity);
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
      this.bind("dragstart", start || true);
      this.bind("dragmove", move || true);
      this.bind("dragend", end || true);
      return this;
    },

    touch: function (start, move, end) {
      this.bind("touchstart", start || true);
      this.bind("touchmove", move || true);
      this.bind("touchend", end || true);
      return this;
    },

    bind: function (name, callback) {
      this[name] = callback;
      this.l.bind(name, this);
      return this;
    },

    unbind: function (name, callback) {
      this[name] = callback;
      this.l.unbind(name, this);
      return this;
    },

    toFront: function () {
      var i = this.l.elements.indexOf(this)
        , self = this
        , elems = this.l.elements;

      if (i < elems.length - 1) {
        elems.splice(i, 1);
        elems.push(this);

        cevents.forEach(function (name) {
          var e = self.l.events[name];
          if (e) {
            var i = e.indexOf(self);
            if (i > -1 && i != e.length - 1) {
              e.splice(i, 1);
              e.push(self);
            }
          }
        });

        this.l.flags.mouseover = i;
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

    updateCoords: function (x, y) {

      if (x && y) {
        this.attrs.x = x;
        this.attrs.y = y;
      }

      if (this.type == "rect") {
        var x = this.attrs.x
          , y = this.attrs.y
          , w = this.attrs.w
          , h = this.attrs.h;

        this.coords = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
      }
    },

    rotate: function (degree, cx, cy) {
      var a = this.attrs;

      if (!a.cx) {
        if (cx && cy) {
          a.cx = a.x + cx;
          a.cy = a.y + cy;
        }
        else {
          a.cx = a.x + a.w/2;
          a.cy = a.y + a.h/2;
        }
      }

      this.l.clear();
      this.ctx.save();

      this.ctx.translate(a.cx, a.cx);
      a.x = - a.w / 2;
      a.y = - a.h / 2;
      this.ctx.rotate(degree * Math.PI / 180);
      //this.redraw();
      //this.l.clear();
      this.draw();
      this.ctx.restore();
      this.transform('translate', a.cx, a.cx);
      this.transform('rotate', degree);
      //this.l.clear();
      //this.draw();
    },

    transform: function (command, degree) {
      var self = this;
      this.coords.forEach(function (pt) {
        self.m[command](pt[0], pt[1], degree);
        var x = self.m.x(pt[0], pt[1]);
        var y = self.m.y(pt[0], pt[1]);
        pt[0] = x;
        pt[1] = y;
      });
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
        this.bind(n, c);
        return this;
      }

      E.prototype["un" + n] = function (c) {
        this.unbind(n, c);
        return this;
      }
    })(events[i]);
  }

})(Leonardo);
