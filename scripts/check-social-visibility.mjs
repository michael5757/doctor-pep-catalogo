import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { validVideo, selectVideos, catalogLink } from '../data/social-content.mjs';
import { baseUrl, pageUrl, structuredData } from '../data/site-config.mjs';

const root = new URL('../', import.meta.url);
// Synthetic fixtures only: never published to the real gallery.
const fixture = { id: 'test', ownerVerified: true, platform: 'tiktok', title: 'Test', publishedAt: '2026-01-02', url: 'https://www.tiktok.com/@doctor.pep.26/video/123456789' };
assert.ok(validVideo(fixture));
assert.ok(validVideo({ ...fixture, url: fixture.url + '/' }));
assert.ok(!validVideo({ ...fixture, url: 'https://www.tiktok.com/@someone.else/video/123456789' }));
assert.ok(!validVideo({ ...fixture, url: 'javascript:alert(1)' }));
assert.ok(!validVideo({ ...fixture, platform: 'unknown' }));
assert.ok(!validVideo({ ...fixture, publishedAt: '2026-02-31' }));
assert.ok(!validVideo({ ...fixture, publishedAt: '2999-01-01' }));
assert.ok(!validVideo({ ...fixture, ownerVerified: false }));
assert.ok(!validVideo({ ...fixture, thumbnail: '/assets/../private.png' }));
const instagram = { ...fixture, id: 'test-instagram', platform: 'instagram', url: 'https://www.instagram.com/reel/TEST_ONLY/', publishedAt: '2026-01-03', featured: true };
assert.deepEqual(selectVideos([fixture, instagram, fixture]).map(v => v.id), ['test-instagram', 'test']);
assert.deepEqual(selectVideos([fixture, instagram], 'all', 'featured').map(v => v.id), ['test-instagram']);
assert.deepEqual(selectVideos([fixture, instagram], 'tiktok', 'featured'), []);

const script = await readFile(new URL('script-v2.js', root), 'utf8');
const helpers = script.slice(script.indexOf('  const isLocalFile'), script.indexOf('  const prefersReducedMotion'));
for (const protocol of ['file:', 'https:']) {
  const route = catalogLink('bac-water', '30 ml', true);
  const location = new URL(route, protocol === 'file:' ? root : baseUrl());
  const context = { URL, URLSearchParams, location, result: '' };
  runInNewContext(helpers + "result = pageParams().get('producto') + ':' + pageParams().get('presentacion');", context);
  assert.equal(context.result, 'bac-water:30 ml', 'Static social links must open the same fiche online and from file://');
}
for (const [filename, key] of [['index.html','home'], ['videos.html','videos'], ['privacidad.html','privacy']]) {
  const html = await readFile(new URL(filename, root), 'utf8');
  assert.equal([...html.matchAll(/<title>/g)].length, 1);
  assert.equal([...html.matchAll(/rel="canonical"/g)].length, 1);
  assert.ok(html.includes(`rel="canonical" href="${pageUrl(key)}"`));
  assert.ok(html.includes(`property="og:url" content="${pageUrl(key)}"`));
  const json = html.match(/id="siteStructuredData"[^>]*>(.*?)<\/script>/)[1];
  assert.deepEqual(JSON.parse(json), structuredData());
  assert.equal([...html.matchAll(/src="analytics.js"/g)].length, 1);
}
for (const hosted of [false, true]) {
  const xml = await readFile(new URL((hosted ? 'public/' : '') + 'sitemap.xml', root), 'utf8');
  assert.deepEqual([...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(x => x[1]), ['home','videos','privacy'].map(key => pageUrl(key, hosted)));
  const robots = await readFile(new URL((hosted ? 'public/' : '') + 'robots.txt', root), 'utf8');
  assert.ok(robots.includes(`Sitemap: ${baseUrl(hosted)}sitemap.xml`));
}
await access(new URL('public/analytics.js', root));

const tracker = await readFile(new URL('analytics.js', root), 'utf8');
function harness({ protocol = 'https:', id = 'G-TEST123', ready = true, consent = '', dnt = false, hostname = 'example.test' } = {}) {
  const listeners = {}; const nodes = [];
  function element(tag) {
    const node = { tag, children: [], listeners: {}, removed: false, dataset: {}, setAttribute() {}, append(...children) { this.children.push(...children); }, addEventListener(name, fn) { this.listeners[name] = fn; }, remove() { this.removed = true; } };
    nodes.push(node); return node;
  }
  const settings = { measurementId: id, enhancedMeasurementDisabled: ready, origins: ['https://example.test'] };
  const doc = { currentScript: {dataset: {config: JSON.stringify(settings)}}, head: element('head'), body: element('body'),
    querySelector: () => null, querySelectorAll: () => [], getElementById: id => nodes.find(n => n.id === id && !n.removed), addEventListener: (name, fn) => {listeners[name] = fn;}, createElement: element };
  const context = { window: {}, document: doc, URL, Date, navigator: {doNotTrack: dnt ? '1' : '0'}, localStorage: {getItem: () => consent, setItem() {}},
    location: new URL(protocol + '//' + hostname + '/index.html?producto=private-selection#?presentacion=private-value') };
  runInNewContext(tracker, context);
  const clickLink = href => listeners.click({target: {closest: selector => selector === 'a[href]' ? {href} : null}});
  const events = () => (context.window.dataLayer || []).map(args => Array.from(args));
  return { context, doc, nodes, clickLink, events };
}
for (const options of [{id: ''}, {ready: false}, {protocol: 'file:'}, {hostname: 'localhost'}, {dnt: true}, {consent: 'declined'}]) {
  const run = harness(options);
  run.clickLink('https://wa.me/593989009150?text=PRIVATE_MESSAGE');
  assert.equal(run.doc.head.children.length, 0, 'Do not contact Analytics without configuration and consent');
  assert.equal(run.events().length, 0);
}
const pending = harness();
assert.equal(pending.doc.head.children.length, 0);
pending.nodes.find(node => node.textContent === 'Permitir').listeners.click();
assert.equal(pending.doc.head.children.length, 1);
pending.clickLink('https://wa.me/593989009150?text=PRIVATE_MESSAGE');
assert.equal(pending.events().filter(args => args[0] === 'event' && args[1] === 'page_view').length, 1);
assert.equal(pending.events().filter(args => args[0] === 'event' && args[1] === 'whatsapp_click').length, 1);
assert.ok(!JSON.stringify(pending.events()).includes('PRIVATE_MESSAGE'));
assert.ok(!JSON.stringify(pending.events()).includes('private-selection'));
assert.ok(!JSON.stringify(pending.events()).includes('private-value'));
pending.context.window.doctorPepMetrics.showSettings();
pending.nodes.filter(node => node.textContent === 'No permitir').at(-1).listeners.click();
pending.clickLink('https://wa.me/593989009150?text=PRIVATE_MESSAGE');
assert.equal(pending.events().filter(args => args[0] === 'event' && args[1] === 'whatsapp_click').length, 1, 'Revoking consent stops later events');
console.log('Social validation, links in file/HTTP mode, metadata, sitemaps and privacy-aware event tracking verified.');
