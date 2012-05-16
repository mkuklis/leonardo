/*!
 * Leonardo
 * Copyright(c) 2012 Michal Kuklis <michal.kuklis@gmail.com>
 * MIT Licensed
 */

(function () {

  // globals
  var w = this
    , d = w.document
    , slice = Array.prototype.slice;

  /**
   * Initializes `Leonardo` for the given parameters.
   *
   * Canvas object will be created or referenced from DOM
   * based on given paramenters.
   *
   * Parameter types:
   *
   * @param {String} container - DOM element or the ID of the canvas
   *
   * or:
   *
   * @param {Number} top
   * @param {Number} left
   * @param {Number} width
   * @param {Number} height
   *
   * or:
   *
   * @param {Array} all - combination of parameters passed as Array
   * @api public
   */

  this.Leonardo = function () {
    var args = arguments,
        opts = (L.is('Arguments', args[0])) ? args[0] : args;

    this.canvas = L.createCanvas.apply(this, opts);
    this.ctx = this.canvas.getContext("2d");
    this.elements = [];
    L.init.call(this);
  }

  /**
   * Initializes `Leonardo` for the given parameters.
   * Shortcut to `Leonardo` constructor.
   * @api public
   */

  this.leonardo = function () {
    return new Leonardo(arguments);
  }

  var L = Leonardo;
  L.version = 0.1;
  L.debug = false;

  /**
   * Registers callback executed during constructor
   * initialization. Used by `Leonardo` and `Element`.
   *
   * @param {Function} fn
   * @api private
   */

  L.init = function (fn) {
    if (fn) {
      this.inits = this.inits || [];
      this.inits.push(fn);
    }
    else {
      var ctr = this.constructor;
      ctr.inits && ctr.inits.forEach(function (fnc) {
        fnc.call(this);
      }, this);
    }
  }

  // leonardo API
  L.fn = {
    constructor: L,

    /**
     * Creates circle element.
     *
     * @param {Number} x - x coordinate of the centre
     * @param {Number} y - y coordinate of the centre
     * @param {Number} r - radius
     *
     * @param {Object} attrs - additional attributes
     * described by `Element.attr`
     * @api public
     */

    circle: function (x, y, r, attrs) {
      var pos = { x: x || 0, y: y || 0, r: r || 0 }
        , circle = L.E('circle', L.extend(pos, attrs), this);

      circle.draw();

      return circle;
    },

    /**
     * Creates rectangle element.
     *
     * @param {Number} x - x coordinate of the top left corner
     * @param {Number} y - y coordinate of the top left corner
     * @param {Number} w - width
     * @param {Number} h - height
     * @param {Number} r - radius for rounded corners, optional default is 0
     * @param {Object} attrs - optional attributes described
     *  by `Element.attr`
     *
     * @api public
     */

    rect: function (x, y, w, h, r, attrs) {
      var args = arguments, pos, rect;

      if (args.length == 5 && L.is("Object", args[4])) {
        attrs = args[4];
      }

      pos = { x: x || 0, y: y || 0, w: w || 0, h: h || 0, r: r || 0 };
      rect = L.E('rect', L.extend(pos, attrs), this);

      rect.draw();

      return rect;
    },

    /**
     * Creates path element.
     * Path can be used to draw lines, polygons and curves.
     * Command argument represents single path command or multiple
     * commands passed as {Array}.
     *
     * Commands:
     *
     *  {M: [x, y]} - move to point with x, y coordinates
     *  {L: [x, y]} - draw line to x, y
     *  {V: x}      - draw vertical line to x
     *  {H: y}      - draw horizontal line
     *  {Q: [cp1x, cp1y, x1, y1, cp2x, cp2y, x2, y2, ...]} - draw quadratric curve
     *  {B: [cp1x, cp1y, cp2x, cp2y, x, y, ....]} - draw bezier curve
     *
     * @param {Object} command
     *
     * or
     *
     * @param {Array} command
     * @api public
     */

    path: function (command, attrs, options) {
      var path;

      if (L.is('Array', command)) {
        command = {path: command};
      }

      path = L.E('path', L.extend(command, attrs), this, options);

      path.draw();

      return path;
    },

    /**
     * Creates image element.
     *
     * @param {String} src
     * @param {Number} x - x coordinate of the top left corner
     * @param {Number} y - y coordinate of the top left corner
     * @param {Number} w - width
     * @param {Number} h - height
     * @param {Object} attrs -  additional attributes described
     *                 by `Element.attr`
     * @api public
     */

    image: function (src, x, y, w, h, attrs) {
      var pos = {src: src, x: x || 0, y: y || 0, w: w || 0, h: h || 0}
        , image = L.E('image', L.extend(pos, attrs), this);

      image.draw();

      return image;
    },

    /**
     * Redraws all elemenets into canvas. Additional callback
     * can be passed to execute for each element before rendering.
     *
     *
     * @param {Function} callback
     * @api public
     */

    redraw: function (callback) {
      this.clear();
      for (var i = 0, l = this.elements.length; i < l; i++) {
        var el = this.elements[i];
        callback && callback.call(this, el);
        el.draw();
      }
    },

    /**
     * Resets leonardo state. Remove all elements
     * and clear canvas.
     * @api public
     */

    reset: function () {
      this.elements.splice(0, this.elements.length);
      this.flags = {};
      this.clear();
    },

    /**
     * Clears canvas. Elements are preserved in memory.
     * @api public
     */

    clear: function () {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.beginPath();
    },

    /**
     * Returns a `CanvasPixelArray` object which presents
     * single object on canvas.
     *
     * @param {Number} x
     * @param {Number} y
     * @api public
     */

    getPx: function (x, y) {
      return this.ctx.getImageData(x, y, 1, 1).data;
    },

    /**
     * Returns a hexadecimal color from given pixel
     * for given position.
     *
     * @param {Number} x
     * @param {Number} y
     *
     * @pi public
     */
    getPxColor: function (x, y) {
      var px = this.getPx(x, y);
      if (px[0] === 0 && px[1] === 0 && px[2] === 0) {
        return (px[3] === 0) ? "#ffffff" : "#000000";
      }

      return "#" + L.C.rgbToHex(px[0], px[1], px[2]);
    }
  };

  // attach api to prototype
  L.prototype = L.fn;

  // static functions

  L.toString = function () {
    return "Leonardo ver. " + L.version;
  };

  /**
   * Creates proxy for given `Function` and context.
   *
   * @param {Function} func
   * @param {Object} ctx
   *
   */
  L.proxy = function (fn, ctx) {
    return function () {
      fn.apply(ctx, arguments);
    }
  };

  /**
   * Creates or references canvas element for
   * given arguments.
   * @api private
   */

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
  };

  /**
   * Extends given object with passed arguments.
   *
   * @param {Object} obj
   * @api private
   */

  L.extend = function (obj) {
    var args = slice.call(arguments, 1), src;
    for (var i = 0, l = args.length; i < l; i++) {
      src = args[i];
      for (var prop in src) {
        if (src[prop] !== void 0) { obj[prop] = src[prop]; }
      }
    }
    return obj;
  };

  /**
   * Tests type of given argument.
   *
   * @param {String} type
   * @param {Object} obj
   * @api private
   */

  L.is = function (type, obj) {
    var clas = L.typeOf(obj);
    return typeof obj != "undefined" && obj !== null && clas === type;
  };

  /**
   * Returns type of given object.
   *
   * @param {Object} obj
   * @api private
   */

  L.typeOf = function (obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
  };

  /**
   * Checks if all items of given array are numeric.
   * @api private
   */

  L.isAllN = function (array) {
    for (var i = 0, l = array.length; i < l; i++) {
      if (!L.is("Number", array[i])) {
        return false;
      }
    }
    return true;
  };

  /**
   * Generates uuid.
   * https://gist.github.com/982883
   * @api private
   */

  L.uuid = function b(a) {
    return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b);
  };

  /**
   * Converts given degrees to radians.
   *
   * @param {Number} deg
   * @api private
   */

  L.rad = function (deg) {
    return deg % 360 * Math.PI / 180;
  };

  /**
   * Converts given radians to degrees.
   *
   * @param {Number} rad
   * @api private
   */

  L.deg = function (rad) {
    return rad * 180 / Math.PI % 360;
  };

}).call(this);

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
      y === null && (y = x);
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

