const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readNfc: () => ipcRenderer.invoke('read-nfc'),
  writeNfcData: (data) => ipcRenderer.send('write-nfc-data', data),
  onWriteNfcResult: (callback) => ipcRenderer.on('write-nfc-result', (_event, value) => callback(value)),
  
  // 新しい監視用API
  startNfcMonitor: () => ipcRenderer.send('start-nfc-monitor'),
  stopNfcMonitor: () => ipcRenderer.send('stop-nfc-monitor'),
  onNfcDataRead: (callback) => ipcRenderer.on('nfc-data-read', (_event, value) => callback(value)),
  onNfcTagRemoved: (callback) => ipcRenderer.on('nfc-tag-removed', (_event) => callback())
});
