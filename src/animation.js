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
    this.dv = ev - sv;
    this.st = st;
    this.ms = ms;
    this.easing = easing || "easeInQuad";
  }

  Tween.prototype = {
    run: function () {
      var dt = L.now() - this.st;
      return this.dv * L.easings[this.easing](dt / this.ms) + this.sv;
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
      var tween;

      this.tweens = [];
      this.st = L.now();

      for (attr in this.attrs) {
        tween = new Tween(this.el.attrs[attr], this.attrs[attr],
          this.st, this.duration, this.easing);
        this.tweens.push({attr: attr, tween: tween});
      }
    },

    stop: function () {
      this.el.curAnimation = null;
      this.endFn && this.endFn.call(this.el);
    },

    step: function () {
      var attr, tween;
      for (var i = 0, l = this.tweens.length; i < l; i++) {
        attr = this.tweens[i].attr,
        tween = this.tweens[i].tween;
        this.el.attrs[attr] = tween.run();
        this.stepFn && this.stepFn.call(this.el);

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
