(function () {
  "use strict";

  const $ = (selector, context) => (context || document).querySelector(selector);
  const $$ = (selector, context) =>
    Array.from((context || document).querySelectorAll(selector));

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const mobileNavigation = window.matchMedia("(max-width: 1080px)");
  const categoryNames = {
    metabolismo: "Metabolismo y control de peso",
    energia: "Vitalidad, rendimiento y recuperación",
    antienvejecimiento: "Bienestar, longevidad y cuidado",
    accesorios: "Agua bacteriostática y accesorios",
  };

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function slug(value) {
    return normalizeText(value)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /* ---------- WhatsApp: único acceso flotante ---------- */
  const whatsappNumber = (document.body.dataset.whatsappNumber || "").replace(
    /\D/g,
    ""
  );
  const whatsappFloat = $(".whatsapp-float");
  const whatsappCount = $("#whatsappCount");
  const defaultMessage =
    "Hola, quisiera consultar la disponibilidad del catálogo Doctor Pep.";

  function whatsappUrl(message) {
    const destination = whatsappNumber
      ? "https://wa.me/" + whatsappNumber
      : "https://wa.me/";
    return destination + "?text=" + encodeURIComponent(message || defaultMessage);
  }

  /* ---------- Datos y mejoras de las tarjetas ---------- */
  const sourceCards = $$(
    ".category .feature-card, .category .product-card, .category .accessory"
  );

  function getCardData(card) {
    if (!card) return null;

    const section = card.closest(".category");
    const category = card.dataset.category || (section ? section.id : "catalogo");
    const nameElement = $("h3, h4", card);
    const descriptionElement = $(".fc-desc", card) || $("p", card) || $(".acc-cat", card);
    const presentationElements = $$(".pres", card);
    let presentations = presentationElements.map(function (item) {
      return item.textContent.trim();
    });

    if (!presentations.length) {
      const badge = $(".pc-badge, .acc-icon", card);
      if (badge) presentations = [badge.textContent.trim()];
    }

    if (card.dataset.presentations) {
      try {
        presentations = JSON.parse(card.dataset.presentations);
      } catch (_error) {
        presentations = presentations;
      }
    }

    return {
      name: card.dataset.productName || (nameElement ? nameElement.textContent.trim() : "Producto"),
      description:
        card.dataset.productDescription ||
        (descriptionElement ? descriptionElement.textContent.trim() : "Consulta la información disponible de esta presentación."),
      category: category,
      categoryLabel: categoryNames[category] || "Catálogo Doctor Pep",
      presentations: presentations.length ? presentations : ["Formato por confirmar"],
    };
  }

  function enhanceCard(card) {
    const data = getCardData(card);
    if (!data) return;

    card.dataset.productName = data.name;
    card.dataset.productDescription = data.description;
    card.dataset.category = data.category;
    card.dataset.presentations = JSON.stringify(data.presentations);

    if ($(".card-actions", card)) return;

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const viewButton = document.createElement("button");
    viewButton.type = "button";
    viewButton.className = "card-action card-action-secondary";
    viewButton.dataset.cardAction = "view";
    viewButton.textContent = "Ver ficha";
    viewButton.setAttribute("aria-label", "Ver ficha de " + data.name);

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "card-action card-action-primary";
    addButton.dataset.cardAction = "add";
    addButton.textContent = "Añadir a consulta";
    addButton.setAttribute(
      "aria-label",
      "Añadir " + data.name + " " + data.presentations[0] + " a la consulta"
    );

    actions.append(viewButton, addButton);
    card.appendChild(actions);
  }

  sourceCards.forEach(enhanceCard);

  function buildFeaturedProducts() {
    const grid = $("#featuredGrid");
    if (!grid) return;

    const featuredNames = ["TIRZEPATIDE", "BPC-157", "NAD", "BAC WATER"];
    featuredNames.forEach(function (name) {
      const source = sourceCards.find(function (card) {
        return getCardData(card).name === name;
      });
      if (!source) return;

      const clone = source.cloneNode(true);
      clone.classList.remove("reveal");
      clone.classList.add("featured-card", "visible");
      clone.removeAttribute("style");
      grid.appendChild(clone);
    });
  }

  buildFeaturedProducts();

  /* ---------- Lista de consulta ---------- */
  const storageKey = "doctorPepConsultationV1";
  const consultationList = $("#consultationList");
  const consultationEmpty = $("#consultationEmpty");
  const consultationTotal = $("#consultationTotal");
  const consultationStatus = $("#consultationStatus");
  let consultation = [];

  function loadConsultation() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
      if (!Array.isArray(saved)) return [];
      return saved
        .filter(function (item) {
          return item && item.name && item.presentation;
        })
        .map(function (item) {
          return {
            id: slug(item.name + "-" + item.presentation),
            name: String(item.name),
            presentation: String(item.presentation),
            category: String(item.category || "Catálogo Doctor Pep"),
            quantity: Math.min(99, Math.max(1, Number(item.quantity) || 1)),
          };
        });
    } catch (_error) {
      return [];
    }
  }

  function saveConsultation() {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(consultation));
    } catch (_error) {
      /* La lista sigue funcionando durante la sesión aunque el navegador bloquee el almacenamiento. */
    }
  }

  function consultationMessage() {
    if (!consultation.length) return defaultMessage;

    const lines = consultation.map(function (item) {
      return "• " + item.quantity + " × " + item.name + " — " + item.presentation;
    });
    return (
      "Hola, quisiera consultar disponibilidad de estos productos Doctor Pep:\n\n" +
      lines.join("\n") +
      "\n\n¿Podrían confirmarme disponibilidad, entrega y forma de pago?"
    );
  }

  function updateWhatsappFloat() {
    if (!whatsappFloat) return;
    const total = consultation.reduce(function (sum, item) {
      return sum + item.quantity;
    }, 0);

    whatsappFloat.href = whatsappUrl(consultationMessage());
    whatsappFloat.setAttribute(
      "aria-label",
      total
        ? "Consultar por WhatsApp con " + total + (total === 1 ? " producto" : " productos") + " en la lista"
        : "Consultar el catálogo Doctor Pep por WhatsApp"
    );

    if (whatsappCount) {
      whatsappCount.textContent = String(total);
      whatsappCount.hidden = total === 0;
    }
  }

  function createQuantityButton(symbol, action, item) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quantity-button";
    button.dataset.consultationAction = action;
    button.dataset.itemId = item.id;
    button.textContent = symbol;
    button.setAttribute(
      "aria-label",
      (action === "increase" ? "Aumentar cantidad de " : "Disminuir cantidad de ") + item.name
    );
    if (action === "decrease" && item.quantity <= 1) button.disabled = true;
    return button;
  }

  function renderConsultation() {
    if (!consultationList) return;
    consultationList.textContent = "";

    consultation.forEach(function (item) {
      const row = document.createElement("li");
      row.className = "consultation-item";
      row.dataset.itemId = item.id;

      const product = document.createElement("div");
      product.className = "consultation-product";
      const name = document.createElement("strong");
      name.textContent = item.name;
      const meta = document.createElement("span");
      meta.textContent = item.presentation + " · " + item.category;
      product.append(name, meta);

      const controls = document.createElement("div");
      controls.className = "consultation-controls";
      const decrease = createQuantityButton("−", "decrease", item);
      const quantity = document.createElement("output");
      quantity.className = "consultation-quantity";
      quantity.textContent = String(item.quantity);
      quantity.setAttribute("aria-label", "Cantidad: " + item.quantity);
      const increase = createQuantityButton("+", "increase", item);
      controls.append(decrease, quantity, increase);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "consultation-remove";
      remove.dataset.consultationAction = "remove";
      remove.dataset.itemId = item.id;
      remove.textContent = "Eliminar";
      remove.setAttribute("aria-label", "Eliminar " + item.name + " de la consulta");

      row.append(product, controls, remove);
      consultationList.appendChild(row);
    });

    const total = consultation.reduce(function (sum, item) {
      return sum + item.quantity;
    }, 0);
    if (consultationEmpty) consultationEmpty.hidden = consultation.length > 0;
    consultationList.hidden = consultation.length === 0;
    if (consultationTotal) {
      consultationTotal.textContent = total + (total === 1 ? " producto" : " productos");
    }
    updateWhatsappFloat();
    saveConsultation();
  }

  function announceConsultation(message) {
    if (!consultationStatus) return;
    consultationStatus.textContent = "";
    window.setTimeout(function () {
      consultationStatus.textContent = message;
    }, 20);
  }

  function addToConsultation(data, presentation, quantity) {
    const safeQuantity = Math.min(99, Math.max(1, Number(quantity) || 1));
    const id = slug(data.name + "-" + presentation);
    const existing = consultation.find(function (item) {
      return item.id === id;
    });

    if (existing) existing.quantity = Math.min(99, existing.quantity + safeQuantity);
    else {
      consultation.push({
        id: id,
        name: data.name,
        presentation: presentation,
        category: data.categoryLabel,
        quantity: safeQuantity,
      });
    }

    renderConsultation();
    announceConsultation(data.name + " fue añadido a tu consulta.");
  }

  consultation = loadConsultation();
  renderConsultation();

  if (consultationList) {
    consultationList.setAttribute("tabindex", "-1");
    consultationList.addEventListener("click", function (event) {
      const button = event.target.closest("[data-consultation-action]");
      if (!button) return;
      const item = consultation.find(function (entry) {
        return entry.id === button.dataset.itemId;
      });
      if (!item) return;

      const action = button.dataset.consultationAction;
      if (action === "increase") item.quantity = Math.min(99, item.quantity + 1);
      if (action === "decrease") item.quantity = Math.max(1, item.quantity - 1);
      if (action === "remove") {
        consultation = consultation.filter(function (entry) {
          return entry.id !== item.id;
        });
      }

      renderConsultation();
      announceConsultation(
        action === "remove"
          ? item.name + " fue eliminado de tu consulta."
          : "Cantidad de " + item.name + " actualizada a " + item.quantity + "."
      );

      const nextFocus = $("[data-item-id='" + item.id + "'][data-consultation-action='" + action + "']");
      if (nextFocus) nextFocus.focus();
      else if (consultation.length) consultationList.focus({ preventScroll: true });
      else {
        const heading = $("#consultation-title");
        if (heading) {
          heading.setAttribute("tabindex", "-1");
          heading.focus({ preventScroll: true });
        }
      }
    });
  }

  /* ---------- Ficha de producto ---------- */
  const productDialog = $("#productDialog");
  const dialogTitle = $("#dialogTitle");
  const dialogCategory = $("#dialogCategory");
  const dialogDescription = $("#dialogDescription");
  const dialogPresentations = $("#dialogPresentations");
  const dialogQuantity = $("#dialogQuantity");
  const dialogForm = $("#dialogForm");
  const dialogClose = $("#dialogClose");
  let activeProduct = null;
  let dialogTrigger = null;

  function openProductDialog(data, trigger) {
    if (!productDialog || !data) return;
    activeProduct = data;
    dialogTrigger = trigger || null;
    dialogTitle.textContent = data.name;
    dialogCategory.textContent = data.categoryLabel;
    dialogDescription.textContent = data.description;
    dialogPresentations.textContent = "";

    data.presentations.forEach(function (presentation, index) {
      const option = document.createElement("label");
      option.className = "presentation-option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "presentation";
      input.value = presentation;
      input.checked = index === 0;
      const text = document.createElement("span");
      text.textContent = presentation;
      option.append(input, text);
      dialogPresentations.appendChild(option);
    });

    dialogQuantity.value = "1";
    productDialog.showModal();
    const firstOption = $("input[name='presentation']", dialogPresentations);
    window.setTimeout(function () {
      (firstOption || dialogClose).focus();
    }, 0);
  }

  if (dialogClose && productDialog) {
    dialogClose.addEventListener("click", function () {
      productDialog.close();
    });

    productDialog.addEventListener("click", function (event) {
      if (event.target === productDialog) productDialog.close();
    });

    productDialog.addEventListener("close", function () {
      if (dialogTrigger && document.contains(dialogTrigger)) dialogTrigger.focus();
      dialogTrigger = null;
      activeProduct = null;
    });
  }

  if (dialogForm) {
    dialogForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!activeProduct) return;
      const selected = $("input[name='presentation']:checked", dialogPresentations);
      const presentation = selected ? selected.value : activeProduct.presentations[0];
      addToConsultation(activeProduct, presentation, dialogQuantity.value);
      productDialog.close();
    });
  }

  document.addEventListener("click", function (event) {
    const action = event.target.closest("[data-card-action]");
    if (!action) return;
    const card = action.closest(".feature-card, .product-card, .accessory");
    const data = getCardData(card);
    if (!data) return;

    if (action.dataset.cardAction === "view") openProductDialog(data, action);
    if (action.dataset.cardAction === "add") {
      addToConsultation(data, data.presentations[0], 1);
    }
  });

  /* ---------- Buscador y filtros ---------- */
  const catalogSearch = $("#catalogSearch");
  const clearSearch = $("#clearSearch");
  const resetCatalog = $("#resetCatalog");
  const resultCount = $("#catalogResultCount");
  const emptyState = $("#catalogEmpty");
  const filterChips = $$("[data-category-filter]");
  const categorySections = $$(".category");
  let activeCategory = "all";

  function updateAccessorySubheadings(section) {
    if (!section || section.id !== "accesorios") return;
    $$(".sub-heading", section).forEach(function (heading) {
      const grid = heading.nextElementSibling;
      const hasVisibleCards = grid
        ? $$(".product-card, .accessory", grid).some(function (card) {
            return !card.hidden;
          })
        : false;
      heading.hidden = !hasVisibleCards;
    });
  }

  function applyCatalogFilters() {
    const query = normalizeText(catalogSearch ? catalogSearch.value : "");
    let visibleCount = 0;

    sourceCards.forEach(function (card) {
      const data = getCardData(card);
      const haystack = normalizeText(
        [data.name, data.description, data.categoryLabel].concat(data.presentations).join(" ")
      );
      const categoryMatches = activeCategory === "all" || data.category === activeCategory;
      const searchMatches = !query || haystack.includes(query);
      const visible = categoryMatches && searchMatches;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    categorySections.forEach(function (section) {
      const hasVisibleCards = $$(
        ".feature-card, .product-card, .accessory",
        section
      ).some(function (card) {
        return !card.hidden;
      });
      section.hidden = !hasVisibleCards;
      updateAccessorySubheadings(section);
    });

    if (clearSearch) clearSearch.hidden = !query;
    if (emptyState) emptyState.hidden = visibleCount !== 0;
    if (resultCount) {
      resultCount.textContent =
        visibleCount +
        " de " +
        sourceCards.length +
        (visibleCount === 1 ? " resultado" : " resultados");
    }
  }

  function resetCatalogFilters() {
    activeCategory = "all";
    if (catalogSearch) catalogSearch.value = "";
    filterChips.forEach(function (chip) {
      const active = chip.dataset.categoryFilter === "all";
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", active ? "true" : "false");
    });
    applyCatalogFilters();
    if (catalogSearch) catalogSearch.focus();
  }

  if (catalogSearch) catalogSearch.addEventListener("input", applyCatalogFilters);
  if (clearSearch) {
    clearSearch.addEventListener("click", function () {
      catalogSearch.value = "";
      applyCatalogFilters();
      catalogSearch.focus();
    });
  }
  if (resetCatalog) resetCatalog.addEventListener("click", resetCatalogFilters);

  filterChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      activeCategory = chip.dataset.categoryFilter;
      filterChips.forEach(function (item) {
        const active = item === chip;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", active ? "true" : "false");
      });
      applyCatalogFilters();
    });
  });

  applyCatalogFilters();

  /* ---------- Progreso, navegación y menú ---------- */
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

    const marker = window.scrollY + 160;
    let currentId = sections[0] ? sections[0].id : "";
    sections.forEach(function (section) {
      if (!section.hidden && section.offsetTop <= marker) currentId = section.id;
    });

    navLinks.forEach(function (link) {
      const active = link.getAttribute("href") === "#" + currentId;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  window.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("resize", updateScrollState, { passive: true });
  updateScrollState();

  const menuToggle = $("#menuToggle");
  const navLinksWrap = $("#navLinks");

  function setNavigationAvailability(open) {
    if (!navLinksWrap) return;
    if (!mobileNavigation.matches) {
      navLinksWrap.hidden = false;
      navLinksWrap.inert = false;
      return;
    }
    navLinksWrap.hidden = !open;
    navLinksWrap.inert = !open;
  }

  function closeMenu(returnFocus) {
    if (!menuToggle || !navLinksWrap) return;
    navLinksWrap.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    document.body.classList.remove("menu-open");
    setNavigationAvailability(false);
    if (returnFocus) menuToggle.focus();
  }

  function openMenu() {
    if (!menuToggle || !navLinksWrap) return;
    setNavigationAvailability(true);
    navLinksWrap.classList.add("open");
    menuToggle.classList.add("open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Cerrar menú");
    document.body.classList.add("menu-open");
    const firstLink = $(".nav-link", navLinksWrap);
    if (firstLink) firstLink.focus();
  }

  if (menuToggle && navLinksWrap) {
    setNavigationAvailability(false);
    menuToggle.addEventListener("click", function () {
      if (navLinksWrap.classList.contains("open")) closeMenu(false);
      else openMenu();
    });

    navLinksWrap.addEventListener("click", function (event) {
      const link = event.target.closest(".nav-link");
      if (!link) return;
      closeMenu(false);
      const target = $(link.getAttribute("href"));
      if (target && mobileNavigation.matches) {
        target.setAttribute("tabindex", "-1");
        window.setTimeout(function () {
          target.focus({ preventScroll: true });
        }, 80);
      }
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

    mobileNavigation.addEventListener("change", function () {
      closeMenu(false);
    });
  }

  /* ---------- Revelado discreto ---------- */
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
