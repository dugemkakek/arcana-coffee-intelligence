// Arcana Coffee Intelligence — Electron main process.
//
// Pinned to Electron 13.x (the last major that supports Windows 7 SP1).
// Loads the Next.js static export from file:// in production, or from
// http://localhost:3000 in dev mode. Spawns the Fastify server as a
// child process in production so the user only has to launch the .exe.

const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('node:path');
const { spawn } = require('node:child_process');
const fs = require('node:fs');

const isDev = !!process.env.ARCANA_DEV;
const APP_ROOT = path.join(__dirname, '..');
const SERVER_ENTRY = path.join(APP_ROOT, 'dist', 'server', 'index.js');
const UI_EXPORT = path.join(APP_ROOT, 'out', 'index.html');
const DEV_UI_URL = process.env.ARCANA_DEV_UI_URL ?? 'http://localhost:3000';
const SERVER_PORT = process.env.LOCAL_NODE_PORT ?? '4000';

let mainWindow = null;
let serverProcess = null;

function startServer() {
  if (isDev) {
    console.log('[main] dev mode — assuming server runs via `pnpm dev:server`');
    return;
  }
  if (!fs.existsSync(SERVER_ENTRY)) {
    console.error('[main] server build not found at', SERVER_ENTRY);
    return;
  }
  console.log('[main] starting Fastify server…');
  serverProcess = spawn(process.execPath, [SERVER_ENTRY], {
    env: { ...process.env, LOCAL_NODE_PORT: SERVER_PORT, NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  serverProcess.stdout?.on('data', (d) => process.stdout.write(`[server] ${d}`));
  serverProcess.stderr?.on('data', (d) => process.stderr.write(`[server] ${d}`));
  serverProcess.on('exit', (code) => {
    console.log('[main] server exited with code', code);
    serverProcess = null;
  });
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

  // Open external links in the OS browser, not the Electron window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    mainWindow.loadURL(DEV_UI_URL);
    mainWindow.webContents.openDevTools();
  } else {
    if (!fs.existsSync(UI_EXPORT)) {
      dialog.showErrorBox(
        'UI build missing',
        `Could not find the static UI export at:\n${UI_EXPORT}\n\nPlease run \`pnpm --filter @arcana/local-node build\` before launching the installer.`,
      );
      app.quit();
      return;
    }
    mainWindow.loadFile(UI_EXPORT);
  }
}

app.whenReady().then(() => {
  startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});
