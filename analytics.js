(function () {
  'use strict';
  if (window.doctorPepMetrics) return;
  const script = document.currentScript;
  const config = JSON.parse(script?.dataset.config || '{}');
  const id = config.measurementId || '';
  const key = 'doctorPepAnalyticsChoiceV1';
  const allowedHost = (config.origins || []).includes(location.origin);
  const configured = /^G-[A-Z0-9]+$/.test(id) && config.enhancedMeasurementDisabled === true;
  const available = configured && location.protocol === 'https:' && allowedHost;
  const optedOut = navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  let choice = '';
  try { choice = localStorage.getItem(key) || ''; } catch {}
  let started = false;
  let sentView = false;
  const path = location.pathname.replace(/\/$/, '');
  const group = /\/videos(?:\.html)?$/.test(path) ? 'videos' : /\/privacidad(?:\.html)?$/.test(path) ? 'privacy' : 'catalog';
  // Never include product URLs, searches, selected items or the WhatsApp message.
  const page = { page_group: group, page_title: 'Doctor Pep | ' + group, page_location: location.origin + location.pathname, page_referrer: '' };

  function emit(name) {
    if (!available || optedOut || choice !== 'accepted' || !started) return;
    window.gtag('event', name, { ...page, send_to: id, transport_type: 'beacon' });
  }
  function start() {
    if (!available || optedOut || choice !== 'accepted') return;
    window['ga-disable-' + id] = false;
    if (!started) {
      started = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      window.gtag('js', new Date());
      window.gtag('config', id, { ...page, send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, cookie_flags: 'SameSite=Lax;Secure' });
      const remote = document.createElement('script');
      remote.async = true;
      remote.referrerPolicy = 'origin';
      remote.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
      document.head.append(remote);
    } else {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
    }
    if (!sentView) { sentView = true; emit('page_view'); }
  }
  function choose(value) {
    choice = value;
    try { localStorage.setItem(key, value); } catch {}
    document.getElementById('analyticsNotice')?.remove();
    if (value === 'accepted') start();
    else {
      window['ga-disable-' + id] = true;
      if (started) window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
    updateStatus();
  }
  function updateStatus() {
    const status = document.querySelector('[data-analytics-status]');
    if (status) status.textContent = !available ? 'Las estadísticas de visitas están desactivadas en esta versión.' : optedOut ? 'La preferencia de privacidad de tu navegador mantiene las estadísticas desactivadas.' : choice === 'accepted' ? 'Has permitido las estadísticas de visitas y clics.' : 'Las estadísticas están desactivadas hasta que las permitas.';
    document.querySelectorAll('[data-analytics-settings]').forEach(button => { button.hidden = !available || optedOut; });
  }
  function showSettings() {
    if (!available || optedOut || document.getElementById('analyticsNotice')) return;
    const box = document.createElement('section');
    box.id = 'analyticsNotice'; box.className = 'analytics-notice';
    box.setAttribute('aria-label', 'Preferencias de estadísticas');
    const copy = document.createElement('p');
    copy.textContent = '¿Permites estadísticas de visitas y clics con Google Analytics? Puedes cambiar tu elección en Privacidad.';
    const accept = document.createElement('button'); accept.type = 'button'; accept.textContent = 'Permitir';
    const reject = document.createElement('button'); reject.type = 'button'; reject.textContent = 'No permitir';
    accept.addEventListener('click', () => choose('accepted'));
    reject.addEventListener('click', () => choose('declined'));
    box.append(copy, accept, reject); document.body.append(box);
  }
  window.doctorPepMetrics = { showSettings };
  document.addEventListener('click', event => {
    if (event.target.closest?.('[data-analytics-settings]')) { showSettings(); return; }
    const link = event.target.closest?.('a[href]');
    if (link) {
      try {
        const target = new URL(link.href, location.href);
        if (target.protocol === 'https:' && target.hostname === 'wa.me' && target.pathname === '/593989009150') emit('whatsapp_click');
        else if (['www.instagram.com', 'www.tiktok.com'].includes(target.hostname)) emit('social_click');
      } catch {}
    }
    if (event.target.closest?.('[data-video-open]')) emit('video_open');
  }, true);
  updateStatus(); start();
  if (!choice) showSettings();
})();
