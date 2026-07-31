// ==========================================================================
// CODINEX COMPUTERS LTD — shared site behaviour
// ==========================================================================

(function () {
  "use strict";

  /* ---------- Theme toggle (dark default, light optional) ---------- */
  var THEME_KEY = "codinex-theme";
  function getStoredTheme() {
    try { return window.localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function storeTheme(v) {
    try { window.localStorage.setItem(THEME_KEY, v); } catch (e) { /* ignore */ }
  }
  function applyTheme(theme) {
    document.documentElement.classList.toggle("light", theme === "light");
    var btn = document.getElementById("themeToggle");
    if (btn) btn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
  }
  var savedTheme = getStoredTheme() || "dark";
  applyTheme(savedTheme);

  document.addEventListener("DOMContentLoaded", function () {
    var themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", function () {
        var isLight = document.documentElement.classList.contains("light");
        var next = isLight ? "dark" : "light";
        applyTheme(next);
        storeTheme(next);
      });
    }

    /* ---------- Mobile nav ---------- */
    var hamburger = document.getElementById("hamburger");
    var navLinks = document.getElementById("navLinks");
    if (hamburger && navLinks) {
      hamburger.addEventListener("click", function () {
        navLinks.classList.toggle("open");
        var expanded = navLinks.classList.contains("open");
        hamburger.setAttribute("aria-expanded", expanded ? "true" : "false");
      });
      navLinks.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { navLinks.classList.remove("open"); });
      });
    }

    /* ---------- Scroll reveal ---------- */
    var revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && revealEls.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("in-view"); });
    }

    /* ---------- Animated stat counters ---------- */
    var counters = document.querySelectorAll("[data-count]");
    function animateCounter(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1400;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.floor(eased * target);
        el.textContent = value.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString() + suffix;
      }
      requestAnimationFrame(step);
    }
    if ("IntersectionObserver" in window && counters.length) {
      var counterIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { counterIo.observe(el); });
    }

    /* ---------- Tabs (services page) ---------- */
    document.querySelectorAll("[data-tabs]").forEach(function (group) {
      var tabButtons = group.querySelectorAll(".tab-btn");
      var panels = group.querySelectorAll(".tab-panel");
      tabButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          tabButtons.forEach(function (b) { b.classList.remove("active"); });
          panels.forEach(function (p) { p.classList.remove("active"); });
          btn.classList.add("active");
          var target = group.querySelector('[data-panel="' + btn.getAttribute("data-tab") + '"]');
          if (target) target.classList.add("active");
        });
      });
    });

    /* ---------- Accordion (training / FAQ) ---------- */
    document.querySelectorAll(".accordion-item").forEach(function (item) {
      var head = item.querySelector(".accordion-head");
      var body = item.querySelector(".accordion-body");
      head.addEventListener("click", function () {
        var isOpen = item.classList.contains("open");
        item.parentElement.querySelectorAll(".accordion-item").forEach(function (other) {
          other.classList.remove("open");
          other.querySelector(".accordion-body").style.maxHeight = null;
        });
        if (!isOpen) {
          item.classList.add("open");
          body.style.maxHeight = body.scrollHeight + "px";
        }
      });
    });

    /* ---------- Cost estimator ---------- */
    var estimatorForm = document.getElementById("estimatorForm");
    if (estimatorForm) {
      var ranges = {
        networking: [400000, 2500000, "Networking & Cabling"],
        cctv: [350000, 3000000, "CCTV & Security Systems"],
        webdesign: [600000, 4000000, "Website Design & Hosting"],
        software: [1500000, 12000000, "Custom Software / Management System"],
        repair: [30000, 250000, "Computer Repair & Maintenance"],
        training: [80000, 400000, "Computer Training / Certification"]
      };
      var scopeMultiplier = { small: 1, medium: 1.8, large: 3 };

      function formatUGX(n) {
        return "UGX " + Math.round(n).toLocaleString();
      }

      function updateEstimate() {
        var service = estimatorForm.querySelector('[name="service"]').value;
        var scope = estimatorForm.querySelector('input[name="scope"]:checked');
        var scopeVal = scope ? scope.value : "small";
        var base = ranges[service];
        if (!base) return;
        var mult = scopeMultiplier[scopeVal] || 1;
        var low = base[0] * (mult === 1 ? 1 : mult * 0.8);
        var high = base[1] * mult;
        var resultEl = document.getElementById("estimateRange");
        var labelEl = document.getElementById("estimateService");
        if (resultEl) resultEl.textContent = formatUGX(low) + " – " + formatUGX(high);
        if (labelEl) labelEl.textContent = base[2];
        var waBtn = document.getElementById("estimateWaBtn");
        if (waBtn) {
          var msg = "Hello Codinex, I'd like a quote for " + base[2] + " (" + scopeVal + " scope). Estimated range shown: " + formatUGX(low) + " - " + formatUGX(high) + ".";
          waBtn.href = "https://wa.me/256756198585?text=" + encodeURIComponent(msg);
        }
      }

      estimatorForm.addEventListener("change", updateEstimate);
      updateEstimate();
    }

    /* ---------- Contact form (client-side only, no backend) ---------- */
    var contactForm = document.getElementById("contactForm");
    if (contactForm) {
      contactForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var status = document.getElementById("formStatus");
        var name = contactForm.querySelector('[name="name"]').value.trim();
        var email = contactForm.querySelector('[name="email"]').value.trim();
        var message = contactForm.querySelector('[name="message"]').value.trim();
        var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name || !email || !message) {
          status.textContent = "Please fill in your name, email, and message.";
          status.className = "form-status error";
          return;
        }
        if (!emailRe.test(email)) {
          status.textContent = "That email address doesn't look right — please check it.";
          status.className = "form-status error";
          return;
        }
        var subject = encodeURIComponent("Website enquiry from " + name);
        var body = encodeURIComponent(message + "\n\n— " + name + " (" + email + ")");
        window.location.href = "mailto:info@codinex.co.ug?subject=" + subject + "&body=" + body;
        status.textContent = "Opening your email app to send this message to info@codinex.co.ug…";
        status.className = "form-status success";
      });
    }

    /* ---------- Footer year ---------- */
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Set active nav link ---------- */
    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) a.classList.add("active");
    });
  });
})();
