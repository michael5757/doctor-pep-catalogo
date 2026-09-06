import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

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
await writeFile(new URL('../videos.html', import.meta.url), `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Videos | Doctor Pep</title>
  <meta name="description" content="Las cuentas oficiales de Doctor Pep en TikTok e Instagram." />
  <link rel="icon" href="assets/doctor-pep-logo.webp" />
  <link rel="stylesheet" href="styles-v3.css" />
  <link rel="stylesheet" href="styles-storefront.css" />
  <link rel="stylesheet" href="styles-refinement.css" />
</head>
<body>
  <div id="videosRoot"></div>
  <noscript>Activa JavaScript para ver esta galería. <a href="index.html">Volver al catálogo</a></noscript>
  <script defer src="local/videos.js"></script>
</body>
</html>
`, 'utf8');
