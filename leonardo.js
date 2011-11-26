(function () {

  // global
  var w = this
    , d = w.document
    // valid attributes
    , vattrs = {x:1,y:1,cx:1,cy:1,r:1,w:1,h:1,fill:1,path:1,"stroke-width": 1}
    // element events
    , events = "mouseover mouseout mousedown mouseup click".split(" ")
    // canvas events
    , cevents = "mousedown mouseup mousemove click".split(" ")
    // map canvas events to element events
    , map = {
        "mouseover": "mousemove",
        "dragmove": "mousemove",
        "dragstart": "mousedown",
        "mouseout": "mousemove",
        "dragend": "mouseup"
      }

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
    // canvas event handlers
    , handlers = {
        mousemove: function (el, p, i, elements) {
          var j = this.flags.mouseover;
          // mouseover
          if ((!el.flags.over || el.flags.dragging) && L.isPointInRange(el, p)) {
            // drag
            if (el.flags.dragging) {
              el.attr(p);
              L.is("Function", el.dragmove) && el.dragmove.call(el);
            }
            else {
              if (!j || i > j) {
                if (i > j) {
                  var prev = elements[j];
                  prev.mouseout && prev.mouseout.call(prev);
                  prev.flags.over = false;
                }

                el.mouseover && el.mouseover.call(el);
                this.flags.mouseover = i;
                el.flags.over = true;
              }
            }
          }
          // mouseout
          else if (el.flags.over && !L.isPointInRange(el, p)) {
            el.flags.over = false;
            el.mouseout && el.mouseout.call(el);
            delete this.flags.mouseover;
          }
        },

        mousedown: function (el, p) {
          if (L.isPointInRange(el, p)) {
            if (el.dragstart) {
              el.flags.dragging = true;
              el.toFront();
              L.is("Function", el.dragstart) && el.dragstart.call(el);
            }
            else {
              el.mousedown && el.mousedown.call(el);
            }
            return true;
          }
        },

        mouseup: function (el, p) {
          if (L.isPointInRange(el, p)) {
            if (el.dragend) {
              el.flags.dragging = false;
              L.is("Function", el.dragend) && el.dragend.call(el);
            }
            else {
              el.mouseup && el.mouseup.call(el);
            }
            return true;
          }
        },

        click: function (el, p) {
          if (L.isPointInRange(el, p)) {
            el.click && el.click.call(el);
            return true;
          }
        }
      };

  function L() {
    if (!(this instanceof L)) {
      return new L();
    }

    this.canvas = L.createCanvas(arguments);
    this.ctx = this.canvas.getContext("2d");
    this.elements = [];
    this.events = {};
    this.flags = {};

    // setup events
    for (var i = 0, l = cevents.length; i < l; i++) {
      (function (name) {
        this.events[name] = [];
        this.canvas.addEventListener(name, L.proxy(function (e) { this[name](e);}, this), false);
      }).call(this, cevents[i]);
    }
  }

  this.Leonardo = L;
  L.version = 0.1;

  L.prototype = {
    // create circle element
    circle: function (x, y, r) {
      var attrs = {x: x || 0, y: y || 0, r: r || 0};
      var circle = E('circle', attrs, this);
      circle.draw();
      return circle;
    },

    // create rect element
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

    getPos: function (e) {
      var x = e.pageX - this.canvas.offsetLeft
        , y = e.pageY - this.canvas.offsetTop;
      return {x: x, y: y};
    },

    bind: function (n, el) {
      var e = this.events
        , n = (map[n]) ? map[n] : n;

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
  L.createCanvas = function (args) {
    var c;

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

    return c;
  }

  L.isPointInRange = function (el, pt) {
    if (el.type == "circle") {
      var dx = el.attrs.x - pt.x;
      var dy = el.attrs.y - pt.y;
      return dx * dx + dy * dy <= el.attrs.r * el.attrs.r
    }
    else {
      for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) {
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
        && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
        && (c = !c);
      }
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
    this.flags = {}; // holds different event ralated flags
    this.l = l;
    this.ctx = this.l.ctx;

    // push element to leonardo
    this.l.elements.push(this);
  }

  E.prototype = {
    constructor: E,

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

      // http://digitalarts.bgsu.edu/faculty/bonniem/Spring11/artc4330_1/notes/notes26.html
      // isPointInPath
      //if (this.ctx.isPointInPath(x, y)) {
      //}

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

    drag: function (drag, start, end) {
      this.bind("dragmove", drag || true);
      this.bind("dragstart", start || true);
      this.bind("dragend", end || true);
    },

    bind: function (eventName, callback) {
      this[eventName] = callback;
      this.l.bind(eventName, this);
      return this;
    },

    unbind: function (eventName, callback) {
      this[eventName] = callback;
      this.l.unbind(eventName, this);
      return this;
    },

    toFront: function () {
      var index = this.l.elements.indexOf(this)
        , self = this
        , a = this.l.elements;

      if (index < a.length - 1) {
        a.splice(index, 1);
        a.push(this);

        cevents.forEach(function (name) {
          var a = self.l.events[name];
          if (a) {
            var i = a.indexOf(self);
            if (i < a.length) {
              a.splice(i, 1);
              a.push(self);
            }
          }
        });

        this.redraw();
      }
    },

    toBack: function () {
    },

    processPath: function (p) {
      for (c in p) {
        pathCommands[c].call(this, p[c]);
      }
    }
  }

  // setup element events api
  for (var i = 0, l = events.length; i < l; i++) {
    (function (n) {
      E.prototype[n] = function (c) {
        this.bind(n, c);
      }
      E.prototype["un" + n] = function (c) {
        this.unbind(n, c);
      }
    })(events[i]);
  }

  // setup leonardo api
  for (var i = 0, l = cevents.length; i < l; i++) {
    (function (n) {
      L.prototype[n] = function (e) {
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
