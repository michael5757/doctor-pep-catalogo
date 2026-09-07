import { cp, mkdir, readFile, readdir, rm, writeFile, access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { catalog, slug, featuredProductIds } from '../data/catalog.mjs';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = resolve(projectRoot, "public");
const publicAssetsRoot = resolve(publicRoot, "assets");
let html = await readFile(resolve(projectRoot, "site-template.html"), "utf8");
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const imageExists = async path => { try { await access(resolve(projectRoot, path.replace(/^\/+/, ''))); return true; } catch { return false; } };
// Catalog imagery and editorial copy have one source for SSR and interaction.
const cardPattern = /<(article|div) class="(?:feature-card|product-card|accessory)(?=[\s"])[\s\S]*?<h[34]>([^<]+)<\/h[34]>/g;
const matches = [...html.matchAll(cardPattern)];
for (const match of matches.reverse()) {
  const product = catalog[slug(match[2])];
  if (!product) throw new Error(`Missing product record: ${match[2]}`);
  let block = match[0];
  const badge = block.match(/class="pc-badge"[^>]*>([^<]+)/)?.[1];
  const first = product.name === 'BAC WATER' && badge ? badge.replace(/\s*ml/i, ' ml') : product.presentations[0];
  const fallback = block.match(/<img src="([^"]+)"/)?.[1];
  for (const presentation of product.presentations) {
    if (!await imageExists(product.images[presentation])) product.images[presentation] = '/' + fallback;
    // Relative assets work both beside index.html (file://) and on the web.
    product.images[presentation] = product.images[presentation].replace(/^\/+/, '');
  }
  block = block.replace(/(<(?:article|div) class="[^"]+")/, `$1 data-product-id="${product.id}" data-default-presentation="${escape(first)}"`);
  block = block.replace(/(<img src=")[^"]+/, `$1${product.images[first]}`);
  block = block.replace(/alt="[^"]*"/, `alt="${escape(product.name + ' · ' + first)}"`);
  const tag = { tirzepatide: 'Acción GIP / GLP-1', retatrutide: 'Triple acción en investigación' }[product.id];
  if (tag) block = block.replace(/(<span class="fc-tag">)[^<]+/, `$1${tag}`);
  if (product.evidence === 'Accesorio') block = block.replace(/(<span class="acc-icon">)[^<]+/, `$1${escape(first)}`);
  html = html.slice(0, match.index) + block + html.slice(match.index + match[0].length);
}
// Replace legacy promotional descriptions without changing the hand-authored layout.
html = html.replace(/(<h([34])>([^<]+)<\/h\2>\s*<(?:p(?: class="fc-desc")?|span class="acc-cat")>)([\s\S]*?)(<\/(?:p|span)>)/g,
  (all, prefix, level, name, old, suffix) => catalog[slug(name)] ? prefix + escape(catalog[slug(name)].summary) + suffix : all);
// Publish only the storefront fields, not internal research notes or references.
const publicCatalog = Object.fromEntries(Object.entries(catalog).map(([id, product]) => [id, {
  id, name: product.name, presentations: product.presentations, images: product.images,
  summary: product.summary, what: product.what, usage: product.usage,
  benefits: product.benefits, benefitsTitle: product.benefitsTitle, note: product.note,
}]));
html = html.replace('<!-- CATALOG_DATA -->', `<script id="catalogData" type="application/json">${JSON.stringify({products: publicCatalog, featuredProductIds}).replaceAll('<', '\\u003c')}</script>`);
html = html.replace('<!-- HERO_PRODUCTS -->', '<div class="hero-product-stage">' + ['tirzepatide','serum-ghk-cu','selank-spray-nasal'].map((id,index) => {
  const product = catalog[id]; const presentation = product.presentations[0];
  return `<figure><a href="?producto=${id}&presentacion=${encodeURIComponent(presentation)}" data-product-link="${id}" aria-label="Ver ficha de ${escape(product.name)}"><img src="${product.images[presentation]}" alt="${escape(product.name)} · ${escape(presentation)}" width="640" height="640" ${index ? 'decoding="async"' : 'fetchpriority="high"'}/></a><figcaption><strong>${escape(product.name)}</strong><small>${escape(presentation)} · Ver ficha ↗</small></figcaption></figure>`;
}).join('') + '</div>');
await writeFile(resolve(projectRoot, 'index.html'), html.replaceAll('href="/videos"', 'href="videos.html"').replaceAll('href="/privacidad"', 'href="privacidad.html"'), 'utf8');
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<script src="script-v2\.js"><\/script>\s*<\/body>/i);

if (!bodyMatch) {
  throw new Error("No se pudo extraer el contenido principal de index.html.");
}

const bodyHtml = bodyMatch[1].trim();
await mkdir(resolve(projectRoot, "app"), { recursive: true });
await mkdir(publicRoot, { recursive: true });

await writeFile(
  resolve(projectRoot, "app", "site-body.generated.ts"),
  "export const bodyHtml = " + JSON.stringify(bodyHtml) + ";\n",
  "utf8"
);

await cp(
  resolve(projectRoot, "styles-v3.css"),
  resolve(projectRoot, "public", "styles-v3.css")
);
await cp(
  resolve(projectRoot, "styles-storefront.css"),
  resolve(projectRoot, "public", "styles-storefront.css")
);
await cp(resolve(projectRoot, 'styles-refinement.css'), resolve(publicRoot, 'styles-refinement.css'));
await cp(
  resolve(projectRoot, "script-v2.js"),
  resolve(projectRoot, "public", "script-v2.js")
);
if (dirname(publicAssetsRoot) !== publicRoot) {
  throw new Error("La carpeta pública de recursos no es segura.");
}
await rm(publicAssetsRoot, { recursive: true, force: true });
await mkdir(publicAssetsRoot, { recursive: true });

for (const asset of [
  "doctor-pep-logo.webp",
  "hero-editorial-720.webp",
  "hero-editorial-1280.webp",
  "og-doctor-pep-social.png",
]) {
  await cp(
    resolve(projectRoot, "assets", asset),
    resolve(publicAssetsRoot, asset)
  );
}
const placeholderRoot = resolve(projectRoot, "assets", "placeholders");
await mkdir(resolve(publicAssetsRoot, "placeholders"), { recursive: true });
for (const filename of await readdir(placeholderRoot)) {
  if (!filename.endsWith(".webp")) continue;
  await cp(
    resolve(placeholderRoot, filename),
    resolve(publicAssetsRoot, "placeholders", filename)
  );
}
const productsRoot = resolve(projectRoot, 'assets/products');
await mkdir(productsRoot, { recursive: true });
await cp(productsRoot, resolve(publicAssetsRoot, 'products'), { recursive: true });
await cp(
  resolve(projectRoot, "assets", "og-doctor-pep-social.png"),
  resolve(projectRoot, "public", "og.png")
);
await import('./build-visibility.mjs');
await import('./build-local-videos.mjs');
