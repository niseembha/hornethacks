/* Shared behavior: config-driven links, mobile nav, footer year. */
(function () {
  var cfg = window.HORNETHACKS || {};

  /* Apply configured URLs everywhere they appear */
  if (cfg.interestFormUrl) {
    document.querySelectorAll('[data-link="interest"]').forEach(function (a) {
      a.href = cfg.interestFormUrl;
    });
  }
  if (cfg.sponsorFormUrl) {
    document.querySelectorAll('[data-link="sponsor"]').forEach(function (a) {
      a.href = cfg.sponsorFormUrl;
    });
  }
  if (cfg.contactEmail) {
    document.querySelectorAll('[data-link="email"]').forEach(function (a) {
      a.href = "mailto:" + cfg.contactEmail;
      if (a.hasAttribute("data-show-email")) a.textContent = cfg.contactEmail;
    });
  }

  /* Mobile nav */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
