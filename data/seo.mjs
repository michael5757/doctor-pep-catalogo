import { siteConfig, pageInfo, pageUrl, socialImage, structuredData } from './site-config.mjs';
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
export const safeJson = value => JSON.stringify(value).replaceAll('<', '\u003c');

export function metadataFor(key, hosted = true) {
  const { title, description } = pageInfo[key];
  const url = pageUrl(key, hosted);
  const image = socialImage(hosted);
  return { title, description, alternates: { canonical: url },
    openGraph: { type: 'website', locale: 'es_EC', siteName: siteConfig.name, title, description, url,
      images: [{ url: image, width: 1200, height: 630, alt: 'Doctor Pep — Conoce, compara y consulta' }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export function staticMetadata(key) {
  const { title, description } = pageInfo[key];
  return `<title>${escape(title)}</title>
  <meta name="description" content="${escape(description)}" />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <link rel="canonical" href="${escape(pageUrl(key))}" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="es_EC" />
  <meta property="og:site_name" content="Doctor Pep" />
  <meta property="og:title" content="${escape(title)}" />
  <meta property="og:description" content="${escape(description)}" />
  <meta property="og:url" content="${escape(pageUrl(key))}" />
  <meta property="og:image" content="${escape(socialImage())}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Doctor Pep — Conoce, compara y consulta" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escape(title)}" />
  <meta name="twitter:description" content="${escape(description)}" />
  <meta name="twitter:image" content="${escape(socialImage())}" />
${siteConfig.googleVerification ? `  <meta name="google-site-verification" content="${escape(siteConfig.googleVerification)}" />\n` : ''}  <script id="siteStructuredData" type="application/ld+json">${safeJson(structuredData())}</script>`;
}

export function replaceStaticMetadata(html, key) {
  return html.replace(/<title>[\s\S]*?<\/title>\s*/g, '')
    .replace(/<meta\s+(?:name|property)="(?:description|robots|og:[^"]+|twitter:[^"]+|google-site-verification)"[^>]*>\s*/g, '')
    .replace(/<link rel="canonical"[^>]*>\s*/g, '')
    .replace(/<script id="siteStructuredData"[^>]*>[\s\S]*?<\/script>\s*/g, '')
    .replace('</head>', staticMetadata(key) + '\n</head>');
}
