import assert from 'node:assert/strict';
import { access, readFile, readdir, stat } from 'node:fs/promises';

const client = new URL('../dist/client/', import.meta.url);
const cssUrl = new URL('_next/static/css/', client);
const cssFiles = (await readdir(cssUrl)).filter(name => name.endsWith('.css'));
const runtimeSize = (await stat(new URL('script-v2.min.js', client))).size;
const cssSizes = await Promise.all(cssFiles.map(name => stat(new URL(name, cssUrl))));
const cssSize = cssSizes.reduce((sum, item) => sum + item.size, 0);

assert.ok(runtimeSize < 35 * 1024, `Interactive runtime regression: ${runtimeSize} bytes`);
assert.ok(cssSize < 75 * 1024, `CSS regression: ${cssSize} bytes`);
await access(new URL('analytics.js', client));
await access(new URL('assets/products/tirzepatide-10-mg.webp', client));
for (const stale of ['script-v2.js', 'styles-v3.css', 'styles-storefront.css', 'styles-refinement.css']) {
  await assert.rejects(access(new URL(stale, client)), error => error?.code === 'ENOENT', `Unexpected duplicate public asset: ${stale}`);
}

const headers = await readFile(new URL('_headers', client), 'utf8');
assert.match(headers, /max-age=31536000, immutable/, 'Hashed assets must keep immutable caching');

console.log(
  `Build output verified: interactive runtime ${(runtimeSize / 1024).toFixed(1)} KB; CSS ${(cssSize / 1024).toFixed(1)} KB; no duplicate unminified runtime/CSS.`
);
