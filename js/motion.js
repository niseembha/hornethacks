/* ==========================================================================
   Motion layer: scroll reveals, hero startup, parallax, atmosphere, and the
   occasional pixel hornet buzzing across the hero. Everything here is
   decorative: it is skipped under prefers-reduced-motion, and the page is
   fully usable (and fully visible) without it.
   ========================================================================== */
(function () {
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Scroll reveals with a small stagger per group ---- */
  if (!RM && "IntersectionObserver" in window) {
    var els = document.querySelectorAll(
      ".fact, .card, .timeline li, .faq details, .band, .section h2, .prose > p"
    );
    var groups = new Map();
    els.forEach(function (el) {
      var n = groups.get(el.parentElement) || 0;
      groups.set(el.parentElement, n + 1);
      el.classList.add("reveal");
      /* long lists (schedule timeline, FAQ) cascade faster so late items
         aren't left waiting behind a big stagger */
      var quick = el.matches(".timeline li, .faq details");
      var step = quick ? 40 : 70;
      var cap = quick ? 200 : 420;
      el.style.setProperty("--reveal-delay", Math.min(n * step, cap) + "ms");
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  var hero = document.querySelector(".hero");
  if (!hero) return;

  var root = document.documentElement;
  var introActive = root.classList.contains("hero-intro-active");
  var introFinished = !introActive;
  var introTimer = 0;
  var introPulseTimer = 0;

  /* ---- Coordinate the existing title build, typing, and content reveal ---- */
  function finishIntro(skipped) {
    if (introFinished) return;
    introFinished = true;
    clearTimeout(introTimer);
    clearTimeout(introPulseTimer);
    root.classList.remove("hero-intro-active");
    root.classList.add(skipped ? "hero-intro-skipped" : "hero-intro-done");
    window.dispatchEvent(new CustomEvent(skipped ? "hh:intro-skip" : "hh:intro-complete"));
    window.removeEventListener("pointerdown", skipIntro);
    window.removeEventListener("keydown", skipIntro);
  }

  function skipIntro() {
    finishIntro(true);
  }

  if (introActive && !RM) {
    window.addEventListener("pointerdown", skipIntro, { passive: true });
    window.addEventListener("keydown", skipIntro);
    introPulseTimer = window.setTimeout(function () {
      window.dispatchEvent(new CustomEvent("hh:energy-pulse", {
        detail: { x: 0.5, y: 0.42, normalized: true, power: 1.4 }
      }));
    }, 1250);
    introTimer = window.setTimeout(function () { finishIntro(false); }, 2650);
  }

  var typeEl = hero.querySelector(".eyebrow [data-type]");
  if (typeEl && introActive && !RM) {
    var full = typeEl.textContent;
    var typeTimer = 0;
    var typeStart = window.setTimeout(function () {
      typeEl.textContent = "";
      var i = 0;
      typeTimer = window.setInterval(function () {
        typeEl.textContent = full.slice(0, ++i);
        if (i >= full.length) window.clearInterval(typeTimer);
      }, 27);
    }, 640);
    window.addEventListener("hh:intro-skip", function () {
      window.clearTimeout(typeStart);
      window.clearInterval(typeTimer);
      typeEl.textContent = full;
    }, { once: true });
  }

  /* ---- Pointer depth: one rAF write, no layout reads while moving ---- */
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!RM && finePointer) {
    var targetX = 0;
    var targetY = 0;
    var parallaxRaf = 0;
    function paintParallax() {
      parallaxRaf = 0;
      hero.style.setProperty("--content-x", (-targetX * 2).toFixed(2) + "px");
      hero.style.setProperty("--content-y", (-targetY * 1.2).toFixed(2) + "px");
      hero.style.setProperty("--cube-near-x", (targetX * 9).toFixed(2) + "px");
      hero.style.setProperty("--cube-near-y", (targetY * 7).toFixed(2) + "px");
      hero.style.setProperty("--cube-far-x", (-targetX * 12).toFixed(2) + "px");
      hero.style.setProperty("--cube-far-y", (-targetY * 8).toFixed(2) + "px");
    }
    hero.addEventListener("pointermove", function (e) {
      var rect = hero.getBoundingClientRect();
      targetX = Math.max(-1, Math.min(1, (e.clientX - rect.left) / rect.width * 2 - 1));
      targetY = Math.max(-1, Math.min(1, (e.clientY - rect.top) / rect.height * 2 - 1));
      if (!parallaxRaf) parallaxRaf = requestAnimationFrame(paintParallax);
    }, { passive: true });
    hero.addEventListener("pointerleave", function () {
      targetX = 0;
      targetY = 0;
      if (!parallaxRaf) parallaxRaf = requestAnimationFrame(paintParallax);
    }, { passive: true });
  }

  /* ---- One lightweight canvas: honeycomb activation + data pixels ---- */
  var atmosphere = hero.querySelector("[data-hero-atmosphere]");
  if (atmosphere && atmosphere.getContext && !RM) {
    var actx = atmosphere.getContext("2d");
    var aw = 0;
    var ah = 0;
    var adpr = 1;
    var atmosphereRaf = 0;
    var atmosphereVisible = true;
    var lastAtmosphere = 0;
    var cells = [];
    var pixels = [];
    var pulses = [];
    var pointer = { x: -1000, y: -1000, active: false };
    var compact = window.innerWidth < 760 || (navigator.deviceMemory && navigator.deviceMemory <= 4);

    function sizeAtmosphere() {
      var rect = hero.getBoundingClientRect();
      aw = Math.max(1, Math.round(rect.width));
      ah = Math.max(1, Math.round(rect.height));
      adpr = Math.min(window.devicePixelRatio || 1, compact ? 1.35 : 1.75);
      atmosphere.width = Math.round(aw * adpr);
      atmosphere.height = Math.round(ah * adpr);
      atmosphere.style.width = aw + "px";
      atmosphere.style.height = ah + "px";
      actx.setTransform(adpr, 0, 0, adpr, 0, 0);
      cells = [];
      var radius = compact ? 42 : 48;
      var dx = radius * 1.5;
      var dy = radius * 0.866;
      for (var x = -radius, col = 0; x < aw + radius; x += dx, col++) {
        for (var y = -radius; y < ah + radius; y += dy * 2) {
          cells.push({ x: x, y: y + (col % 2 ? dy : 0), r: radius });
        }
      }
      pixels = [];
      var count = compact ? 14 : 28;
      for (var i = 0; i < count; i++) {
        pixels.push({
          x: Math.random() * aw,
          y: Math.random() * ah,
          speed: 4 + Math.random() * 10,
          phase: Math.random() * Math.PI * 2,
          size: Math.random() > 0.78 ? 3 : 2
        });
      }
    }

    function hexPath(x, y, r) {
      actx.beginPath();
      for (var n = 0; n < 6; n++) {
        var a = Math.PI / 3 * n;
        var hx = x + Math.cos(a) * r;
        var hy = y + Math.sin(a) * r;
        if (!n) actx.moveTo(hx, hy);
        else actx.lineTo(hx, hy);
      }
      actx.closePath();
    }

    function drawAtmosphere(now) {
      atmosphereRaf = requestAnimationFrame(drawAtmosphere);
      if (!atmosphereVisible || document.hidden || now - lastAtmosphere < 33) return;
      var dt = Math.min(0.05, (now - lastAtmosphere) / 1000 || 0.033);
      lastAtmosphere = now;
      actx.clearRect(0, 0, aw, ah);

      for (var c = 0; c < cells.length; c++) {
        var cell = cells[c];
        var alpha = 0.032;
        if (pointer.active) {
          var pd = Math.hypot(cell.x - pointer.x, cell.y - pointer.y);
          if (pd < 170) alpha += (1 - pd / 170) * 0.2;
        }
        for (var q = 0; q < pulses.length; q++) {
          var pulse = pulses[q];
          var age = (now - pulse.t0) / 900;
          var ring = age * 260;
          var d = Math.hypot(cell.x - pulse.x, cell.y - pulse.y);
          var edge = Math.abs(d - ring);
          if (age < 1 && edge < 42) alpha += (1 - edge / 42) * (1 - age) * 0.5 * pulse.power;
        }
        hexPath(cell.x, cell.y, cell.r);
        actx.strokeStyle = "rgba(52,211,153," + Math.min(alpha, 0.48).toFixed(3) + ")";
        actx.lineWidth = alpha > 0.16 ? 1.15 : 0.65;
        actx.stroke();
      }

      for (var p = 0; p < pixels.length; p++) {
        var px = pixels[p];
        px.y -= px.speed * dt;
        px.x += Math.sin(now / 1800 + px.phase) * dt * 3;
        if (px.y < -5) { px.y = ah + 5; px.x = Math.random() * aw; }
        var shimmer = 0.12 + (Math.sin(now / 700 + px.phase) + 1) * 0.07;
        actx.fillStyle = "rgba(110,231,183," + shimmer.toFixed(3) + ")";
        actx.fillRect(Math.round(px.x), Math.round(px.y), px.size, px.size);
      }
      pulses = pulses.filter(function (pulse) { return now - pulse.t0 < 900; });
    }

    if (finePointer) {
      hero.addEventListener("pointermove", function (e) {
        var rect = hero.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
        pointer.active = true;
      }, { passive: true });
      hero.addEventListener("pointerleave", function () { pointer.active = false; }, { passive: true });
    }
    window.addEventListener("hh:energy-pulse", function (e) {
      var d = e.detail || {};
      pulses.push({
        x: d.normalized ? d.x * aw : d.x,
        y: d.normalized ? d.y * ah : d.y,
        power: d.power || 1,
        t0: performance.now()
      });
    });
    new ResizeObserver(sizeAtmosphere).observe(hero);
    new IntersectionObserver(function (entries) {
      atmosphereVisible = entries[0].isIntersecting;
    }, { rootMargin: "100px" }).observe(hero);
    sizeAtmosphere();
    atmosphereRaf = requestAnimationFrame(drawAtmosphere);
  }

  /* ---- Every so often, a tiny hornet buzzes across the screen ---- */
  /* The flyby carries its own copy of the sprite (rather than <use>) so the
     two wing frames can flutter via CSS; it rides fixed on <body>, above
     everything, and clicking it swats it out of the air. */
  if (document.querySelector(".hero .voxel-decor") && !RM) {
    var SPRITE =
      '<svg viewBox="0 0 11 10" shape-rendering="crispEdges" aria-hidden="true">' +
      '<g class="fw fw-a">' +
      '<g fill="#000000">' +
      '<rect x="3" y="0" width="2" height="1"/><rect x="6" y="0" width="2" height="1"/>' +
      '<rect x="2" y="1" width="1" height="2"/><rect x="5" y="1" width="1" height="1"/>' +
      '<rect x="8" y="1" width="1" height="2"/><rect x="6" y="2" width="1" height="1"/>' +
      "</g>" +
      '<g fill="#34d399">' +
      '<rect x="3" y="1" width="2" height="1"/><rect x="6" y="1" width="2" height="1"/>' +
      '<rect x="3" y="2" width="3" height="1"/><rect x="7" y="2" width="1" height="1"/>' +
      "</g></g>" +
      '<g class="fw fw-b">' +
      '<g fill="#000000">' +
      '<rect x="1" y="2" width="1" height="1"/><rect x="5" y="2" width="1" height="1"/>' +
      '<rect x="9" y="2" width="1" height="1"/>' +
      "</g>" +
      '<g fill="#34d399">' +
      '<rect x="2" y="2" width="3" height="1"/><rect x="6" y="2" width="3" height="1"/>' +
      "</g></g>" +
      '<g fill="#000000">' +
      '<rect x="3" y="3" width="6" height="1"/>' +
      '<rect x="2" y="4" width="2" height="1"/><rect x="5" y="4" width="1" height="5"/>' +
      '<rect x="9" y="4" width="1" height="1"/>' +
      '<rect x="1" y="5" width="1" height="1"/><rect x="3" y="5" width="1" height="3"/>' +
      '<rect x="10" y="5" width="1" height="3"/>' +
      '<rect x="0" y="6" width="2" height="1"/>' +
      '<rect x="1" y="7" width="1" height="1"/>' +
      '<rect x="2" y="8" width="2" height="1"/><rect x="9" y="8" width="1" height="1"/>' +
      '<rect x="3" y="9" width="6" height="1"/>' +
      "</g>" +
      '<g fill="#34d399"><rect x="4" y="4" width="1" height="5"/></g>' +
      '<g fill="#000000"><rect x="8" y="6" width="1" height="1"/></g>' +
      '<g fill="currentColor">' +
      '<rect x="6" y="4" width="3" height="1"/><rect x="2" y="5" width="1" height="3"/>' +
      '<rect x="6" y="5" width="4" height="1"/><rect x="6" y="6" width="2" height="1"/>' +
      '<rect x="9" y="6" width="1" height="1"/><rect x="6" y="7" width="4" height="1"/>' +
      '<rect x="6" y="8" width="3" height="1"/>' +
      "</g>" +
      "</svg>";
    var SPEED = 130; /* px per second — a steady, unhurried cruise */
    var flyby = function () {
      if (document.hidden) {
        schedule(9000);
        return;
      }
      var w = window.innerWidth;
      var h = window.innerHeight;
      var dir = Math.random() < 0.5 ? 1 : -1;
      var wrap = document.createElement("div");
      wrap.className = "flyby";
      wrap.setAttribute("aria-hidden", "true");
      wrap.innerHTML = SPRITE;
      document.body.appendChild(wrap);
      var y0 = h * (0.12 + Math.random() * 0.5);
      var amp = 12 + Math.random() * 8;
      var cycles = 2 + Math.random();
      var frames = [];
      var N = 36;
      for (var k = 0; k <= N; k++) {
        var p = k / N;
        var x = dir > 0 ? -44 + p * (w + 88) : w + 44 - p * (w + 88);
        var y = y0 + Math.sin(p * Math.PI * 2 * cycles) * amp;
        frames.push({
          transform:
            "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) scaleX(" + (dir > 0 ? 1 : -1) + ")",
        });
      }
      var anim = wrap.animate(frames, {
        duration: ((w + 88) / SPEED) * 1000,
        easing: "linear",
      });
      anim.onfinish = function () {
        wrap.remove();
        schedule();
      };
      wrap.addEventListener("click", function () {
        if (wrap.classList.contains("dead")) return;
        wrap.classList.add("dead");
        var frozen = getComputedStyle(wrap).transform;
        anim.cancel();
        if (frozen === "none") frozen = "";
        wrap.style.transform = frozen;
        var ty = y0;
        var m = /^matrix\(([^)]+)\)$/.exec(frozen);
        if (m) ty = parseFloat(m[1].split(",")[5]) || y0;
        var fall = Math.max(h - ty + 60, 120);
        var drop = wrap.animate(
          [
            {
              transform: frozen + " translateY(0) rotate(0deg)",
              easing: "cubic-bezier(0.2, 0.65, 0.4, 1)",
            },
            {
              transform: frozen + " translateY(-22px) rotate(175deg)",
              offset: 0.3,
              easing: "cubic-bezier(0.5, 0, 0.85, 0.4)",
            },
            { transform: frozen + " translateY(" + fall + "px) rotate(195deg)" },
          ],
          { duration: 500 + Math.sqrt(fall) * 26 }
        );
        drop.onfinish = function () {
          wrap.remove();
          schedule();
        };
      });
    };
    var schedule = function (ms) {
      setTimeout(flyby, ms || 15000 + Math.random() * 15000);
    };
    schedule(2600);
  }

  /* ---- Hero-only CTA pointer light and tiny activation pixels ---- */
  hero.querySelectorAll(".cta-row .btn").forEach(function (button) {
    if (finePointer) {
      button.addEventListener("pointermove", function (e) {
        var rect = button.getBoundingClientRect();
        button.style.setProperty("--btn-x", ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + "%");
      }, { passive: true });
    }
    button.addEventListener("pointerdown", function (e) {
      if (RM) return;
      var rect = button.getBoundingClientRect();
      for (var i = 0; i < 6; i++) {
        var bit = document.createElement("i");
        bit.className = "button-pixel";
        bit.style.left = (e.clientX - rect.left) + "px";
        bit.style.top = (e.clientY - rect.top) + "px";
        var angle = Math.PI * 2 * i / 6;
        bit.style.setProperty("--burst-x", Math.cos(angle) * (16 + i * 2) + "px");
        bit.style.setProperty("--burst-y", Math.sin(angle) * (12 + i * 2) + "px");
        button.appendChild(bit);
        window.setTimeout(function (node) { node.remove(); }, 560, bit);
      }
    }, { passive: true });
  });
})();
