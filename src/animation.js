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
   * sv - start value
   * ev - end value
   * st - start time
   * ms - duration
   * easing - easing function
   */
  function Tween(sv, ev, ms, easing) {
    this.sv = sv;
    this.ev = ev;
    this.dv = ev - sv;
    this.st = L.now();
    this.ms = ms || 1000;
    this.easing = easing || "easeInQuad";
  }

  Tween.prototype = {
    run: function () {
      var dt = L.now() - this.st;
      return this.dv * L.easings[this.easing](dt / this.ms) + this.sv;
    }
  };

  // animation object
  L.Animation = function (element, attrs, speed, easing, callback) {
    this.el = element;
    this.attrs = attrs;
    this.tweens = [];
    this.callback = callback;
    this.tweens.push(new Tween(this.el.attrs.x, this.attrs.x, speed, easing));
  }

  L.Animation.prototype = {
    stop: function () {
      this.el.curAnimation = null;
      this.callback && this.callback();
    },

    step: function () {
      for (var i = 0, l = this.tweens.length; i < l; i++) {
        this.el.attrs.x = this.tweens[i].run();

        if (this.el.attrs.x > this.attrs.x) {
          this.el.attrs.x = this.attrs.x;
          this.stop();
        }
      }
    }
  }

  E.init(function () {
    this.animations = [];
  });

  E.fn.animate = function (attrs, speed) {
    var anim = new L.Animation(this, attrs, speed);
    this.animations.push(anim);
  }

  E.fn.processAnimations = function () {
    if (this.animations.length > 0 && !this.curAnimation) {
      this.curAnimation = this.animations.shift();
      this.curAnimation.step();
    }
    else if (this.curAnimation) {
      this.curAnimation.step();
    }
  }
})(Leonardo);
