(() => {
  "use strict";

  /* Sticky header shadow on scroll */
  const header = document.getElementById("header");
  const toggleHeaderShadow = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  toggleHeaderShadow();
  window.addEventListener("scroll", toggleHeaderShadow, { passive: true });

  /* Mobile nav toggle */
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("primaryNav");

  const closeNav = () => {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  const openNav = () => {
    nav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.contains("is-open");
    isOpen ? closeNav() : openNav();
  });

  nav.querySelectorAll(".nav-link, .nav-cta").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  document.addEventListener("click", (e) => {
    const isOpen = nav.classList.contains("is-open");
    if (!isOpen) return;
    if (nav.contains(e.target) || navToggle.contains(e.target)) return;
    closeNav();
  });

  /* Active nav link on click */
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  /* Scrollspy for sections that exist on this page.
     Picks the last section (in document order) whose top has crossed the
     anchor line — deterministic in both scroll directions, unlike relying
     on IntersectionObserver entry order when two short sections both
     briefly overlap the detection band. */
  const spySections = ["top", "sobre", "servicos"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (spySections.length) {
    const setActiveLink = (id) => {
      const match = document.querySelector(`.nav-link[href="#${id}"]`);
      if (!match) return;
      navLinks.forEach((l) => l.classList.remove("active"));
      match.classList.add("active");
    };

    let ticking = false;
    const updateActiveSection = () => {
      ticking = false;
      const anchor = header.offsetHeight + 24;
      let current = spySections[0];
      for (const section of spySections) {
        if (section.getBoundingClientRect().top - anchor <= 0) {
          current = section;
        } else {
          break;
        }
      }
      setActiveLink(current.id);
    };

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(updateActiveSection);
      },
      { passive: true }
    );
    updateActiveSection();
  }

  /* Stats count-up animation, triggered once on scroll into view */
  const statNumbers = document.querySelectorAll(".stat-number");

  const animateCount = (el) => {
    const target = Number(el.dataset.target || 0);
    const duration = 1400;
    const start = performance.now();
    const easeOutQuad = (t) => t * (2 - t);

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.round(target * easeOutQuad(progress));
      el.textContent = value;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    };
    requestAnimationFrame(step);
  };

  if (statNumbers.length) {
    if ("IntersectionObserver" in window) {
      const statsObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            animateCount(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.6 }
      );
      statNumbers.forEach((el) => statsObserver.observe(el));
    } else {
      statNumbers.forEach(animateCount);
    }
  }
})();
