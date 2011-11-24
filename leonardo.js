(function () {

  // global
  var w = this
    , d = w.document
    // valid attributes
    , vattrs = {x:1,y:1,cx:1,cy:1,r:1,w:1,h:1,fill:1,path:1,"stroke-width": 1}
    , events = "mouseover mouseout mousedown mouseup click".split(" ")

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
    }

  function L() {
    if (!(this instanceof L)) {
      return new L();
    }

    var self = this;
    this.canvas = L.createCanvas(arguments);
    this.ctx = this.canvas.getContext("2d");
    this.elements = [];
    this.events = {mouseover:[], mouseout:[], click: []};

    // setup events
    // TODO: make it generic
    this.canvas.addEventListener('mousemove', function (e) { self.mouseover(e); });
    this.canvas.addEventListener('mousemove', function (e) { self.mouseout(e); });
    this.canvas.addEventListener('mousedown', function (e) { self.mousedown(e); });
    this.canvas.addEventListener('mouseup', function (e) { self.mouseup(e); });
    this.canvas.addEventListener('click', function (e) { self.click(e); });
  }

  this.Leonardo = L;
  L.version = 0.1;

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

    // redraws all elements
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
    },

    mouseover: function (e) {
      var p = this.getPosition(e);
      this.events.mouseover.forEach(function (e) {
        if (!e.el.state.over && L.isPointInRange(e.el, p)) {
          e.el.state.over = true;
          e.callback.call(e.el);
        }
      });
    },

    mouseout: function (e) {
      var p = this.getPosition(e);
      this.events.mouseout.forEach(function (e) {
        if (e.el.state.over && !L.isPointInRange(e.el, p)) {
          e.el.state.over = false;
          e.callback.call(e.el);
        }
      });
    },

    mousedown: function (e) {
      var p = this.getPosition(e);
      this.events.mousedown.forEach(function (e) {
        if (L.isPointInRange(e.el, p)) {
          e.callback.call(e.el);
        }
      });
    },

    mouseup: function (e) {
      var p = this.getPosition(e);
      this.events.mouseup.forEach(function (e) {
        if (L.isPointInRange(e.el, p)) {
          e.callback.call(e.el);
        }
      });
    },

    click: function (e) {
      var p = this.getPosition(e);
      this.events.click.forEach(function (e) {
        if (L.isPointInRange(e.el, p)) {
          e.callback.call(e.el);
        }
      });
    },

    getPosition: function (e) {
      var x = e.pageX - this.canvas.offsetLeft
        , y = e.pageY - this.canvas.offsetTop;
      return {x: x, y: y};
    },

    bind: function (eventName, el, callback) {
      this.events[eventName] = this.events[eventName] || [];
      this.events[eventName].push({el: el, callback: callback});
    },

    unbind: function (eventName, el, callback) {
      var events = this.events[eventName];
      events.forEach(function (e, i) {
        if (e.el == el && e.callback == callback) {
          events.splice(i, 1);
        }
      });
    }
  };

  L.toString = function () {
    return "Leonardo ver. " + L.version;
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

  L.isPointInRange = function (el, pt) {
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

  // element constructor
  var E = function (type, attrs, l) {
    if (!(this instanceof E)) {
      return new E(type, attrs, l);
    }

    this.type = type;
    this.attrs = attrs;
    this.state = {}; // holds different element states
    this.l = l;
    this.events = l.events;
    this.ctx = this.l.ctx;

    // push element to leonardo
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
      this.redraw();
      return this;
    },

    redraw: function () {
      this.l.redraw();
    },

    draw: function () {
      var a = this.attrs,
          self = this;

      this.ctx.beginPath();

      if (a.fill) {
        this.ctx.fillStyle = a.fill;
      }

      // TODO test for type?
      if (this.type == "circle") {
        this.ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2, true);
        this.ctx.stroke();
        this.ctx.fill();
      }

      if (this.type == "rect") {
        this.ctx.rect(a.x, a.y, a.w, a.h);
        this.ctx.fill();
      }

      if (this.type == "path") {
        this.attrs.path.forEach(this.processPath, this);
        this.ctx.stroke();
        this.ctx.fill();
      }
      this.ctx.closePath();
    },

    bind: function (eventName, callback) {
      this.l.bind(eventName, this, callback);
      return this;
    },

    unbind: function (eventName, callback) {
      this.l.unbind(eventName, this, callback);
      return this;
    },

    processPath: function (p) {
      for (c in p) {
        pathCommands[c].call(this, p[c]);
      }
    }
  }

  // setup events api
  for (var i = 0, l = events.length; i < l; i++) {
    (function (eventName) {
      E.prototype[eventName] = function (callback) {
        this.bind(eventName, callback);
      }
      E.prototype["un" + eventName] = function (callback) {
        this.unbind(eventName, callback);
      }
    })(events[i]);
  }
}).call(this);
