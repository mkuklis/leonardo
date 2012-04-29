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
   * Initialize `Leonardo` for the given parameters.
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
   *
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
   * Initialize `Leonardo` for the given parameters.
   * Shortcut to `Leonardo` constructor.
   *
   * @api public
   */

  this.leonardo = function () {
    return new Leonardo(arguments);
  }

  var L = Leonardo;
  L.version = 0.1;
  L.debug = false;

  /**
   * Register callback executed during constructor
   * initialization. Used by `Leonardo` and `Element`.
   *
   * @param {Function} fn
   *
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
     * Create circle element.
     *
     * @param {Number} x - x coordinate of the centre
     * @param {Number} y - y coordinate of the centre
     * @param {Number} r - radius
     *
     * @param {Object} attrs - additional attributes
     * described by `Element.attr`
     *
     * @api public
     */

    circle: function (x, y, r, attrs) {
      var pos = { x: x || 0, y: y || 0, r: r || 0 }
        , circle = L.E('circle', L.extend(pos, attrs), this);

      return circle;
    },

    /**
     * Create rectangle element.
     *
     * @param {Number} x - x coordinate of the top left corner
     * @param {Number} y - y coordinate of the top left corner
     * @param {Number} w - width
     * @param {Number} h - height
     * @param {Number} r - radius for rounded corners, default is 0
     *
     * @param {Object} attrs - additional attributes
     * described by `Element.attr`
     *
     * @api public
     */

    rect: function (x, y, w, h, r, attrs) {
      var pos = { x: x || 0, y: y || 0, w: w || 0, h: h || 0, r: r || 0 }
        , rect = L.E('rect', L.extend(pos, attrs), this);
      return rect;
    },

    /**
     * Create path element.
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
     *
     * @api public
     */

    path: function (command) {
      var path;

      if (L.is('Array', command)) {
        command = {path: command};
      }

      path = L.E('path', command, this, options);
      return path;
    },

    /**
     * Create image element.
     *
     * @param {String} src
     * @param {Number} x - x coordinate of the top left corner
     * @param {Number} y - y coordinate of the top left corner
     * @param {Number} w - width
     * @param {Number} h - height
     * @param {Object} attrs -  additional attributes described
     *                 by `Element.attr`
     *
     * @api public
     */

    image: function (src, x, y, w, h, attrs) {
      var pos = {src: src, x: x || 0, y: y || 0, w: w || 0, h: h || 0}
        , image = L.E('image', L.extend(pos, attrs), this);

      return image;
    },

    /**
     * Redraw all elemenets into canvas. Additional callback
     * can be passed to execute for each element before rendering.
     *
     *
     * @param {Function} callback
     *
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
     * Reset leonardo state. Remove all elements
     * and clear canvas.
     *
     * @api public
     */

    reset: function () {
      this.elements.splice(0, this.elements.length);
      this.flags = {};
      this.clear();
    },

    /**
     * Clear canvas. Elements are preserved in memory.
     *
     * @api public
     */

    clear: function () {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.beginPath();
    },

    /**
     * Return a `CanvasPixelArray` object which presents
     * single object on canvas.
     *
     * @param {Number} x
     * @param {Number} y
     *
     * @api public
     */

    getPx: function (x, y) {
      return this.ctx.getImageData(x, y, 1, 1).data;
    },

    /**
     * Return a hexadecimal color from given pixel
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
   * Create proxy for given `Function` and context.
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
   * Create or reference canvas element for
   * given arguments.
   *
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
   * Extend given object with passed arguments.
   *
   * @param {Object} obj
   *
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
   * Test type of given argument.
   *
   * @param {String} type
   * @param {Object} obj
   *
   * @api private
   */

  L.is = function (type, obj) {
    var clas = L.typeOf(obj);
    return typeof obj != "undefined" && obj !== null && clas === type;
  };

  /**
   * Return type of given object.
   *
   * @param {Object} obj
   *
   * @api private
   */

  L.typeOf = function (obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
  };

  /**
   * Check if all items of given array are numeric.
   *
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
   * Generate uuid.
   * https://gist.github.com/982883
   *
   * @api private
   */

  L.uuid = function b(a) {
    return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b);
  };

  /**
   * Convert given degrees to radians.
   *
   * @param {Number} deg
   *
   * @api private
   */

  L.rad = function (deg) {
    return deg % 360 * Math.PI / 180;
  };

  /**
   * Convert given radians to degrees.
   *
   * @param {Number} rad
   *
   * @api private
   */

  L.deg = function (rad) {
    return rad * 180 / Math.PI % 360;
  };

}).call(this);
