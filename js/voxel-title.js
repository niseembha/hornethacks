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
  if (!host) return;
  if (!window.CanvasRenderingContext2D) {
    document.documentElement.classList.add("no-voxel");
    return;
  }

  var TEXT_A = "HORNET";
  var TEXT_B = "HACKS";
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var canvas = document.createElement("canvas");
  canvas.width = 0; /* keep the pre-draw canvas out of layout — the host's */
  canvas.height = 0; /* aspect-ratio box alone reserves the title's space */
  host.appendChild(canvas);
  var ctx = canvas.getContext("2d");

  var grid = null;
  var gw = 0;
  var gh = 0;
  var splitX = 0;

  /* Live-interaction state: cursor-proximity glow + idle glints */
  var curS = 8; /* block size of the last draw, for pointer→block mapping */
  var pointer = null; /* {x, y} in block coordinates */
  var glints = []; /* {x, y, t0} short-lived bright blocks */
  var idleRaf = 0;
  var lastGlint = 0;
  var lastIdleDraw = 0;

  /* Build animation: blocks rise up from deep inside the page (z-axis),
     growing from a distant point into their slot with an overshoot pop,
     radiating from the center outward */
  var GROW = 560; /* ms a block spends rising */
  var FLASH = 260; /* ms of landing glow */
  var buildDelay = null; /* per-block start time offset */
  var buildTotal = 0;

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

    /* choreograph the build: center blocks arrive first, edges last */
    buildDelay = new Float32Array(gw * gh);
    var maxD = 0;
    for (var by = 0; by < gh; by++) {
      for (var bx = 0; bx < gw; bx++) {
        if (!grid[by][bx]) continue;
        var idx = by * gw + bx;
        var dx = Math.abs(bx + 0.5 - gw / 2) / (gw / 2); /* 0 center → 1 edge */
        var dy = Math.abs(by + 0.5 - gh / 2) / (gh / 2);
        var d =
          dx * 780 + /* radiate outward horizontally */
          dy * 140 + /* slight vertical bloom */
          hash(bx + 13, by + 7) * 240; /* organic jitter */
        buildDelay[idx] = d;
        if (d > maxD) maxD = d;
      }
    }
    buildTotal = maxD + GROW + FLASH;
  }

  /* ---- Block face colors (light from the top-left) ---- */
  /* Brightness boost from the cursor and any active glints */
  function liveBoost(x, y, now) {
    var b = 0;
    if (pointer) {
      var dx = x - pointer.x;
      var dy = (y - pointer.y) * 1.5;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < 5.5) b += (1 - d / 5.5) * 17;
    }
    for (var i = 0; i < glints.length; i++) {
      var gl = glints[i];
      var age = (now - gl.t0) / 750;
      if (age < 0 || age > 1) continue;
      var gx = x - gl.x;
      var gy = y - gl.y;
      var gd = Math.sqrt(gx * gx + gy * gy);
      if (gd < 1.8) b += Math.sin(age * Math.PI) * (1 - gd / 1.8) * 15;
    }
    return b;
  }

  function frontColor(green, x, y, boost) {
    var j = (hash(x, y) - 0.5) * 8 + (boost || 0);
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
  function drawSides(x, y, s, oy, ox, yOff) {
    var green = x >= splitX;
    var px = x * s;
    var py = y * s + yOff;
    if (ox > 0.5) {
      ctx.fillStyle = sideRColor(green);
      quad(px + s, py, px + s + ox, py + oy, px + s + ox, py + s + oy, px + s, py + s);
    } else if (ox < -0.5) {
      ctx.fillStyle = sideLColor(green);
      quad(px, py, px + ox, py + oy, px + ox, py + s + oy, px, py + s);
    }
    ctx.fillStyle = sideBColor(green);
    quad(px, py + s, px + ox, py + s + oy, px + s + ox, py + s + oy, px + s, py + s);
  }

  function drawFront(x, y, s, boost, yOff) {
    var green = x >= splitX;
    var px = x * s;
    var py = y * s + yOff;
    ctx.fillStyle = "rgba(4,12,9,0.9)"; /* thin mortar seam */
    ctx.fillRect(px, py, s, s);
    ctx.fillStyle = frontColor(green, x, y, boost);
    ctx.fillRect(px + 0.5, py + 0.5, s - 1, s - 1);
  }

  /* Render the mark. buildMs === undefined → complete (idle/static);
     otherwise it's elapsed build time and blocks are settled / falling. */
  function draw(now, buildMs) {
    now = now || 0;
    var complete = buildMs === undefined;
    var wAvail = host.clientWidth || 300;
    /* narrow screens get fractional block sizes so the mark fills the full
       width instead of dropping to the next whole-block step down */
    var sRaw = wAvail / (gw + 2);
    var s = Math.max(3, wAvail < 700 ? sRaw : Math.floor(sRaw));
    curS = s;
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
    var emerging = [];

    /* settled blocks: side pass, then front pass (fronts cover the sides) */
    for (var pass = 0; pass < 2; pass++) {
      for (var y = 0; y < gh; y++) {
        for (var x = 0; x < gw; x++) {
          if (!grid[y][x]) continue;
          var ox = ((half - (x + 0.5)) / half) * oxMax;
          var boost = 0;
          if (!complete) {
            var i = y * gw + x;
            var t = (buildMs - buildDelay[i]) / GROW;
            if (t < 0) continue; /* not yet spawned */
            if (t < 1) {
              if (pass === 1) emerging.push({ x: x, y: y, t: t, ox: ox });
              continue;
            }
            var age = buildMs - buildDelay[i] - GROW;
            if (age < FLASH) boost = (1 - age / FLASH) * 18; /* arrival flash */
          }
          if (pass === 0) drawSides(x, y, s, oy, ox, 0);
          else drawFront(x, y, s, boost + liveBoost(x, y, now), 0);
        }
      }
    }

    /* rising blocks grow up out of the page depth — from a distant point
       to full size, overshooting slightly as they surface — trailed by a
       smaller ghost of where they just were, deeper in */
    for (var f = 0; f < emerging.length; f++) {
      var b = emerging[f];
      var u = b.t - 1;
      var c1 = 1.70158;
      var e = 1 + (c1 + 1) * u * u * u + c1 * u * u; /* easeOutBack 0 → 1 */
      var sc = Math.max(0.01, e); /* deep (0) → surface (1), pop past on arrival */
      var alpha = Math.min(1, 0.12 + b.t / 0.55); /* comes into focus as it rises */
      var cx = b.x * s + s / 2;
      var cy = b.y * s + s / 2;

      ctx.save();
      ctx.globalAlpha = alpha * 0.22; /* ghost trailing deeper in the page */
      ctx.translate(cx, cy);
      ctx.scale(Math.max(0.01, sc * 0.6), Math.max(0.01, sc * 0.6));
      ctx.translate(-cx, -cy);
      drawFront(b.x, b.y, s, 6, 0);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(cx, cy);
      ctx.scale(sc, sc);
      ctx.translate(-cx, -cy);
      drawSides(b.x, b.y, s, oy, b.ox, 0);
      drawFront(b.x, b.y, s, 8, 0);
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  function reveal() {
    if (RM) {
      draw(performance.now());
      return;
    }
    var t0 = performance.now();
    (function step(now) {
      var elapsed = now - t0;
      draw(now, elapsed);
      if (elapsed < buildTotal) requestAnimationFrame(step);
      else {
        draw(now);
        startIdle();
      }
    })(t0);
  }

  /* After the build-in: blocks glow near the cursor, and random glints
     shimmer across the mark while it's on screen. ~30fps, paused offscreen. */
  function startIdle() {
    if (RM) return;

    canvas.addEventListener("pointermove", function (e) {
      pointer = { x: e.offsetX / curS, y: e.offsetY / curS };
    });
    canvas.addEventListener("pointerdown", function (e) {
      pointer = { x: e.offsetX / curS, y: e.offsetY / curS };
    });
    canvas.addEventListener("pointerleave", function () {
      pointer = null;
    });

    function spawnGlint(now) {
      for (var tries = 0; tries < 10; tries++) {
        var x = Math.floor(Math.random() * gw);
        var y = Math.floor(Math.random() * gh);
        if (grid[y][x]) {
          glints.push({ x: x, y: y, t0: now });
          return;
        }
      }
    }

    function tick(now) {
      idleRaf = requestAnimationFrame(tick);
      if (now - lastIdleDraw < 33) return; /* ~30fps is plenty */
      lastIdleDraw = now;
      if (now - lastGlint > 500 + hash(now | 0, 3) * 900) {
        spawnGlint(now);
        lastGlint = now;
      }
      glints = glints.filter(function (g) {
        return now - g.t0 < 750;
      });
      draw(now);
    }

    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !idleRaf) {
        lastIdleDraw = 0;
        idleRaf = requestAnimationFrame(tick);
      } else if (!entries[0].isIntersecting && idleRaf) {
        cancelAnimationFrame(idleRaf);
        idleRaf = 0;
      }
    });
    io.observe(host);
  }

  /* CSS reserves the canvas's slot from first paint (aspect-ratio on the
     host), so a failed init must hand the slot back to the text h1 */
  function fallback() {
    document.documentElement.classList.add("no-voxel");
  }

  function start() {
    try {
      rasterize();
      if (!gw || !gh) return fallback(); /* raster failed → text headline */
      reveal();
      new ResizeObserver(function () {
        draw(performance.now());
      }).observe(host);
    } catch (err) {
      fallback(); /* canvas blocked (e.g. privacy mode) → text headline */
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
