var LeonardoMatchers = {
  toBeRectangle: function (rect) {
    var el = this.actual;

    if (el.attrs.x == rect.x &&
        el.attrs.y == rect.y &&
        el.attrs.w == rect.w &&
        el.attrs.h == rect.h &&
        el.l.getPxColor(rect.x, rect.y) == el.attrs.stroke &&
        el.l.getPxColor(rect.w, rect.h) == el.attrs.stroke) {
      return true;
    }

    return false;
  },

  toBeCircle: function (circle) {
    var el = this.actual;
    if (el.attrs.x == circle.x &&
        el.attrs.y == circle.y &&
        el.attrs.r == circle.r &&
        el.l.getPxColor(circle.x + circle.r, circle.y) == el.attrs.stroke) {
      return true;
    }

    return false;
  }
};
