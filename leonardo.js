(function () {

  // global
  var w = this
    , d = w.document
    // valid attributes
    , vattrs = {x:1,y:1,r:1,w:1,h:1,fill:1,path:1};

  function L() {
    if (!(this instanceof L)) {
      return new L();
    }

    this.canvas = L.createCanvas(arguments);
    this.ctx = this.canvas.getContext("2d");
    this.elements = [];
  }

  L.prototype = {
    circle: function (x, y, r) {
      var attrs = {x: x || 0, y: y || 0, r: r || 0};
      // create circle element
      var circle = E('circle', attrs, this);
      circle.draw();
      return circle;
    },

    rect: function (x, y, w, h, r) {
      var attrs = {x: x || 0, y: y || 0, w: w || 0, h: h || 0, r: r || 0};
      var rect = E('rect', attrs, this);
      rect.draw();
      return rect;
    },

    path: function (p) {

      if (!L.isO(p)) {
        //p = L.parsePath()
      }

      var attrs = {path: p};
      var path = E('path', attrs, this);
      path.draw();
      return path;
    },

    // process all elements and redraws them
    redraw: function () {
      this.clear();
      this.elements.forEach(function (el) {
        el.draw();
      });
    },

    // clears canvas
    clear: function () {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.beginPath();
    }
  };

  // element
  var E = function (type, attrs, l) {
    if (!(this instanceof E)) {
      return new E(type, attrs, l);
    }

    this.type = type;
    this.attrs = attrs;
    this.l = l; // leonardo
    this.l.elements.push(this);
  }

  E.prototype = {
    attr: function (args) {
      for (key in args) {
        // TODO: test for correct attributes
        if (vattrs[key]) {
          this.attrs[key] = args[key];
        }
      }
      // redraw all elements
      this.l.redraw();
      return this;
    },

    // TODO make it per type?
    draw: function () {
      var a = this.attrs,
          self = this;

      this.l.ctx.beginPath();

      if (a.fill) {
        this.l.ctx.fillStyle = a.fill;
      }

      // TODO test for type?
      if (this.type == "circle") {
        this.l.ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2, true);
        this.l.ctx.stroke();
        this.l.ctx.fill();
      }

      if (this.type == "rect") {
        this.l.ctx.fillRect(a.x, a.y, a.w, a.h);
        this.l.ctx.strokeRect(a.x, a.y, a.w, a.h);
      }

      if (this.type == "path") {
        this.attrs.path.forEach(this.processPath, this);
        this.l.ctx.stroke();
      }

      this.l.ctx.closePath();
    },

    processPath: function (p) {
      for (c in p) {
        switch(c) {
          case 'M':
            this.l.ctx.moveTo(p[c][0], p[c][1]);
            break;
          case 'L':
            for (var i = 0, l = p[c].length; i < l; i += 2) {
              this.l.ctx.lineTo(p[c][i], p[c][i + 1]);
            }
            break;
          case 'V':
            for (var i = 0, l = p[c].length; i < l; i += 2) {
              this.l.ctx.lineTo(0, p[c][i]);
            }
            break;
          case 'H':
            for (var i = 0, l = p[c].length; i < l; i += 2) {
              this.l.ctx.lineTo(p[c][i], 0);
            }
        }
      }
    }
  }

  // create canvas
  L.createCanvas = function (args) {
    var c;

    if (args.length == 4) {
      if (L.isAllN(args)) {
        c = d.createElement("canvas");
        c.style.position = "absolute";
        c.style.left = args[0] + 'px';
        c.style.top = args[1] + 'px';
        c.setAttribute('width', args[2]);
        c.setAttribute('height', args[3]);
        d.body.appendChild(c);
      }
    }
    return c;
  }

  this.Leonardo = L;

  L.version = 0.1;

  L.toString = function () {
    return "Leonardo ver. " + L.version;
  }

  // hash values to array
  L.toA = function (h) {
    var a = [];
    for (k in h) {
      a.push(h[k]);
    }
    return a;
  }

  L.isA = Array.isArray || function (o) {
    return toString.call(o) == '[object Array]';
  }

  L.isN = function(o) {
    return toString.call(o) == '[object Number]';
  }

  L.isO = function (o) {
    return toString.call(o) == '[object Object]';
  }

  L.isAllN = function (o) {
    for (var i = 0, l = o.length; i < l; i++) {
      if (!L.isN(o[i])) {
        return false;
      }
    }
    return true;
  }

}).call(this);
