import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { baseUrl, pageInfo, pageUrl, analyticsSettings } from '../data/site-config.mjs';
import { replaceStaticMetadata } from '../data/seo.mjs';
import { catalog } from '../data/catalog.mjs';
import publications from '../data/publications.json' with { type: 'json' };
import { validVideo } from '../data/social-content.mjs';

const root = new URL('../', import.meta.url);
const seen = new Set();
for (const video of publications) {
  if (!validVideo(video) || seen.has(video.id)) throw new Error('Publicación inválida o duplicada: ' + video.id);
  seen.add(video.id);
  for (const id of video.relatedProductIds || []) if (!catalog[id]) throw new Error('Producto del video no encontrado: ' + id);
  if (video.thumbnail) await readFile(new URL(video.thumbnail.slice(1), root));
}
const socialProducts = Object.fromEntries(Object.values(catalog).map(p => [p.id, { id: p.id, name: p.name, presentation: p.presentations[0], image: p.images[p.presentations[0]] }]));
await writeFile(new URL('data/social-products.generated.json', root), JSON.stringify(socialProducts, null, 2) + '\n');

const escaped = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
export const analyticsConfig = analyticsSettings();
export const analyticsTag = `<script src="analytics.js" defer data-config="${escaped(JSON.stringify(analyticsConfig))}"></script>`;

for (const [filename, key] of [['index.html', 'home'], ['videos.html', 'videos'], ['privacidad.html', 'privacy']]) {
  let html = await readFile(new URL(filename, root), 'utf8');
  html = replaceStaticMetadata(html, key).replace(/\s*<script src="analytics.js"[^>]*><\/script>/g, '').replace('</head>', analyticsTag + '\n</head>');
  await writeFile(new URL(filename, root), html);
}
await mkdir(new URL('public/', root), { recursive: true });
await cp(new URL('analytics.js', root), new URL('public/analytics.js', root));
for (const hosted of [false, true]) {
  const prefix = hosted ? 'public/' : '';
  const base = baseUrl(hosted);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(pageInfo).map(key => `  <url><loc>${escaped(pageUrl(key, hosted))}</loc></url>`).join('\n')}\n</urlset>\n`;
  await writeFile(new URL(prefix + 'sitemap.xml', root), sitemap);
  await writeFile(new URL(prefix + 'robots.txt', root), `User-agent: *\nAllow: /\n\nSitemap: ${base}sitemap.xml\n`);
}
