(function (L) {

  /*moved from Leo constructor
  this.events = {};
  */

  /* TODO moved from leonardo
   * call from element

  reset: function () {
      var events = this.events;
      cevents.forEach(function (name) {
        if (events[name]) {
          events[name].splice(0, events[name].length);
        }
      });
    },
  */

    /*
    getPos: function (e) {
      var x, y;
      if (e.touches) {
        x = e.touches[0].pageX - this.canvas.offsetLeft;
        y = e.touches[0].pageY - this.canvas.offsetTop;
      }
      else {
        x = e.pageX - this.canvas.offsetLeft;
        y = e.pageY - this.canvas.offsetTop;
      }

      return {x: x, y: y};
      return pos;
    },

    on: function (n, el) {
      var evts = this.events
        , n = (emap[n]) ? emap[n] : n;

      if (!evts[n]) {
        evts[n] = [];
        this.canvas.addEventListener(n, L.proxy(function (e) {
          this[n](e);
          e.preventDefault();
        }, this), false);
      }

      if (evts[n].length == 0 || evts[n].indexOf(el) == -1) {
        evts[n].push(el);
      }
    },

    off: function (n, el) {
      var e = this.events[n];
      e.forEach(function (ell, i) {
        if (ell == el) {
          delete el[n];
          e.splice(i, 1);
        }
      });
    },
    */



  var events = "mouseover mouseout mousedown mouseup click".split(" ")
    // canvas events
    , cevents = "mousedown mouseup mousemove touchstart touchmove touchend click".split(" ")
    // map element events to canvas events
    , emap = {
        "mouseover": "mousemove",
        "mouseout": "mousemove",
        /*
        "touchstart": "mousedown",
        "touchmove": "mousemove",
        "touchend": "mouseup",
        */
        "dragstart": "mousedown",
        "dragmove": "mousemove",
        "dragend": "mouseup"
      }

    // touch is supported
    , supportsTouch = 'createTouch' in d
    // canvas event handlers
    , handlers = {
        mousemove: function (el, pt, curIndex, elements) {
          // drag
          if (el.flags.dragging) {
            el.attr({x: pt.x - el.attrs.dx, y: pt.y - el.attrs.dy});
            //el.redraw();
          }
          // mouseover
          else if (!el.flags.over && L.isPointInRange(el, pt)) {
            var prevIndex = this.flags.mouseover;
            if (!prevIndex || curIndex > prevIndex || this.flags.dragging) {
              if (curIndex > prevIndex) {
                var prev = elements[prevIndex];
                prev.mouseout && prev.mouseout.call(prev);
                prev.flags.over = false;
              }

              el.mouseover && el.mouseover.call(el);
              this.flags.mouseover = curIndex;
              el.flags.over = true;
              return true;
            }
          }
          // mouseout
          else if (el.flags.over && !L.isPointInRange(el, pt)) {
            el.flags.over = false;
            el.mouseout && el.mouseout.call(el);
            delete this.flags.mouseover;
          }
        },

        mousedown: function (el, pt) {
          if (L.isPointInRange(el, pt)) {
            if (el.dragstart) {
              el.flags.dragging = true;
              this.flags.dragging = true;
              el.toFront();
              el.attr({dx: pt.x - el.attrs.x, dy: pt.y - el.attrs.y}, {silent: true});
              L.is("Function", el.dragstart) && el.dragstart.call(el);
            }
            else {
              el.mousedown && el.mousedown.call(el);
            }

            return true;
          }
        },

        mouseup: function (el, pt) {
          //if (L.isPointInRange(el, pt)) {
          if (el.dragend && el.flags.dragging) {
            el.flags.dragging = false;
            this.flags.dragging = false;
            L.is("Function", el.dragend) && el.dragend.call(el);
          }
          else {
            el.mouseup && el.mouseup.call(el);
          }
          //}
        },

        click: function (el, p) {
          if (L.isPointInRange(el, p)) {
            el.click && el.click.call(el);
            return true;
          }
        },

        touchstart: function (el, pt) {
          if (L.isPointInRange(el, pt)) {
            el.touchstart && el.touchstart.call(el);
            return true;
          }
        },

        touchmove: function () {
          // this.mousemove.apply(arguments);
        },

        touchend: function () {
          // this.mouseup.apply(arguments);
        }
      }

  /* Moved from Element
    // setup element events api
  for (var i = 0, l = events.length; i < l; i++) {
    (function (n) {
      E.prototype[n] = function (c) {
        this.on(n, c);
        return this;
      }

      E.prototype["un" + n] = function (c) {
        this.off(n, c);
        return this;
      }
    })(events[i]);
  }
 */


    // setup leonardo api
  /*
  for (var i = 0, l = cevents.length; i < l; i++) {
    (function (n) {
      Leo.prototype[n] = function (e) {
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
  } */


})(Leo);
