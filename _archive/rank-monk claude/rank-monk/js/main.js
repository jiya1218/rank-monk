/* ==========================================================
   Rank Monk — shared frontend script
   - Injects header + footer on every page
   - Light / dark theme toggle (remembered in localStorage)
   - Mobile menu, blog filter, form handling
   Backend hook points are marked with  // BACKEND:
   ========================================================== */

(function () {
  var THEME_KEY = "rankmonk-theme";
  var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  /* ---------- theme ---------- */
  function getPreferredTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
      btn.textContent = t === "dark" ? "☀" : "☾";
    }
  }
  function toggleTheme() {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    applyTheme(next);
  }
  applyTheme(getPreferredTheme());

  /* ---------- shared header ---------- */
  var NAV = [
    { href: "index.html", label: "Home" },
    { href: "features.html", label: "Features" },
    { href: "pricing.html", label: "Pricing" },
    { href: "blog.html", label: "Blog" },
    { href: "about.html", label: "About" },
    { href: "contact.html", label: "Contact" }
  ];

  var headerHTML =
    '<header class="site-header"><div class="container nav">' +
    '<a class="brand" href="index.html" aria-label="Rank Monk home"><span class="brand-badge"><img src="img/logo.png" alt="Rank Monk"></span></a>' +
    '<ul class="nav-links" id="nav-links">' +
    NAV.map(function (n) {
      var active = page === n.href ? ' class="active"' : "";
      return '<li><a href="' + n.href + '"' + active + ">" + n.label + "</a></li>";
    }).join("") +
    "</ul>" +
    '<div class="nav-actions">' +
    '<a class="btn btn-ghost btn-sm" href="login.html">Log in</a>' +
    '<a class="btn btn-primary btn-sm" href="signup.html">Start climbing</a>' +
    '<button class="theme-toggle" id="theme-toggle" type="button" aria-label="Toggle theme"></button>' +
    '<button class="theme-toggle menu-btn" id="menu-btn" type="button" aria-label="Open menu">☰</button>' +
    "</div></div></header>";

  var footerHTML =
    '<footer class="site-footer"><div class="container">' +
    '<div class="footer-grid">' +
    '<div class="footer-brand"><span class="brand-badge"><img src="img/logo.png" alt="Rank Monk"></span>' +
    "<p>Content, search and AI visibility, handled. So you can get back to building the business.</p></div>" +
    "<div><h4>Product</h4><ul>" +
    '<li><a href="features.html">Features</a></li><li><a href="pricing.html">Pricing</a></li>' +
    '<li><a href="dashboard.html">Dashboard preview</a></li><li><a href="blog.html">Journal</a></li></ul></div>' +
    "<div><h4>Company</h4><ul>" +
    '<li><a href="about.html">About</a></li><li><a href="contact.html">Contact</a></li>' +
    '<li><a href="signup.html">Get started</a></li><li><a href="login.html">Log in</a></li></ul></div>' +
    "<div><h4>Legal</h4><ul>" +
    '<li><a href="privacy.html">Privacy policy</a></li><li><a href="terms.html">Terms of service</a></li></ul></div>' +
    "</div>" +
    '<div class="footer-bottom"><span>© <span id="year"></span> Rank Monk. All rights reserved.</span>' +
    "<span>Made for founders who want to be found.</span></div>" +
    "</div></footer>";

  var headerSlot = document.getElementById("site-header");
  if (headerSlot) headerSlot.outerHTML = headerHTML;
  var footerSlot = document.getElementById("site-footer");
  if (footerSlot) footerSlot.outerHTML = footerHTML;

  applyTheme(getPreferredTheme());

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("#theme-toggle");
    if (t) return toggleTheme();
    var m = e.target.closest && e.target.closest("#menu-btn");
    if (m) {
      var links = document.getElementById("nav-links");
      if (links) links.classList.toggle("open");
    }
  });

  /* ---------- blog filter ---------- */
  var chips = document.querySelectorAll("[data-filter]");
  if (chips.length) {
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("on"); });
        chip.classList.add("on");
        var f = chip.getAttribute("data-filter");
        document.querySelectorAll("[data-cat]").forEach(function (card) {
          card.style.display = (f === "all" || card.getAttribute("data-cat") === f) ? "" : "none";
        });
      });
    });
  }
  var search = document.getElementById("blog-search");
  if (search) {
    search.addEventListener("input", function () {
      var q = search.value.trim().toLowerCase();
      document.querySelectorAll("[data-cat]").forEach(function (card) {
        card.style.display = card.textContent.toLowerCase().indexOf(q) > -1 ? "" : "none";
      });
    });
  }

  /* ---------- forms ---------- */
  document.querySelectorAll("form[data-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = form.querySelector(".form-msg");
      // BACKEND: replace this block with a fetch() to your endpoint, e.g.
      // fetch(form.dataset.endpoint, { method: "POST", body: new FormData(form) })
      var data = Object.fromEntries(new FormData(form).entries());
      console.log("[rank-monk] form submitted:", form.dataset.form, data);
      if (msg) {
        msg.textContent = form.dataset.success || "Thanks. We will be in touch shortly.";
        msg.classList.add("show");
      }
      form.reset();
    });
  });
})();
