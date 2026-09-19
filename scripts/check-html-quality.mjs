import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const pages = ['index.html', 'videos.html', 'privacidad.html'];

for (const name of pages) {
  const html = await readFile(new URL(name, root), 'utf8');
  assert.match(html, /<html[^>]+lang="es"/i, `${name}: missing Spanish language`);
  assert.ok(!/javascript:/i.test(html), `${name}: javascript URL is not allowed`);
  assert.ok(!/\son\w+\s*=/i.test(html), `${name}: inline event handler is not allowed`);

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  assert.equal(duplicateIds.length, 0, `${name}: duplicate element id: ${duplicateIds.join(', ')}`);

  for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/gi)) {
    assert.match(match[0], /rel="[^"]*noopener[^"]*"/i, `${name}: _blank link without noopener`);
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    assert.match(match[0], /\balt="[^"]*"/i, `${name}: image without alt`);
    assert.match(match[0], /\bwidth="\d+"/i, `${name}: image without width`);
    assert.match(match[0], /\bheight="\d+"/i, `${name}: image without height`);
  }
}
const index = await readFile(new URL('index.html', root), 'utf8');
assert.match(index, /<meta name="referrer" content="strict-origin-when-cross-origin"/i);
assert.match(index, /class="skip-link" href="#main-content"/i);
assert.match(index, /<main id="main-content">/i);

for (const match of index.matchAll(/<button\b[^>]*>/gi)) {
  assert.match(match[0], /\btype="(?:button|submit|reset)"/i, `index.html: button without explicit type: ${match[0]}`);
}

assert.match(index, /fetchpriority="high"/i, 'Primary hero image must be prioritized');
assert.ok((index.match(/fetchpriority="low"/gi) || []).length >= 2, 'Secondary hero images must be low priority');
console.log('HTML quality verified: semantics, accessibility, safe links, image dimensions, and hero priorities.');
