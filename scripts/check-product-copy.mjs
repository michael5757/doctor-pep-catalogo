import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { catalog } from '../data/catalog.mjs';
import { productCopy } from '../data/product-copy.mjs';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const match = html.match(/<script id="catalogData" type="application\/json">([\s\S]*?)<\/script>/);
assert.ok(match, 'Public catalog payload is present');
const { products } = JSON.parse(match[1]);
assert.equal(Object.keys(products).length, 34);
assert.deepEqual(Object.keys(productCopy).sort(), Object.keys(catalog).sort());

for (const [id, product] of Object.entries(products)) {
  for (const field of ['summary', 'what', 'usage', 'benefitsTitle']) {
    assert.ok(product[field]?.trim(), `${id}: missing ${field}`);
  }
  assert.ok(Array.isArray(product.benefits), `${id}: benefits must be a list`);
  assert.deepEqual(product.benefits, productCopy[id].benefits);
  for (const internal of ['sources', 'reviewed', 'detail', 'caution', 'storage', 'evidence']) {
    assert.ok(!(internal in product), `${id}: internal ${internal} leaked into public catalog`);
  }
  assert.deepEqual(product.presentations, catalog[id].presentations);
  assert.ok(html.includes(product.summary), `${id}: missing updated card summary`);
}

assert.ok(!html.includes('Un ensayo piloto en 22 pacientes'));
assert.ok(/Acción GIP \/ GLP-1<\/span>\s*<\/div>\s*<h3>TIRZEPATIDE/.test(html));
assert.ok(/Triple acción en investigación<\/span>\s*<\/div>\s*<h3>RETATRUTIDE/.test(html));
assert.equal(products.klow.benefits.length, 0, 'Do not invent benefits for an unknown formula');
assert.equal(products.glow.benefits.length, 0);
assert.match(products['ara-290'].benefitsTitle, /potenciales/);
for (const product of Object.values(products)) {
  assert.ok(!/investiga|en estudio|precl[ií]nic/i.test(product.summary), `${product.id}: academic card summary`);
}
for (const id of ['retatrutide','mots-c','bpc-157','tb-500','cjc-1295-no-dac-ipamorelin','ipamorelin','kiss-peptin','ara-290','ghk-cu','epitalon','dsip','kpv','semax','selank','selank-spray-nasal','semax-spray','5-amino-1mq']) {
  assert.match(products[id].usage, /experimental/, `${id}: retain the experimental context inside the fiche`);
}
assert.match(products.nad.benefitsTitle, /Funciones naturales/);
assert.match(products.glutathione.benefitsTitle, /Funciones naturales/);
const script = await readFile(new URL('../script-v2.js', import.meta.url), 'utf8');
assert.ok(!script.includes('Fuentes de consulta'));
assert.ok(!script.includes('Beneficios y límites de la evidencia'));
assert.ok(script.includes("addSection('Qué es'"));
assert.ok(script.includes("addSection('Para qué sirve'"));
assert.equal(script, await readFile(new URL('../public/script-v2.js', import.meta.url), 'utf8'));
console.log('34 fiches verified: consumer copy, presentations, and public data separation.');
