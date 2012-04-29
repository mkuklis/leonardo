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

    if (!(this instanceof E)) {
      return new E(type, attrs, leonardo, options);
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

    E.init.call(this);
  }


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
     * stroke-width {Number} - stroke width in pixels default is '1'
     * text-position {String} - position of the text in the format
     *                          vertical-align:horizontal-align
     *                          default is 'center:middle'
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
      this.ctx.strokeStyle = L.C.toColor(a.stroke, a.stroke-opacity);
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
    }
  }

  E.isGradient = function (str) {
    return str[0] == "r" || str[0] == "l";
  }

  E.prototype = E.fn;
  L.E = E;

})(Leonardo);
