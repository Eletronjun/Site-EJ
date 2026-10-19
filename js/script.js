(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    /* 1. Sticky header shadow on scroll */
    const header = document.getElementById("header");
    if (header) {
      const toggleHeaderShadow = () => {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
      };
      toggleHeaderShadow();
      window.addEventListener("scroll", toggleHeaderShadow, { passive: true });
    }

    /* 2. Mobile nav toggle (protegido contra ausência de elementos) */
    const navToggle = document.getElementById("navToggle");
    const nav = document.getElementById("primaryNav");

    if (navToggle && nav) {
      const closeNav = () => {
        nav.classList.remove("is-open", "nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      };

      const openNav = () => {
        nav.classList.add("is-open", "nav-open");
        navToggle.setAttribute("aria-expanded", "true");
      };

      navToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = nav.classList.contains("is-open") || nav.classList.contains("nav-open");
        isOpen ? closeNav() : openNav();
      });

      nav.querySelectorAll(".nav-link, .nav-cta").forEach((link) => {
        link.addEventListener("click", closeNav);
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeNav();
      });

      document.addEventListener("click", (e) => {
        const isOpen = nav.classList.contains("is-open") || nav.classList.contains("nav-open");
        if (!isOpen) return;
        if (nav.contains(e.target) || navToggle.contains(e.target)) return;
        closeNav();
      });
    }

    /* 3. Active nav link baseado na URL atual (para páginas fora da Home) */
    const navLinks = document.querySelectorAll(".nav-link");
    const currentPath = window.location.pathname;

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && !href.startsWith("#")) {
        if (currentPath.endsWith(href) || (href.includes("projetos.html") && currentPath.includes("projetos"))) {
          navLinks.forEach((l) => l.classList.remove("active"));
          link.classList.add("active");
        }
      }
    });

    /* 4. Scrollspy (Executado SOMENTE se as seções existirem na página atual) */
    const spySections = ["top", "sobre", "servicos"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (spySections.length && header) {
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
        if (current) setActiveLink(current.id);
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

    /* 5. Animação de estatísticas (Executada apenas se os elementos existirem) */
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

    /* 6. Máscara e validação numérica para o campo de Telefone */
    const campoTelefone = document.getElementById("telefone");
    if (campoTelefone) {
      campoTelefone.addEventListener("input", (e) => {
        let v = e.target.value.replace(/\D/g, ""); // Remove tudo que não for dígito
        if (v.length > 11) v = v.substring(0, 11);

        if (v.length > 10) {
          v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
        } else if (v.length > 6) {
          v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
        } else if (v.length > 2) {
          v = v.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
        } else if (v.length > 0) {
          v = v.replace(/^(\d*)$/, "($1");
        }
        e.target.value = v;
      });
    }
  });
})();