import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { catalog } from '../data/catalog.mjs';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const { products } = JSON.parse(html.match(/<script id="catalogData" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const hashes = new Map();
let count = 0;
for (const product of Object.values(catalog)) {
  for (const [presentation, image] of Object.entries(product.images)) {
    const relative = image.replace(/^\/+/, '');
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
assert.equal(count, 41);
const cards = [...html.matchAll(/<(?:article|div) class="(?:feature-card|product-card|accessory)(?=[\s"])[\s\S]*?<h[34]>([^<]+)<\/h[34]>/g)];
assert.equal(cards.length, 36);
for (const [block, name] of cards) {
  const image = block.match(/<img src="([^"]+)"/)?.[1];
  assert.ok(image?.startsWith('assets/products/'), `${name}: generic card illustration`);
  await access(new URL(image, root));
}
console.log('Verified 41 distinct product/presentation images across all 36 cards and 34 fiches.');
