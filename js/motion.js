/* ==========================================================================
   Motion layer: scroll reveals, typing eyebrow, cube parallax, and the
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
      el.style.setProperty("--reveal-delay", Math.min(n * 70, 420) + "ms");
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

  /* ---- The hero eyebrow types itself out ---- */
  var typeEl = document.querySelector(".hero .eyebrow [data-type]");
  if (typeEl && !RM) {
    var full = typeEl.textContent;
    typeEl.textContent = "";
    typeEl.classList.add("typing");
    var i = 0;
    var timer = setInterval(function () {
      typeEl.textContent = full.slice(0, ++i);
      if (i >= full.length) {
        clearInterval(timer);
        setTimeout(function () {
          typeEl.classList.remove("typing");
        }, 2600);
      }
    }, 42);
  }

  /* ---- Every so often, a tiny hornet buzzes across the screen ---- */
  /* The flyby carries its own copy of the sprite (rather than <use>) so the
     two wing frames can flutter via CSS; it rides fixed on <body>, above
     everything, and clicking it swats it out of the air. */
  if (document.querySelector(".hero .voxel-decor") && !RM) {
    var SPRITE =
      '<svg viewBox="0 0 16 12" shape-rendering="crispEdges" aria-hidden="true">' +
      '<g class="fw fw-a"><g fill="#d9f2e6" opacity="0.8">' +
      '<rect x="4" y="0" width="3" height="1"/><rect x="8" y="0" width="3" height="1"/>' +
      '<rect x="3" y="1" width="4" height="1"/><rect x="8" y="1" width="4" height="1"/>' +
      "</g></g>" +
      '<g class="fw fw-b"><g fill="#d9f2e6" opacity="0.8">' +
      '<rect x="2" y="1" width="5" height="1"/><rect x="8" y="1" width="5" height="1"/>' +
      "</g></g>" +
      '<g fill="currentColor">' +
      '<rect x="4" y="2" width="6" height="1"/>' +
      '<rect x="2" y="3" width="2" height="1"/><rect x="10" y="3" width="3" height="1"/>' +
      '<rect x="6" y="3" width="2" height="7"/>' +
      '<rect x="1" y="4" width="3" height="2"/><rect x="10" y="4" width="4" height="1"/>' +
      '<rect x="10" y="5" width="2" height="1"/><rect x="13" y="5" width="1" height="1"/>' +
      '<rect x="0" y="6" width="4" height="1"/><rect x="10" y="6" width="4" height="3"/>' +
      '<rect x="1" y="7" width="3" height="2"/>' +
      '<rect x="2" y="9" width="2" height="1"/><rect x="10" y="9" width="3" height="1"/>' +
      '<rect x="4" y="10" width="6" height="1"/>' +
      "</g>" +
      '<g fill="#34d399"><rect x="4" y="3" width="2" height="7"/><rect x="8" y="3" width="2" height="7"/></g>' +
      '<g fill="#0a0a0a"><rect x="12" y="5" width="1" height="1"/></g>' +
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
})();
