(function (L) {
  var E = L.E,
      events = "mouseover mouseout mousedown mouseup click".split(" "),
      cevents = "mousedown mouseup mousemove click".split(" "),
      emap = {
        "mouseover": "mousemove",
        "mouseout": "mousemove",
        "dragmove": "mousemove",
        "dragstart": "mousedown",
        "dragend": "mouseup"
      };

  // canvas event handlers
  var handlers = {
    click: function (pos) {
      if (isPointInRange(this, pos)) {
        this.execCallbacks('click');
      }
    },

    mousemove: function (pt, curIndex) {

      // handle drag
      if (this.flags.dragging) {
        this.attr({x: pt.x - this.attrs.dx, y: pt.y - this.attrs.dy});
        //el.redraw();
      }

      // handle mouseover
      else if (!this.flags.over && isPointInRange(this, pt)) {

        var prevIndex = this.l.flags.mouseover;
        if (!prevIndex || curIndex > prevIndex || this.l.flags.dragging) {
          if (curIndex > prevIndex) {
            var el = this.l.elements[prevIndex];
            el.execCallbacks('mouseout');
            el.flags.over = false;
          }

          this.execCallbacks('mouseover');
          this.l.flags.mouseover = curIndex;
          this.flags.over = true;
          return true;
        }
      }

      // handle mouseout
      else if (this.flags.over && !isPointInRange(this, pt)) {
        this.flags.over = false;
        this.execCallbacks('mouseout');
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
          this.execCallbacks('dragstart');
        }
        else {
          this.execCallbacks('mousedown');
        }

        return true;
      }
    },

    mouseup: function (pt) {
      if (this.callbacks.dragend && this.flags.dragging) {
        this.flags.dragging = false;
        this.l.flags.dragging = false;
        this.execCallbacks('dragend');
      }
      else {
        this.execCallbacks('mouseup');
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
        ((poly[i][1] <= pt.y && pt.y < poly[j][1]) || (poly[j][1] <= pt.y && pt.y < poly[i][1]))
        && (pt.x < (poly[j][0] - poly[i][0]) * (pt.y - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])
        && (c = !c);
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

  L.init(function () {
    this.flags = {};
    for (var i = 0, l = cevents.length; i < l; i++) {
      (L.proxy(function (event) {
        this.canvas.addEventListener(event, L.proxy(function (e) {
          this.trigger(event, getPos(e));
          e.preventDefault();
        }, this));
      }, this))(cevents[i]);
    }
  });

  E.init(function () {
    this.flags = {};
    this.callbacks = {};
  });

  E.fn.drag = function (start, move, end) {
    this.on("dragstart", start || true);
    this.on("dragmove", move || true);
    this.on("dragend", end || true);
    return this;
  }

  E.fn.on = function (event, fn) {
    this.callbacks[event] = this.callbacks[event] || [];
    if (fn) {
      this.bind(emap[event] || event);
      this.callbacks[event].push(fn);
    }
  },

  E.fn.execCallbacks = function (event) {
    var callbacks = this.callbacks[event];
    if (callbacks) {
      for (var i = 0, l = callbacks.length; i < l; i++) {
        L.is("Function", callbacks[i]) && callbacks[i]();
      }
    }
  }

  events.forEach(function (event) {
    E.fn[event] = function (fn) {
      this.on(event, fn);
      return this;
    }
  });

  E.fn.toFront = function () {
    this.l.toFront(this);
    var index = this.reorder('mousedown');
    this.l.flags.mouseover = index;
    this.redraw();
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

  // pub/sub module
  var ev = (function (slice) {
    var events = []; //shared by element and leo

    function bind(event, fn) {
      events[event] = events[event] || [];
      events[event].push(this);
    }

    function unbind(event, fn) {
      if (!(event in events)) return;
      events[event].splice(events[event].indexOf(fn), 1);
    }

    function reorder(event) {
      var elems = events[event],
          index = elems.indexOf(this);

      if (index < elems.length - 1) {
        elems.splice(index, 1);
        elems.push(this);
      }

      return index;
    }

    function trigger(event) {
      var args, binds;
      if (!(event in events)) return;
      args = slice.call(arguments, 1);
      binds = events[event];
      for (var i = binds.length - 1; i >= 0; i--) {
        handlers[event].apply(binds[i], args);
      }
    }

    return function () {
      this.reorder = reorder;
      this.bind = bind;
      this.unbind = unbind;
      this.trigger = trigger;
      return this;
    };
  })([].slice);

  ev.call(L.prototype);
  ev.call(L.E.prototype);

})(Leonardo);
