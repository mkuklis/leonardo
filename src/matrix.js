(function (L) {

  function Matrix() {
    this.reset();
  }

  Matrix.prototype =  {
    reset: function () {
      this.m = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    },

    add: function (a, b, c, d, e, f) {
      var o = [[], [], []]
        , m = [[a, c, e], [b, d, f], [0, 0, 1]]
        , x, y, z, res;

      for (x = 0; x < 3; x++) {
        for (y = 0; y < 3; y++) {
          res = 0;
          for (z = 0; z < 3; z++) {
            res += this.m[x][z] * m[z][y];
          }
          o[x][y] = res;
        }
      }
      this.m = o;
    },

    translate: function (x, y) {
      this.add(1, 0, 0, 1, x, y);
    },

    scale: function (x, y, cx, cy) {
      y == null && (y = x);
      (cx || cy) && this.add(1, 0, 0, 1, cx, cy);
      this.add(x, 0, 0, y, 0, 0);
      (cx || cy) && this.add(1, 0, 0, 1, -cx, -cy);
    },

    rotate: function (a, x, y) {
      a = L.rad(a);
      x = x || 0;
      y = y || 0;
      var cos = Math.cos(a).toFixed(9)
        , sin = Math.sin(a).toFixed(9);
      this.add(cos, sin, -sin, cos, x, y);
      this.add(1, 0, 0, 1, -x, -y);
    },

    x: function (x, y) {
      return x * this.m[0][0] + y * this.m[0][1] + this.m[0][2];
    },

    y: function (x, y) {
      return x * this.m[1][0] + y * this.m[1][1] + this.m[1][2];
    },

    xy: function (x, y) {
      return [this.x(x, y), this.y(x, y)];
    }
  }

  L.matrix = function () {
    return new Matrix();
  };

  L.Matrix = Matrix;

})(Leonardo);
