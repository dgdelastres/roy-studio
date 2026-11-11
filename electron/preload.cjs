const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {\n  platform: process.platform,\n  version: process.versions.electron,\n});
