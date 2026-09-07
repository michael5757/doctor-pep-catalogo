// Public configuration only. Never put passwords, API secrets or tokens here.
export const siteConfig = {
  name: 'Doctor Pep',
  staticUrl: 'https://michael5757.github.io/doctor-pep-catalogo/',
  hostedUrl: 'https://doctor-pep-catalogo.gremori57.chatgpt.site/',
  googleVerification: '',
  analytics: { measurementId: '', enhancedMeasurementDisabled: false },
};

export const pageInfo = {
  home: { title: 'Doctor Pep | Péptidos, sérums y accesorios en Ecuador', description: 'Conoce los productos de Doctor Pep, compara presentaciones y prepara tu consulta por WhatsApp. Atención personalizada en Ecuador.', staticPath: '', hostedPath: '' },
  videos: { title: 'Redes y videos de Doctor Pep | TikTok e Instagram', description: 'Videos de Doctor Pep y acceso a sus cuentas oficiales de TikTok e Instagram.', staticPath: 'videos.html', hostedPath: 'videos' },
  privacy: { title: 'Privacidad y uso responsable | Doctor Pep', description: 'Cómo se guarda tu lista, preferencias de estadísticas y uso responsable del catálogo Doctor Pep.', staticPath: 'privacidad.html', hostedPath: 'privacidad' },
};

export function baseUrl(hosted = false) {
  const value = hosted ? siteConfig.hostedUrl : siteConfig.staticUrl;
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('Usa una URL pública HTTPS sin credenciales ni parámetros.');
  return url.href.replace(/\/?$/, '/');
}

export function pageUrl(key, hosted = false) {
  return new URL(pageInfo[key][hosted ? 'hostedPath' : 'staticPath'], baseUrl(hosted)).href;
}

export function socialImage(hosted = false) {
  return new URL('assets/og-doctor-pep-social.png', baseUrl(hosted)).href;
}

export function analyticsSettings() {
  return { ...siteConfig.analytics, origins: [new URL(baseUrl()).origin, new URL(baseUrl(true)).origin] };
}

export function structuredData(hosted = false) {
  const url = baseUrl(hosted);
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', '@id': url + '#organization', name: siteConfig.name, url,
      logo: new URL('assets/doctor-pep-logo.webp', url).href,
      sameAs: ['https://www.tiktok.com/@doctor.pep.26', 'https://www.instagram.com/doctor.pep.26/'],
      contactPoint: { '@type': 'ContactPoint', telephone: '+593989009150', contactType: 'customer service', availableLanguage: 'Spanish' } },
    { '@type': 'WebSite', '@id': url + '#website', name: siteConfig.name, url, inLanguage: 'es-EC', publisher: { '@id': url + '#organization' } },
  ] };
}
