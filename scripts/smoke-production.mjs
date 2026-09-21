import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = 8791;
const isWindows = process.platform === 'win32';
const child = isWindows
  ? spawn('cmd.exe', ['/d', '/s', '/c', `pnpm exec vinext start --port ${port}`], {
      cwd: root, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
    })
  : spawn('pnpm', ['exec', 'vinext', 'start', '--port', String(port)], {
      cwd: root, stdio: ['ignore', 'pipe', 'pipe'],
    });
let output = '';
const ready = new Promise((resolveReady, reject) => {
  const timer = setTimeout(() => reject(new Error('Production server startup timeout\n' + output)), 15000);
  const onData = chunk => {
    output += chunk.toString();
    if (output.includes('Production server running')) { clearTimeout(timer); resolveReady(); }
  };
  child.stdout.on('data', onData); child.stderr.on('data', onData);
  child.once('exit', code => reject(new Error(`Production server exited early (${code})\n${output}`)));
});

try {
  await ready;
  const checks = ['/', '/privacidad', '/videos', '/script-v2.min.js', '/assets/products/tirzepatide-10-mg.png'];
  for (const path of checks) {
    const response = await fetch(`http://127.0.0.1:${port}${path}`);
    assert.equal(response.status, 200, `${path}: expected HTTP 200, got ${response.status}`);
    if (path === '/') assert.match(await response.text(), /Doctor Ecupep/i, 'Home response is missing Doctor Ecupep content');
  }
  console.log(`Production smoke verified: ${checks.length} endpoints returned HTTP 200.`);
} finally {
  if (process.platform === 'win32' && child.pid) {
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
  } else {
    child.kill('SIGTERM');
  }
}
