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
        this.redraw();
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
        this.em.trigger('dragend', this);
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
      for (var i = 0, l = callbacks.length; i < l; i++) {
        L.is("Function", callbacks[i]) && callbacks[i].call(this);
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
