// requestAnimationFrame shim
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// http://webstuff.nfshost.com/anim-timing/Overview.html
// http://dev.chromium.org/developers/design-documents/requestanimationframe-implementation
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
