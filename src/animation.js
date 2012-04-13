// requestAnimationFrame shim
//http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
(function() {
  var lastTime = 0,
      vendors = ['ms', 'moz', 'webkit', 'o'],
      w = window;

  for (var x = 0, l = vendors.length; x < l && !w.requestAnimationFrame; ++x) {
    w.requestAnimationFrame = w[vendors[x]+'RequestAnimationFrame'];
    w.cancelRequestAnimationFrame = w[vendors[x] + 'CancelRequestAnimationFrame'];
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
}())


(function (L) {
  var E = L.E;

  function Animation() {
    this.speed = 1000;
  }

  Animation.prototype = {

  }

  E.init(function () {
    this.animation = new Animation();
  });

  E.fn.animate = function (attrs) {

  }

})(Leonardo);
