(() => {
  "use strict";

  /* Sticky header shadow on scroll */
  const header = document.getElementById("header");
  if (header) {
    const toggleHeaderShadow = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    toggleHeaderShadow();
    window.addEventListener("scroll", toggleHeaderShadow, { passive: true });
  }

  /* Mobile nav toggle */
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("primaryNav");

  if (navToggle && nav) {
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
  }

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

  /* Animated services carousel card */
  const servicesCarousel = document.querySelector(".services-carousel");
  if (servicesCarousel) {
    const slides = Array.from(servicesCarousel.querySelectorAll(".service-slide"));
    const prevBtn = servicesCarousel.querySelector(".services-arrow--prev");
    const nextBtn = servicesCarousel.querySelector(".services-arrow--next");
    const dots = Array.from(servicesCarousel.querySelectorAll(".services-dot"));
    const counterEl = servicesCarousel.querySelector(".service-card-counter");
    const progressBar = servicesCarousel.querySelector(".service-card-progress-bar");
    const viewport = servicesCarousel.querySelector(".service-card-viewport");

    const total = slides.length;
    if (total > 0) {
      let currentIndex = 0;
      const animClasses = [
        "is-entering-right",
        "is-entering-left",
        "is-leaving-left",
        "is-leaving-right",
      ];
      const reducedMotionQuery = window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

      const updateIndicators = (index) => {
        if (counterEl) {
          counterEl.textContent = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
        }
        if (progressBar) {
          progressBar.style.width = `${((index + 1) / total) * 100}%`;
        }
        dots.forEach((dot, dotIndex) => {
          const isActive = dotIndex === index;
          dot.classList.toggle("is-active", isActive);
          dot.setAttribute("aria-selected", isActive ? "true" : "false");
        });
      };

      const clearSlideAnimations = (slide) => {
        slide.classList.remove(...animClasses);
      };

      const goToSlide = (targetIndex, explicitDirection) => {
        const nextIndex = (targetIndex + total) % total;
        if (nextIndex === currentIndex) return;

        const direction =
          explicitDirection || (nextIndex > currentIndex ? "next" : "prev");
        const prevSlide = slides[currentIndex];
        const nextSlide = slides[nextIndex];

        slides.forEach((slide) => {
          clearSlideAnimations(slide);
          if (slide !== prevSlide && slide !== nextSlide) {
            slide.classList.remove("is-active");
            slide.setAttribute("aria-hidden", "true");
          }
        });

        const prefersReducedMotion = Boolean(
          reducedMotionQuery && reducedMotionQuery.matches
        );

        prevSlide.classList.remove("is-active");
        prevSlide.setAttribute("aria-hidden", "true");
        nextSlide.classList.add("is-active");
        nextSlide.setAttribute("aria-hidden", "false");

        if (!prefersReducedMotion) {
          void nextSlide.offsetWidth;

          const leaveClass =
            direction === "next" ? "is-leaving-left" : "is-leaving-right";
          const enterClass =
            direction === "next" ? "is-entering-right" : "is-entering-left";

          prevSlide.classList.add(leaveClass);
          nextSlide.classList.add(enterClass);

          const onLeaveEnd = (event) => {
            if (event.target !== prevSlide) return;
            prevSlide.classList.remove(leaveClass);
          };
          const onEnterEnd = (event) => {
            if (event.target !== nextSlide) return;
            nextSlide.classList.remove(enterClass);
          };

          prevSlide.addEventListener("animationend", onLeaveEnd, { once: true });
          nextSlide.addEventListener("animationend", onEnterEnd, { once: true });
        }

        currentIndex = nextIndex;
        updateIndicators(currentIndex);
      };

      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          goToSlide(currentIndex - 1, "prev");
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          goToSlide(currentIndex + 1, "next");
        });
      }

      dots.forEach((dot) => {
        dot.addEventListener("click", () => {
          const index = Number(dot.dataset.index);
          if (Number.isNaN(index)) return;
          goToSlide(index, index > currentIndex ? "next" : "prev");
        });
      });

      servicesCarousel.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          goToSlide(currentIndex + 1, "next");
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          goToSlide(currentIndex - 1, "prev");
        }
      });

      if (viewport) {
        let touchStartX = 0;
        let touchStartY = 0;

        viewport.addEventListener(
          "touchstart",
          (event) => {
            if (!event.changedTouches.length) return;
            touchStartX = event.changedTouches[0].clientX;
            touchStartY = event.changedTouches[0].clientY;
          },
          { passive: true }
        );

        viewport.addEventListener(
          "touchend",
          (event) => {
            if (!event.changedTouches.length) return;
            const deltaX = event.changedTouches[0].clientX - touchStartX;
            const deltaY = event.changedTouches[0].clientY - touchStartY;
            if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
              goToSlide(
                deltaX < 0 ? currentIndex + 1 : currentIndex - 1,
                deltaX < 0 ? "next" : "prev"
              );
            }
          },
          { passive: true }
        );
      }

      updateIndicators(0);
    }
  }
})();
