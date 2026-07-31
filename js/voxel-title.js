/* ==========================================================================
   Voxel wordmark
   Rasterizes "HORNETHACKS" in the Silkscreen pixel font at its native 8px,
   then redraws every glyph pixel as a small extruded 3D block on a canvas:
   white blocks for "HORNET", emerald for "HACKS" — with darker side faces
   for depth and a staggered build-in on load.

   Progressive enhancement: the real <h1> stays in the page (visually
   hidden once the canvas renders) so screen readers, SEO, and no-JS
   visitors keep the text headline.
   ========================================================================== */
(function () {
  var host = document.getElementById("voxel-title");
  var heroTitle = document.querySelector(".hero h1");
  if (!host || !window.CanvasRenderingContext2D) return;

  var TEXT_A = "HORNET";
  var TEXT_B = "HACKS";
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var canvas = document.createElement("canvas");
  host.appendChild(canvas);
  var ctx = canvas.getContext("2d");

  var grid = null;
  var gw = 0;
  var gh = 0;
  var splitX = 0;

  /* Deterministic per-block jitter so the mosaic is stable */
  function hash(x, y) {
    var h = Math.imul(x + 1, 374761393) + Math.imul(y + 1, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (((h ^ (h >>> 16)) >>> 0) % 1000) / 1000;
  }

  /* ---- Rasterize the title into a pixel grid ---- */
  function rasterize() {
    var F = 8; /* Silkscreen's native pixel size */
    var off = document.createElement("canvas");
    var g = off.getContext("2d");
    g.font = F + 'px "Silkscreen", monospace';
    var wA = Math.ceil(g.measureText(TEXT_A).width);
    var wAll = Math.ceil(g.measureText(TEXT_A + TEXT_B).width);
    off.width = wAll + 2;
    off.height = F + 6;
    g = off.getContext("2d");
    g.font = F + 'px "Silkscreen", monospace';
    g.textBaseline = "top";
    g.fillStyle = "#fff";
    g.fillText(TEXT_A + TEXT_B, 0, 2);

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
    grid = [];
    for (var ty = top; ty <= bottom; ty++) grid.push(rows[ty].slice(left, right + 1));
    gw = right - left + 1;
    gh = grid.length;
    splitX = wA - left;
  }

  /* ---- Block face colors (light from the top-left) ---- */
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

  function quad(x1, y1, x2, y2, x3, y3, x4, y4) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
  }

  /* ---- Draw the blocks (progress ∈ 0..1 staggers the build-in) ----
     One-point perspective: the extrusion converges on a vanishing point
     behind the center of the word, so letters left of center show their
     right faces, letters right of center show their left faces, and the
     middle sits flat — a natural centered curve. */
  function draw(progress) {
    var wAvail = host.clientWidth || 300;
    var s = Math.max(3, Math.floor(wAvail / (gw + 2)));
    var oxMax = s * 1.1; /* horizontal depth at the outer edges */
    var oy = Math.max(2, Math.round(s * 0.5)); /* constant downward drop */
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
    /* pass 0: extruded side faces · pass 1: front faces (cover the sides) */
    for (var pass = 0; pass < 2; pass++) {
      for (var y = 0; y < gh; y++) {
        for (var x = 0; x < gw; x++) {
          if (!grid[y][x]) continue;
          if ((x + y) / maxSum > progress) continue;
          var green = x >= splitX;
          var px = x * s;
          var py = y * s;
          /* offset toward the central vanishing point */
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

  function reveal() {
    if (RM) {
      draw(1);
      return;
    }
    var t0 = performance.now();
    var DUR = 750;
    (function step(now) {
      var p = Math.min(1, (now - t0) / DUR);
      draw(p * p * (3 - 2 * p) * 1.15); /* slight overshoot finishes the corner */
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  function start() {
    try {
      rasterize();
      if (!gw || !gh) return; /* raster failed → keep the text headline */
      if (heroTitle) heroTitle.classList.add("replaced-by-voxel");
      host.classList.add("active");
      reveal();
      new ResizeObserver(function () {
        draw(1);
      }).observe(host);
    } catch (err) {
      /* canvas blocked (e.g. privacy mode) → text headline stays */
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
