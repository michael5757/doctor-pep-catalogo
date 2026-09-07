import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { staticMetadata } from '../data/seo.mjs';
import { analyticsTag } from './build-visibility.mjs';
import { socialAccounts } from '../data/social-content.mjs';

// Bundle the same gallery as a classic script: file:// cannot load an ES module graph.
// Keep generated local files beside index.html; never empty the workspace.
const root = fileURLToPath(new URL('../', import.meta.url));
const result = await build({
  configFile: false,
  root,
  plugins: [react()],
  logLevel: 'warn',
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    write: false,
    sourcemap: false,
    lib: {
      entry: fileURLToPath(new URL('../app/videos/local-entry.tsx', import.meta.url)),
      name: 'DoctorPepVideos', formats: ['iife'], fileName: () => 'videos.js',
    },
  },
});
const outputs = (Array.isArray(result) ? result : [result]).flatMap(item => item.output);
const script = outputs.find(item => item.type === 'chunk' && item.isEntry);
if (!script || outputs.length !== 1) throw new Error('The local gallery must be a single self-contained script');
await mkdir(new URL('../local/', import.meta.url), { recursive: true });
await writeFile(new URL('../local/videos.js', import.meta.url), script.code, 'utf8');
const socialIcons = {
  tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 4v10.1a4.8 4.8 0 1 1-4.1-4.7v3.2a1.8 1.8 0 1 0 1.1 1.6V4h3Z"/><path d="M14.5 4c.6 2.5 2.2 3.9 5 4.1v3c-2-.1-3.7-.8-5-2"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>',
};
const creatorEmbed = '<!doctype html><html lang="es"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:white}blockquote{margin:0!important}</style></head><body><blockquote class="tiktok-embed" cite="https://www.tiktok.com/@doctor.pep.26" data-unique-id="doctor.pep.26" data-embed-type="creator" style="max-width:780px;min-width:288px"><section><a target="_blank" rel="noopener" href="https://www.tiktok.com/@doctor.pep.26">@doctor.pep.26</a></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script></body></html>';
await writeFile(new URL('../videos.html', import.meta.url), `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  ${staticMetadata('videos')}
  ${analyticsTag}
  <link rel="icon" href="assets/doctor-pep-logo.webp" />
  <link rel="stylesheet" href="styles-v3.css" />
  <link rel="stylesheet" href="styles-storefront.css" />
  <link rel="stylesheet" href="styles-refinement.css" />
</head>
<body>
  <div id="videosRoot"><div class="videos-shell">
    <header class="video-nav"><a class="video-brand" href="index.html" aria-label="Doctor Pep, volver al inicio"><img src="assets/doctor-pep-logo.webp" width="48" height="48" alt="" /><span>DOCTOR <strong>PEP</strong></span></a><nav aria-label="Navegación principal"><a href="index.html#catalogo-completo">Catálogo</a><a href="videos.html" aria-current="page">Videos</a><a href="index.html#?lista=1">Mi lista</a></nav></header>
    <main class="videos-page">
      <section class="social-directory" aria-labelledby="social-title">
        <div class="videos-intro"><h1 id="social-title">En nuestras redes</h1><p>@doctor.pep.26</p></div>
        <div class="social-channel-grid"><article class="social-channel tiktok-channel tiktok-feed"><span class="channel-icon">${socialIcons.tiktok}</span><h2 id="tiktok-feed-title">TikTok</h2><iframe class="tiktok-profile-frame" title="Videos recientes de Doctor Pep en TikTok" srcdoc="${escapeHtml(creatorEmbed)}" loading="eager" allow="autoplay; fullscreen; encrypted-media" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe><p class="social-feed-note">Los videos empiezan sin sonido. Usa el control de audio del reproductor cuando quieras escucharlos.</p><a class="channel-primary" href="${escapeHtml(socialAccounts.tiktok)}" target="_blank" rel="noopener noreferrer">Abrir TikTok ↗</a></article><article class="social-channel instagram-channel"><span class="channel-icon">${socialIcons.instagram}</span><h2>Instagram</h2><a class="channel-primary" href="${escapeHtml(socialAccounts.instagram)}" target="_blank" rel="noopener noreferrer">Abrir perfil <span aria-hidden="true">↗</span></a></article></div>
      </section>
    </main>
    <footer class="video-footer"><span>© 2026 Doctor Pep</span><a href="privacidad.html">Privacidad y uso responsable</a></footer>
    <a class="whatsapp-float" href="https://wa.me/593989009150?text=${encodeURIComponent('Hola, quisiera consultar el catálogo Doctor Pep.')}" aria-label="Consultar por WhatsApp" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" d="M20 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.1-4.4A8.5 8.5 0 1 1 20 11.5Z"/><path fill="none" stroke="currentColor" stroke-width="1.7" d="M8 7c-2 3 2 7 5 8l2-2-2-1-1 1-3-3 1-1-2-2Z"/></svg><span class="whatsapp-label">WhatsApp</span></a>
  </div></div>
  <script defer src="local/videos.js"></script>
</body>
</html>
`, 'utf8');

function escapeHtml(value) { return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;'); }