// colors helpers
(function (L) {
  L.C = {
    rgbRegex: /^rgb\(([0-255]{1,3}),\s*([0-255]{1,3}),\s*([0-255]{1,3})\)$/ig,
    singleHexRegex: /^([a-f0-9])([a-f0-9])([a-f0-9])$/i,
    tripleHexRegex: /^([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i,

    // hex to rgb
    h2rgb: function (hex) {
      hex = (hex[0] == "#") ? hex.substr(1) : hex;

      if (hex.length == 3) {
        var temp = this.singleHexRegex.exec(hex).slice(1);
        for (var i = 0; i < 3; i++) {
          hex += temp[i];
        }
      }

      var trio = this.tripleHexRegex.exec(hex).slice(1);

      return {
        r: parseInt(trio[0], 16),
        g: parseInt(trio[1], 16),
        b: parseInt(trio[2], 16)
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
      rgb = this.rgbRegex.exec(color);

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
          var rgb = this.h2rgb(color);
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
    },

    d2c: function (decA) {
      return "#" + this.d2h(decA[0]) + this.d2h(decA[1]) + this.d2h(decA[2]);
    },

    rgb2h: function (r, g, b) {
      return this.d2h(r) + this.d2h(g) + this.d2h(b);
    },

    h2d: function (h) {
      return parseInt(h, 16);
    },

    d2h: function (n) {
      n = parseInt(n, 10);
      if (isNaN(n)) {
        return "00";
      }
      n = Math.max(0, Math.min(n, 255));
      return "0123456789ABCDEF".charAt((n - n % 16) / 16) + "0123456789ABCDEF".charAt(n % 16);
    },

    c2d: function (color) {
      var rgb = this.h2rgb(color);
      return [rgb.r, rgb.g, rgb.b];
    }
  };
})(Leonardo);

/*!
 * Leonardo
 * Copyright(c) 2012 Michal Kuklis <michal.kuklis@gmail.com>
 * MIT Licensed
 */

(function (L) {

  // path commands used by `Leonardo.path`
  // executed in the context of `Element`
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

    // draw commands executed in the context of the `Element`
    , drawCommmands = {
        circle: function (a) {
          this.ctx.arc(a.tx, a.ty, a.r, 0, Math.PI * 2, true);
          this.updateBbox({x: a.tx - a.r, y: a.ty - a.r, w: 2 * a.r, h: 2 * a.r});
        }
      , rect: function (a) {
          if (a.r && a.r > 0) {
            this.roundRect();
          }
          else {
            this.ctx.rect(a.tx, a.ty, a.w, a.h);
          }
          this.updateBbox({x: a.tx, y: a.ty, w: a.w, h: a.h});
        }
      , path: function () {
          this.attrs.path.forEach(function (p) {
            for (var c in p) { pathCommands[c].call(this, p[c]); }
          }, this);
        }
      , image: function (a) {
          this.processImage();
          this.updateBbox({x: a.x, y: a.y, w: a.w, h: a.h});
        }
      };

  /**
   * Initializes `Element` object.
   *
   * Represents drawing element. Supported types are:
   * circle, rect, path, image.
   *
   * @param {String} type
   * @param {Object} attrs
   * @param {Leonardo} leonardo
   * @param {Object} options
   * @api public
   */

  var Element = function (type, attrs, leonardo, options) {

    if (!(this instanceof Element)) {
      return new Element(type, attrs, leonardo, options);
    }

    options = options || {};

    attrs.tx = attrs.x;
    attrs.ty = attrs.y;
    attrs.dx = 0;
    attrs.dy = 0;

    this.id = L.uuid();
    this.type = type;
    this.attrs = attrs;
    this.l = leonardo;
    this.ctx = this.l.ctx;

    // bbox
    this.bbox = {x: Infinity, y: Infinity, w: 0, h: 0};

    // set of draw callbacks
    this.drawCallbacks = [];

    if (options.back) {
      this.l.elements.unshift(this);
    }
    else {
      this.l.elements.push(this);
    }

    Element.init.call(this);
  }

  // element shortcut
  var E = Element;

  E.init = L.init;

  // Element API
  E.fn = {
    constructor: E,

    /**
     * Sets attributes for element.
     * Gets attribute value if attrName is passed.
     * Gets array of values if array of attrNames is passed
     *
     * Possible attributes:
     *
     * x {Number} - the x-axis coordinate
     * y {Number} - the y-axis coordinate
     * w {Number} - width
     * h {Number} - height
     * r {Number} - radius for circle or rounded corner for rect
     * cx {Number} - the x-axis coordinate of the center of the circle, or ellipse
     * cy {Number} - the y-axis coordinate of the center of the circle, or ellipse
     * fill {String} - color, gradient, image
     * opacity {Number}
     * stroke {String} - color default is '#000000'
     * stroke-width {Number} - stroke width in pixels default is '1'
     * stroke-opacity {Number}
     * text-position {String} - position of the text in the format
     * vertical-align:horizontal-align default is 'center:middle'
     * font {String} - font name and size default is '10px sans-serif'
     * font-color {String} - font color default is '#000000'
     * src {String} - image URL for `Element.image`
     *
     * Parameters:
     *
     * @param {Object} args - name/value pairs
     * @param {Object} options
     *
     * or:
     *
     * @param {String} attrName
     *
     * or:
     *
     * @param {Array} attrNames
     *
     * @return {Element} when attributes are being set
     * @return {...} value of the attribute if attrName is passed
     * @return {Array} values of the attirbutes if attrNames are passed
     * @api public
     */

    attr: function (args, options) {

      options = options || {};

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

      if (!options.silent) {
        this.em.trigger('change:attrs', this);
      }

      return this;
    },

    /**
     * Redraws element on canvas.
     *
     * Currently this call is very expensive
     * and redraws all elements.
     * @api public
     */

    redraw: function () {
      this.l.redraw();
    },

    /**
     * Draws element on canvas.
     *
     * @return {Element}
     * @api public
     */

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
        this.processTransform();
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

      return this;
    },

    /**
     * Updates internal coordinates.
     *
     * @api private
     */

    updateCoords: function () {
      var a = this.attrs;
      // transformation present
      if (this.trans && this.trans.r) {
        this.coords = [[a.tx, a.ty], [a.tx + a.w, a.ty],
          [a.tx + a.w, a.ty + a.h], [a.tx, a.ty + a.h]];

        for (var i = 0, l = this.coords.length; i < l; i++) {
          var c = this.coords[i];
          this.coords[i] = this.m.xy(c[0], c[1]);
        }
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
    },

    /**
     * Creates and returns color or gradient.
     *
     * @return {String} rgba color
     * @return {String} gradient
     * @api private
     */

    createStyle: function () {
      var a = this.attrs;

      if (E.isGradient(a.fill)) {
        return this.processGradient(a.fill);
      }

      return L.C.toColor(a.fill, a.opacity);
    },

    /**
     * Processes attributes related to text.
     *
     * @api private
     */

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

    /**
     * Processes attributes related to image.
     *
     * @api private
     */

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

    /**
     * Processes gradient based on the `fill` attribute.
     *
     * Radial and linear gradients are supported.
     *
     * gradient format:
     *
     * type:number-color:number-color:number-color
     *
     * where:
     *  type - 'r' for radian and 'l' for linear
     *  number - represents the position of the color stop
     *  color - color
     *
     * Example:
     *
     * r:0-#A7D30C:0.9-#019F62:1-#fefefe
     *
     *
     * @return {CanvasGradient}
     * @api private
     */

    processGradient: function () {
      var a = this.attrs
        , g = a.split(":")
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

    /**
     * Draws rect with rounded corners.
     *
     * @api private
     */

    roundRect: function() {
      var a = this.attrs;

      this.ctx.beginPath();
      this.ctx.moveTo(a.x + a.r, a.y);
      this.ctx.lineTo(a.x + a.w - a.r, a.y);
      this.ctx.quadraticCurveTo(a.x + a.w, a.y, a.x + a.w, a.y + a.r);
      this.ctx.lineTo(a.x + a.w, a.y + a.h - a.r);
      this.ctx.quadraticCurveTo(a.x + a.w, a.y + a.h, a.x + a.w - a.r, a.y + a.h);
      this.ctx.lineTo(a.x + a.r, a.y + a.h);
      this.ctx.quadraticCurveTo(a.x, a.y + a.h, a.x, a.y + a.h - a.r);
      this.ctx.lineTo(a.x, a.y + a.r);
      this.ctx.quadraticCurveTo(a.x, a.y, a.x + a.r, a.y);
      this.ctx.closePath();
    },

    /**
     * Updates bbox state.
     *
     * @param {Object} a
     * @api private
     */

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

    /**
     * Returns element's bbox.
     *
     * @return {Object}
     * @api public
     */
    getBbox: function () {
      return this.bbox;
    }
  }

  E.isGradient = function (str) {
    return str[0] == "r" || str[0] == "l";
  }

  E.prototype = E.fn;
  L.E = E;

})(Leonardo);

(function (L) {

  // emitter
  L.em = (function (slice) {
    var events = []; //shared by element and leo

    function on(event, fn, ctx) {
      events[event] = events[event] || [];
      events[event].push({fn: fn, ctx: ctx || this});
    }

    function off(event) {
      if (!(event in events)) { return; }
      events[event].splice(events[event].indexOf(this), 1);
    }

    function reorder(event, ctx) {
      var bindings = events[event], fn, binding;

      for (var i = 0, l = bindings.length; i < l; i++) {
        binding = bindings[i];
        if (ctx == binding.ctx) {
          fn = binding.fn;
          bindings.splice(i, 1);
          bindings.push({fn: fn, ctx: ctx});

          return i;
        }
      }

      return -1;
    }

    function trigger(event) {
      var args, bindings;
      if (!(event in events)) { return; }

      args = slice.call(arguments, 1);
      bindings = events[event];

      for (var i = bindings.length - 1; i >= 0; i--) {
        var binding = bindings[i];
        binding.fn.apply(binding.ctx, args);
      }
    }

    return function () {
      this.em = {
        on: on,
        off: off,
        reorder: reorder,
        trigger: trigger
      };
      return this;
    };
  })([].slice);

})(Leonardo);

(function (L) {
  var E = L.E
    , events = "mouseover mouseout mousedown mouseup click".split(" ")
    , cevents = "mousedown mouseup mousemove click".split(" ")
    , emap = {
        "mouseover": "mousemove"
      , "mouseout": "mousemove"
      , "dragmove": "mousemove"
      , "dragstart": "mousedown"
      , "dragend": "mouseup"
    };

  var slice = Array.prototype.slice;

  // canvas event handlers
  var handlers = {
    click: function (pt) {
      if (isPointInRange(this, pt)) {
        this.execCallbacks('click', pt);
      }
    },

    mousemove: function (pt, curIndex) {
      // handle drag
      if (this.flags.dragging) {
        this.attr({x: pt.x - this.attrs.dx, y: pt.y - this.attrs.dy});
        this.redraw();
      }

      // handle mouseover
      else if (!this.flags.over && isPointInRange(this, pt)) {
        var prevIndex = this.l.flags.mouseover;
        if (!prevIndex || curIndex > prevIndex || this.l.flags.dragging) {
          if (curIndex > prevIndex) {
            var el = this.l.elements[prevIndex];
            el.execCallbacks('mouseout', pt);
            el.flags.over = false;
          }

          this.execCallbacks('mouseover', pt);
          this.l.flags.mouseover = curIndex;
          this.flags.over = true;
          return true;
        }
      }

      // handle mouseout
      else if (this.flags.over && !isPointInRange(this, pt)) {
        this.flags.over = false;
        this.execCallbacks('mouseout', pt);
        delete this.l.flags.mouseover;
      }
    },

    mousedown: function (pt) {
      if (isPointInRange(this, pt)) {
        if (!this.l.flags.dragging && this.callbacks.dragstart) {
          this.flags.dragging = true;
          this.l.flags.dragging = true;
          this.toFront();
          this.attr({dx: pt.x - this.attrs.x, dy: pt.y - this.attrs.y}, {silent: true});
          this.execCallbacks('dragstart', pt);
        }
        else {
          this.execCallbacks('mousedown', pt);
        }

        return true;
      }
    },

    mouseup: function (pt) {
      if (this.callbacks.dragend && this.flags.dragging) {
        this.flags.dragging = false;
        this.l.flags.dragging = false;
        this.execCallbacks('dragend', pt);
        this.em.trigger('dragend', this);
      }
      else {
        this.execCallbacks('mouseup', pt);
      }
    }
  };

  function getPos(e) {
    var x, y;
    if (e.touches) {
      x = e.touches[0].pageX - e.target.offsetLeft;
      y = e.touches[0].pageY - e.target.offsetTop;
    }
    else {
      x = e.pageX - e.target.offsetLeft;
      y = e.pageY - e.target.offsetTop;
    }

    return { x: x, y: y };
  }

  // test if the point is in range
  function isPointInRange (el, pt) {
    var d, poly;

    if (el.type == "circle") {
      d = Math.pow(el.attrs.x - pt.x, 2) + Math.pow(el.attrs.y - pt.y, 2);

      return d <= el.attrs.r * el.attrs.r;
    }
    else {
      poly = el.coords;
      for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) {
        ((poly[i][1] <= pt.y && pt.y < poly[j][1]) || (poly[j][1] <= pt.y && pt.y < poly[i][1])) &&
          (pt.x < (poly[j][0] - poly[i][0]) * (pt.y - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0]) &&
          (c = !c);
      }

      return c;
    }
  }

  L.fn.toFront = function (el) {
    var elems = this.elements,
        index = elems.indexOf(el);

    if (index < elems.length - 1) {
      elems.splice(index, 1);
      elems.push(el);
    }
  }

  var setupListener = function (event) {
    this.canvas.addEventListener(event, L.proxy(function (e) {
      this.em.trigger(event, getPos(e));
      e.preventDefault();
    }, this));
  }

  L.init(function () {
    this.flags = {};
    for (var i = 0, l = cevents.length; i < l; i++) {
      (L.proxy(setupListener, this))(cevents[i]);
    }
  });

  E.init(function () {
    this.flags = {};
    this.callbacks = {};
  });

  E.fn.drag = function (dragstart, dragmove, dragend) {
    var args = arguments;

    if (L.is('Object', args[0])) {
      var handlers = { dragstart: true, dragmove: true, dragend: true };
      handlers = L.extend(handlers, args[0]);

      for (var key in handlers) {
        this.on(key, handlers[key]);
      }

      return this;
    }

    this.on("dragstart", dragstart);
    this.on("dragmove", dragmove);
    this.on("dragend", dragend);

    return this;
  }

  E.fn.undrag = function () {
    this.off("dragstart");
    this.off("dragmove");
    this.off("dragend");
    return this;
  }

  E.fn.on = function (e, fn) {
    var event = emap[e] || e;

    this.callbacks[e] = this.callbacks[e] || [];
    this.em.on(event, handlers[event], this);

    if (fn) {
      this.callbacks[e].push(fn);
    }

    return this;
  }

  E.fn.off = function (event, fn) {
    if (this.callbacks[event]) {
      if (fn) {
        var index = this.callbacks[event].indexOf(fn);
        this.callbacks[event].splice(index, 1);
      }
      else {
        delete this.callbacks[event];
      }

      this.em.off(emap[event] || event);
    }

    return this;
  }

  E.fn.execCallbacks = function (event) {
    var callbacks = this.callbacks[event];
    if (callbacks) {
      var args = slice.call(arguments, 1);
      for (var i = 0, l = callbacks.length; i < l; i++) {
        L.is("Function", callbacks[i]) && callbacks[i].apply(this, args);
      }
    }
  }

  events.forEach(function (event) {
    E.fn[event] = function (fn) {
      this.on(event, fn);
      return this;
    }

    E.fn["un" + event] = function (fn) {
      this.off(event, fn);
      return this;
    }
  });

  E.fn.toFront = function () {
    this.l.toFront(this);
    var index = this.em.reorder('mousedown', this);
    if (index > -1) {
      this.l.flags.mouseover = index;
      this.redraw();
    }
  }

  /*
  E.fn.toBack = function () {
    var index = this.l.elements.indexOf(this)
      , elems = this.l.elements;

    elems.splice(index, 1);
    elems.unshift(this);
    this.redraw();
  }
  */

  L.em.call(L.prototype);
  L.em.call(L.E.prototype);

})(Leonardo);

// requestAnimationFrame shim
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// http://webstuff.nfshost.com/anim-timing/Overview.html
// http://dev.chromium.org/developers/design-documents/requestanimationframe-implementation
(function(w) {
  var lastTime = 0,
      vendors = ['ms', 'moz', 'webkit', 'o'];

  for (var i = 0, l = vendors.length; i < l && !w.requestAnimationFrame; ++i) {
    w.requestAnimationFrame = w[vendors[i] + 'RequestAnimationFrame'];
    w.cancelRequestAnimationFrame = w[vendors[i] + 'CancelRequestAnimationFrame'];
  }

  if (!w.requestAnimationFrame) {
    w.requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime(),
            timeToCall = Math.max(0, 16 - (currTime - lastTime)),
            id = w.setTimeout(function( ) { callback(currTime + timeToCall); },
          timeToCall);

        lastTime = currTime + timeToCall;
        return id;
    };
  }

  if (!w.cancelAnimationFrame) {
    w.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }
}(window));

/* The equations defined here are open source under BSD License.
 * http://www.robertpenner.com/easing_terms_of_use.html (c) 2003 Robert Penner
 * Adapted to single time-based by
 * Brian Crescimanno <brian.crescimanno@gmail.com>
 * Ken Snyder <kendsnyder@gmail.com>
 */
(function (L) {
  L.easings = {
    easeInQuad: function (pos) {
      return Math.pow(pos, 2);
    },

    easeOutQuad: function (pos) {
      return -(Math.pow((pos-1), 2) -1);
    },

    easeInOutQuad: function (pos) {
      return ((pos /= 0.5) < 1) ? 0.5 * Math.pow(pos, 2) : -0.5 * ((pos -= 2) * pos - 2);
    },

    easeInCubic: function (pos) {
      return Math.pow(pos, 3);
    },

    easeOutCubic: function (pos) {
      return (Math.pow((pos-1), 3) +1);
    },

    easeInOutCubic: function (pos) {
      return ((pos/=0.5) < 1) ? 0.5 * Math.pow(pos,3) : 0.5 * (Math.pow((pos - 2), 3) + 2);
    },

    easeInQuart: function (pos) {
      return Math.pow(pos, 4);
    },

    easeOutQuart: function (pos) {
      return -(Math.pow((pos - 1), 4) -1);
    },

    easeInOutQuart: function (pos) {
      return ((pos /= 0.5) < 1) ?
        0.5 * Math.pow(pos,4) : -0.5 * ((pos -= 2) * Math.pow(pos, 3) - 2);
    },

    easeInQuint: function (pos) {
      return Math.pow(pos, 5);
    },

    easeOutQuint: function (pos) {
      return (Math.pow((pos-1), 5) +1);
    },

    easeInOutQuint: function (pos) {
      return ((pos /= 0.5) < 1) ?
        0.5 * Math.pow(pos, 5) : 0.5 * (Math.pow((pos - 2), 5) + 2);
    },

    easeInSine: function (pos) {
      return -Math.cos(pos * (Math.PI/2)) + 1;
    },

    easeOutSine: function (pos) {
      return Math.sin(pos * (Math.PI/2));
    },

    easeInOutSine: function (pos) {
      return (-0.5 * (Math.cos(Math.PI*pos) -1));
    },

    easeInExpo: function (pos) {
      return (pos === 0) ? 0 : Math.pow(2, 10 * (pos - 1));
    },

    easeOutExpo: function (pos) {
      return (pos === 1) ? 1 : -Math.pow(2, -10 * pos) + 1;
    },

    easeInOutExpo: function (pos) {
      if (pos === 0) {
        return 0;
      }

      if (pos === 1) {
        return 1;
      }

      if ((pos /= 0.5) < 1) {
        return 0.5 * Math.pow(2,10 * (pos-1));
      }

      return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
    },

    easeInCirc: function (pos) {
      return -(Math.sqrt(1 - (pos * pos)) - 1);
    },

    easeOutCirc: function (pos) {
      return Math.sqrt(1 - Math.pow((pos - 1), 2))
    },

    easeInOutCirc: function (pos) {
      return ((pos/=0.5) < 1) ? -0.5 * (Math.sqrt(1 - pos * pos) - 1)
        : 0.5 * (Math.sqrt(1 - (pos-=2)*pos) + 1);
    },

    easeOutBounce: function (pos) {
      if ((pos) < (1/2.75)) {
        return (7.5625*pos*pos);
      } else if (pos < (2/2.75)) {
        return (7.5625*(pos-=(1.5/2.75))*pos + 0.75);
      } else if (pos < (2.5/2.75)) {
        return (7.5625*(pos-=(2.25/2.75))*pos + 0.9375);
      } else {
        return (7.5625*(pos-=(2.625/2.75))*pos + 0.984375);
      }
    },

    easeInBack: function (pos) {
      var s = 1.70158;
      return (pos) * pos * ((s + 1) * pos - s);
    },

    easeOutBack: function (pos) {
      var s = 1.70158;
      return (pos = pos- 1) * pos * ((s + 1) * pos + s) + 1;
    },

    easeInOutBack: function (pos) {
      var s = 1.70158;
      return ((pos /= 0.5) < 1) ? 0.5*(pos*pos*(((s*=(1.525))+1)*pos -s))
        : 0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos +s) +2);
    },

    elastic: function (pos) {
      return -1 * Math.pow(4,-8*pos) * Math.sin((pos*6-1)*(2*Math.PI)/2) + 1;
    },

    swingFromTo: function (pos) {
      var s = 1.70158;
      return ((pos /= 0.5) < 1) ? 0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s)) :
      0.5 * ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2);
    },

    swingFrom: function (pos) {
      var s = 1.70158;
      return pos * pos * ((s + 1) * pos - s);
    },

    swingTo: function (pos) {
      var s = 1.70158;
      return (pos -= 1) * pos * ((s + 1) * pos + s) + 1;
    },

    bounce: function (pos) {
      if (pos < (1/2.75)) {
        return (7.5625*pos*pos);
      } else if (pos < (2/2.75)) {
        return (7.5625*(pos-=(1.5/2.75))*pos + 0.75);
      } else if (pos < (2.5/2.75)) {
        return (7.5625*(pos-=(2.25/2.75))*pos + 0.9375);
      } else {
        return (7.5625*(pos-=(2.625/2.75))*pos + 0.984375);
      }
    },

    bouncePast: function (pos) {
      if (pos < (1/2.75)) {
        return (7.5625*pos*pos);
      } else if (pos < (2/2.75)) {
        return 2 - (7.5625*(pos-=(1.5/2.75))*pos + 0.75);
      } else if (pos < (2.5/2.75)) {
        return 2 - (7.5625*(pos-=(2.25/2.75))*pos + 0.9375);
      } else {
        return 2 - (7.5625*(pos-=(2.625/2.75))*pos + 0.984375);
      }
    },

    easeFromTo: function (pos) {
      return ((pos/=0.5) < 1) ? 0.5 * Math.pow(pos,4) :
        -0.5 * ((pos-=2)*Math.pow(pos,3) - 2);
    },

    easeFrom: function (pos) {
      return Math.pow(pos,4);
    },

    easeTo: function (pos) {
      return Math.pow(pos,0.25);
    }
  };
})(Leonardo);

