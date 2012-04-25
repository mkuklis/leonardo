(function (L) {

  // emitter
  L.em = (function (slice) {
    var events = []; //shared by element and leo

    function on(event, fn, ctx) {
      events[event] = events[event] || [];
      events[event].push({fn: fn, ctx: ctx || this});
    }

    function off(event) {
      if (!(event in events)) { return; }
      events[event].splice(events[event].indexOf(this), 1);
    }

    function reorder(event) {
      var els = events[event],
          index = els.indexOf(this);

      if (index < els.length - 1) {
        els.splice(index, 1);
        els.push(this);
        return index;
      }

      return -1;
    }

    function trigger(event) {
      var args, bindings;
      if (!(event in events)) { return; }

      args = slice.call(arguments, 1);
      bindings = events[event];

      for (var i = bindings.length - 1; i >= 0; i--) {
        var binding = bindings[i];
        binding.fn.apply(binding.ctx, args);
      }
    }

    return function () {
      this.ev = {
        on: on,
        off: off,
        reorder: reorder,
        trigger: trigger
      };
      return this;
    };
  })([].slice);

})(Leonardo);
