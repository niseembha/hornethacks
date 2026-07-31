/* ==========================================================================
   Voxel headings
   Rasterizes big titles in the Silkscreen pixel font at its native 8px,
   then redraws every glyph pixel as an extruded 3D block on a canvas with
   centered one-point perspective (letters left of center show their right
   faces, right of center their left faces, flat in the middle).

   Applies to:
   - the hero wordmark (#voxel-title): "HORNET" white / "HACKS" emerald
   - every subpage title (.page-hero h1): white blocks

   Progressive enhancement: the real heading stays in the page (visually
   hidden once its canvas renders) so screen readers, SEO, and no-JS
   visitors keep the text headline.
   ========================================================================== */
(function () {
  if (!window.CanvasRenderingContext2D) return;
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Deterministic per-block jitter so the mosaic is stable */
  function hash(x, y) {
    var h = Math.imul(x + 1, 374761393) + Math.imul(y + 1, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (((h ^ (h >>> 16)) >>> 0) % 1000) / 1000;
  }

  function frontColor(green, x, y) {
    var j = (hash(x, y) - 0.5) * 8;
    var sparkle = hash(x * 3 + 7, y * 5 + 3) > 0.94 ? 10 : 0;
    return green
      ? "hsl(160,62%," + (52 + j + sparkle) + "%)"
      : "hsl(150,8%," + (88 + j * 0.6 + sparkle * 0.5) + "%)";
  }
  function sideRColor(green) {
    return green ? "hsl(160,58%,29%)" : "hsl(150,6%,46%)";
  }
  function sideLColor(green) {
    /* light comes from the top-left, so left faces are a touch brighter */
    return green ? "hsl(160,55%,36%)" : "hsl(150,6%,56%)";
  }
  function sideBColor(green) {
    return green ? "hsl(162,62%,19%)" : "hsl(150,7%,30%)";
  }

  /* ---- One voxelized heading ---- */
  function voxelize(host, heading, segments, opts) {
    var canvas = document.createElement("canvas");
    host.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    /* Rasterize the text into a pixel grid + per-column segment index */
    var F = 8; /* Silkscreen's native pixel size */
    var off = document.createElement("canvas");
    var g = off.getContext("2d");
    g.font = F + 'px "Silkscreen", monospace';
    var widths = segments.map(function (s) {
      return g.measureText(s.text).width;
    });
    var total = Math.ceil(widths.reduce(function (a, b) { return a + b; }, 0));
    if (!total) return false;
    off.width = total + 2;
    off.height = F + 8;
    g = off.getContext("2d");
    g.font = F + 'px "Silkscreen", monospace';
    g.textBaseline = "top";
    g.fillStyle = "#fff";
    var starts = [];
    var cursor = 0;
    segments.forEach(function (s, i) {
      starts.push(cursor);
      g.fillText(s.text, cursor, 3);
      cursor += widths[i];
    });

    var data = g.getImageData(0, 0, off.width, off.height).data;
    var rows = [];
    for (var y = 0; y < off.height; y++) {
      var row = [];
      for (var x = 0; x < off.width; x++) {
        row.push(data[(y * off.width + x) * 4 + 3] > 128 ? 1 : 0);
      }
      rows.push(row);
    }
    /* trim empty rows and columns */
    var top = 0, bottom = rows.length - 1, left = off.width, right = 0;
    while (top < rows.length && rows[top].indexOf(1) === -1) top++;
    while (bottom > top && rows[bottom].indexOf(1) === -1) bottom--;
    for (var yy = top; yy <= bottom; yy++) {
      var first = rows[yy].indexOf(1);
      var last = rows[yy].lastIndexOf(1);
      if (first !== -1) {
        if (first < left) left = first;
        if (last > right) right = last;
      }
    }
    if (left > right) return false;
    var grid = [];
    for (var ty = top; ty <= bottom; ty++) grid.push(rows[ty].slice(left, right + 1));
    var gw = right - left + 1;
    var gh = grid.length;
    /* which segment (color) does each column belong to? */
    var colGreen = [];
    for (var cx = 0; cx < gw; cx++) {
      var orig = cx + left;
      var seg = 0;
      for (var si = 0; si < starts.length; si++) {
        if (orig >= starts[si]) seg = si;
      }
      colGreen.push(!!segments[seg].green);
    }

    function quad(x1, y1, x2, y2, x3, y3, x4, y4) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.closePath();
      ctx.fill();
    }

    /* Centered one-point perspective draw; progress staggers the build-in */
    function draw(progress) {
      var wAvail = host.clientWidth || 300;
      var s = Math.max(3, Math.floor(wAvail / (gw + 1)));
      if (opts.maxS && s > opts.maxS) s = opts.maxS;
      var oxMax = s * 0.8;
      var oy = Math.max(2, Math.round(s * 0.45));
      var W = gw * s + 2;
      var H = gh * s + oy + 1;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      var half = gw / 2;
      var maxSum = gw + gh;
      for (var pass = 0; pass < 2; pass++) {
        for (var y = 0; y < gh; y++) {
          for (var x = 0; x < gw; x++) {
            if (!grid[y][x]) continue;
            if ((x + y) / maxSum > progress) continue;
            var green = colGreen[x];
            var px = x * s;
            var py = y * s;
            var ox = ((half - (x + 0.5)) / half) * oxMax;
            if (pass === 0) {
              if (ox > 0.5) {
                ctx.fillStyle = sideRColor(green);
                quad(px + s, py, px + s + ox, py + oy, px + s + ox, py + s + oy, px + s, py + s);
              } else if (ox < -0.5) {
                ctx.fillStyle = sideLColor(green);
                quad(px, py, px + ox, py + oy, px + ox, py + s + oy, px, py + s);
              }
              ctx.fillStyle = sideBColor(green);
              quad(px, py + s, px + ox, py + s + oy, px + s + ox, py + s + oy, px + s, py + s);
            } else {
              ctx.fillStyle = "rgba(4,12,9,0.9)"; /* thin mortar seam */
              ctx.fillRect(px, py, s, s);
              ctx.fillStyle = frontColor(green, x, y);
              ctx.fillRect(px + 0.5, py + 0.5, s - 1, s - 1);
            }
          }
        }
      }
    }

    if (heading) heading.classList.add("replaced-by-voxel");
    host.classList.add("active");
    if (RM) {
      draw(1);
    } else {
      var t0 = performance.now();
      var DUR = 750;
      (function step(now) {
        var p = Math.min(1, (now - t0) / DUR);
        draw(p * p * (3 - 2 * p) * 1.15);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }
    new ResizeObserver(function () {
      draw(1);
    }).observe(host);
    return true;
  }

  function start() {
    try {
      /* Hero wordmark: two-tone */
      var heroHost = document.getElementById("voxel-title");
      if (heroHost) {
        voxelize(heroHost, document.querySelector(".hero h1"), [
          { text: "HORNET", green: false },
          { text: "HACKS", green: true },
        ], {});
      }
      /* Subpage titles: white blocks, capped so short titles stay tasteful */
      document.querySelectorAll(".page-hero h1").forEach(function (h) {
        var text = (h.textContent || "").trim();
        if (!text) return;
        var host = document.createElement("div");
        host.className = "voxel-title voxel-title--page";
        host.setAttribute("aria-hidden", "true");
        h.parentNode.insertBefore(host, h.nextSibling);
        voxelize(host, h, [{ text: text, green: false }], { maxS: 10 });
      });
    } catch (err) {
      /* canvas blocked → text headlines stay visible */
    }
  }

  /* Wait for the pixel font so the raster is crisp; cap the wait */
  var ready = document.fonts && document.fonts.load
    ? Promise.race([
        document.fonts.load('8px "Silkscreen"'),
        new Promise(function (res) { setTimeout(res, 1500); }),
      ])
    : Promise.resolve();
  ready.then(start, start);
})();
