import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { catalog } from '../data/catalog.mjs';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const { products } = JSON.parse(html.match(/<script id="catalogData" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const hashes = new Map();
let count = 0;
const pending = new Set([
  'alcohol-pre-pad-formato-por-confirmar.webp',
  'pen-peptide-modelo-por-confirmar.webp',
  'cartucho-capacidad-por-confirmar.webp',
  'aguja-pen-medidas-por-confirmar.webp',
  'derma-roller-medidas-por-confirmar.webp',
]);
for (const product of Object.values(catalog)) {
  for (const [presentation, image] of Object.entries(product.images)) {
    const relative = image.replace(/^\/+/, '');
    if (pending.has(relative.split('/').pop())) continue;
    const bytes = await readFile(new URL(relative, root));
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    assert.ok(bytes.length > 4000, `${relative}: implausibly small product image`);
    const hash = createHash('sha256').update(bytes).digest('hex');
    assert.ok(!hashes.has(hash), `${relative}: duplicated image ${hashes.get(hash)}`);
    hashes.set(hash, relative);
    assert.equal(products[product.id].images[presentation], relative, `${product.id}: still using a fallback`);
    const publicBytes = await readFile(new URL('public/' + relative, root));
    assert.ok(bytes.equals(publicBytes), `${relative}: public copy is stale`);
    count++;
  }
}
// Five accessory generators were rate-limited; those cards intentionally retain
// the existing labeled accessory placeholders until their custom assets arrive.
assert.equal(count, 36);
for (const [filename, expected] of Object.entries({
  'tirzepatide-10-mg.webp': 'ec68ae79d46495b1f868d6442643c70b051909daf4fb4aff62f7d766e54a7c46',
  'nad-500-mg.webp': '1be4296f07c6e1f77dfb3e94855b601dc02470bc35f18a2e7a2cd225366d9336',
})) {
  const bytes = await readFile(new URL('assets/products/' + filename, root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), expected, 'Preserve existing ' + filename);
}
const cards = [...html.matchAll(/<(?:article|div) class="(?:feature-card|product-card|accessory)(?=[\s"])[\s\S]*?<h[34]>([^<]+)<\/h[34]>/g)];
assert.equal(cards.length, 36);
const pendingIds = new Set(['alcohol-pre-pad', 'pen-peptide', 'cartucho', 'aguja-pen', 'derma-roller']);
for (const [block, name] of cards) {
  const image = block.match(/<img src="([^"]+)"/)?.[1];
  const id = block.match(/data-product-id="([^"]+)"/)?.[1];
  const presentation = block.match(/data-default-presentation="([^"]+)"/)?.[1];
  if (pendingIds.has(id)) continue;
  assert.ok(image?.startsWith('assets/products/'), `${name}: generic card illustration`);
  assert.equal(image, products[id]?.images[presentation], `${name}: incorrect default presentation image`);
  await access(new URL(image, root));
}
for (const [, id, image] of html.matchAll(/data-product-link="([^"]+)"[^>]*><img src="([^"]+)"/g)) {
  const product = products[id];
  assert.equal(image, product.images[product.presentations[0]], `${id}: stale hero image`);
}
console.log('Verified 36 distinct product/presentation images; 5 accessory placeholders remain documented.');
