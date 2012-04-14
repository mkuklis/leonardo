// requestAnimationFrame shim
//http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

(function(w) {
  var lastTime = 0,
      vendors = ['ms', 'moz', 'webkit', 'o'];

  for (var i = 0, l = vendors.length; i < l && !w.requestAnimationFrame; ++i) {
    w.requestAnimationFrame = w[vendors[i] + 'RequestAnimationFrame'];
    w.cancelRequestAnimationFrame = w[vendors[i] + 'CancelRequestAnimationFrame'];
  }

  if (!w.requestAnimationFrame) {
    w.requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime(),
            timeToCall = Math.max(0, 16 - (currTime - lastTime)),
            id = w.setTimeout(function( ) { callback(currTime + timeToCall); },
          timeToCall);

        lastTime = currTime + timeToCall;
        return id;
    };
  }

  if (!w.cancelAnimationFrame) {
    w.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }
}(window));

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

  // animation object
  L.Animation = function (element, attrs, speed, easing) {

    this.el = element;
    this.time = 0;
    this.ms = speed || 1000;
    this.attrs = attrs;
    this.easing = easing || "linear";

    // velocity
    this.vx = ((this.attrs.x || this.el.attrs.x) - this.el.attrs.x) / this.ms;
    this.vy = ((this.attrs.y || this.el.attrs.y) - this.el.attrs.y) / this.ms;
  }

  L.Animation.prototype = {

    stop: function () {
      this.el.curAnimation = null;
    },

    step: function () {
      var ct = new Date().getTime(),
          dt = ct - (this.time || ct),
          dx = dt * this.vx,
          dy = dt * this.vy;

      this.el.attrs.x = this.el.attrs.x + dx;
      this.el.attrs.y = this.el.attrs.y + dy;

      if ((this.attrs.x < (this.el.attrs.x + dx))
          || (this.attrs.y < (this.el.attrs.y + dy))) {
        this.stop();
        //return;
      }

      this.time = ct;
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
