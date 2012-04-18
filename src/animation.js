(function (L) {

  var E = L.E;

  L.fn.animate = function () {
    requestAnimationFrame(L.proxy(function () {
      this.clear();

      for (var i = 0, l = this.elements.length; i < l; i++) {
        var el = this.elements[i];
        el.processAnimations();
        el.draw();
      }

      this.animate();
    }, this));
  }

  L.init(function () {
    // TODO only do this when animations are present
    this.animate();
  });

  // returns current time
  L.now = function () {
    return (Date.now) ? Date.now() : new Date().getTime();
  }

  /**
   * Tween
   *
   * sv - start value
   * ev - end value
   * st - start time
   * ms - duration
   * easing - easing function
   */
  function Tween(sv, ev, st, ms, easing) {
    this.sv = sv;
    this.ev = ev;
    this.st = st;
    this.ms = ms;
    this.easing = easing || "easeInQuad";
  }

  Tween.prototype = {
    run: function () {
      var result = [];
      if (L.is("Array", this.ev)) {
        for (var i = 0, l = this.ev.length; i < l; i++) {
          result.push(this.process(this.sv[i], this.ev[i]));
        }
        return result;
      }
      else {
        return this.process(this.sv, this.ev);
      }
    },

    // ev - end value
    // sv - start value
    process: function (sv, ev) {
      var nv = (ev - sv) * L.easings[this.easing]((L.now() - this.st) / this.ms) + sv;
      return (ev > sv) ? ((nv > ev) ? ev : nv) : ((nv < ev) ? ev : nv);
    }
  };

  // tween converters
  var from = {
    fill: function (color) {
      return L.C.c2d(color);
    }
  };

  var to = {
    fill: function (color) {
      return L.C.d2c(color);
    }
  };

  // animation object
  L.Animation = function (element, attrs, duration, easing, step, end) {
    this.el = element;
    this.attrs = attrs;
    this.stepFn = step;
    this.endFn = end;
    this.easing = easing;
    this.duration = duration || 1000;
  }

  L.Animation.prototype = {
    start: function () {
      var st, ev, convert

      this.tweens = [];

      for (attr in this.attrs) {
        convert = from[attr];

        if (convert) {
          sv = convert(this.el.attrs[attr]);
          ev = convert(this.attrs[attr]);
          this.addTween(sv, ev);
        }
        else {
          this.addTween(this.el.attrs[attr], this.attrs[attr]);
        }
      }
    },

    addTween: function (sv, ev) {
      this.st = L.now();
      var tween = new Tween(sv, ev, this.st, this.duration, this.easing);
      this.tweens.push({attr: attr, tween: tween});
    },

    stop: function () {
      this.el.curAnimation = null;
      this.endFn && this.endFn.call(this.el);
    },

    step: function () {
      var attr, tween, val, convert, i;

      for (i = 0, l = this.tweens.length; i < l; i++) {
        attr = this.tweens[i].attr;
        tween = this.tweens[i].tween;
        convert = to[attr];
        val = tween.run();

        this.el.attrs[attr] = (convert) ? convert(val) : val;

        if (L.now() >= (this.st + this.duration)) {
          this.el.attrs[attr] = this.attrs[attr];
          this.stop();
        }
      }
    }
  }

  E.init(function () {
    this.animations = [];
  });

  E.fn.animate = function (props, options) {
    var duration, easing, step, end;

    if (L.is("Object", options)) {
      duration = options.duration,
      easing = options.easing,
      end = options.end,
      step = options.step;
    }
    else {
      options = L.A.slice.call(arguments, 1);
      for (var i = 0, l = options.length; i < l; i++) {
        if (L.is("Function", options[i])) {
          end = options[i];
        }
        else if (L.is('Number', options[i])) {
          duration = options[i];
        }
        else if (L.is('String', options[i])) {
          easing = options[i];
        }
      }
    }

    var anim = new L.Animation(this, props, duration, easing, step, end);
    this.animations.push(anim);
    return this;
  }

  E.fn.processAnimations = function () {
    if (this.animations.length > 0 && !this.curAnimation) {
      this.curAnimation = this.animations.shift();
      this.curAnimation.start();
    }
    else if (this.curAnimation) {
      this.curAnimation.step();
    }
  }
})(Leonardo);
