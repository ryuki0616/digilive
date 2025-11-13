const { contextBridge, ipcRenderer } = require('electron');

// 'contextIsolation' が有効な環境で、
// レンダラープロセス（script.js）の 'window' オブジェクトに、
// 安全なAPIを公開します。

contextBridge.exposeInMainWorld(
    'electronAPI', // window.electronAPI としてアクセスできるようになる
    {
        // --------------------------------------------------
        // メインプロセス -> レンダラープロセス への通信
        // --------------------------------------------------
        // 'nfc-data' チャンネルでデータを受信したら、
        // 登録されたコールバック関数 (callback) を実行するリスナーを定義
        
        /**
         * @param {function(string)} callback - NFCデータ受信時に実行する関数
         */
        onNfcData: (callback) => {
            // ipcRenderer.on を使って、メインプロセスからの 'nfc-data' メッセージを待ち受ける
            // (event, message) の message が main.js から送られてきたデータ
            ipcRenderer.on('nfc-data', (event, message) => {
                callback(message); // 受け取ったデータをそのままコールバック関数に渡す
            });
        },
        
        // --------------------------------------------------
        // レンダラープロセス -> メインプロセス への通信
        // --------------------------------------------------
        
        /**
         * NFCカードへのデータ書き込みをメインプロセスに依頼する関数
         * @param {object} dataToWrite - 書き込むデータオブジェクト
         */
        writeNfcData: (dataToWrite) => {
            ipcRenderer.send('write-nfc-request', dataToWrite);
        },
        
        /**
         * メインプロセスからのNFC書き込み結果を受信するリスナー
         * @param {function(string)} callback - 書き込み結果受信時に実行する関数
         */
        onWriteNfcResult: (callback) => {
            ipcRenderer.on('write-nfc-result', (event, result) => {
                callback(result);
            });
        }
    }
);

console.log('Preloadスクリプトがロードされました。');