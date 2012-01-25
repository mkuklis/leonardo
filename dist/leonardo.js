(function () {

  // global
  var w = this
    , d = w.document
    // canvas events
    , cevents = "mousedown mouseup mousemove touchstart touchmove touchend click".split(" ")
    // map element events to canvas events
    , map = {
        "mouseover": "mousemove",
        "mouseout": "mousemove",
        /*
        "touchstart": "mousedown",
        "touchmove": "mousemove",
        "touchend": "mouseup",
        */
        "dragstart": "mousedown",
        "dragmove": "mousemove",
        "dragend": "mouseup"
      }
    // touch is supported
    , supportsTouch = 'createTouch' in d
    // canvas event handlers
    , handlers = {
        mousemove: function (el, pt, curIndex, elements) {
          // drag
          if (el.flags.dragging) {
            el.attr({x: pt.x - el.attrs.dx, y: pt.y - el.attrs.dy});
            //el.redraw();
          }
          // mouseover
          else if (!el.flags.over && L.isPointInRange(el, pt)) {
            var prevIndex = this.flags.mouseover;
            if (!prevIndex || curIndex > prevIndex || this.flags.dragging) {
              if (curIndex > prevIndex) {
                var prev = elements[prevIndex];
                prev.mouseout && prev.mouseout.call(prev);
                prev.flags.over = false;
              }

              el.mouseover && el.mouseover.call(el);
              this.flags.mouseover = curIndex;
              el.flags.over = true;
              return true;
            }
          }
          // mouseout
          else if (el.flags.over && !L.isPointInRange(el, pt)) {
            el.flags.over = false;
            el.mouseout && el.mouseout.call(el);
            delete this.flags.mouseover;
          }
        },

        mousedown: function (el, pt) {
          if (L.isPointInRange(el, pt)) {
            if (el.dragstart) {
              el.flags.dragging = true;
              this.flags.dragging = true;
              el.toFront();
              el.attr({dx: pt.x - el.attrs.x, dy: pt.y - el.attrs.y}, {silent: true});
              L.is("Function", el.dragstart) && el.dragstart.call(el);
            }
            else {
              el.mousedown && el.mousedown.call(el);
            }

            return true;
          }
        },

        mouseup: function (el, pt) {
          //if (L.isPointInRange(el, pt)) {
          if (el.dragend && el.flags.dragging) {
            el.flags.dragging = false;
            this.flags.dragging = false;
            L.is("Function", el.dragend) && el.dragend.call(el);
          }
          else {
            el.mouseup && el.mouseup.call(el);
          }
          //}
        },

        click: function (el, p) {
          if (L.isPointInRange(el, p)) {
            el.click && el.click.call(el);
            return true;
          }
        },

        touchstart: function (el, pt) {
          if (L.isPointInRange(el, pt)) {
            el.touchstart && el.touchstart.call(el);
            return true;
          }
        },

        touchmove: function () {
          // this.mousemove.apply(arguments);
        },

        touchend: function () {
          // this.mouseup.apply(arguments);
        }
      };


  this.Leonardo = this.L = function () {
    var l = new Leo();
    l.canvas = L.createCanvas.apply(l, arguments);
    l.ctx = l.canvas.getContext("2d");
    return l;
  }

  L.version = 0.1;

  function Leo() {
    this.elements = [];
    this.events = {};
    this.flags = {};
  }

  Leo.prototype = {
    // create circle element
    circle: function (x, y, r, attrs) {
      var pos = {x: x || 0, y: y || 0, r: r || 0}
        , circle = L.E('circle', L.extend(pos, attrs), this);

      circle.draw();

      return circle;
    },

    // create rect element
    rect: function (x, y, w, h, r, attrs) {
      var pos = {x: x || 0, y: y || 0, w: w || 0, h: h || 0, r: r || 0}
        , rect = L.E('rect', L.extend(pos, attrs), this);
      rect.draw();
      return rect;
    },

    path: function (attrs, options) {
      if (L.is('Array', attrs)) {
        var attrs = {path: attrs};
      }

      var options = options || {}
        , path = L.E('path', attrs, this, options);

      if (!options.silent) {
        path.draw();
      }

      return path;
    },

    // create image element
    image: function (src, x, y, w, h, attrs) {
      var pos = {src: src, x: x || 0, y: y || 0, w: w || 0, h: h || 0}
        , image = L.E('image', L.extend(pos, attrs), this);
      image.draw();

      return image;
    },

    // redraws all elements
    redraw: function () {
      this.clear();
      this.elements.forEach(function (el) {
        el.draw();
      });
    },

    // clears paper, removes all elements
    reset: function () {
      var events = this.events;

      cevents.forEach(function (name) {
        if (events[name]) {
          events[name].splice(0, events[name].length);
        }
      });

      this.elements.splice(0, this.elements.length);
      this.flags = {};
      this.clear();
    },

    // clears paper, removes all elements
    clear: function () {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.beginPath();
    },

    getPos: function (e) {
      var x, y;
      if (e.touches) {
        x = e.touches[0].pageX - this.canvas.offsetLeft;
        y = e.touches[0].pageY - this.canvas.offsetLeft;
      }
      else {
        x = e.pageX - this.canvas.offsetLeft;
        y = e.pageY - this.canvas.offsetTop;
      }

      return {x: x, y: y};
    },

    bind: function (n, el) {
      var e = this.events
        , n = (map[n]) ? map[n] : n;

      if (!this.events[n]) {
        this.events[n] = [];
        this.canvas.addEventListener(n, L.proxy(function (e) {
          this[n](e);
          e.preventDefault();
        }, this), false);
      }

      if (e[n].length == 0 || e[n].indexOf(el) == -1) {
        e[n].push(el);
      }
    },

    unbind: function (n, el) {
      var e = this.events[n];
      e.forEach(function (ell, i) {
        if (ell == el) {
          delete el[n];
          e.splice(i, 1);
        }
      });
    }
  };

  L.toString = function () {
    return "Leonardo ver. " + L.version;
  }

  L.proxy = function (func, context) {
    return function () {
      func.apply(context, arguments);
    }
  }

  // create canvas
  L.createCanvas = function () {
    var c, args = arguments;
    if (args.length == 4) {
      if (L.isAllN(args)) {
        c = d.createElement("canvas");
        c.style.position = "absolute";
        c.style.left = args[0] + 'px';
        c.style.top = args[1] + 'px';
        c.width = args[2];
        c.height = args[3];
        d.body.appendChild(c);
      }
    }
    else if (L.is("String", args[0])) {
      c = d.getElementById(args[0]);
    }

    return c;
  }

  L.isPointInRange = function (el, pt) {
    if (el.type == "circle") {
      var d = Math.pow(el.attrs.x - pt.x, 2) + Math.pow(el.attrs.y - pt.y, 2);
      return d <= el.attrs.r * el.attrs.r;
    }
    else {
      var poly = el.coords;
      for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) {
        ((poly[i][1] <= pt.y && pt.y < poly[j][1]) || (poly[j][1] <= pt.y && pt.y < poly[i][1]))
        && (pt.x < (poly[j][0] - poly[i][0]) * (pt.y - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])
        && (c = !c);
      }
      return c;
    }
  }

  L.extend = function(obj) {
    [].slice.call(arguments, 1).forEach(function(source) {
      for (var prop in source) {
        if (source[prop] !== void 0) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  L.is = function (type, obj) {
    var clas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
  }

  L.isAllN = function (o) {
    for (var i = 0, l = o.length; i < l; i++) {
      if (!L.is("Number", o[i])) {
        return false;
      }
    }
    return true;
  }

  // uuid https://gist.github.com/982883
  L.uuid = function b (a) {
    return a ? (a^Math.random()*16>>a/4).toString(16) : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, b);
  }

  L.rad = function (deg) {
    return deg % 360 * Math.PI / 180;
  };

  L.deg = function (rad) {
    return rad * 180 / Math.PI % 360;
  };

  // setup leonardo api
  for (var i = 0, l = cevents.length; i < l; i++) {
    (function (n) {
      Leo.prototype[n] = function (e) {
        var p = this.getPos(e)
          , events = this.events[n];
        // process elements for specific event
        for (var i = events.length - 1; i >= 0; i--) {
          var el = events[i]
            , val = handlers[n].call(this, el, p, i, events);

          if (val) {
            return true;
          }
        }
      }
    })(cevents[i]);
  }
}).call(this);

// colors helpers
(function (L) {
  L.C = {
    rgbRegex: /^rgb\(([0-255]{1,3}),\s*([0-255]{1,3}),\s*([0-255]{1,3})\)$/ig,
    singleHexRegex: /^([a-f0-9])([a-f0-9])([a-f0-9])$/i,
    tripleHexRegex: /^([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i,

    hex2rgb: function (hex) {
      var hex = (hex[0] == "#") ? hex.substr(1) : hex;

      if (hex.length == 3) {
        var temp = this.singleHexRegex.exec(hex).slice(1);
        for (var i = 0; i < 3; i++) {
          hex += temp[i];
        }
      }

      var triplets = this.tripleHexRegex.exec(hex).slice(1);

      return {
        r: parseInt(triplets[0], 16),
        g: parseInt(triplets[1], 16),
        b: parseInt(triplets[2], 16)
      };
    },

    //TODO: IE support
    // http://dean.edwards.name/weblog/2009/10/convert-any-colour-value-to-hex-in-msie/
    txt2rgb: function (txtColor) {
      var el = d.getElementById('txt2rgb');
      if (!el) {
        el = d.createElement("div");
        attr = d.createAttribute('id');
        attr.value = 'txt2rgb';
        el.setAttributeNode(attr);
        el.style.display = "none";
        d.body.appendChild(el);
      }

      el.style.color = txtColor;
      return ww.getComputedStyle(el).color;
    },

    rgb2rgba: function (rgb, opacity) {
      var rgb = this.rgbRegex.exec(color);
      if (rgb && rgb.length == 4) {
        return "rgba(" + rgb[1] + ", " + rgb[2] + ", " + rgb[3] + ", " + opacity + ")";
      }
      return rgb;
    },

    // converts given color to rgba if opacity is present
    toColor: function (color, opacity) {
      if (typeof opacity != "undefined") {
        if (color.indexOf('rgba') > -1) {
          return color;
        }
        else if (color.charAt() === "#") {
          var rgb = this.hex2rgb(color);
          return "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + opacity + ")";
        }
        else if (color.indexOf('rgb') > -1) {
          return this.rgb2rgba(color);
        }
        else {
          return this.rgb2rgba(this.txt2rgb(color));
        }
      }
      return color;
    }
  };
})(Leonardo);

(function (L) {

  function Matrix() {
    this.reset();
  }

  Matrix.prototype =  {
    reset: function () {
      this.m = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    },

    add: function (a, b, c, d, e, f) {
      var o = [[], [], []]
        , m = [[a, c, e], [b, d, f], [0, 0, 1]]
        , x, y, z, res;

      for (x = 0; x < 3; x++) {
        for (y = 0; y < 3; y++) {
          res = 0;
          for (z = 0; z < 3; z++) {
            res += this.m[x][z] * m[z][y];
          }
          o[x][y] = res;
        }
      }
      this.m = o;
    },

    translate: function (x, y) {
      this.add(1, 0, 0, 1, x, y);
    },

    scale: function (x, y, cx, cy) {
      y == null && (y = x);
      (cx || cy) && this.add(1, 0, 0, 1, cx, cy);
      this.add(x, 0, 0, y, 0, 0);
      (cx || cy) && this.add(1, 0, 0, 1, -cx, -cy);
    },

    rotate: function (a, x, y) {
      a = L.rad(a);
      x = x || 0;
      y = y || 0;
      var cos = Math.cos(a).toFixed(9)
        , sin = Math.sin(a).toFixed(9);
      this.add(cos, sin, -sin, cos, x, y);
      this.add(1, 0, 0, 1, -x, -y);
    },

    x: function (x, y) {
      return x * this.m[0][0] + y * this.m[0][1] + this.m[0][2];
    },

    y: function (x, y) {
      return x * this.m[1][0] + y * this.m[1][1] + this.m[1][2];
    },

    xy: function (x, y) {
      return [this.x(x, y), this.y(x, y)];
    }
  }

  L.matrix = function () {
    return new Matrix();
  };

  L.Matrix = Matrix;

})(Leonardo);

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
          this.ctx.arc(a.x - a.dx, a.y - a.dy, a.r, 0, Math.PI * 2, true);
          this.updateBbox({x: a.x - a.dx - a.r, y: a.y - a.dy - a.r, w: 2 * a.r, h: 2 * a.r});
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

      this.ctx.strokeStyle = "#ff0000";
      this.ctx.rect(this.bbox.x, this.bbox.y, this.bbox.w, this.bbox.h);

      this.ctx.stroke();

      if (a.fill) {
        this.ctx.fill();
      }

      // text
      if (a.text) {
        this.processText();
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