(function (L) {

  var E = L.E;

  // leonardo animation api
  L.fn.animate = function () {
    requestAnimationFrame(L.proxy(function () {
      if (this.fxcounter > 0) {
        this.clear();
        for (var i = 0, l = this.elements.length; i < l; i++) {
          var el = this.elements[i];
          el.processFx();
          el.draw();
        }
      }
      this.animate();
    }, this));
  };

  // returns current time
  L.now = function () {
    return (Date.now) ? Date.now() : new Date().getTime();
  };

  L.init(function () {
    // # of fx elements
    this.fxcounter = 0;
    this.em.on('fx:add', function () {
      this.fxcounter += 1;
    }, this);

    this.em.on('fx:remove', function () {
      this.fxcounter -= 1;
    }, this);

    this.animate();
  });

  /**
   * animation tween
   *
   * sv - start value
   * ev - end value
   * st - start time
   * ms - duration
   * easing - easing function
   */
  function Tween(sv, ev, st, ms, easing) {
    this.sv = sv;
    this.ev = ev;
    this.st = st;
    this.ms = ms;
    this.easing = easing || "easeInQuad";
  }

  Tween.prototype = {
    run: function () {
      var result = [];
      if (L.is("Array", this.ev)) {
        for (var i = 0, l = this.ev.length; i < l; i++) {
          result.push(this.process(this.sv[i], this.ev[i]));
        }
        return result;
      }
      else {
        return this.process(this.sv, this.ev);
      }
    },

    // ev - end value
    // sv - start value
    process: function (sv, ev) {
      var nv = (ev - sv) * L.easings[this.easing]((L.now() - this.st) / this.ms) + sv;
      return (ev > sv) ? ((nv > ev) ? ev : nv) : ((nv < ev) ? ev : nv);
    },

    updateTime: function (delta) {
      this.st += delta;
    }
  };

  // tween converters
  var from = {
    fill: function (color) {
      return L.C.c2d(color);
    }
  };

  var to = {
    fill: function (color) {
      return L.C.d2c(color);
    }
  };

  var argTypes = {
    "Function": function (arg) {
      this.endFn = arg;
    },
    "Number": function (arg) {
      this.duration = arg;
    },
    "String": function (arg) {
      this.easing = arg;
    },
    "Object": function (opts) {
      this.duration = opts.duration;
      this.easing = opts.easing;
      this.endFn = opts.end;
      this.stepFn = opts.step;
    }
  };

  // animation object
  L.Animation = function (element, attrs, opts) {
    opts = L.A.slice.call(arguments, 2);

    this.el = element;
    this.sttrs = element.attrs; // start attrs
    this.attrs = attrs;
    this.status = "play";

    for (var i = 0, l = opts.length; i < l; i++) {
      var opt = opts[i];
      argTypes[L.typeOf(opt)].call(this, opt);
    }

    this.duration = this.duration || 400;
    this.easing = this.easing || "easeInQuad";
  }

  L.Animation.prototype = {
    start: function () {
      var st, ev, convert;

      this.tweens = [];

      for (var attr in this.attrs) {
        convert = from[attr];

        if (convert) {
          sv = convert(this.sttrs[attr]);
          ev = convert(this.attrs[attr]);
          this.addTween(sv, ev);
        }
        else {
          this.addTween(this.sttrs[attr], this.attrs[attr]);
        }
      }
    },

    // sv - start value
    // ev  end value
    addTween: function (sv, ev) {
      this.st = L.now();
      var tween = new Tween(sv, ev, this.st, this.duration, this.easing);
      this.tweens.push({attr: attr, tween: tween});
    },

    resume: function () {
      var delta = L.now() - this.ptime;
      for (var i = 0, l = this.tweens.length; i < l; i++) {
        this.tweens[i].tween.updateTime(delta);
      }

      this.status = "play";
    },

    stop: function () {
      // TODO: use pub/sub
      this.el.curAnim = null;
      this.endFn && this.endFn.call(this.el);
      this.el.ev.trigger('fx:remove', this);
    },

    isActive: function () {
      return this.status == "play";
    },

    pause: function () {
      this.ptime = L.now();
      this.status = "pause";
    },

    step: function () {
      var attr, tween, val, convert, done = false;

      for (var i = 0, l = this.tweens.length; i < l; i++) {
        attr = this.tweens[i].attr;
        tween = this.tweens[i].tween;
        convert = to[attr];
        val = tween.run();

        this.sttrs[attr] = (convert) ? convert(val) : val;
        done = (this.sttrs[attr] == this.attrs[attr]);
      }

      done && this.stop();
    }
  }

  E.init(function () {
    // animation queue
    this.animations = [];
  });

  // element fx api

  E.fn.animate = function (props, opts) {
    var anim = new L.Animation(this, props, opts);
    this.ev.trigger('fx:add', this);

    this.animations.push(anim);
    return this;
  }

  E.fn.pause = function () {
    if (this.curAnim && this.curAnim.isActive()) {
      this.curAnim.pause();
    }
  }

  E.fn.resume = function () {
    if (this.curAnim && !this.curAnim.isActive()) {
      this.curAnim.resume();
    }
  }

  // TODO: make this private?
  E.fn.processFx = function () {
    if (this.animations.length > 0 && !this.curAnim) {
      this.curAnim = this.animations.shift();
      this.curAnim.start();
    }
    else if (this.curAnim && this.curAnim.isActive()) {
      this.curAnim.step();
    }

    return this;
  }
})(Leonardo);

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
