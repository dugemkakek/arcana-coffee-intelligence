// Preload — exposes a tiny, safe API to the renderer.
// v0.1 has no privileged operations; this is a placeholder for v0.2
// when we'll add IPC channels for native dialogs, system info, etc.

const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('arcana', {
  version: '0.1.0',
  platform: process.platform,
});
