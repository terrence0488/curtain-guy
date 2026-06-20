/* ============================================================
   Curtain Guy — Calvin · interactions
   Vanilla JS. No deps. Respects prefers-reduced-motion.
   ============================================================ */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav scroll state ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");

    // Back to top
    const toTop = document.getElementById("toTop");
    if (toTop) {
      if (window.scrollY > 600) {
        toTop.hidden = false;
        requestAnimationFrame(() => toTop.classList.add("is-visible"));
      } else {
        toTop.classList.remove("is-visible");
        setTimeout(() => { if (window.scrollY <= 600) toTop.hidden = true; }, 400);
      }
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Back to top click ---------- */
  const toTop = document.getElementById("toTop");
  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    });
  }

  /* ---------- Mobile menu ---------- */
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  const setMenu = (open) => {
    if (!navToggle || !mobileMenu) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  };

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      setMenu(!open);
    });
  }
  document.querySelectorAll("[data-close]").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu && mobileMenu.classList.contains("is-open")) {
      setMenu(false);
      navToggle && navToggle.focus();
    }
  });

  /* ---------- Smooth scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
    });
  });

  /* ---------- Reveal on scroll (IntersectionObserver) ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- Stat counters ---------- */
  const stats = document.querySelectorAll(".stat__num");
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count || "0", 10);
    const suffix = el.dataset.suffix || "";
    if (prefersReduced) {
      el.textContent = target + suffix;
      return;
    }
    const dur = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const val = Math.round(eased * target);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (stats.length) {
    if (prefersReduced || !("IntersectionObserver" in window)) {
      stats.forEach(animateCount);
    } else {
      const statObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              statObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      stats.forEach((s) => statObserver.observe(s));
    }
  }

  /* ---------- Hero parallax ---------- */
  const heroImg = document.getElementById("heroImg");
  if (heroImg && !prefersReduced) {
    let ticking = false;
    const onParallax = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < window.innerHeight) {
            heroImg.style.transform = `translateY(${y * 0.22}px) scale(1.06)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onParallax, { passive: true });
  }

  /* ---------- Lightbox ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");
  let lastFocused = null;

  const openLightbox = (src, alt, trigger) => {
    if (!lightbox) return;
    lastFocused = trigger;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => lightboxClose && lightboxClose.focus(), 100);
  };
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  };

  document.querySelectorAll(".gallery__item").forEach((item) => {
    item.addEventListener("click", () => {
      const src = item.dataset.img;
      const alt = item.querySelector("img")?.getAttribute("alt") || "";
      openLightbox(src, alt, item);
    });
  });
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox && lightbox.classList.contains("is-open")) closeLightbox();
  });

  /* ---------- FAQ accordion (single-open behaviour, keyboard via <details>) ---------- */
  const faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        faqItems.forEach((other) => {
          if (other !== item && other.open) other.open = false;
        });
      }
    });
  });

  /* ---------- Quote form ---------- */
  const form = document.getElementById("quoteForm");
  const formSuccess = document.getElementById("formSuccess");
  const formSubmit = document.getElementById("formSubmit");
  const formReset = document.getElementById("formReset");

  const showError = (field, msg) => {
    const input = form.querySelector(`#${field}`);
    const errEl = form.querySelector(`.form__error[data-for="${field}"]`);
    if (input) input.classList.add("is-invalid");
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.add("is-visible");
    }
  };
  const clearError = (field) => {
    const input = form.querySelector(`#${field}`);
    const errEl = form.querySelector(`.form__error[data-for="${field}"]`);
    if (input) input.classList.remove("is-invalid");
    if (errEl) {
      errEl.textContent = "";
      errEl.classList.remove("is-visible");
    }
  };

  // Live clear on input
  ["name", "contact"].forEach((f) => {
    const el = form.querySelector(`#${f}`);
    if (el) el.addEventListener("input", () => clearError(f));
  });

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isPhone = (v) => /^[+]?[\d\s()-]{6,}$/.test(v);

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;

      const name = form.name.value.trim();
      const contact = form.contact.value.trim();

      if (name.length < 2) { showError("name", "Please enter your name."); valid = false; }
      else clearError("name");

      if (contact.length < 4) {
        showError("contact", "Please enter a phone or email.");
        valid = false;
      } else if (!isEmail(contact) && !isPhone(contact)) {
        showError("contact", "Enter a valid phone number or email.");
        valid = false;
      } else {
        clearError("contact");
      }

      if (!valid) {
        const firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Mock submission: loading -> success
      formSubmit.classList.add("is-loading");
      formSubmit.querySelector(".form__submit-text").textContent = "Sending…";

      setTimeout(() => {
        formSubmit.classList.remove("is-loading");
        form.style.display = "none";
        if (formSuccess) {
          formSuccess.hidden = false;
          formSuccess.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
        }
      }, 900);
    });
  }

  if (formReset && form) {
    formReset.addEventListener("click", () => {
      form.reset();
      ["name", "contact"].forEach(clearError);
      if (formSuccess) formSuccess.hidden = true;
      form.style.display = "";
      form.querySelector("#name").focus();
    });
  }

  /* ---------- Footer year fallback (in case element missing) ---------- */
  // (handled above)
})();
