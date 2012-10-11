/*****************************************************************************/
/* xflame                                                                    */
/*   Originally By:                                                          */
/*     The Rasterman (Carsten Haitzler)                                      */
/*     Copyright (C) 1996                                                    */
/*       EFlame    Ecore/Evas port: d'Oursse (Vincent TORRI), 2004           */
/*       xflame.js javascript port: Takeshi Banse, 2011                      */
/*****************************************************************************/
/* This code is Freeware. You may copy it, modify it or do with it as you    */
/* please, but you may not claim copyright on any code wholly or partly      */
/* based on this code. I accept no responisbility for any consequences of    */
/* using this code, be they proper or otherwise.                             */
/*****************************************************************************/
/* Okay, now all the legal mumbo-jumbo is out of the way, I will just say    */
/* this: enjoy this program, do with it as you please and watch out for more */
/* code releases from The Rasterman and d'Oursse running under X... the only */
/* way to code.                                                              */
/*****************************************************************************/

window.onload = function () {
  var powerof = function (n) {
    var p = 32;
    if (n <= 0x80000000)
      p = 31;
    if (n <= 0x40000000)
      p = 30;
    if (n <= 0x20000000)
      p = 29;
    if (n <= 0x10000000)
      p = 28;
    if (n <= 0x08000000)
      p = 27;
    if (n <= 0x04000000)
      p = 26;
    if (n <= 0x02000000)
      p = 25;
    if (n <= 0x01000000)
      p = 24;
    if (n <= 0x00800000)
      p = 23;
    if (n <= 0x00400000)
      p = 22;
    if (n <= 0x00200000)
      p = 21;
    if (n <= 0x00100000)
      p = 20;
    if (n <= 0x00080000)
      p = 19;
    if (n <= 0x00040000)
      p = 18;
    if (n <= 0x00020000)
      p = 17;
    if (n <= 0x00010000)
      p = 16;
    if (n <= 0x00008000)
      p = 15;
    if (n <= 0x00004000)
      p = 14;
    if (n <= 0x00002000)
      p = 13;
    if (n <= 0x00001000)
      p = 12;
    if (n <= 0x00000800)
      p = 11;
    if (n <= 0x00000400)
      p = 10;
    if (n <= 0x00000200)
      p = 9;
    if (n <= 0x00000100)
      p = 8;
    if (n <= 0x00000080)
      p = 7;
    if (n <= 0x00000040)
      p = 6;
    if (n <= 0x00000020)
      p = 5;
    if (n <= 0x00000010)
      p = 4;
    if (n <= 0x00000008)
      p = 3;
    if (n <= 0x00000004)
      p = 2;
    if (n <= 0x00000002)
      p = 1;
    if (n <= 0x00000001)
      p = 0;
    return p;
  };
  var random = function () {
    var RANDMAX = 32767;
    return Math.floor(Math.random() * RANDMAX);
  };

  var Hspread = 26;
  var Vspread = 78;
  var VARIANCE = 50;
  var VARTREND = 20;
  var Residual = 68;
  var Bloomp = true;
  var WW = 256;
  var HH = 256;

  var flamewidth = WW >> 1;
  var flameheight = HH >> 1;
  var ws = powerof(flamewidth);
  var size = (1 << ws) * flameheight * 4;
  var a1 = new Uint32Array(new ArrayBuffer(size));
  var a2 = new Uint32Array(new ArrayBuffer(size));
  var flameinit = function () {
    for (var y = 0; y < (HH >> 1); y++) {
      for (var x = 0; x < (WW >> 1); x++) {
        a1[(y << ws) + x] = 0;
        a2[(y << ws) + x] = 0;
      }
    }
    var y = (HH >> 1) - 1;
    for (var x = 0; x < (WW >> 1); x++) {
      a1[(y << ws) + x] = random() % 300;
    }
  };
  var flameactive = function () {
    var y = (HH >> 1) - 1;
    for (var x = 0; x < (WW >> 1); x++) {
      var i = (y << ws) + x;
      var v = a1[i] + (random() % VARIANCE) - VARTREND;
      if (v > 300) v = 0;
      if (v < 0) v = 0;
      a1[i] = v;
    }
  };
  var flamebloom =
    (function () {
       var r = Residual;
       var h = Hspread;
       var v = Vspread;
       return function () {
         if (Bloomp) {
           var v1 = random() % 100;
           switch(v1) {
           case 10: Residual += (random() % 10); break;
           case 20: Hspread  += (random() % 15); break;
           case 30: Vspread  += (random() % 20); break;
           }
         }
         Residual = Math.floor(((r * 10) + (Residual * 90)) / 100);
         Hspread  = Math.floor(((h * 10) + (Hspread  * 90)) / 100);
         Vspread  = Math.floor(((v * 10) + (Vspread  * 90)) / 100);
       };
     })();
  var flameadvance = function () {
    for (var y = ((HH >> 1) - 1); y >= 2; y--) {
      for (var x = 1; x < ((WW >> 1) - 1); x++) {
        var i =  (y << ws) + x;
        var v = a1[i];
        if (v > 300) a1[i] = 300;
        v = a1[i];
        if (v > 0) {
          var tmp, p;
          tmp = (v * Vspread) >> 8;
          p = i - (2 << ws);     a1[p] += tmp >> 1;
          p = i - (1 << ws);     a1[p] += tmp;
          tmp = (v * Hspread) >> 8;
          p = i - (1 << ws) - 1; a1[p] += tmp;
          p = i - (1 << ws) + 1; a1[p] += tmp;
          p = i - 1;             a1[p] += tmp >> 1;
          p = i + 1;             a1[p] += tmp >> 1;
          if (v > 255)
            a2[i] = 255;
          else
            a2[i] = v;
          if (y < (HH >> 1) - 1) a1[i] = (v * Residual) >> 8;
        }
      }
    }
  };

  var ims = powerof(WW);
  var makepaletteraw = function (r, g, b) {
    var pal = new Uint32Array(new ArrayBuffer(300 * 4));
    var rr = 255 - r;
    var gg = 255 - g;
    var bb = 255 - b;
    for (var i = 0; i < 300; i++) {
      r = (i - rr) * 3;
      g = (i - gg) * 3;
      b = (i - bb) * 3;

      if (r < 0)   r = 0;
      if (r > 255) r = 255;
      if (g < 0)   g = 0;
      if (g > 255) g = 255;
      if (b < 0)   b = 0;
      if (b > 255) b = 255;
      pal[i] = ((255 << 24) | (r << 16) | (g << 8) | b);
    }
    return pal;
  };
  var memoize = function (f, keyfun) {
    var memo = [];
    return function (_rest) {
      var key = keyfun.apply(null, arguments);
      var val = memo[key];
      if (!val) {
        val = f.apply(null, arguments);
        memo[key] = val;
      }
      return val;
    };
  };
  var makepalette = memoize(
    makepaletteraw,
    function (r, g, b) {
      return ((255 << 24) | (r << 16) | (g << 8) | b);
    });
  var flame2image = function (im, pal) {
    for (var y = 0; y < ((HH >> 1) - 1); y++) {
      for (var x = 0; x < ((WW >> 1) - 1); x++) {
        var c1, c2, c3, c4;
        c1 = a2[(y << ws) + x];
        c2 = a2[(y << ws) + x + 1];
        c3 = a2[((y + 1) << ws) + x];
        c4 = a2[((y + 1) << ws) + x + 1];

        var xx = x << 1;
        var yy = y << 1;
        var p, i;
        i = (xx + (yy << ims)) << 2;
        p = c1;
        im[i++] = pal[p] >> 16 & 0xff;
        im[i++] = pal[p] >> 8 & 0xff;
        im[i++] = pal[p] & 0xff;
        im[i++] = pal[p] >> 24 & 0xff;
        p = (c1 + c2) >> 1;
        im[i++] = pal[p] >> 16 & 0xff;
        im[i++] = pal[p] >> 8 & 0xff;
        im[i++] = pal[p] & 0xff;
        im[i++] = pal[p] >> 24 & 0xff;
        i = (xx + ((yy + 1) << ims)) << 2;
        p = (c1 + c3) >> 1;
        im[i++] = pal[p] >> 16 & 0xff;
        im[i++] = pal[p] >> 8 & 0xff;
        im[i++] = pal[p] & 0xff;
        im[i++] = pal[p] >> 24 & 0xff;
        p = (c1 + c4) >> 1;
        im[i++] = pal[p] >> 16 & 0xff;
        im[i++] = pal[p] >> 8 & 0xff;
        im[i++] = pal[p] & 0xff;
        im[i++] = pal[p] >> 24 & 0xff;
      }
    }
  };

  (function () {
     var e = document.getElementById('main');
     e.style.margin = '0 auto';
     e.style.width = WW + 'px';
   })();

  var canvas = document.getElementById('flame');
  canvas.setAttribute('width', WW);
  canvas.setAttribute('height', HH);
  var ctx = canvas.getContext('2d');
  var imagedata = ctx.createImageData(WW, HH);

  var flamedraw = function (imagedata, animate, colourpicker) {
    var RGB = [255, 175, 95];
    var im = imagedata.data;
    var pal = makepalette.apply(null, RGB);
    flameinit();
    ctx.putImageData(imagedata, 0, 0); // XXX: Firefox/15.0.1
    var flame = function () {
      flameactive();
      flamebloom();
      flameadvance();
      flame2image(im, pal);
      ctx.putImageData(imagedata, 0, 0);
      animate(flame);
    };
    colourpicker(
      rgbtohsv.apply(null, RGB),
      flame,
      function (h, s, v) {
        pal = makepalette.apply(null, hsvtorgb(h, s, v));
      });
  };
  flamedraw(
    imagedata,
    (function (w) {
       return w.mozRequestAnimationFrame || w.webkitRequestAnimationFrame ||
         (function () {
            alert('eek');
            return function (f) { setTimeout(f, 0); };
          })();
     })(window),
    function (hsv, start, updatepalette) {
      var msg = 'Loading colourpicker data... Plaese wait';
      $('#message').text(msg);
      var w = WW, h = HH / 3;

      var rendersv =
        (function () {
           var c = $('<canvas/>').attr({width : w, height : h}).get(0);
           var ctx = c.getContext('2d');
           return function (hv) {
             for (var y = 0; y < h; y++) {
               var g = ctx.createLinearGradient(0, 0, w, 0);
               for (var i = 0; i <= 10; i++) {
                 var s = i / 10;
                 var rgb = hsvtorgb(hv, ((h - y) / h), s);
                 g.addColorStop(i / 10, 'rgb(' + rgb.join(',') + ')');
               }
               ctx.fillStyle = g;
               ctx.fillRect(0, y, w, 1);
             }
             return ctx.getImageData(0, 0, w, h);
           };
         })();

      var intervalid = setInterval(
        (function () {
           var hv = hsv[0];
           var sv = hsv[1];
           var vv = hsv[2];
           var updatecolourname = function () {
             $('#colourname').val(
               '#' + hsvtorgb(hv, sv, vv).map(
                 function (x) {
                   var s = x.toString(16);
                   if (s.length == 1) { s += "0"; }
                   return s;
                 }
               ).join(''));
           };
           $('#colournameform').submit(
             function (e) {
               e.preventDefault();
               e.stopPropagation();
               var s = $('#colourname').val();
               var r = s.slice(1,3);
               var g = s.slice(3,5);
               var b = s.slice(5,7);
               var hsv =
                 rgbtohsv.apply(
                   null,
                   [r, g, b].map(function (x) {return parseInt(x, 16);}));
               hv = hsv[0], sv = hsv[1], vv = hsv[2];
               var ol = 0;
               for (var p = $('#h').get(0); p != null; p = p.offsetParent) {
                 ol += p.offsetLeft;
               }
               drawupdate(null, ol + (hv * WW));
             }
           );

           var fliphv = function (h) {
             var hv = h * 360;
             return ((hv <= 180) ? hv + 180 : hv - 180) / 360;
           };

           var drawupdate = function (k, left) {
             $('#hb').css(
               {left: left + 'px',
                backgroundColor:
                'rgb(' + hsvtorgb(fliphv(hv), 1, 1).join(',') + ')'
               });
             updatepalette(hv, sv, vv);
             drawsv();
             if (k) k();
           };

           var svmovep = true;
           var hvmovep = true;
           var ims = [];
           var drawsv =
             (function () {
                var c = $('#sv').attr({width : w, height : h}).hide().get(0);
                var ctx = c.getContext('2d');
                var move = function (ev) {
                  if (!svmovep) return;
                  var x = ev.clientX;
                  var y = ev.clientY;
                  for (var p = ev.target; p != null; p = p.offsetParent) {
                    x -= p.offsetLeft;
                    y -= p.offsetTop;
                  }
                  sv = (h - y) / h;
                  vv = x / w;
                  updatepalette(hv, sv, vv);
                  drawaux(x, y);
                  updatecolourname();
                };
                c.addEventListener('mousemove', move, false);
                c.addEventListener(
                  'mousedown',
                  function (ev) {
                    svmovep = svmovep ? false : true;
                    hvmovep = svmovep ? false : true;
                    if (svmovep) move(ev);
                  },
                  false);

                var drawaux = function (x, y) {
                  var im = ims[Math.round(hv * 360)];
                  if (!im) {
                    if (window.console && console.log) {
                      console.log(hv + " cache miss");
                    }
                    im = ims[361];
                  }
                  ctx.putImageData(im, 0, 0);
                  drawbars(x, y);
                };

                var drawbars = function (x, y) {
                  if (x >= w) x = w - 1;

                  var gh = ctx.createLinearGradient(0, 0, w, 0);
                  gh.addColorStop(
                    0,
                    'rgb('
                      + hsvtorgb(fliphv(hv), 0, 1).join(',')
                      + ')');
                  gh.addColorStop(
                    1,
                    'rgb('
                      + hsvtorgb(fliphv(hv), 1, 1 - (y / h)).join(',')
                      + ')');
                  ctx.fillStyle = gh;
                  ctx.fillRect(0, y, w, 1);

                  var gv = ctx.createLinearGradient(0, 0, 0, h);
                  gv.addColorStop(
                    0,
                    'rgb('
                      + hsvtorgb(fliphv(hv), x / w, 1).join(',')
                      + ')');
                  gv.addColorStop(
                    1,
                    'rgb('
                      + hsvtorgb(fliphv(hv), x / w / 3, 1 - x / w).join(',')
                      + ')');
                  ctx.fillStyle = gv;
                  ctx.fillRect(x, 0, 1, h);

                  var rgb = 'rgb(' + hsvtorgb(hv, sv, vv).join(',') + ')';
                  ctx.fillStyle = rgb;
                  ctx.fillRect(x, y, 1, 1);
                };

                return function () {
                  var x = vv * w;
                  var y = Math.round(h - sv * h);
                  drawaux(x, y);
                  return c;
                };
              })();

           var drawhue = function (k) {
             var w = WW;
             var h = 16;
             var c = $('#h').attr({width : w, height : h}).hide().get(0);
             var ctx = c.getContext('2d');
             var g = ctx.createLinearGradient(0, 0, w, 0);
             for (var i = 0; i <= 360; i++) {
               var rgb = hsvtorgb(i / 360, 1, 1);
               g.addColorStop(i / 360, 'rgb(' + rgb.join(',') + ')');
             }
             ctx.fillStyle = g;
             ctx.fillRect(0, 0, w, h);

             var move = function (ev) {
               if (!hvmovep) return;
               var x = ev.clientX;
               for (var p = ev.target; p != null; p = p.offsetParent) {
                 x -= p.offsetLeft;
               }
               hv = x / WW;
               drawupdate(updatecolourname, ev.clientX);
             };
             c.addEventListener('mousemove', move, false);
             [$('#hb').get(0), c].forEach(
               function (e) {
                 e.addEventListener(
                   'mousedown',
                   function (ev) {
                     hvmovep = hvmovep ? false : true;
                     svmovep = hvmovep ? false : true;
                     if (hvmovep) move(ev);
                   },
                   false);
               });

             k(c,
               function () {
                 var ol = 0, ot = 0;
                 for (var p = c; p != null; p = p.offsetParent) {
                   ol += p.offsetLeft;
                   ot += p.offsetTop;
                 }
                 $('#hb').css(
                   {width: '1px',
                    height: c.getAttribute('height') + 'px',
                    backgroundColor:
                    'rgb(' + hsvtorgb(fliphv(hv), 1, 1).join(',') + ')',
                    position: 'absolute',
                    left: ol + (hv * WW) + 'px',
                    top: ot + 'px'
                   }).show();
               });
           };

           var p = 0;
           return function () {
             ims[p] = rendersv(p++ / 360);
             ims[hv * 360] = ims[361] = rendersv(hv);
             $('#message').text(msg + ' ' + Math.round(100 * p / 360) + '%');
             if (p == 360) { // Wow, Firefox actually ramps up!
               $('#message').html(msg + '<br />100% done.');
               clearInterval(intervalid);
               var csv = drawsv();
               drawhue(
                 function (c, k) {
                   updatecolourname();
                   $('#picker').fadeIn();
                   $(csv).fadeIn();
                   $(c).fadeIn(
                     function () {
                       $('#message').animate({opacity: 0.0});
                       k();
                     });
                 });
               setTimeout(start, 300);
             }
           };
         })(),
        0);
    });
};
