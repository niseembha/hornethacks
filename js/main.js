/* Shared behavior: config-driven links + footer year. */
(function () {
  var cfg = window.HORNETHACKS || {};

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

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
