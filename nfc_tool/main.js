// Electronのコアモジュール
const { app, BrowserWindow, ipcMain } = require('electron');
// OSのパスを扱うためのモジュール
const path = require('path');
// Pythonなどの外部プロセスを起動するためのモジュール
const { spawn } = require('child_process');

// Pythonプロセスのインスタンスをグローバルに保持
let pythonProcess = null;

/**
 * Pythonスクリプトを起動する関数
 * @param {BrowserWindow} mainWindow - データを送信する対象のウィンドウ
 */
function startPythonProcess(mainWindow) {
    // 起動するPythonスクリプトのパス
    // __dirname は main.js があるフォルダを指す
    const pythonScriptPath = path.join(__dirname, 'nfc_reader.py');
    
    console.log(`Pythonスクリプトを起動します: ${pythonScriptPath}`);

    // 'python' コマンドで nfc_reader.py を実行
    // (Windowsで 'python' がPATHにあれば動く)
    // (Raspberry Piでは 'python3' にする必要があるかもしれない)
    pythonProcess = spawn('python', [pythonScriptPath]);

    // --- Pythonプロセスからの出力を監視 ---

    // 1. Pythonの「標準出力」(print) からデータが流れてきた時
    pythonProcess.stdout.on('data', (data) => {
        // データはBuffer形式で来るので文字列に変換し、前後の空白を削除
        const message = data.toString().trim();
        
        console.log(`[Python:stdout] ${message}`); // Electron側のコンソールにログを出す
        
        // ★重要: "IDm:" で始まるデータのみをレンダラープロセス（画面）に送信
        if (message.startsWith('IDm:')) {
            // 'nfc-data' というチャンネル名で、データを送信
            // mainWindow が null でないことを確認
            if (mainWindow) {
                mainWindow.webContents.send('nfc-data', message);
            }
        }
    });

    // 2. Pythonの「標準エラー出力」(print(..., file=sys.stderr)) からデータが流れてきた時
    pythonProcess.stderr.on('data', (data) => {
        // エラーはElectronのコンソールにエラーとして表示
        console.error(`[Python:stderr] ${data.toString().trim()}`);
    });

    // 3. Pythonプロセスが終了した時
    pythonProcess.on('close', (code) => {
        console.log(`Pythonプロセスが終了しました。終了コード: ${code}`);
        // (必要ならここで再起動処理などを書く)
        pythonProcess = null;
    });

    // 4. Pythonプロセスの起動に失敗した時
    pythonProcess.on('error', (err) => {
        console.error('Pythonプロセスの起動に失敗しました:', err);
    });
}

/**
 * Electronウィンドウを作成する関数
 */
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            // ★重要: レンダラープロセスとメインプロセスを安全に橋渡しするスクリプト
            preload: path.join(__dirname, 'preload.js'),
            // 以下の2行はセキュリティ上「必須」
            contextIsolation: true, // レンダラープロセスの 'window' と 'main' を分離
            nodeIntegration: false  // レンダラープロセスでNode.jsの機能(fsなど)を無効化
        }
    });

    // index.html を読み込む
    mainWindow.loadFile('index.html');

    // ★ウィンドウが作成されたら、Pythonプロセスを起動
    startPythonProcess(mainWindow);
    
    // 開発者ツールを自動で開かない（前回の質問の反映）
    // mainWindow.webContents.openDevTools();
}

// ============================================
// IPC通信（レンダラープロセスとの通信）
// ============================================

// 'write-nfc-request' チャンネルでデータを受信したら、Pythonスクリプトを実行
ipcMain.on('write-nfc-request', (event, dataToWrite) => {
    const writerScriptPath = path.join(__dirname, 'nfc_writer.py');
    console.log(`NFC書き込みリクエスト受信:`, dataToWrite);
    
    // 送信されたデータをPythonスクリプトに渡すための引数を準備
    // 例: ["名前", "100", "1", "1", "1", "1", "1", "1"]
    const args = [
        dataToWrite.topBox1,
        dataToWrite.topBox2.toString(),
        dataToWrite.box1.toString(),
        dataToWrite.box2.toString(),
        dataToWrite.box3.toString(),
        dataToWrite.box4.toString(),
        dataToWrite.box5.toString(),
        dataToWrite.box6.toString()
    ];
    
    console.log(`Python書き込みスクリプトを起動: ${writerScriptPath}`);
    const writerProcess = spawn('python', [writerScriptPath, ...args], {
        // 標準入出力のエンコーディングをUTF-8に設定
        stdio: ['pipe', 'pipe', 'pipe'],
        encoding: 'utf8'
    });
    
    let stdout = '';
    let stderr = '';
    
    // Pythonスクリプトからの標準出力を取得
    writerProcess.stdout.on('data', (data) => {
        stdout += data.toString();
    });
    
    // Pythonスクリプトからの標準エラー出力を取得
    writerProcess.stderr.on('data', (data) => {
        stderr += data.toString();
    });
    
    // Pythonスクリプトが終了したときの処理
    writerProcess.on('close', (code) => {
        if (code === 0) {
            console.log(`[Python:writer] 成功: ${stdout.trim()}`);
            // 成功メッセージをレンダラープロセスに送信
            event.sender.send('write-nfc-result', stdout.trim());
        } else {
            console.error(`[Python:writer] エラー: ${stderr.trim()}`);
            // 失敗メッセージをレンダラープロセスに送信
            event.sender.send('write-nfc-result', `書き込み失敗: ${stderr.trim()}`);
        }
    });
});

// --- Electronアプリのライフサイクル ---

// 準備が完了したらウィンドウを作成
app.whenReady().then(() => {
    createWindow();

    // (macOS用のコード - Windowsでは影響しない)
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// アプリが終了する直前の処理
app.on('before-quit', () => {
    // Pythonプロセスが起動中なら、強制終了(kill)する
    if (pythonProcess) {
        console.log('Pythonプロセスを終了します...');
        pythonProcess.kill();
        pythonProcess = null;
    }
});

// 全てのウィンドウが閉じたらアプリを終了 (Windows/Linux)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});