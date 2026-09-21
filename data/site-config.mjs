// Public configuration only. Never put passwords, API secrets or tokens here.
import { catalog } from './catalog.mjs';

export const siteConfig = {
  name: 'Doctor Ecupep',
  staticUrl: 'https://michael5757.github.io/doctor-pep-catalogo/',
  hostedUrl: 'https://michael5757.github.io/doctor-pep-catalogo/',
  googleVerification: '',
  analytics: { measurementId: '', enhancedMeasurementDisabled: false },
};

export const pageInfo = {
  home: { title: 'Doctor Ecupep | Péptidos, sérums y accesorios en Ecuador', description: 'Conoce los productos de Doctor Ecupep, compara presentaciones y prepara tu consulta por WhatsApp. Atención personalizada en Ecuador.', staticPath: '', hostedPath: '' },
  videos: { title: 'Redes y videos de Doctor Ecupep | TikTok e Instagram', description: 'Videos de Doctor Ecupep y acceso a sus cuentas oficiales de TikTok e Instagram.', staticPath: 'videos.html', hostedPath: 'videos' },
  privacy: { title: 'Privacidad y uso responsable | Doctor Ecupep', description: 'Cómo se guarda tu lista, preferencias de estadísticas y uso responsable del catálogo Doctor Ecupep.', staticPath: 'privacidad.html', hostedPath: 'privacidad' },
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
  return new URL('assets/og-doctor-ecupep-social.png', baseUrl(hosted)).href;
}

export function analyticsSettings() {
  return { ...siteConfig.analytics, origins: [...new Set([new URL(baseUrl()).origin, new URL(baseUrl(true)).origin])] };
}

export function structuredData(hosted = false) {
  const url = baseUrl(hosted);
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', '@id': url + '#organization', name: siteConfig.name, url,
      logo: new URL('assets/doctor-ecupep-logo-oficial-v2.png', url).href,
      sameAs: ['https://www.tiktok.com/@doctor.pep.26', 'https://www.instagram.com/doctor.pep.26/'],
      contactPoint: { '@type': 'ContactPoint', telephone: '+593989009150', contactType: 'customer service', availableLanguage: 'Spanish' } },
    { '@type': 'WebSite', '@id': url + '#website', name: siteConfig.name, url, inLanguage: 'es-EC', publisher: { '@id': url + '#organization' } },
    { '@type': 'ItemList', '@id': url + '#catalog', name: 'Catálogo Doctor Ecupep',
      numberOfItems: Object.keys(catalog).length,
      itemListElement: Object.values(catalog).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: product.name,
        url: new URL('?producto=' + encodeURIComponent(product.id) + '&presentacion=' + encodeURIComponent(product.presentations[0]), url).href,
      })) },
  ] };
}
