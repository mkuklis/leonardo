// colors helpers
(function (L) {
  L.C = {
    rgbRegex: /^rgb\(([0-255]{1,3}),\s*([0-255]{1,3}),\s*([0-255]{1,3})\)$/ig,
    singleHexRegex: /^([a-f0-9])([a-f0-9])([a-f0-9])$/i,
    tripleHexRegex: /^([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i,

    // hex to rgb
    h2rgb: function (hex) {
      var hex = (hex[0] == "#") ? hex.substr(1) : hex;

      if (hex.length == 3) {
        var temp = this.singleHexRegex.exec(hex).slice(1);
        for (var i = 0; i < 3; i++) {
          hex += temp[i];
        }
      }

      var trio = this.tripleHexRegex.exec(hex).slice(1);

      return {
        r: parseInt(trio[0], 16),
        g: parseInt(trio[1], 16),
        b: parseInt(trio[2], 16)
      };
    },

    //TODO: IE support
    // http://dean.edwards.name/weblog/2009/10/convert-any-colour-value-to-hex-in-msie/
    txt2rgb: function (txtColor) {
      var el = d.getElementById('txt2rgb');
      if (!el) {
        el = d.createElement("div");
        attr = d.createAttribute('id');
        attr.value = 'txt2rgb';
        el.setAttributeNode(attr);
        el.style.display = "none";
        d.body.appendChild(el);
      }

      el.style.color = txtColor;
      return ww.getComputedStyle(el).color;
    },

    rgb2rgba: function (rgb, opacity) {
      var rgb = this.rgbRegex.exec(color);
      if (rgb && rgb.length == 4) {
        return "rgba(" + rgb[1] + ", " + rgb[2] + ", " + rgb[3] + ", " + opacity + ")";
      }
      return rgb;
    },

    // converts given color to rgba if opacity is present
    toColor: function (color, opacity) {
      if (typeof opacity != "undefined") {
        if (color.indexOf('rgba') > -1) {
          return color;
        }
        else if (color.charAt() === "#") {
          var rgb = this.h2rgb(color);
          return "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + opacity + ")";
        }
        else if (color.indexOf('rgb') > -1) {
          return this.rgb2rgba(color);
        }
        else {
          return this.rgb2rgba(this.txt2rgb(color));
        }
      }
      return color;
    },

    d2c: function (decA) {
      return "#" + this.toHex(decA[0]) + this.toHex(decA[1]) + this.toHex(decA[2]);
    },

    rgbToHex: function (r, g, b) {
      return this.toHex(r) + this.toHex(g) + this.toHex(b);
    },

    d2h: function (d) {
      return d.toString(16);
    },

    h2d: function (h) {
      return parseInt(h, 16);
    },

    toHex: function (n) {
      n = parseInt(n, 10);
      if (isNaN(n)) return "00";
      n = Math.max(0, Math.min(n, 255));
      return "0123456789ABCDEF".charAt((n - n % 16) / 16) + "0123456789ABCDEF".charAt(n % 16);
    },

    c2d: function (color) {
      var rgb = this.h2rgb(color);
      return [rgb.r, rgb.g, rgb.b];
    }
  };
})(Leonardo);
