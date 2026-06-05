// Arcana Coffee Intelligence — Electron main process.
//
// Pinned to Electron 13.x (the last major that supports Windows 7 SP1).
// In dev, loads the Next.js dev server from http://localhost:3000.
// In production, spawns both the Next.js server (port 3000) and the
// Fastify API (port 4000) as child processes, then loads http://localhost:3000.

const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('node:path');
const { spawn } = require('node:child_process');
const fs = require('node:fs');

const isDev = !!process.env.ARCANA_DEV;
const APP_ROOT = path.join(__dirname, '..');
const SERVER_ENTRY = path.join(APP_ROOT, 'dist', 'server', 'index.js');
const UI_PORT = process.env.LOCAL_NODE_UI_PORT ?? '3000';
const SERVER_PORT = process.env.LOCAL_NODE_API_PORT ?? '4000';
const UI_URL = process.env.ARCANA_DEV_UI_URL ?? `http://localhost:${UI_PORT}`;

let mainWindow = null;
let serverProcess = null;
let uiProcess = null;

function waitForPort(port, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const sock = require('node:net').createConnection(port, '127.0.0.1');
      sock
        .on('connect', () => {
          sock.end();
          resolve();
        })
        .on('error', () => {
          sock.destroy();
          if (Date.now() - start > timeoutMs) reject(new Error(`port ${port} not open after ${timeoutMs}ms`));
          else setTimeout(tick, 250);
        });
    };
    tick();
  });
}

async function startServer() {
  if (isDev) {
    console.log('[main] dev mode — assuming server + UI run via `pnpm dev`');
    return;
  }
  if (!fs.existsSync(SERVER_ENTRY)) {
    dialog.showErrorBox(
      'Server build missing',
      `Could not find the Fastify build at:\n${SERVER_ENTRY}\n\nPlease run \`pnpm --filter @arcana/local-node build\` first.`,
    );
    app.quit();
    return;
  }
  console.log('[main] starting Fastify server…');
  serverProcess = spawn(process.execPath, [SERVER_ENTRY], {
    env: { ...process.env, LOCAL_NODE_API_PORT: SERVER_PORT, NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  serverProcess.stdout?.on('data', (d) => process.stdout.write(`[server] ${d}`));
  serverProcess.stderr?.on('data', (d) => process.stderr.write(`[server] ${d}`));
  serverProcess.on('exit', (code) => {
    console.log('[main] server exited with code', code);
    serverProcess = null;
  });

  console.log('[main] starting Next.js UI…');
  uiProcess = spawn(process.execPath, [path.join(APP_ROOT, 'node_modules', 'next', 'dist', 'bin', 'next'), 'start', '-p', UI_PORT], {
    env: { ...process.env, NODE_ENV: 'production' },
    cwd: APP_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  uiProcess.stdout?.on('data', (d) => process.stdout.write(`[ui] ${d}`));
  uiProcess.stderr?.on('data', (d) => process.stderr.write(`[ui] ${d}`));
  uiProcess.on('exit', (code) => {
    console.log('[main] UI exited with code', code);
    uiProcess = null;
  });

  // Wait for both ports to be open
  try {
    await Promise.all([
      waitForPort(Number(SERVER_PORT)),
      waitForPort(Number(UI_PORT)),
    ]);
    console.log('[main] both services ready');
  } catch (err) {
    console.error('[main] services did not become ready:', err);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    title: 'Arcana Coffee Intelligence',
    backgroundColor: '#241408',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.loadURL(UI_URL);
  if (isDev) mainWindow.webContents.openDevTools();
}

app.whenReady().then(async () => {
  await startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  for (const p of [serverProcess, uiProcess]) p?.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  for (const p of [serverProcess, uiProcess]) {
    if (p) {
      p.kill();
    }
  }
  serverProcess = null;
  uiProcess = null;
});
