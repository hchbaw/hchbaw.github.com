(function (global) {
   var J = global.J || {};

   // hsvtorgb and hslsv are take from
   // http://hackage.haskell.org/package/colour-2.3.1
   /*
Copyright (c) 2008, 2009
Russell O'Connor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
    */
   J.hsvtorgb = function (h, s, v) {
     var v$ = function () {
       if (s == 0) { return [v, v, v]; }

       var hue = h; if (hue == 1) { hue = 0; }
       hue *= 6.0;
       var hi = Math.floor(hue);
       var f = hue - hi;
       var p = v * (1 - s);
       var q = v * (1 - f * s);
       var t = v * (1 - (1 - f) * s);
       switch(hi) {
       case 0: return [v, t, p];
       case 1: return [q, v, p];
       case 2: return [p, v, t];
       case 3: return [p, q, v];
       case 4: return [t, p, v];
       case 5: return [v, p, q];
       default:return [v, p, q];
       }
     };
     return v$().map(function (x) { return Math.floor(255 * x); });
   };
   var hslsv = function (r, g, b) {
     var mx = Math.max.apply(null, [r, g, b]);
     var mn = Math.min.apply(null, [r, g, b]);
     if (mx == mn) { return [0, 0, mx, 0, mx]; }

     var l = (mx + mn) / 2;
     var s = l <= 0.5 ? (mx - mn) / (mx + mn) : (mx - mn) / (2 - (mx + mn));
     var s0 = (mx - mn) / mx;
     var rgb = [r, g, b, r, g];
     var imx = rgb.indexOf(mx);
     //var [x, y, z] = rgb.slice(imx, imx + 3);
     var tmp = rgb.slice(imx, imx + 3), x = tmp[0], y = tmp[1], z = tmp[2];
     var o = [r, g, b].indexOf(mx);
     var h0 = 60 * (y - z) / (mx - mn) + 120 * o;
     var h = h0 < 0 ? h0 + 360 : h0;
     return [h, s, l, s0, mx];
   };

   J.rgbtohsv = function (r, g, b) {
     //var [h, _s, _l, s, v] = hslsv(r, g, b);
     var tmp = hslsv(r, g, b), h = tmp[0], s = tmp[3], v = tmp[4];
     return [h / 360, s, v / 255];
   };

   for (var name in J) { global[name] = J[name]; }

 })(window);
