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
    assert.equal(bytes.toString('hex', 0, 8), '89504e470d0a1a0a', `${relative}: expected PNG`);
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
// The catalog contains 34 product records plus the two category groups that
// render 36 storefront cards; each card still points to a distinct catalog image.
assert.equal(cards.length, 36);
for (const [block, name] of cards) {
  const image = block.match(/<img src="([^"]+)"/)?.[1];
  const id = block.match(/data-product-id="([^"]+)"/)?.[1];
  const presentation = block.match(/data-default-presentation="([^"]+)"/)?.[1];
  assert.ok(image?.startsWith('assets/products/'), `${name}: generic card illustration`);
  assert.equal(image, products[id]?.images[presentation], `${name}: incorrect default presentation image`);
  await access(new URL(image, root));
}
const optimizedHeroIds = new Set(['tirzepatide', 'serum-ghk-cu', 'selank-spray-nasal']);
for (const [, id, image] of html.matchAll(/data-product-link="([^"]+)"[^>]*><img src="([^"]+)"/g)) {
  const product = products[id];
  const source = product.images[product.presentations[0]];
  const expected = optimizedHeroIds.has(id)
    ? source.replace('assets/products/', 'assets/products/hero-')
    : source;
  assert.equal(image, expected, `${id}: stale hero image`);
  const bytes = await readFile(new URL(image, root));
  assert.equal(bytes.toString('hex', 0, 8), '89504e470d0a1a0a', `${image}: expected PNG`);
  assert.ok(bytes.length > 2500, `${image}: implausibly small hero image`);
}
console.log('Verified 41 distinct product/presentation images; no catalog card uses an accessory placeholder.');
