import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { Script, runInNewContext } from 'node:vm';

const root = new URL('../', import.meta.url);
for (const name of ['index.html', 'videos.html', 'privacidad.html']) {
  const url = new URL(name, root);
  const html = await readFile(url, 'utf8');
  for (const [, value] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(?:https?:|data:|#)/.test(value)) continue;
    assert.ok(!value.startsWith('/'), `${name}: server-only URL ${value}`);
    await access(new URL(value.replaceAll('&amp;', '&'), url));
  }
  assert.ok(!html.includes('type="module"'), `${name}: local entry must be a classic script`);
}
const html = await readFile(new URL('index.html', root), 'utf8');
const { products } = JSON.parse(html.match(/<script id="catalogData" type="application\/json">([\s\S]*?)<\/script>/)[1]);
for (const product of Object.values(products)) {
  for (const image of Object.values(product.images)) {
    assert.ok(!image.startsWith('/'), `${product.name}: server-only image path`);
    await access(new URL(image, root));
  }
}
assert.ok(!html.includes('class="nav-link">Redes y videos</a>'), 'La pestaña de redes no debe aparecer en el menú principal');
assert.ok(html.includes('href="privacidad.html"'));
const hosted = await readFile(new URL('app/site-body.generated.ts', root), 'utf8');
assert.ok(!hosted.includes('class=\\"nav-link\\">Redes y videos</a>'), 'La pestaña de redes no debe aparecer en el menú alojado');
assert.ok(hosted.includes('href=\\"/privacidad\\"'), 'Preserve the hosted privacy route');
const script = await readFile(new URL('script-v2.js', root), 'utf8');
new Script(script);
new Script(await readFile(new URL('local/videos.js', root), 'utf8'));

// Unit-test local URL behavior without a browser or a running server.
const helpers = script.slice(script.indexOf('  const isLocalFile'), script.indexOf('  const prefersReducedMotion'));
const productUrl = script.slice(script.indexOf('  function productUrl('), script.indexOf('  function syncProductSelection('));
const file = new URL('index.html', root);
const context = {
  URL, URLSearchParams,
  location: { href: file.href, protocol: 'file:' },
  history: { replaceState(_state, _unused, url) {
    assert.equal(url.pathname, file.pathname);
    assert.equal(url.search, file.search, 'A local History update must only change the hash');
    context.result = url.href;
  } },
};
runInNewContext(helpers + productUrl + `
  const target = productUrl({id:'tirzepatide'}, '15 mg');
  if (pageParams(target).get('presentacion') !== '15 mg') throw new Error('Local route round-trip failed');
  replacePageUrl(target);
`, context);
assert.match(context.result, /#\?producto=tirzepatide&presentacion=15\+mg$/);
context.history.replaceState = () => { throw new Error('Browser blocks local history'); };
runInNewContext(helpers + productUrl + `replacePageUrl(productUrl({id:'nad'}, '500 mg'));`, { ...context });
console.log('Local files verified: relative resources, gallery bundle, product images, and file-safe history.');
