(function (L) {

  var E = L.E;

  L.init(function () {
    // TODO only do this when animations are present
    this.animate();
  });

  // leonardo animation api
  L.fn.animate = function () {
    requestAnimationFrame(L.proxy(function () {
      this.clear();

      for (var i = 0, l = this.elements.length; i < l; i++) {
        var el = this.elements[i];
        el.processFx();
        el.draw();
      }

      this.animate();
    }, this));
  }

  // returns current time
  L.now = function () {
    return (Date.now) ? Date.now() : new Date().getTime();
  }

  /**
   * Low level animation tween
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
    },

    updateTime: function (delta) {
      this.st += delta;
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
  L.Animation = function (element, attrs, opts) {

    this.el = element;
    this.attrs = attrs;
    this.status = "play";

    if (L.is("Object", opts)) {
      this.duration = opts.duration;
      this.easing = opts.easing,
      this.endFn = opts.end,
      this.stepFn = opts.step;
    }
    else {
      opts = L.A.slice.call(arguments, 2);
      for (var i = 0, l = opts.length; i < l; i++) {
        if (L.is("Function", opts[i])) {
          this.endFn = opts[i];
        }
        else if (L.is('Number', opts[i])) {
          this.duration = opts[i];
        }
        else if (L.is('String', opts[i])) {
          this.easing = opts[i];
        }
      }
    }

    this.duration = this.duration || 400;
    this.easing = this.easing || "easeInQuad";
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

    // sv - start value
    // ev  end value
    addTween: function (sv, ev) {
      this.st = L.now();
      var tween = new Tween(sv, ev, this.st, this.duration, this.easing);
      this.tweens.push({attr: attr, tween: tween});
    },

    resume: function () {
      var delta = L.now() - this.ptime;
      for (var i = 0, l = this.tweens.length; i < l; i++) {
        this.tweens[i].tween.updateTime(delta);
      }

      this.status = "play";
    },

    stop: function () {
      // use pub/sub
      this.el.curAnim = null;
      this.endFn && this.endFn.call(this.el);
    },

    isActive: function () {
      return this.status == "play";
    },

    pause: function () {
      this.ptime = L.now();
      this.status = "pause";
    },

    step: function () {
      var attr, tween, val, convert;

      for (var i = 0, l = this.tweens.length; i < l; i++) {
        attr = this.tweens[i].attr;
        tween = this.tweens[i].tween;
        convert = to[attr];
        val = tween.run();

        this.el.attrs[attr] = (convert) ? convert(val) : val;

        if (this.el.attrs[attr] == this.attrs[attr]) {
          //if (L.now() >= (this.st + this.duration)) {
          //this.el.attrs[attr] = this.attrs[attr];
          this.stop();
        }
      }
    }
  }

  E.init(function () {
    // animation queue
    this.animations = [];
  });

  // element fx api

  E.fn.animate = function (props, opts) {
    var anim = new L.Animation(this, props, opts);
    this.animations.push(anim);
    return this;
  }

  E.fn.pause = function () {
    if (this.curAnim && this.curAnim.isActive()) {
      this.curAnim.pause();
    }
  }

  E.fn.resume = function () {
    if (this.curAnim && !this.curAnim.isActive()) {
      this.curAnim.resume();
    }
  }

  // TODO: make this private?
  E.fn.processFx = function () {
    if (this.animations.length > 0 && !this.curAnim) {
      this.curAnim = this.animations.shift();
      this.curAnim.start();
    }
    else if (this.curAnim && this.curAnim.isActive()) {
      this.curAnim.step();
    }

    return this;
  }
})(Leonardo);
