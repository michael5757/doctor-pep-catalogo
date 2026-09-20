(() => {
  'use strict';
  const api = window.DoctorEcupepCatalog;
  if (!api || window.DoctorEcupepExtras) return;
  window.DoctorEcupepExtras = true;
  if (!document.querySelector("link[data-ecupep-extras]")) {
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = new URL("catalog-extras.min.css?v=20260920-discovery-v2", document.baseURI).href;
    style.dataset.ecupepExtras = "true";
    document.head.append(style);
  }
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const compact = value => normalize(value).replace(/[^a-z0-9]/g, '');
  const publicCatalog = JSON.parse($('#catalogData')?.textContent || '{"products":{}}').products || {};
  const cards = $$('.category .feature-card,.category .product-card,.category .accessory');
  const cardById = new Map();
  cards.forEach(card => { const id = card.dataset.productId; if (id && !cardById.has(id)) cardById.set(id, card); });
  const ids = api.productIds.filter(id => cardById.has(id));
  const data = id => api.getProduct(id);
  const image = (item, presentation) => publicCatalog[item.id]?.images?.[presentation] || item.image;
  const track = (name, detail) => api.track?.(name, detail);
  const toast = message => api.toast?.(message);

  const recentKey = 'doctorEcupepRecentlyViewedV1';
  const readRecent = () => {
    try {
      const value = JSON.parse(localStorage.getItem(recentKey) || '[]');
      return Array.isArray(value) ? value.filter(x => x?.id && cardById.has(x.id)).slice(0, 6) : [];
    } catch { return []; }
  };
  const writeRecent = value => { try { localStorage.setItem(recentKey, JSON.stringify(value)); } catch {} };
  function renderRecent() {
    const section = $('#vistos-recientemente');
    const grid = $('#recentGrid');
    if (!section || !grid) return;
    const items = readRecent();
    section.hidden = !items.length;
    grid.replaceChildren();
    items.forEach(entry => {
      const item = data(entry.id);
      if (!item) return;
      const presentation = item.presentations.includes(entry.presentation) ? entry.presentation : item.presentations[0];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'recent-card';
      const img = document.createElement('img');
      img.src = image(item, presentation);
      img.alt = '';
      img.width = 120; img.height = 120; img.loading = 'lazy';
      const copy = document.createElement('span');
      const strong = document.createElement('strong');
      strong.textContent = item.name;
      const small = document.createElement('small');
      small.textContent = presentation + ' · ' + item.categoryLabel;
      copy.append(strong, small);
      button.append(img, copy);
      button.setAttribute('aria-label', 'Abrir ficha de ' + item.name + ', ' + presentation);
      button.addEventListener('click', () => {
        api.openProduct(item.id, presentation, button);
        track('recent_product_open');
      });
      grid.append(button);
    });
  }
  function rememberProduct(id, presentation) {
    if (!id || !cardById.has(id)) return;
    const next = readRecent().filter(item => item.id !== id);
    next.unshift({ id, presentation });
    writeRecent(next.slice(0, 6));
    renderRecent();
  }
  window.addEventListener('doctorecupep:product-view', event => {
    const detail = event.detail || {};
    rememberProduct(detail.id, detail.presentation);
  });
  $('#clearRecent')?.addEventListener('click', () => {
    try { localStorage.removeItem(recentKey); } catch {}
    renderRecent();
    toast('Historial reciente limpiado.');
  });
  renderRecent();
  const activeAtLoad = api.getActiveProduct?.();
  if (activeAtLoad) rememberProduct(activeAtLoad.id, activeAtLoad.presentation);

  const search = $('#catalogSearch');
  const suggestions = $('#catalogSuggestions');
  function hideSuggestions() {
    if (!search || !suggestions) return;
    suggestions.hidden = true;
    suggestions.replaceChildren();
    search.setAttribute('aria-expanded', 'false');
  }
  function renderSuggestions() {
    if (!search || !suggestions) return;
    const query = normalize(search.value);
    if (!query) return hideSuggestions();
    const cq = compact(query);
    const matches = ids.map(id => ({ id, item: data(id), card: cardById.get(id) }))
      .filter(x => (x.card.dataset.searchIndex || '').includes(query) || (cq && (x.card.dataset.searchIndexCompact || '').includes(cq)))
      .sort((a, b) => Number(!normalize(a.item.name).startsWith(query)) - Number(!normalize(b.item.name).startsWith(query)) || a.item.name.localeCompare(b.item.name, 'es'))
      .slice(0, 6);
    suggestions.replaceChildren();
    if (!matches.length) return hideSuggestions();
    matches.forEach(({ item }, index) => {
      const presentation = item.selectedPresentation || item.presentations[0];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'catalog-suggestion';
      button.id = 'catalogSuggestion' + index;
      button.setAttribute('role', 'option');
      const img = document.createElement('img');
      img.src = image(item, presentation); img.alt = ''; img.width = 52; img.height = 52; img.loading = 'lazy';
      const copy = document.createElement('span');
      const strong = document.createElement('strong');
      strong.textContent = item.name;
      const small = document.createElement('small');
      small.textContent = item.presentations.join(' · ');
      copy.append(strong, small); button.append(img, copy);
      button.addEventListener('mousedown', e => e.preventDefault());
      button.addEventListener('click', () => {
        hideSuggestions();
        api.openProduct(item.id, presentation, button);
        track('search_suggestion_open', { result_count: matches.length });
      });
      suggestions.append(button);
    });
    suggestions.hidden = false;
    search.setAttribute('aria-expanded', 'true');
  }
  search?.addEventListener('input', renderSuggestions);
  search?.addEventListener('focus', renderSuggestions);
  search?.addEventListener('blur', () => setTimeout(hideSuggestions, 120));
  search?.addEventListener('keydown', event => {
    if (event.key === 'Escape') return hideSuggestions();
    if (event.key !== 'ArrowDown' || suggestions?.hidden) return;
    const first = $('[role="option"]', suggestions);
    if (first) { event.preventDefault(); first.focus(); }
  });
  suggestions?.addEventListener('keydown', event => {
    const options = $$('[role="option"]', suggestions);
    const current = options.indexOf(document.activeElement);
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && options.length) {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      options[(current + step + options.length) % options.length].focus();
    } else if (event.key === 'Escape') {
      hideSuggestions(); search?.focus();
    }
  });
  document.addEventListener('keydown', event => {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k') return;
    event.preventDefault();
    $('#catalogo-completo')?.scrollIntoView({ behavior: api.reducedMotion ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => search?.focus({ preventScroll: true }), api.reducedMotion ? 0 : 320);
  });

  const compareKey = 'doctorEcupepCompareV1';
  const compareBar = $('#compareBar');
  const compareCount = $('#compareCount');
  const openCompare = $('#openCompare');
  const compareDialog = $('#compareDialog');
  const compareGrid = $('#compareGrid');
  let selected = [];
  try {
    const saved = JSON.parse(sessionStorage.getItem(compareKey) || '[]');
    if (Array.isArray(saved)) selected = saved.filter(id => cardById.has(id)).slice(0, 3);
  } catch {}
  function syncCompare() {
    $$('[data-compare-id]').forEach(button => {
      const on = selected.includes(button.dataset.compareId);
      button.classList.toggle('is-selected', on);
      button.setAttribute('aria-pressed', String(on));
      button.textContent = on ? '✓ Comparando' : 'Comparar';
      const item = data(button.dataset.compareId);
      button.setAttribute('aria-label', on ? 'Comparando ' + item.name + ', quitar del comparador' : 'Comparar ' + item.name);
    });
    if (compareBar) compareBar.hidden = !selected.length;
    if (compareCount) compareCount.textContent = selected.length + (selected.length === 1 ? ' seleccionado' : ' seleccionados');
    if (openCompare) openCompare.disabled = selected.length < 2;
    try { sessionStorage.setItem(compareKey, JSON.stringify(selected)); } catch {}
  }
  ids.forEach(id => {
    const card = cardById.get(id);
    const photo = $('.product-photo', card);
    if (!photo || $('[data-compare-id]', photo)) return;
    const item = data(id);
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'compare-toggle'; button.dataset.compareId = id;
    button.setAttribute('aria-label', 'Comparar ' + item.name);
    button.addEventListener('click', event => {
      event.stopPropagation();
      if (selected.includes(id)) selected = selected.filter(value => value !== id);
      else if (selected.length < 3) selected.push(id);
      else return toast('Puedes comparar hasta 3 productos.');
      syncCompare();
    });
    photo.append(button);
  });
  syncCompare();
  function renderCompare() {
    compareGrid?.replaceChildren();
    selected.forEach(id => {
      const item = data(id);
      if (!item || !compareGrid) return;
      const presentation = item.selectedPresentation || item.presentations[0];
      const record = publicCatalog[id] || {};
      const article = document.createElement('article');
      article.className = 'compare-item';
      const img = document.createElement('img');
      img.src = image(item, presentation); img.alt = item.name + ' · ' + presentation; img.width = 180; img.height = 180;
      const category = document.createElement('span'); category.className = 'compare-category'; category.textContent = item.categoryLabel;
      const title = document.createElement('h3'); title.textContent = item.name;
      const presentations = document.createElement('p'); presentations.textContent = 'Presentaciones: ' + item.presentations.join(' · ');
      const description = document.createElement('p'); description.textContent = item.description;
      const extra = document.createElement('p'); extra.className = 'compare-evidence'; extra.textContent = record.usage || '';
      const open = document.createElement('button'); open.type = 'button'; open.className = 'card-action card-action-secondary'; open.textContent = 'Ver ficha';
      open.addEventListener('click', () => { compareDialog?.close(); setTimeout(() => api.openProduct(id, presentation, open), 20); });
      article.append(img, category, title, presentations, description);
      if (extra.textContent) article.append(extra);
      article.append(open); compareGrid.append(article);
    });
  }
  openCompare?.addEventListener('click', () => {
    if (selected.length < 2 || !compareDialog) return;
    renderCompare(); compareDialog.showModal(); $('#compareClose')?.focus();
    track('compare_open', { item_count: selected.length });
  });
  $('#clearCompare')?.addEventListener('click', () => { selected = []; syncCompare(); });
  $('#compareClose')?.addEventListener('click', () => compareDialog?.close());
  compareDialog?.addEventListener('click', event => { if (event.target === compareDialog) compareDialog.close(); });

  function navigate(step) {
    const active = api.getActiveProduct?.();
    if (!active || !ids.length) return;
    const index = ids.indexOf(active.id);
    const id = ids[(index + step + ids.length) % ids.length];
    const item = data(id);
    api.openProduct(id, item?.presentations?.[0], document.activeElement);
  }
  $('#dialogPrev')?.addEventListener('click', () => navigate(-1));
  $('#dialogNext')?.addEventListener('click', () => navigate(1));

  const originalFilters = $$('[data-category-filter]');
  const strip = document.createElement('div');
  strip.className = 'mobile-filter-strip';
  strip.setAttribute('aria-label', 'Filtros rápidos del catálogo');
  originalFilters.forEach(original => {
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.mobileCategory = original.dataset.categoryFilter;
    button.textContent = original.textContent.replace(/\s+\d+$/, '');
    button.addEventListener('click', () => original.click());
    strip.append(button);
    original.addEventListener('click', () => setTimeout(syncStrip));
  });
  document.body.append(strip);
  function syncStrip() {
    const active = originalFilters.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.categoryFilter || 'all';
    $$('[data-mobile-category]', strip).forEach(button => button.classList.toggle('is-active', button.dataset.mobileCategory === active));
  }
  function updateStrip() {
    if (!matchMedia('(max-width:760px)').matches) return strip.classList.remove('is-visible');
    const start = $('#catalogo-completo');
    const categories = $$('.category').filter(section => !section.hidden);
    const last = categories.at(-1);
    if (!start || !last) return strip.classList.remove('is-visible');
    const y = scrollY + Math.min(220, innerHeight * .3);
    strip.classList.toggle('is-visible', y >= start.offsetTop && y <= last.offsetTop + last.offsetHeight);
  }
  addEventListener('scroll', updateStrip, { passive: true });
  addEventListener('resize', updateStrip, { passive: true });
  syncStrip(); updateStrip();

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    const registerServiceWorker = () => {
      const sw = new URL('service-worker.js', document.baseURI);
      navigator.serviceWorker.register(sw.href, { scope: './' }).catch(() => {});
    };
    if (document.readyState === 'complete') registerServiceWorker();
    else addEventListener('load', registerServiceWorker, { once: true });
  }
})();
