const { contextBridge, ipcRenderer } = require('electron');

/**
 * メインワールド（レンダラープロセス）にAPIを公開する
 * これにより、HTML/JavaScript側からElectronの機能（メインプロセス）を安全に呼び出せる
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // --- 書き込み機能 ---
  // NFC書き込みを実行する
  writeNfcData: (data) => ipcRenderer.send('write-nfc-data', data),
  // 書き込み結果を受け取るリスナーを設定
  onWriteNfcResult: (callback) => ipcRenderer.on('write-nfc-result', (_event, value) => callback(value)),
  
  // --- 読み取り（監視）機能 ---
  // NFC監視を開始する
  startNfcMonitor: () => ipcRenderer.send('start-nfc-monitor'),
  // NFC監視を停止する
  stopNfcMonitor: () => ipcRenderer.send('stop-nfc-monitor'),
  // データ読み取りイベントを受け取るリスナーを設定
  onNfcDataRead: (callback) => ipcRenderer.on('nfc-data-read', (_event, value) => callback(value)),
  // タグ離脱イベントを受け取るリスナーを設定
  onNfcTagRemoved: (callback) => ipcRenderer.on('nfc-tag-removed', (_event) => callback())
});
