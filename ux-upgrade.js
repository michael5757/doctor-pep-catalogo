(() => {
  'use strict';

  if (window.DoctorEcupepUXUpgrade) return;
  const api = window.DoctorEcupepCatalog;
  if (!api) return;
  window.DoctorEcupepUXUpgrade = true;

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const normalize = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  const compact = value => normalize(value).replace(/[^a-z0-9]+/g, '');

  const cards = $$('.category .feature-card, .category .product-card, .category .accessory');
  const productByCard = card => api.getProduct(card.dataset.productId);
  const cardById = new Map();
  cards.forEach(card => {
    if (card.dataset.productId && !cardById.has(card.dataset.productId)) {
      cardById.set(card.dataset.productId, card);
    }
  });

  /* ---------------- Search intelligence ---------------- */
  const aliases = {
    tirzepatide: ['tirzepatida', 'mounjaro', 'gip glp1', 'gip glp-1'],
    retatrutide: ['retatrutida', 'triple agonista', 'triple accion'],
    'mots-c': ['mots c', 'motsc'],
    'bpc-157': ['bpc 157', 'bpc157'],
    'tb-500': ['tb 500', 'tb500'],
    'cjc-1295-no-dac-ipamorelin': ['cjc 1295', 'cjc1295', 'ipamorelin cjc', 'cjc ipamorelin'],
    tesamorelin: ['tesamorelina'],
    ipamorelin: ['ipamorelina'],
    'pt-141': ['pt 141', 'pt141', 'bremelanotide', 'bremelanotida'],
    'kiss-peptin': ['kisspeptin', 'kisspeptina', 'kiss peptin'],
    'ss-31': ['ss 31', 'ss31', 'elamipretide'],
    'ara-290': ['ara 290', 'ara290'],
    glutathione: ['glutation', 'glutathion', 'glutathione'],
    'ghk-cu': ['ghk cu', 'ghkcu', 'peptido cobre', 'peptido de cobre'],
    epitalon: ['epithalon', 'epitalon'],
    nad: ['nad+', 'nad plus', 'nicotinamida adenina dinucleotido'],
    dsip: ['delta sleep peptide', 'sueno'],
    kpv: ['lisina prolina valina'],
    semax: ['semax nasal'],
    selank: ['selank nasal'],
    'serum-ghk-cu': ['serum ghk cu', 'serum ghkcu', 'serum cobre'],
    'selank-spray-nasal': ['selank spray', 'spray selank', 'selank nasal'],
    'semax-spray': ['semax spray', 'spray semax', 'semax nasal'],
    klow: ['k-low'],
    glow: ['g-low'],
    '5-amino-1mq': ['5 amino 1mq', '5amino1mq', '1mq'],
    'bac-water': ['bac water', 'agua bacteriostatica', 'agua bacteriostática'],
    'jeringa-3-ml': ['jeringa 3ml', 'jeringuilla 3 ml'],
    'jeringuilla-10-ml': ['jeringa 10ml', 'jeringuilla 10ml'],
    'alcohol-pre-pad': ['alcohol pad', 'alcohol prep pad', 'toallita alcohol'],
    'pen-peptide': ['pen peptide', 'pluma peptide', 'pluma peptido'],
    cartucho: ['cartridge'],
    'aguja-pen': ['aguja pen', 'pen needle'],
    'derma-roller': ['dermaroller', 'derma roller']
  };

  cards.forEach(card => {
    const item = productByCard(card);
    const base = card.dataset.searchIndex || '';
    card.dataset.uxBaseSearchIndex = base;
    const terms = [
      base,
      item?.name,
      compact(item?.name),
      ...(aliases[card.dataset.productId] || [])
    ].filter(Boolean);
    card.dataset.searchIndex = normalize(terms.join(' '));
  });

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const previous = Array.from({ length: b.length + 1 }, (_, i) => i);
    const current = new Array(b.length + 1);
    for (let i = 1; i <= a.length; i += 1) {
      current[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        current[j] = Math.min(
          current[j - 1] + 1,
          previous[j] + 1,
          previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
      for (let j = 0; j <= b.length; j += 1) previous[j] = current[j];
    }
    return previous[b.length];
  }

  function enrichSearchForQuery(rawValue) {
    const query = compact(rawValue);
    cards.forEach(card => {
      const base = card.dataset.uxBaseSearchIndex || card.dataset.searchIndex || '';
      const item = productByCard(card);
      const terms = [base, item?.name, compact(item?.name), ...(aliases[card.dataset.productId] || [])];
      card.dataset.searchIndex = normalize(terms.filter(Boolean).join(' '));
    });
    if (query.length < 4) return;

    const threshold = query.length >= 9 ? 2 : 1;
    const ranked = [];
    cardById.forEach((card, id) => {
      const item = api.getProduct(id);
      const candidates = [
        compact(item?.name),
        ...(aliases[id] || []).map(compact)
      ].filter(Boolean);
      const best = candidates.reduce((score, candidate) => Math.min(score, levenshtein(query, candidate)), Infinity);
      if (best <= threshold) ranked.push({ card, best });
    });
    ranked.sort((a, b) => a.best - b.best).slice(0, 3).forEach(({ card }) => {
      card.dataset.searchIndex += ' ' + normalize(rawValue);
    });
  }

  const catalogSearch = $('#catalogSearch');
  const heroSearch = $('#heroCatalogSearch');
  catalogSearch?.addEventListener('input', () => enrichSearchForQuery(catalogSearch.value), true);
  heroSearch?.addEventListener('input', () => enrichSearchForQuery(heroSearch.value), true);
  $('#heroSearchForm')?.addEventListener('submit', () => enrichSearchForQuery(heroSearch?.value), true);

  /* ---------------- Category counts + sticky desktop navigation ---------------- */
  const categories = [
    { id: 'metabolismo', label: 'Metabolismo' },
    { id: 'energia', label: 'Vitalidad' },
    { id: 'antienvejecimiento', label: 'Bienestar' },
    { id: 'accesorios', label: 'Accesorios' }
  ];

  const filterButtons = $$('[data-category-filter]');
  const totalFor = id => id === 'all'
    ? cards.length
    : cards.filter(card => card.closest('.category')?.id === id).length;

  filterButtons.forEach(button => {
    if ($('.filter-count', button)) return;
    const count = document.createElement('span');
    count.className = 'filter-count';
    count.setAttribute('aria-hidden', 'true');
    count.textContent = ' ' + totalFor(button.dataset.categoryFilter);
    button.append(count);
  });

  const catalogTools = $('#catalogo-completo');
  let jumpNav = null;
  if (catalogTools && !$('.category-jump-nav')) {
    jumpNav = document.createElement('nav');
    jumpNav.className = 'category-jump-nav';
    jumpNav.setAttribute('aria-label', 'Ir a una categoría');
    const inner = document.createElement('div');
    inner.className = 'category-jump-inner';

    [{ id: 'all', label: 'Todo' }, ...categories].forEach(entry => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.jumpCategory = entry.id;
      button.innerHTML = '<span>' + entry.label + '</span><small>' + totalFor(entry.id) + '</small>';
      button.addEventListener('click', () => {
        const filter = $('[data-category-filter="' + entry.id + '"]');
        filter?.click();
        const target = entry.id === 'all' ? catalogTools : document.getElementById(entry.id);
        if (target) {
          if (entry.id !== 'all') {
            const toggle = $('.category-toggle', target);
            if (target.classList.contains('is-collapsed')) toggle?.click();
          }
          setTimeout(() => target.scrollIntoView({
            behavior: api.reducedMotion ? 'auto' : 'smooth',
            block: 'start'
          }), 30);
        }
      });
      inner.append(button);
    });
    jumpNav.append(inner);
    catalogTools.insertAdjacentElement('afterend', jumpNav);
  }

  function setJumpActive(id) {
    if (!jumpNav) return;
    $$('[data-jump-category]', jumpNav).forEach(button => {
      const active = button.dataset.jumpCategory === id;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', () => setTimeout(() => setJumpActive(button.dataset.categoryFilter), 0));
  });
  setJumpActive('all');

  if ('IntersectionObserver' in window && jumpNav) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting && !entry.target.hidden)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setJumpActive(visible.target.id);
    }, { rootMargin: '-22% 0px -60% 0px', threshold: [0.05, 0.2, 0.45] });
    categories.forEach(entry => {
      const section = document.getElementById(entry.id);
      if (section) observer.observe(section);
    });
  }

  /* ---------------- Product sharing + dynamic metadata ---------------- */
  const defaults = {
    title: document.title,
    description: $('meta[name="description"]')?.content || '',
    canonical: $('link[rel="canonical"]')?.href || location.href,
    ogTitle: $('meta[property="og:title"]')?.content || '',
    ogDescription: $('meta[property="og:description"]')?.content || '',
    ogUrl: $('meta[property="og:url"]')?.content || '',
    ogImage: $('meta[property="og:image"]')?.content || '',
    twitterTitle: $('meta[name="twitter:title"]')?.content || '',
    twitterDescription: $('meta[name="twitter:description"]')?.content || '',
    twitterImage: $('meta[name="twitter:image"]')?.content || ''
  };

  function setMeta(selector, value) {
    const node = $(selector);
    if (node && value) node.setAttribute('content', value);
  }

  function productPublicUrl(id, presentation) {
    const url = new URL(location.origin + location.pathname);
    url.searchParams.set('producto', id);
    if (presentation) url.searchParams.set('presentacion', presentation);
    return url.href;
  }

  function updateProductMeta(id, presentation) {
    const item = api.getProduct(id);
    if (!item) return;
    const selected = presentation || item.presentations?.[0] || '';
    const title = item.name + (selected ? ' ' + selected : '') + ' | Doctor Ecupep';
    const description = (item.description || 'Consulta información y presentaciones del catálogo Doctor Ecupep.') +
      (selected ? ' Presentación: ' + selected + '.' : '');
    const url = productPublicUrl(id, selected);
    const image = item.image ? new URL(item.image, location.href).href : defaults.ogImage;

    document.title = title;
    const descriptionMeta = $('meta[name="description"]');
    if (descriptionMeta) descriptionMeta.content = description;
    const canonical = $('link[rel="canonical"]');
    if (canonical) canonical.href = url;
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', url);
    setMeta('meta[property="og:image"]', image);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[name="twitter:image"]', image);
  }

  function restoreMeta() {
    document.title = defaults.title;
    const descriptionMeta = $('meta[name="description"]');
    if (descriptionMeta) descriptionMeta.content = defaults.description;
    const canonical = $('link[rel="canonical"]');
    if (canonical) canonical.href = defaults.canonical;
    setMeta('meta[property="og:title"]', defaults.ogTitle);
    setMeta('meta[property="og:description"]', defaults.ogDescription);
    setMeta('meta[property="og:url"]', defaults.ogUrl);
    setMeta('meta[property="og:image"]', defaults.ogImage);
    setMeta('meta[name="twitter:title"]', defaults.twitterTitle);
    setMeta('meta[name="twitter:description"]', defaults.twitterDescription);
    setMeta('meta[name="twitter:image"]', defaults.twitterImage);
  }

  window.addEventListener('doctorecupep:product-view', event => {
    const detail = event.detail || {};
    if (detail.id) updateProductMeta(detail.id, detail.presentation);
  });

  $('#productDialog')?.addEventListener('close', restoreMeta);

  const activeAtLoad = api.getActiveProduct?.();
  if (activeAtLoad?.id) updateProductMeta(activeAtLoad.id, activeAtLoad.presentation);

  const shareButton = $('#shareProduct');
  if (shareButton) {
    shareButton.textContent = 'Compartir';
    shareButton.addEventListener('click', async event => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const active = api.getActiveProduct?.();
      const item = active?.id ? api.getProduct(active.id) : null;
      const url = active?.id ? productPublicUrl(active.id, active.presentation) : location.href;
      const title = item ? item.name + ' | Doctor Ecupep' : 'Doctor Ecupep';
      const text = item
        ? item.name + (active.presentation ? ' · ' + active.presentation : '') + ' en el catálogo Doctor Ecupep.'
        : 'Catálogo Doctor Ecupep';

      try {
        if (navigator.share && location.protocol !== 'file:') {
          await navigator.share({ title, text, url });
          shareButton.textContent = 'Compartido ✓';
          api.track?.('product_share_native', { product_id: active?.id });
        } else {
          await navigator.clipboard.writeText(url);
          shareButton.textContent = 'Enlace copiado ✓';
          api.track?.('product_share_copy', { product_id: active?.id });
        }
      } catch (error) {
        if (error?.name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(url);
            shareButton.textContent = 'Enlace copiado ✓';
          } catch {
            shareButton.textContent = 'No se pudo compartir';
          }
        }
      }
      setTimeout(() => { shareButton.textContent = 'Compartir'; }, 1800);
    }, true);
  }

  /* ---------------- Consultation drawer upgrades ---------------- */
  const drawer = $('#consultationDrawer');
  const intro = $('.consultation-intro', drawer);
  let summaryCard = null;
  if (drawer && intro && !$('.consultation-summary-card', drawer)) {
    summaryCard = document.createElement('div');
    summaryCard.className = 'consultation-summary-card';
    summaryCard.hidden = true;
    summaryCard.innerHTML =
      '<span class="consultation-summary-icon" aria-hidden="true">✓</span>' +
      '<div><strong>Lista preparada</strong><small id="uxConsultationSummary"></small></div>';
    intro.insertAdjacentElement('afterend', summaryCard);
  } else {
    summaryCard = $('.consultation-summary-card', drawer);
  }

  function updateDrawerSummary() {
    if (!summaryCard) return;
    const total = $('#consultationTotal')?.textContent?.trim() || '';
    const list = $('#consultationList');
    const hasItems = list && !list.hidden && list.children.length > 0;
    summaryCard.hidden = !hasItems;
    const text = $('#uxConsultationSummary');
    if (text) text.textContent = total || 'Revisa tu selección antes de enviarla.';
  }

  const consultationList = $('#consultationList');
  const consultationTotal = $('#consultationTotal');
  if ('MutationObserver' in window) {
    if (consultationList) {
      new MutationObserver(updateDrawerSummary).observe(consultationList, {
        childList: true, subtree: true, attributes: true, attributeFilter: ['hidden']
      });
    }
    if (consultationTotal) {
      new MutationObserver(updateDrawerSummary).observe(consultationTotal, {
        childList: true, subtree: true, characterData: true
      });
    }
  }
  updateDrawerSummary();

  /* ---------------- Image loading / rendering performance ---------------- */
  $$('.product-photo img, .recent-card img').forEach((image, index) => {
    if (!image.closest('.hero-product-stage')) {
      image.loading = 'lazy';
      image.decoding = 'async';
      if (index > 2) image.setAttribute('fetchpriority', 'low');
    }
  });

  $$('.section.category').forEach(section => {
    section.classList.add('ux-render-optimized');
  });

  /* ---------------- PWA install + network feedback ---------------- */
  let installPrompt = null;
  let installButton = null;

  function ensureInstallButton() {
    if (installButton || matchMedia('(display-mode: standalone)').matches) return installButton;
    const footerColumn = $('.footer-column');
    if (!footerColumn) return null;
    installButton = document.createElement('button');
    installButton.type = 'button';
    installButton.className = 'pwa-install-button';
    installButton.innerHTML = '<span aria-hidden="true">＋</span> Instalar catálogo';
    installButton.hidden = true;
    footerColumn.append(installButton);
    installButton.addEventListener('click', async () => {
      if (!installPrompt) return;
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      api.track?.('pwa_install_prompt', { outcome: result.outcome });
      installPrompt = null;
      installButton.hidden = true;
    });
    return installButton;
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    const button = ensureInstallButton();
    if (button) button.hidden = false;
  });

  window.addEventListener('appinstalled', () => {
    if (installButton) installButton.hidden = true;
    installPrompt = null;
    api.toast?.('Doctor Ecupep quedó instalado como app.');
  });

  let lastOnline = navigator.onLine;
  function networkChanged() {
    if (navigator.onLine === lastOnline) return;
    lastOnline = navigator.onLine;
    api.toast?.(
      navigator.onLine
        ? 'Conexión restablecida.'
        : 'Estás sin conexión. Puedes seguir consultando contenido ya cargado.'
    );
  }
  window.addEventListener('online', networkChanged);
  window.addEventListener('offline', networkChanged);

  /* ---------------- Useful keyboard access ---------------- */
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
    const tag = document.activeElement?.tagName?.toLowerCase();
    const typing = ['input', 'textarea', 'select'].includes(tag) || document.activeElement?.isContentEditable;
    if (typing) return;
    if (event.key === '/') {
      event.preventDefault();
      catalogTools?.scrollIntoView({ behavior: api.reducedMotion ? 'auto' : 'smooth', block: 'start' });
      setTimeout(() => catalogSearch?.focus({ preventScroll: true }), api.reducedMotion ? 0 : 280);
    }
  });
})();