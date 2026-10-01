(() => {
  'use strict';
  if (window.DoctorEcupepProductionPolish) return;
  const api = window.DoctorEcupepCatalog;
  if (!api) return;
  window.DoctorEcupepProductionPolish = true;

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const cards = $$('.category .feature-card,.category .product-card,.category .accessory');
  const favKey = 'doctorEcupepFavoritesV1';
  const searchKey = 'doctorEcupepRecentSearchesV1';

  const readJson = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '');
      return value ?? fallback;
    } catch { return fallback; }
  };
  const writeJson = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  };


  /* ---------- Mobile blur state guard ---------- */
  function clearStaleMobileOverlay() {
    const menu = document.querySelector('#navLinks');
    const toggle = document.querySelector('#menuToggle');
    const actuallyOpen = Boolean(menu?.classList.contains('open') && toggle?.getAttribute('aria-expanded') === 'true');

    if (!actuallyOpen) {
      document.body.classList.remove('menu-open');
      menu?.classList.remove('open');
      toggle?.classList.remove('open');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
      }
    }

    document.documentElement.classList.add('no-global-blur');
  }

  clearStaleMobileOverlay();
  document.addEventListener('DOMContentLoaded', clearStaleMobileOverlay, { once: true });
  window.addEventListener('pageshow', clearStaleMobileOverlay);
  window.addEventListener('focus', clearStaleMobileOverlay);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) clearStaleMobileOverlay();
  });

  /* ---------- Favorites ---------- */
  let favorites = new Set(
    (Array.isArray(readJson(favKey, [])) ? readJson(favKey, []) : [])
      .filter(id => api.productIds.includes(id))
  );
  let favoritesOnly = false;

  const filterRow = $('.catalog-filter-row');
  const favoriteFilter = document.createElement('button');
  favoriteFilter.type = 'button';
  favoriteFilter.className = 'filter-chip favorite-filter';
  favoriteFilter.setAttribute('aria-pressed', 'false');

  function saveFavorites() {
    writeJson(favKey, [...favorites]);
  }

  function syncFavoriteFilter() {
    favoriteFilter.innerHTML = '<span aria-hidden="true">♡</span> Favoritos <small>' + favorites.size + '</small>';
    favoriteFilter.classList.toggle('is-active', favoritesOnly);
    favoriteFilter.setAttribute('aria-pressed', String(favoritesOnly));
    favoriteFilter.disabled = favoritesOnly ? false : favorites.size === 0;
  }

  function syncFavoriteButtons() {
    $$('[data-favorite-id]').forEach(button => {
      const on = favorites.has(button.dataset.favoriteId);
      button.classList.toggle('is-active', on);
      button.setAttribute('aria-pressed', String(on));
      button.textContent = on ? '♥' : '♡';
      const item = api.getProduct(button.dataset.favoriteId);
      button.setAttribute('aria-label',
        (on ? 'Quitar ' : 'Guardar ') + (item?.name || 'producto') + (on ? ' de favoritos' : ' en favoritos')
      );
    });
    syncFavoriteFilter();
  }

  function visibleFavoriteCount() {
    return cards.filter(card => !card.hidden && favorites.has(card.dataset.productId)).length;
  }

  function applyFavoriteView() {
    if (!favoritesOnly) return;
    cards.forEach(card => {
      if (!favorites.has(card.dataset.productId)) card.hidden = true;
    });
    $$('.category').forEach(section => {
      const visible = $$('.feature-card,.product-card,.accessory', section).some(card => !card.hidden);
      section.hidden = !visible;
    });
    const result = $('#catalogResultCount');
    if (result) {
      const count = visibleFavoriteCount();
      result.textContent = count
        ? count + (count === 1 ? ' favorito visible' : ' favoritos visibles')
        : 'No hay favoritos que coincidan con estos filtros.';
    }
  }

  function restoreBaseFiltering() {
    const active = $('[data-category-filter][aria-pressed="true"]') || $('[data-category-filter="all"]');
    active?.click();
  }

  cards.forEach(card => {
    const photo = $('.product-photo', card);
    if (!photo || $('[data-favorite-id]', photo)) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'favorite-toggle';
    button.dataset.favoriteId = card.dataset.productId;
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const id = button.dataset.favoriteId;
      const item = api.getProduct(id);
      if (favorites.has(id)) {
        favorites.delete(id);
        api.track?.('favorite_remove', { item_count: favorites.size });
        api.toast?.((item?.name || 'Producto') + ' se quitó de favoritos.');
      } else {
        favorites.add(id);
        api.track?.('favorite_add', { item_count: favorites.size });
        api.toast?.((item?.name || 'Producto') + ' se guardó en favoritos.');
      }
      saveFavorites();
      syncFavoriteButtons();
      if (favoritesOnly) {
        restoreBaseFiltering();
        setTimeout(applyFavoriteView, 0);
      }
    });
    photo.append(button);
  });

  if (filterRow) {
    filterRow.append(favoriteFilter);
    favoriteFilter.addEventListener('click', () => {
      favoritesOnly = !favoritesOnly;
      if (favoritesOnly) {
        applyFavoriteView();
        api.track?.('favorite_filter', { item_count: favorites.size });
      } else {
        restoreBaseFiltering();
      }
      syncFavoriteFilter();
    });

    filterRow.addEventListener('click', event => {
      const base = event.target.closest('[data-category-filter]');
      if (!base || !favoritesOnly) return;
      setTimeout(applyFavoriteView, 0);
    });
  }

  const reapplyEvents = [$('#catalogSearch'), $('#catalogPresentation'), $('#catalogSort')].filter(Boolean);
  reapplyEvents.forEach(control => {
    control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', () => {
      if (favoritesOnly) setTimeout(applyFavoriteView, 0);
    });
  });

  syncFavoriteButtons();

  /* ---------- Recent searches ---------- */
  const searchWrap = $('.catalog-search-wrap');
  let recentSearches = (Array.isArray(readJson(searchKey, [])) ? readJson(searchKey, []) : [])
    .map(v => String(v || '').trim())
    .filter(Boolean)
    .slice(0, 5);

  const recentBox = document.createElement('div');
  recentBox.className = 'recent-searches';
  recentBox.hidden = true;

  function saveSearch(term) {
    const value = String(term || '').trim();
    if (value.length < 2) return;
    recentSearches = [value, ...recentSearches.filter(item => item.toLowerCase() !== value.toLowerCase())].slice(0, 5);
    writeJson(searchKey, recentSearches);
    renderRecentSearches();
  }

  function useSearch(term) {
    const input = $('#catalogSearch');
    if (!input) return;
    input.value = term;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    $('#catalogo-completo')?.scrollIntoView({ behavior: api.reducedMotion ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => input.focus({ preventScroll: true }), api.reducedMotion ? 0 : 250);
    api.track?.('recent_search_use', { query_length: term.length });
  }

  function renderRecentSearches() {
    recentBox.replaceChildren();
    recentBox.hidden = recentSearches.length === 0;
    if (!recentSearches.length) return;

    const label = document.createElement('span');
    label.textContent = 'Búsquedas recientes';
    recentBox.append(label);

    recentSearches.forEach(term => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = term;
      button.addEventListener('click', () => useSearch(term));
      recentBox.append(button);
    });

    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'recent-search-clear';
    clear.textContent = 'Limpiar';
    clear.addEventListener('click', () => {
      recentSearches = [];
      writeJson(searchKey, recentSearches);
      renderRecentSearches();
      api.track?.('recent_search_clear');
    });
    recentBox.append(clear);
  }

  if (searchWrap) {
    searchWrap.append(recentBox);
    renderRecentSearches();
  }

  $('#catalogSearch')?.addEventListener('keydown', event => {
    if (event.key === 'Enter') saveSearch(event.currentTarget.value);
  });
  $('#heroSearchForm')?.addEventListener('submit', () => saveSearch($('#heroCatalogSearch')?.value));
  $$('[data-quick-search]').forEach(button => {
    button.addEventListener('click', () => saveSearch(button.dataset.quickSearch || button.textContent));
  });

  /* ---------- Improve drawer wording after each render ---------- */
  function polishDrawerRows() {
    $$('.consultation-item').forEach(row => {
      const edit = $('.consultation-edit', row);
      if (edit) {
        edit.textContent = 'Cambiar presentación';
        edit.title = 'Abrir selector de presentación';
      }
    });
  }
  const list = $('#consultationList');
  if (list && 'MutationObserver' in window) {
    new MutationObserver(polishDrawerRows).observe(list, { childList: true, subtree: true });
  }
  polishDrawerRows();

  /* ---------- iPhone install guide ---------- */
  const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  if (isiOS && !standalone) {
    const footerColumn = $('.footer-column');
    if (footerColumn) {
      const install = document.createElement('button');
      install.type = 'button';
      install.className = 'ios-install-button';
      install.innerHTML = '<span aria-hidden="true">＋</span> Instalar en iPhone';
      footerColumn.append(install);

      const dialog = document.createElement('dialog');
      dialog.className = 'ios-install-dialog';
      dialog.innerHTML =
        '<div class="ios-install-shell">' +
          '<button type="button" class="dialog-close ios-install-close" aria-label="Cerrar">×</button>' +
          '<span class="ios-install-icon" aria-hidden="true">↥</span>' +
          '<h2>Instalar Doctor Ecupep</h2>' +
          '<p>Puedes guardar el catálogo como una app en tu pantalla de inicio.</p>' +
          '<ol>' +
            '<li><strong>1</strong><span>Abre el menú <b>Compartir</b> del navegador.</span></li>' +
            '<li><strong>2</strong><span>Elige <b>Añadir a pantalla de inicio</b>.</span></li>' +
            '<li><strong>3</strong><span>Toca <b>Añadir</b>.</span></li>' +
          '</ol>' +
          '<small>Después podrás abrirlo desde el icono de Doctor Ecupep.</small>' +
        '</div>';
      document.body.append(dialog);

      install.addEventListener('click', () => {
        dialog.showModal();
        $('.ios-install-close', dialog)?.focus();
        api.track?.('ios_install_guide_open');
      });
      $('.ios-install-close', dialog)?.addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    }
  }

  /* ---------- Compare guidance on narrow screens ---------- */
  const compareDialog = $('#compareDialog');
  if (compareDialog) {
    const shell = $('.compare-shell', compareDialog);
    if (shell && !$('.compare-mobile-hint', shell)) {
      const hint = document.createElement('p');
      hint.className = 'compare-mobile-hint';
      hint.textContent = 'Desliza horizontalmente para comparar todos los productos.';
      const grid = $('#compareGrid', shell);
      grid?.insertAdjacentElement('beforebegin', hint);
    }
  }

  /* ---------- Better error states for images ---------- */
  $$('img').forEach(image => {
    image.addEventListener('error', () => {
      const shell = image.closest('.product-photo,.dialog-product-photo,.recent-card,.consultation-product');
      if (!shell || shell.querySelector('.image-error-note')) return;
      image.hidden = true;
      const note = document.createElement('span');
      note.className = 'image-error-note';
      note.textContent = 'Imagen no disponible';
      shell.append(note);
    });
  });
})();