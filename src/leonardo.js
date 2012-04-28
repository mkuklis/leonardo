(function () {

  // global
  var w = this
    , d = w.document;

  this.Leonardo = function (args) {
    args = args || arguments;
    this.canvas = L.createCanvas.apply(this, args);
    this.ctx = this.canvas.getContext("2d");
    this.elements = [];
    L.init.call(this);
  }

  this.leo = function () {
    return new Leonardo(arguments);
  }

  var L = Leonardo;
  L.version = 0.1;
  L.debug = false;

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
    // create circle element
    circle: function (x, y, r, attrs) {
      var pos = { x: x || 0, y: y || 0, r: r || 0 }
        , circle = L.E('circle', L.extend(pos, attrs), this);

      return circle;
    },

    // create rect element
    rect: function (x, y, w, h, r, attrs) {
      var pos = { x: x || 0, y: y || 0, w: w || 0, h: h || 0, r: r || 0 }
        , rect = L.E('rect', L.extend(pos, attrs), this);
      return rect;
    },

    path: function (attrs) {
      var path;

      if (L.is('Array', attrs)) {
        attrs = {path: attrs};
      }

      path = L.E('path', attrs, this, options);

      return path;
    },

    // create image element
    image: function (src, x, y, w, h, attrs) {
      var pos = {src: src, x: x || 0, y: y || 0, w: w || 0, h: h || 0}
        , image = L.E('image', L.extend(pos, attrs), this);

      return image;
    },

    // redraws all elements
    redraw: function (callback) {
      this.clear();
      for (var i = 0, l = this.elements.length; i < l; i++) {
        var el = this.elements[i];
        callback && callback.call(this, el);
        el.draw();
      }
    },

    // clears paper, removes all elements
    reset: function () {
      //var events = this.events;
      /*
      cevents.forEach(function (name) {
        if (events[name]) {
          events[name].splice(0, events[name].length);
        }
      });
      */

      this.elements.splice(0, this.elements.length);
      this.flags = {};
      this.clear();
    },

    // clears paper keeps all elements in memory
    clear: function () {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.beginPath();
    },

    // returns pixel for given position
    // useful for testing
    getPx: function (x, y) {
      return this.ctx.getImageData(x, y, 1, 1).data;
    },

    getPxColor: function (x, y) {
      var px = this.getPx(x, y);
      if (px[0] === 0 && px[1] === 0 && px[2] === 0) {
        return (px[3] === 0) ? "#ffffff" : "#000000";
      }

      return "#" + L.C.rgbToHex(px[0], px[1], px[2]);
    }
  };

  L.prototype = L.fn;

  // static functions

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

  L.extend = function(obj) {
    [].slice.call(arguments, 1).forEach(function(source) {
      for (var prop in source) {
        if (source[prop] !== void 0) { obj[prop] = source[prop]; }
      }
    });
    return obj;
  };

  L.is = function (type, obj) {
    var clas = L.typeOf(obj);
    return typeof obj != "undefined" && obj !== null && clas === type;
  }

  L.typeOf = function (obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
  }

  L.A = [];

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

}).call(this);
