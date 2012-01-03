(function (L) {

  var events = "mouseover mouseout mousedown mouseup click".split(" "),
      // transformation commands executed in the context of element
      transCommands = {
        rotate: function (t) {
          this.m.rotate(t.angle);
          this.ctx.rotate(t.angle * Math.PI / 180);
          var a = this.attrs;
          this.coords = [[-t.cx, -t.cy], [-t.cx + a.w, -t.cy], [-t.cx + a.w, -t.cy + a.h], [-t.cx, -t.cy + a.h]];
        },
        scale: function (t) {
          this.m.scale(t.sx, t.sy);
          this.ctx.scale(t.sx, t.sy);
          var a = this.attrs;
          this.coords = [[-t.cx, -t.cy], [-t.cx + a.w, -t.cy], [-t.cx + a.w, -t.cy + a.h], [-t.cx, -t.cy + a.h]];
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
    this.coords = [];
    var options = options || {};

    if (options.back) {
      this.l.elements.unshift(this);
    }
    else {
      this.l.elements.push(this);
    }

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

      if (this.t.length) {
        this.ctx.save();
      }

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


      if (this.type == "circle") {
        this.ctx.arc(a.x - a.dx, a.y - a.dy, a.r, 0, Math.PI * 2, true);
      }

      if (this.type == "rect") {
        this.ctx.rect(-a.cx, -a.cy, a.w, a.h);
        //this.ctx.rect(a.x - a.dx, a.y - a.dy, a.w, a.h);
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

      if (this.t.length) {
        this.ctx.restore();
      }

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

    rotate: function (angle, cx, cy) {
      var a = this.attrs;

      if (cx == undefined) {
        cx = a.w/2;
        cy = a.h/2;
      }

      a.cx = cx;
      a.cy = cy;

      /*
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
      */

      this.t.push({c: 'rotate', angle: angle, cx: cx, cy: cy});
      this.draw();
      return this;
    },

    transform: function () {
      var a = this.attrs;
      this.m.reset();
      this.m.translate(a.x + a.cx, a.y + a.cy);
      this.ctx.translate(a.x + a.cx, a.y + a.cy);

      this.t.forEach(function (t) {
        // process tansformations
        transCommands[t.c].call(this, t);
      }, this);

      this.updateCoords();
    },

    updateCoords: function () {
      var coords = this.coords;
      coords.forEach(function (c, i) {
        var p =this.m.xy(c[0], c[1]);
        this.coords[i] = p;
      }, this);
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
