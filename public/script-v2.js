(function () {
  "use strict";
  if (!document.getElementById('catalogo-completo')) return;

  const $ = (selector, context) => (context || document).querySelector(selector);
  const $$ = (selector, context) =>
    Array.from((context || document).querySelectorAll(selector));
  const isLocalFile = location.protocol === 'file:';
  const pageParams = (url = new URL(location.href)) =>
    url.hash.startsWith('#?') ? new URLSearchParams(url.hash.slice(2)) : url.searchParams;
  function replacePageUrl(url) {
    // Some local browsers restrict History API calls. Never let that break a fiche.
    try { history.replaceState(history.state, '', url); } catch (_error) {}
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const mobileNavigation = window.matchMedia("(max-width: 1080px)");
  const mobileCatalog = window.matchMedia("(max-width: 760px)");
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

  function trackEvent(name, detail) {
    const payload = Object.assign(
      { event: name, timestamp: new Date().toISOString() },
      detail || {}
    );
    window.dispatchEvent(
      new CustomEvent("doctorpep:catalog", { detail: payload })
    );
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
  }

  /* ---------- WhatsApp: único acceso ---------- */
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

  /* ---------- Datos de producto ---------- */
  const sourceCards = $$(
    ".category .feature-card, .category .product-card, .category .accessory"
  );
  const categorySections = $$(".category");
  const editorial = JSON.parse($('#catalogData')?.textContent || '{"products":{}}');
  const canonicalPresentation = value => String(value || '').replace(/\s*ml$/i, ' ml');
  const productRecord = name => editorial.products[slug(name)] || {};
  const imageFor = (data, presentation) => productRecord(data.name).images?.[canonicalPresentation(presentation)] || data.image;

  function getCardData(card) {
    if (!card) return null;
    const section = card.closest(".category");
    const category = card.dataset.category || (section ? section.id : "catalogo");
    const nameElement = $("h3, h4", card);
    const productImage = $(".product-photo img", card);
    const descriptionElement =
      $(".fc-desc", card) || $("p", card) || $(".acc-cat", card);
    let presentations = $$(".pres", card).map(function (item) {
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

    const record = productRecord(card.dataset.productName || nameElement?.textContent.trim());
    if (record.presentations && record.name !== 'BAC WATER') presentations = record.presentations;
    presentations = presentations.map(canonicalPresentation);
    return {
      id: record.id,
      selectedPresentation: card.dataset.selectedPresentation || card.dataset.defaultPresentation || presentations[0],
      name:
        card.dataset.productName ||
        (nameElement ? nameElement.textContent.trim() : "Producto"),
      description:
        record.summary || card.dataset.productDescription ||
        (descriptionElement
          ? descriptionElement.textContent.trim()
          : "Consulta la información disponible de esta presentación."),
      category: category,
      image: productImage ? productImage.getAttribute("src") : "",
      imageAlt: productImage ? productImage.alt : "",
      imageIllustrative: Boolean($(".product-photo figcaption", card)),
      categoryLabel: categoryNames[category] || "Catálogo Doctor Pep",
      presentations: presentations.length
        ? presentations
        : ["Formato por confirmar"],
    };
  }

  function enhanceCard(card) {
    const data = getCardData(card);
    if (!data) return;
    card.dataset.productName = data.name;
    card.dataset.productDescription = data.description;
    card.dataset.category = data.category;
    card.dataset.presentations = JSON.stringify(data.presentations);
    if (data.presentations.length > 1) {
      const holder = $('.fc-presentations', card) || document.createElement('div');
      holder.classList.add('variant-preview');
      holder.setAttribute('role', 'group');
      holder.setAttribute('aria-label', 'Presentaciones de ' + data.name);
      holder.replaceChildren();
      data.presentations.forEach(presentation => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = presentation;
        button.setAttribute('aria-pressed', String(data.selectedPresentation === presentation));
        button.addEventListener('click', () => {
          card.dataset.selectedPresentation = presentation;
          $$('button', holder).forEach(b => b.setAttribute('aria-pressed', String(b === button)));
          const img = $('.product-photo img', card);
          img.src = imageFor(data, presentation);
          img.alt = data.name + ' · ' + presentation;
        });
        holder.append(button);
      });
      if (!holder.parentNode) card.append(holder);
    }

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
    addButton.textContent =
      data.presentations.length > 1 ? "Elegir" : "Añadir";
    addButton.setAttribute(
      "aria-label",
      data.presentations.length > 1
        ? "Elegir presentación de " + data.name
        : "Añadir " + data.name + " " + data.presentations[0] + " a la lista"
    );

    const availability = document.createElement("span");
    availability.className = "availability-tag";
    availability.innerHTML = '<i aria-hidden="true"></i> Disponibilidad por confirmar';

    actions.append(viewButton, addButton);
    card.append(availability, actions);
    const indicator = document.createElement('span');
    indicator.className = 'selection-indicator';
    indicator.hidden = true;
    card.append(indicator);
  }

  sourceCards.forEach(enhanceCard);

  /* ---------- Categorías plegables en móvil ---------- */
  function setCategoryCollapsed(section, collapsed) {
    const toggle = $(".category-toggle", section);
    section.classList.toggle("is-collapsed", collapsed);
    if (toggle) {
      toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
      toggle.querySelector("span").textContent = collapsed ? "Mostrar" : "Ocultar";
    }
  }

  categorySections.forEach(function (section, index) {
    const heading = $(".category-head", section);
    if (!heading) return;

    const content = document.createElement("div");
    content.className = "category-content";
    while (heading.nextSibling) content.appendChild(heading.nextSibling);
    section.appendChild(content);

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "category-toggle";
    toggle.innerHTML = '<span>Ocultar</span><i aria-hidden="true">⌄</i>';
    toggle.setAttribute("aria-expanded", "true");
    toggle.addEventListener("click", function () {
      section.dataset.userToggled = "true";
      setCategoryCollapsed(
        section,
        !section.classList.contains("is-collapsed")
      );
    });
    heading.appendChild(toggle);
    section.dataset.defaultOpen = index === 0 ? "true" : "false";
  });

  function syncCategoryLayout() {
    categorySections.forEach(function (section) {
      if (!mobileCatalog.matches) {
        setCategoryCollapsed(section, false);
        return;
      }
      if (section.dataset.userToggled === "true") return;
      setCategoryCollapsed(section, section.dataset.defaultOpen !== "true");
    });
  }

  syncCategoryLayout();
  mobileCatalog.addEventListener("change", syncCategoryLayout);

  /* ---------- Lista de consulta ---------- */
  const storageKey = "doctorPepConsultationV1";
  const consultationDrawer = $("#consultationDrawer");
  const consultationClose = $("#consultationClose");
  const consultationList = $("#consultationList");
  const consultationEmpty = $("#consultationEmpty");
  const consultationTotal = $("#consultationTotal");
  const consultationStatus = $("#consultationStatus");
  const clearConsultationButton = $("#clearConsultation");
  const listTrigger = $("#listTrigger");
  const listTriggerCount = $("#listTriggerCount");
  const mobileListTrigger = $("#mobileListTrigger");
  const mobileListCount = $("#mobileListCount");
  let consultation = [];
  let drawerTrigger = null;
  let clearConfirmationTimer = 0;

  function sourceDataForItem(item) {
    const sources = sourceCards.filter(function (card) {
      return getCardData(card).name === item.name;
    });
    if (sources.length) {
      const data = getCardData(sources[0]);
      data.presentations = Array.from(
        new Set(
          sources.flatMap(function (card) {
            return getCardData(card).presentations;
          })
        )
      );
      return data;
    }
    return {
      name: item.name,
      description: "Revisa la presentación seleccionada antes de enviar tu lista.",
      category: item.categoryKey || "catalogo",
      categoryLabel: item.categoryLabel || item.category || "Catálogo Doctor Pep",
      presentations:
        Array.isArray(item.presentations) && item.presentations.length
          ? item.presentations
          : [item.presentation],
    };
  }

  function loadConsultation() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
      if (!Array.isArray(saved)) return [];
      return saved
        .filter(function (item) {
          return item && item.name && item.presentation;
        })
        .map(function (item) {
          if (slug(item.name) === 'jeringuilla-100-und') {
            item = Object.assign({}, item, { name: 'Jeringuilla 10 ml', presentation: '10 ml' });
          }
          const sourceData = sourceDataForItem(item);
          return {
            id: slug(item.name + "-" + item.presentation),
            name: String(item.name),
            presentation: canonicalPresentation(item.presentation),
            presentations: sourceData.presentations,
            categoryKey: sourceData.category,
            categoryLabel: sourceData.categoryLabel,
            quantity: Math.min(99, Math.max(1, Math.floor(Number(item.quantity)) || 1)),
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
      /* La selección sigue disponible durante la sesión. */
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
        ? "Consultar por WhatsApp con " +
            total +
            (total === 1 ? " producto" : " productos") +
            " en la lista"
        : "Consultar el catálogo Doctor Pep por WhatsApp"
    );
    if (whatsappCount) {
      whatsappCount.textContent = String(total);
      whatsappCount.hidden = total === 0;
    }
    if (listTriggerCount) listTriggerCount.textContent = String(total);
    if (mobileListCount) mobileListCount.textContent = String(total);
    if (listTrigger) {
      listTrigger.classList.toggle("has-items", total > 0);
      listTrigger.setAttribute(
        "aria-label",
        "Abrir mi lista, " + total + (total === 1 ? " producto" : " productos")
      );
    }
    if (mobileListTrigger) {
      mobileListTrigger.setAttribute(
        "aria-label",
        "Abrir mi lista, " + total + (total === 1 ? " producto" : " productos")
      );
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
      (action === "increase"
        ? "Aumentar cantidad de "
        : "Disminuir cantidad de ") + item.name
    );
    if (action === "decrease" && item.quantity <= 1) button.disabled = true;
    if (action === "increase" && item.quantity >= 99) button.disabled = true;
    return button;
  }

  function renderConsultation() {
    if (!consultationList) return;
    consultationList.textContent = "";

    consultation.forEach(function (item) {
      const row = document.createElement("li");
      row.className = "consultation-item";

      const product = document.createElement("div");
      product.className = "consultation-product";
      const source = sourceDataForItem(item);
      if (source.image) {
        const thumbnail = document.createElement("img");
        thumbnail.className = "consultation-thumbnail";
        thumbnail.src = imageFor(source, item.presentation);
        thumbnail.alt = "";
        thumbnail.width = 64;
        thumbnail.height = 64;
        thumbnail.loading = "lazy";
        product.appendChild(thumbnail);
      }
      const name = document.createElement("strong");
      name.textContent = item.name;
      const meta = document.createElement("span");
      meta.textContent = item.presentation + " · " + item.categoryLabel;
      product.append(name, meta);

      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "consultation-edit";
      edit.dataset.consultationAction = "edit";
      edit.dataset.itemId = item.id;
      edit.textContent = "Cambiar";
      edit.setAttribute("aria-label", "Cambiar presentación de " + item.name);

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
      remove.setAttribute("aria-label", "Eliminar " + item.name + " de la lista");

      const rowActions = document.createElement("div");
      rowActions.className = "consultation-row-actions";
      rowActions.append(edit, remove);
      row.append(product, controls, rowActions);
      consultationList.appendChild(row);
    });

    const total = consultation.reduce(function (sum, item) {
      return sum + item.quantity;
    }, 0);
    if (consultationEmpty) consultationEmpty.hidden = consultation.length > 0;
    consultationList.hidden = consultation.length === 0;
    if (consultationTotal) {
      consultationTotal.textContent =
        total + (total === 1 ? " producto" : " productos");
    }
    if (clearConsultationButton) {
      clearConsultationButton.hidden = consultation.length === 0;
    }
    updateWhatsappFloat();
    sourceCards.forEach(card => {
      const data = getCardData(card);
      const count = consultation.filter(item => item.name === data.name && data.presentations.includes(item.presentation)).reduce((total, item) => total + item.quantity, 0);
      card.classList.toggle('is-selected', count > 0);
      const indicator = $('.selection-indicator', card);
      indicator.hidden = !count;
      indicator.textContent = '✓ En tu lista · ' + count + (count === 1 ? ' envase' : ' envases');
    });
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
    const safeQuantity = Math.min(99, Math.max(1, Math.floor(Number(quantity)) || 1));
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
        presentations: data.presentations,
        categoryKey: data.category,
        categoryLabel: data.categoryLabel,
        quantity: safeQuantity,
      });
    }
    renderConsultation();
    announceConsultation(data.name + " fue añadido a tu lista.");
    showToast(data.name + " fue añadido a tu lista.");
    trackEvent("list_add", { item_count: consultation.length });
  }

  function updateConsultationItem(oldId, data, presentation, quantity) {
    const current = consultation.find(function (item) {
      return item.id === oldId;
    });
    if (!current) return;
    const newId = slug(data.name + "-" + presentation);
    const safeQuantity = Math.min(99, Math.max(1, Math.floor(Number(quantity)) || 1));
    consultation = consultation.filter(function (item) {
      return item.id !== oldId;
    });
    const duplicate = consultation.find(function (item) {
      return item.id === newId;
    });
    if (duplicate) duplicate.quantity = Math.min(99, duplicate.quantity + safeQuantity);
    else {
      consultation.push({
        id: newId,
        name: data.name,
        presentation: presentation,
        presentations: data.presentations,
        categoryKey: data.category,
        categoryLabel: data.categoryLabel,
        quantity: safeQuantity,
      });
    }
    renderConsultation();
    announceConsultation("La selección de " + data.name + " fue actualizada.");
    showToast("Selección actualizada.");
    trackEvent("list_edit", { item_count: consultation.length });
  }

  consultation = loadConsultation();
  renderConsultation();

  function openConsultationDrawer(trigger) {
    if (!consultationDrawer || consultationDrawer.open) return;
    drawerTrigger = trigger || listTrigger;
    consultationDrawer.showModal();
    // Move the single WhatsApp link into the active modal so it remains usable.
    if (whatsappFloat) $('.consultation-footer', consultationDrawer).append(whatsappFloat);
    window.setTimeout(function () {
      if (consultationClose) consultationClose.focus();
    }, 0);
    trackEvent("list_open", { item_count: consultation.length });
  }

  if (listTrigger) {
    listTrigger.addEventListener("click", function () {
      openConsultationDrawer(listTrigger);
    });
  }
  if (mobileListTrigger) {
    mobileListTrigger.addEventListener("click", function () {
      openConsultationDrawer(mobileListTrigger);
    });
  }
  if (consultationClose && consultationDrawer) {
    consultationClose.addEventListener("click", function () {
      consultationDrawer.close();
    });
    consultationDrawer.addEventListener("click", function (event) {
      if (event.target === consultationDrawer) consultationDrawer.close();
    });
    consultationDrawer.addEventListener("close", function () {
      if (whatsappFloat) document.body.append(whatsappFloat);
      if (drawerTrigger && document.contains(drawerTrigger)) drawerTrigger.focus();
      drawerTrigger = null;
    });
  }

  if (clearConsultationButton) {
    clearConsultationButton.addEventListener("click", function () {
      if (clearConsultationButton.dataset.confirm !== "true") {
        clearConsultationButton.dataset.confirm = "true";
        clearConsultationButton.textContent = "Confirmar vaciado";
        window.clearTimeout(clearConfirmationTimer);
        clearConfirmationTimer = window.setTimeout(function () {
          clearConsultationButton.dataset.confirm = "false";
          clearConsultationButton.textContent = "Vaciar lista";
        }, 4000);
        return;
      }
      consultation = [];
      clearConsultationButton.dataset.confirm = "false";
      clearConsultationButton.textContent = "Vaciar lista";
      renderConsultation();
      announceConsultation("La lista fue vaciada.");
      showToast("Lista vaciada.");
      trackEvent("list_clear");
      if (consultationClose) consultationClose.focus();
    });
  }

  /* ---------- Confirmación visual ---------- */
  const catalogToast = $("#catalogToast");
  const toastMessage = $("#toastMessage");
  const toastOpenList = $("#toastOpenList");
  let toastTimer = 0;

  function hideToast() {
    if (!catalogToast) return;
    catalogToast.hidden = true;
    window.clearTimeout(toastTimer);
  }

  function showToast(message) {
    if (!catalogToast || !toastMessage) return;
    toastMessage.textContent = message;
    catalogToast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(hideToast, 4200);
  }

  if (toastOpenList) {
    toastOpenList.addEventListener("click", function () {
      hideToast();
      openConsultationDrawer(listTrigger);
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
  const dialogAddButton = $(".dialog-add", productDialog);
  let activeProduct = null;
  let dialogTrigger = null;
  let dialogMode = "add";
  let editingItemId = null;
  let reopenDrawerAfterDialog = false;
  let previousProductUrl = null;

  function productUrl(data, presentation) {
    const url = new URL(location.href);
    const params = isLocalFile ? new URLSearchParams() : url.searchParams;
    params.set('producto', data.id || slug(data.name));
    params.set('presentacion', presentation);
    if (isLocalFile) url.hash = '?' + params.toString();
    return url;
  }
  function syncProductSelection() {
    if (!activeProduct) return;
    const presentation = $("input[name='presentation']:checked", dialogPresentations)?.value || activeProduct.presentations[0];
    const img = $('#dialogProductImage');
    img.src = imageFor(activeProduct, presentation);
    img.alt = activeProduct.name + ' · ' + presentation;
    $('#selectionSummary').textContent = activeProduct.name + ' · ' + presentation + ' · ' + (dialogQuantity.value || '1') + ' envase(s)';
    replacePageUrl(productUrl(activeProduct, presentation));
  }
  function renderProductDetails(data) {
    const record = productRecord(data.name);
    const container = $('#productDetails');
    container.replaceChildren();
    const addSection = (title, paragraphs, open = false) => {
      const detail = document.createElement('details');
      detail.open = open;
      const summary = document.createElement('summary');
      summary.textContent = title;
      detail.append(summary);
      paragraphs.filter(Boolean).forEach(text => { const p = document.createElement('p'); p.textContent = text; detail.append(p); });
      container.append(detail);
      return detail;
    };
    addSection('Qué es', [record.what], true);
    addSection('Para qué sirve', [record.usage], true);
    if (record.benefits?.length) {
      const benefits = addSection(record.benefitsTitle || 'Beneficios', [], true);
      benefits.className = 'product-benefits';
      const list = document.createElement('ul');
      record.benefits.forEach(text => {
        const item = document.createElement('li');
        item.textContent = text;
        list.append(item);
      });
      benefits.append(list);
    }
    addSection('Presentación e información de uso', [
      'Opciones del catálogo: ' + data.presentations.join(' · ') + '.',
      record.note,
    ]);
  }

  function showProductDialog(data, trigger, options) {
    const settings = options || {};
    activeProduct = data;
    previousProductUrl = location.href;
    dialogTrigger = settings.returnFocus || trigger || null;
    dialogMode = settings.mode || "add";
    editingItemId = settings.itemId || null;
    reopenDrawerAfterDialog = Boolean(settings.reopenDrawer);
    dialogTitle.textContent = data.name;
    dialogCategory.textContent = data.categoryLabel;
    dialogDescription.textContent = data.description;
    const dialogImage = $("#dialogProductImage");
    const dialogPhoto = $("#dialogProductPhoto");
    if (dialogPhoto) dialogPhoto.hidden = !data.image;
    const dialogCaption = dialogPhoto ? $("figcaption", dialogPhoto) : null;
    if (dialogCaption) dialogCaption.hidden = true;
    if (dialogImage && data.image) {
      dialogImage.src = data.image;
      dialogImage.alt = data.imageAlt || "Imagen del tipo de producto";
    }
    dialogPresentations.textContent = "";

    data.presentations.forEach(function (presentation, index) {
      const option = document.createElement("label");
      option.className = "presentation-option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "presentation";
      input.value = presentation;
      input.checked = settings.presentation || data.selectedPresentation
        ? canonicalPresentation(settings.presentation || data.selectedPresentation) === presentation
        : index === 0;
      const text = document.createElement("span");
      text.textContent = presentation;
      option.append(input, text);
      dialogPresentations.appendChild(option);
    });
    dialogQuantity.value = String(settings.quantity || 1);
    renderProductDetails(data);
    syncProductSelection();
    dialogAddButton.textContent =
      dialogMode === "edit" ? "Guardar cambios" : "Añadir a mi lista";
    productDialog.showModal();
    const firstOption = $("input[name='presentation']:checked", dialogPresentations);
    window.setTimeout(function () {
      (firstOption || dialogClose).focus();
    }, 0);
    trackEvent("product_open", { presentation_count: data.presentations.length });
  }

  function openProductDialog(data, trigger, options) {
    if (!productDialog || !data) return;
    if (consultationDrawer && consultationDrawer.open) {
      consultationDrawer.close();
      window.setTimeout(function () {
        showProductDialog(data, trigger, options);
      }, 20);
    } else showProductDialog(data, trigger, options);
  }

  if (dialogClose && productDialog) {
    dialogClose.addEventListener("click", function () {
      productDialog.close();
    });
    productDialog.addEventListener("click", function (event) {
      if (event.target === productDialog) productDialog.close();
    });
    productDialog.addEventListener("close", function () {
      if (previousProductUrl) {
        const url = new URL(previousProductUrl);
        if (isLocalFile) {
          if (url.hash.startsWith('#?')) url.hash = '';
        } else {
          url.searchParams.delete('producto'); url.searchParams.delete('presentacion');
        }
        replacePageUrl(url);
      }
      previousProductUrl = null;
      const shouldReopen = reopenDrawerAfterDialog;
      const focusTarget = dialogTrigger;
      activeProduct = null;
      dialogTrigger = null;
      dialogMode = "add";
      editingItemId = null;
      reopenDrawerAfterDialog = false;
      if (shouldReopen) {
        window.setTimeout(function () {
          openConsultationDrawer(listTrigger);
        }, 20);
      } else if (focusTarget && document.contains(focusTarget)) focusTarget.focus();
    });
  }

  if (dialogForm) {
    dialogForm.addEventListener('change', syncProductSelection);
    dialogQuantity.addEventListener('input', syncProductSelection);
    dialogForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!activeProduct) return;
      const selected = $("input[name='presentation']:checked", dialogPresentations);
      const presentation = selected
        ? selected.value
        : activeProduct.presentations[0];
      if (dialogMode === "edit") {
        updateConsultationItem(
          editingItemId,
          activeProduct,
          presentation,
          dialogQuantity.value
        );
      } else {
        addToConsultation(activeProduct, presentation, dialogQuantity.value);
      }
      productDialog.close();
    });
  }

  document.addEventListener("click", function (event) {
    const cardAction = event.target.closest("[data-card-action]");
    if (cardAction) {
      const card = cardAction.closest(
        ".feature-card, .product-card, .accessory"
      );
      const data = getCardData(card);
      if (!data) return;
      if (cardAction.dataset.cardAction === "view") {
        openProductDialog(data, cardAction);
      }
      if (cardAction.dataset.cardAction === "add") {
        if (data.presentations.length > 1) {
          openProductDialog(data, cardAction);
        } else addToConsultation(data, data.presentations[0], 1);
      }
      return;
    }

    const listAction = event.target.closest("[data-consultation-action]");
    if (!listAction) return;
    const item = consultation.find(function (entry) {
      return entry.id === listAction.dataset.itemId;
    });
    if (!item) return;
    const action = listAction.dataset.consultationAction;

    if (action === "edit") {
      openProductDialog(sourceDataForItem(item), listTrigger, {
        mode: "edit",
        itemId: item.id,
        presentation: item.presentation,
        quantity: item.quantity,
        reopenDrawer: true,
        returnFocus: listTrigger,
      });
      return;
    }
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
        ? item.name + " fue eliminado de la lista."
        : "Cantidad de " + item.name + " actualizada a " + item.quantity + "."
    );
    if (action === "remove") showToast(item.name + " fue eliminado.");
    const next = $(
      "[data-item-id='" +
        item.id +
        "'][data-consultation-action='" +
        action +
        "']"
    );
    if (next) next.focus();
    else if (consultationClose) consultationClose.focus();
  });

  /* ---------- Búsqueda y filtros ---------- */
  const catalogSearch = $("#catalogSearch");
  const heroCatalogSearch = $("#heroCatalogSearch");
  const heroSearchForm = $("#heroSearchForm");
  const quickSearchButtons = $$("[data-quick-search]");
  const mobileSearchTrigger = $("#mobileSearchTrigger");
  const clearSearch = $("#clearSearch");
  const resetCatalog = $("#resetCatalog");
  const resultCount = $("#catalogResultCount");
  const emptyState = $("#catalogEmpty");
  const filterChips = $$("[data-category-filter]");
  let activeCategory = "all";
  let searchTrackingTimer = 0;

  function updateAccessorySubheadings(section) {
    if (!section || section.id !== "accesorios") return;
    $$(".sub-heading", section).forEach(function (heading) {
      const grid = heading.nextElementSibling;
      const visible = grid
        ? $$(".product-card, .accessory", grid).some(function (card) {
            return !card.hidden;
          })
        : false;
      heading.hidden = !visible;
    });
  }

  function applyCatalogFilters() {
    const query = normalizeText(catalogSearch ? catalogSearch.value : "");
    let visibleCount = 0;
    sourceCards.forEach(function (card) {
      const data = getCardData(card);
      const haystack = normalizeText(
        [data.name, data.description, data.categoryLabel]
          .concat(data.presentations)
          .join(" ")
      );
      const categoryMatches =
        activeCategory === "all" || data.category === activeCategory;
      const compact = value => value.replace(/[^a-z0-9]/g, '');
      const searchMatches = !query || haystack.includes(query) || compact(haystack).includes(compact(query));
      const visible = categoryMatches && searchMatches;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    categorySections.forEach(function (section) {
      const hasVisible = $$(
        ".feature-card, .product-card, .accessory",
        section
      ).some(function (card) {
        return !card.hidden;
      });
      section.hidden = !hasVisible;
      updateAccessorySubheadings(section);
      if (hasVisible && (query || activeCategory !== "all")) {
        setCategoryCollapsed(section, false);
      }
    });
    if (!query && activeCategory === "all") syncCategoryLayout();
    if (clearSearch) clearSearch.hidden = !query;
    if (emptyState) emptyState.hidden = visibleCount !== 0;
    if (resultCount) {
      resultCount.textContent =
        visibleCount +
        " de " +
        sourceCards.length +
        (visibleCount === 1 ? " resultado" : " resultados");
    }
    try { sessionStorage.setItem('doctorPepBrowse', JSON.stringify({query: catalogSearch?.value || '', category: activeCategory})); } catch {}
    return visibleCount;
  }

  function resetCatalogFilters() {
    activeCategory = "all";
    if (catalogSearch) catalogSearch.value = "";
    if (heroCatalogSearch) heroCatalogSearch.value = "";
    filterChips.forEach(function (chip) {
      const active = chip.dataset.categoryFilter === "all";
      chip.classList.toggle("is-active", active);
      chip.setAttribute("aria-pressed", active ? "true" : "false");
    });
    applyCatalogFilters();
    if (catalogSearch) catalogSearch.focus();
  }

  if (catalogSearch) {
    catalogSearch.addEventListener("input", function () {
      if (heroCatalogSearch) heroCatalogSearch.value = catalogSearch.value;
      const visible = applyCatalogFilters();
      window.clearTimeout(searchTrackingTimer);
      searchTrackingTimer = window.setTimeout(function () {
        trackEvent("catalog_search", {
          query_length: catalogSearch.value.trim().length,
          result_count: visible,
        });
      }, 500);
    });
  }
  if (heroCatalogSearch) {
    heroCatalogSearch.addEventListener("input", function () {
      if (catalogSearch) catalogSearch.value = heroCatalogSearch.value;
      applyCatalogFilters();
    });
  }
  if (heroSearchForm) {
    heroSearchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (catalogSearch && heroCatalogSearch) {
        catalogSearch.value = heroCatalogSearch.value;
      }
      const visible = applyCatalogFilters();
      $("#catalogo-completo").scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
      window.setTimeout(function () {
        if (catalogSearch) catalogSearch.focus({ preventScroll: true });
      }, prefersReducedMotion ? 0 : 450);
      trackEvent("hero_search", {
        query_length: heroCatalogSearch.value.trim().length,
        result_count: visible,
      });
    });
  }
  quickSearchButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const value = button.dataset.quickSearch || "";
      if (heroCatalogSearch) heroCatalogSearch.value = value;
      if (catalogSearch) catalogSearch.value = value;
      applyCatalogFilters();
      heroSearchForm.requestSubmit();
    });
  });
  if (mobileSearchTrigger) {
    mobileSearchTrigger.addEventListener("click", function () {
      $("#catalogo-completo").scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
      window.setTimeout(function () {
        if (catalogSearch) catalogSearch.focus({ preventScroll: true });
      }, prefersReducedMotion ? 0 : 450);
    });
  }
  if (clearSearch) {
    clearSearch.addEventListener("click", function () {
      catalogSearch.value = "";
      if (heroCatalogSearch) heroCatalogSearch.value = "";
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
      const visible = applyCatalogFilters();
      trackEvent("category_filter", { result_count: visible });
    });
  });
  try {
    const saved = JSON.parse(sessionStorage.getItem('doctorPepBrowse') || 'null');
    if (saved && !pageParams().has('producto')) {
      catalogSearch.value = saved.query || '';
      if (heroCatalogSearch) heroCatalogSearch.value = catalogSearch.value;
      activeCategory = filterChips.some(c => c.dataset.categoryFilter === saved.category) ? saved.category : 'all';
      filterChips.forEach(c => { const on = c.dataset.categoryFilter === activeCategory; c.classList.toggle('is-active', on); c.setAttribute('aria-pressed', String(on)); });
    }
  } catch {}
  applyCatalogFilters();

  if (whatsappFloat) {
    whatsappFloat.addEventListener("click", function () {
      trackEvent("whatsapp_click", { item_count: consultation.length });
    });
  }

  /* ---------- Navegación ---------- */
  const progressBar = $("#scrollProgress");
  const navbar = $("#navbar");
  const navLinks = $$(".nav-link");
  const navSections = navLinks
    .map(function (link) {
      const href = link.getAttribute('href');
      return href?.startsWith('#') ? $(href) : null;
    })
    .filter(Boolean);

  function updateScrollState() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progressBar) progressBar.style.width = progress + "%";
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 20);
    const marker = window.scrollY + 150;
    let currentId = navSections[0] ? navSections[0].id : "";
    navSections.forEach(function (section) {
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
      const href = link.getAttribute('href');
      const target = href?.startsWith('#') ? $(href) : null;
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

  /* ---------- Movimiento discreto ---------- */
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
      { threshold: 0.06, rootMargin: "0px 0px -20px 0px" }
    );
    revealElements.forEach(function (element) {
      revealObserver.observe(element);
    });
  }
  /* Image zoom and presentation-specific sharing. */
  const imageDialog = $('#imageDialog');
  $('#zoomProduct')?.addEventListener('click', () => {
    const source = $('#dialogProductImage');
    $('#largeProductImage').src = source.src;
    $('#largeProductImage').alt = source.alt;
    $('#largeProductCaption').textContent = source.alt;
    imageDialog.showModal();
    $('#closeImage').focus();
  });
  $('#closeImage')?.addEventListener('click', () => imageDialog.close());
  imageDialog?.addEventListener('click', event => { if (event.target === imageDialog) imageDialog.close(); });
  imageDialog?.addEventListener('close', () => $('#zoomProduct').focus({preventScroll: true}));
  $('#shareProduct')?.addEventListener('click', async () => {
    const button = $('#shareProduct');
    const selectedPresentation = $("input[name='presentation']:checked", dialogPresentations)?.value || activeProduct?.presentations?.[0];
    const value = activeProduct && selectedPresentation
      ? productUrl(activeProduct, selectedPresentation).href
      : location.href;
    try { await navigator.clipboard.writeText(value); button.textContent = isLocalFile ? 'Referencia copiada ✓' : 'Enlace copiado ✓'; }
    catch {
      let field = $('#productLinkFallback');
      if (!field) { field = document.createElement('input'); field.id = 'productLinkFallback'; field.readOnly = true; field.setAttribute('aria-label', 'Texto para copiar'); button.after(field); }
      field.value = value; field.focus(); field.select();
      button.textContent = 'Selecciona y copia el enlace';
    }
  });
  productDialog?.addEventListener('close', () => {
    $('#shareProduct').textContent = 'Copiar enlace';
    $('#productLinkFallback')?.remove();
  });
  // Optional owner-selected priorities are applied inside existing categories only.
  const priority = editorial.featuredProductIds || [];
  $$('.feature-grid, .product-grid, .accessory-grid').forEach(grid => {
    const children = [...grid.children];
    children.sort((a, b) => {
      const rank = el => { const i = priority.indexOf(el.dataset.productId); return i < 0 ? Infinity : i; };
      return rank(a) - rank(b);
    }).forEach(child => grid.append(child));
  });
  window.addEventListener('pagehide', () => {
    try { sessionStorage.setItem('doctorPepScroll', String(window.scrollY)); } catch {}
  });
  const initialUrl = new URL(location.href);
  if (isLocalFile) $('#shareProduct').textContent = 'Copiar enlace';
  // Hero links open the same fiche without navigating away from the local file.
  $$('[data-product-link]').forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const card = sourceCards.find(item => getCardData(item).id === link.dataset.productLink);
    if (!card) return;
    event.preventDefault();
    setCategoryCollapsed(card.closest('.category'), false);
    openProductDialog(getCardData(card), link);
  }));
  const initialParams = pageParams(initialUrl);
  const requestedId = initialParams.get('producto') === 'jeringuilla-100-und' ? 'jeringuilla-10-ml' : initialParams.get('producto');
  if (requestedId) {
    const presentation = canonicalPresentation(initialParams.get('presentacion'));
    const matches = sourceCards.filter(card => getCardData(card).id === requestedId);
    const card = matches.find(c => getCardData(c).presentations.includes(presentation)) || matches[0];
    if (card) {
      const data = getCardData(card);
      setCategoryCollapsed(card.closest('.category'), false);
      openProductDialog(data, $('[data-card-action="view"]', card), {presentation: data.presentations.includes(presentation) ? presentation : data.presentations[0]});
    }
  } else if (!location.hash) {
    try { const position = Number(sessionStorage.getItem('doctorPepScroll')); if (position) requestAnimationFrame(() => window.scrollTo({top: position, behavior: 'instant'})); } catch {}
  }
  if (initialParams.get('lista') === '1') {
    openConsultationDrawer(listTrigger);
    const clean = new URL(location.href);
    if (isLocalFile) { if (clean.hash.startsWith('#?')) clean.hash = ''; }
    else clean.searchParams.delete('lista');
    replacePageUrl(clean);
  }
})();
