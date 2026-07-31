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

  /* ---- Every so often, a tiny hornet buzzes across the hero ---- */
  var decor = document.querySelector(".hero .voxel-decor");
  if (decor && !RM && document.getElementById("hh-mark") !== null) {
    var flyby = function () {
      if (document.hidden) {
        schedule(9000);
        return;
      }
      var w = decor.clientWidth || window.innerWidth;
      var h = decor.clientHeight || 320;
      var dir = Math.random() < 0.5 ? 1 : -1;
      var wrap = document.createElement("div");
      wrap.className = "flyby";
      wrap.innerHTML = '<svg viewBox="0 0 20 18" aria-hidden="true"><use href="#hh-mark"/></svg>';
      decor.appendChild(wrap);
      var y0 = h * (0.1 + Math.random() * 0.55);
      var amp = 10 + Math.random() * 12;
      var cycles = 2 + Math.random() * 1.5;
      var frames = [];
      var N = 28;
      for (var k = 0; k <= N; k++) {
        var p = k / N;
        var x = dir > 0 ? -44 + p * (w + 88) : w + 44 - p * (w + 88);
        var y = y0 + Math.sin(p * Math.PI * 2 * cycles) * amp;
        frames.push({
          transform:
            "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) scaleX(" + (dir > 0 ? 1 : -1) + ")",
        });
      }
      var anim = wrap.animate(frames, { duration: 5200 + Math.random() * 2800, easing: "linear" });
      anim.onfinish = function () {
        wrap.remove();
        schedule();
      };
    };
    var schedule = function (ms) {
      setTimeout(flyby, ms || 15000 + Math.random() * 15000);
    };
    schedule(2600);
  }
})();
