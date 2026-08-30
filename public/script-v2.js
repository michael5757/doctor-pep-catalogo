(function () {
  "use strict";

  const $ = (selector, context) => (context || document).querySelector(selector);
  const $$ = (selector, context) =>
    Array.from((context || document).querySelectorAll(selector));

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* Añade un número internacional en data-whatsapp-number del body. */
  const whatsappNumber = (document.body.dataset.whatsappNumber || "").replace(
    /\D/g,
    ""
  );
  const defaultMessage =
    "Hola, quisiera consultar la disponibilidad del catálogo Doctor Pep.";

  function whatsappUrl(message) {
    const destination = whatsappNumber
      ? "https://wa.me/" + whatsappNumber
      : "https://wa.me/";
    return destination + "?text=" + encodeURIComponent(message || defaultMessage);
  }

  $$(".whatsapp-link").forEach(function (link) {
    let message = defaultMessage;
    try {
      message =
        new URL(link.href, window.location.href).searchParams.get("text") ||
        message;
    } catch (_error) {
      message = link.dataset.message || message;
    }
    link.href = whatsappUrl(message);
  });

  function addProductConsultationLinks() {
    $$(".product-card").forEach(function (card) {
      const title = $("h3", card);
      if (!title || $(".product-whatsapp", card)) return;

      const link = document.createElement("a");
      link.className = "product-whatsapp";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Consultar disponibilidad";
      link.href = whatsappUrl(
        "Hola, quisiera consultar disponibilidad y presentaciones de " +
          title.textContent.trim() +
          "."
      );
      link.setAttribute(
        "aria-label",
        "Consultar disponibilidad de " +
          title.textContent.trim() +
          " por WhatsApp"
      );
      card.appendChild(link);
    });

    $$(".feature-card").forEach(function (card) {
      const title = $("h3", card);
      if (!title || $(".feature-whatsapp", card)) return;

      const link = document.createElement("a");
      link.className = "feature-whatsapp";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Consultar esta presentación";
      link.href = whatsappUrl(
        "Hola, quisiera consultar disponibilidad y presentaciones de " +
          title.textContent.trim() +
          "."
      );
      link.setAttribute(
        "aria-label",
        "Consultar presentaciones de " +
          title.textContent.trim() +
          " por WhatsApp"
      );
      card.appendChild(link);
    });
  }

  addProductConsultationLinks();

  const progressBar = $("#scrollProgress");
  const navbar = $("#navbar");
  const navLinks = $$(".nav-link");
  const sections = navLinks
    .map(function (link) {
      return $(link.getAttribute("href"));
    })
    .filter(Boolean);

  function updateScrollState() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (window.scrollY / max) * 100 : 0;

    if (progressBar) progressBar.style.width = progress + "%";
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 24);

    const marker = window.scrollY + 140;
    let currentId = sections[0] ? sections[0].id : "";
    sections.forEach(function (section) {
      if (section.offsetTop <= marker) currentId = section.id;
    });

    navLinks.forEach(function (link) {
      const active = link.getAttribute("href") === "#" + currentId;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  window.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("resize", updateScrollState, { passive: true });
  updateScrollState();

  const menuToggle = $("#menuToggle");
  const navLinksWrap = $("#navLinks");

  function closeMenu(returnFocus) {
    if (!menuToggle || !navLinksWrap) return;
    navLinksWrap.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    document.body.classList.remove("menu-open");
    if (returnFocus) menuToggle.focus();
  }

  function openMenu() {
    if (!menuToggle || !navLinksWrap) return;
    navLinksWrap.classList.add("open");
    menuToggle.classList.add("open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Cerrar menú");
    document.body.classList.add("menu-open");
    const firstLink = $(".nav-link", navLinksWrap);
    if (firstLink) firstLink.focus();
  }

  if (menuToggle && navLinksWrap) {
    menuToggle.addEventListener("click", function () {
      if (navLinksWrap.classList.contains("open")) closeMenu(false);
      else openMenu();
    });

    navLinksWrap.addEventListener("click", function (event) {
      if (event.target.closest(".nav-link")) closeMenu(false);
    });

    document.addEventListener("click", function (event) {
      if (
        navLinksWrap.classList.contains("open") &&
        !navLinksWrap.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMenu(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navLinksWrap.classList.contains("open")) {
        closeMenu(true);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1080) closeMenu(false);
    });
  }

  const revealElements = $$(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach(function (element) {
      element.classList.add("visible");
    });
  } else {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );

    revealElements.forEach(function (element) {
      revealObserver.observe(element);
    });
  }
})();
