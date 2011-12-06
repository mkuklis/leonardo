(function (L) {

  function Matrix(a, b, c, d, e, f) {
    if (a) {
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.e = e;
      this.f = f;
    }
    else {
      this.a = 1;
      this.b = 0;
      this.c = 0;
      this.d = 1;
      this.e = 0;
      this.f = 0;
    }
  }

  Matrix.prototype =  {
    add: function (a, b, c, d, e, f) {
      var out = [[], [], []],
          m = [[this.a, this.c, this.e], [this.b, this.d, this.f], [0, 0, 1]],
          matrix = [[a, c, e], [b, d, f], [0, 0, 1]],
          x, y, z, res;

      if (a && a instanceof Matrix) {
        matrix = [[a.a, a.c, a.e], [a.b, a.d, a.f], [0, 0, 1]];
      }

      for (x = 0; x < 3; x++) {
        for (y = 0; y < 3; y++) {
          res = 0;
          for (z = 0; z < 3; z++) {
            res += m[x][z] * matrix[z][y];
          }
          out[x][y] = res;
        }
      }

      this.a = out[0][0];
      this.b = out[1][0];
      this.c = out[0][1];
      this.d = out[1][1];
      this.e = out[0][2];
      this.f = out[1][2];
    },

    invert: function () {
      var me = this,
          x = me.a * me.d - me.b * me.c;
        return new Matrix(me.d / x, -me.b / x, -me.c / x, me.a / x, (me.c * me.f - me.d * me.e) / x, (me.b * me.e - me.a * me.f) / x);
    },

    clone: function () {
      return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
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
      var cos = +Math.cos(a).toFixed(9),
          sin = +Math.sin(a).toFixed(9);
      this.add(cos, sin, -sin, cos, x, y);
      this.add(1, 0, 0, 1, -x, -y);
    },

    x: function (x, y) {
      return x * this.a + y * this.c + this.e;
    },

    y: function (x, y) {
      return x * this.b + y * this.d + this.f;
    },

    get: function (i) {
      return +this[Str.fromCharCode(97 + i)].toFixed(4);
    },

    offset: function () {
      return [this.e.toFixed(4), this.f.toFixed(4)];
    },

    norm: function (a) {
      return a[0] * a[0] + a[1] * a[1];
    },

    normalize: function(a) {
      var mag = math.sqrt(norm(a));
      a[0] && (a[0] /= mag);
      a[1] && (a[1] /= mag);
    },

    split: function () {
      var out = {};
      // translation
      out.dx = this.e;
      out.dy = this.f;

      // scale and shear
      var row = [[this.a, this.c], [this.b, this.d]];
      out.scalex = math.sqrt(norm(row[0]));
      normalize(row[0]);

      out.shear = row[0][0] * row[1][0] + row[0][1] * row[1][1];
      row[1] = [row[1][0] - row[0][0] * out.shear, row[1][1] - row[0][1] * out.shear];

      out.scaley = math.sqrt(norm(row[1]));
      normalize(row[1]);
      out.shear /= out.scaley;

      // rotation
      var sin = -row[0][1],
          cos = row[1][1];
      if (cos < 0) {
          out.rotate = R.deg(math.acos(cos));
          if (sin < 0) {
              out.rotate = 360 - out.rotate;
          }
      } else {
          out.rotate = R.deg(math.asin(sin));
      }

      out.isSimple = !+out.shear.toFixed(9) && (out.scalex.toFixed(9) == out.scaley.toFixed(9) || !out.rotate);
      out.isSuperSimple = !+out.shear.toFixed(9) && out.scalex.toFixed(9) == out.scaley.toFixed(9) && !out.rotate;
      out.noRotation = !+out.shear.toFixed(9) && !out.rotate;
      return out;
    }
  }

  L.matrix = function (a, b, c, d, e, f) {
    return new Matrix(a, b, c, d, e, f);
  };

  L.Matrix = Matrix;

})(Leonardo);
