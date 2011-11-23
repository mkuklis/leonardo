(function () {

  // global
  var w = this
    , d = w.document
    // valid attributes
    , vattrs = {x:1,y:1,cx:1,cy:1,r:1,w:1,h:1,fill:1,path:1}
    // path commands
    , pathCommands = {
      M: function (v) {
        this.l.ctx.moveTo(v[0], v[1]);
      },
      L: function (v) {
        for (var i = 0, l = v.length; i < l; i += 2) {
          this.l.ctx.lineTo(v[i], v[i + 1]);
        }
      },
      l: function (v) {

      },
      V: function (v) {
        this.l.ctx.lineTo(0, v);
      },
      H: function (v) {
        this.l.ctx.lineTo(v, 0);
      }
    };

  function L() {
    if (!(this instanceof L)) {
      return new L();
    }

    var self = this;
    this.canvas = L.createCanvas(arguments);
    this.ctx = this.canvas.getContext("2d");
    this.elements = [];
    this.events = {};

    this.canvas.onmousemove = function (e) {
      var x = e.pageX - self.canvas.offsetLeft;
      var y = e.pageY - self.canvas.offsetTop;
      self.mouseOver(x, y);
    }
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

    mouseOver: function (x, y) {
      var self = this;
      this.events.mo = this.events.mo || [];
      this.events.mo.forEach(function (el) {
        if (L.isInRange(el[0], {x:x, y:y})) {
          el[1].call(el[0]);
        }
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
        if (vattrs[key]) {
          this.attrs[key] = args[key];
        }
      }
      // redraw all elements
      this.l.redraw();
      return this;
    },

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
        //this.l.ctx.fillRect(a.x, a.y, a.w, a.h);
        this.l.ctx.rect(a.x, a.y, a.w, a.h);
        this.l.ctx.fill();

        //this.l.ctx.strokeRect(a.x, a.y, a.w, a.h);
      }

      if (this.type == "path") {
        this.attrs.path.forEach(this.processPath, this);
        this.l.ctx.stroke();
        this.l.ctx.fill();
      }
      this.l.ctx.closePath();
    },

    mouseover: function (callback) {
      this.l.events.mo = this.l.events.mo || [];
      this.l.events.mo.push([this, callback]);
    },

    processPath: function (p) {
      for (c in p) {
        pathCommands[c].call(this, p[c]);
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

  L.isInRange = function (el, pt) {
    if (el.type == "circle") {
      var dx = el.attrs.x - pt.x;
      var dy = el.attrs.y - pt.y;
      return dx * dx + dy * dy <= el.attrs.r * el.attrs.r
    }
    else {
      for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
        && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
        && (c = !c);
      return c;
    }
  }

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
}).call(this);
