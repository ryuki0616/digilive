const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

/**
 * メインウィンドウを作成する関数
 */
function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      // preloadスクリプトを指定（レンダラープロセスとメインプロセスの橋渡し）
      preload: path.join(__dirname, 'preload.js'),
      // セキュリティ設定：コンテキスト分離を有効化
      contextIsolation: true,
      // Node.jsの機能をレンダラープロセスで直接使えないようにする
      nodeIntegration: false
    }
  });

  // index.htmlを読み込む
  win.loadFile('src/html/index.html');
  
  // 開発者ツールを開く（デバッグ用）
  // win.webContents.openDevTools();
}

// アプリケーションの準備が整ったら実行
app.whenReady().then(() => {
  
  // ============================================
  // NFC書き込み処理のハンドラ
  // ============================================
  ipcMain.on('write-nfc-data', (event, data) => {
    const scriptPath = path.join(__dirname, 'python/nfc_writer.py');
    
    // Pythonスクリプトに渡す引数を準備
    // 引数の順序: name, age, money, power, stamina, speed, technique, luck, class
    const args = [
      scriptPath,
      data.topBox1, // name
      data.age || "0", // age
      String(data.topBox2), // money
      String(data.box1),    // power
      String(data.box2),    // stamina
      String(data.box3),    // speed
      String(data.box4),    // technique
      String(data.box5),    // luck
      String(data.box6)     // class
    ];

    console.log('Running writer with args:', args);

    // Pythonプロセスを起動して書き込みを実行
    const pythonProcess = spawn('python', args);
    let outputString = '';
    let errorString = '';

    // 標準出力を取得
    pythonProcess.stdout.on('data', (data) => {
      outputString += data.toString();
      console.log('Writer stdout:', data.toString());
    });

    // 標準エラー出力を取得
    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
      console.error('Writer stderr:', data.toString());
    });

    // プロセス終了時の処理
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        // 成功時：結果をレンダラープロセスに送信
        event.sender.send('write-nfc-result', outputString.trim());
      } else {
        // エラー時：エラーメッセージを送信
        event.sender.send('write-nfc-result', `エラー (Code ${code}): ${errorString}`);
      }
    });
  });

  // ============================================
  // NFC監視処理のハンドラ
  // ============================================
  
  // NFC監視プロセスの管理用変数
  let monitorProcess = null;

  // NFC監視開始のハンドラ
  ipcMain.on('start-nfc-monitor', (event) => {
    // 既に起動している場合は一度終了する
    if (monitorProcess) {
      monitorProcess.kill();
    }
    
    const scriptPath = path.join(__dirname, 'python/monitor_nfc.py');
    console.log('Starting NFC monitor:', scriptPath);
    
    // Pythonプロセス（監視スクリプト）を起動
    monitorProcess = spawn('python', [scriptPath]);
    
    // 標準出力を取得（リアルタイムでデータが送られてくる）
    monitorProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      lines.forEach(line => {
        if (!line.trim()) return;
        try {
          const json = JSON.parse(line);
          if (json.type === 'data') {
            // ターミナルにも詳細ログを出力
            console.log('--- NFC Data Received ---');
            console.log(JSON.stringify(json.payload, null, 2));
            console.log('-------------------------');
            
            // 読み取りデータをレンダラープロセスに送信
            event.sender.send('nfc-data-read', json.payload);
          } else if (json.type === 'removed') {
            // カード離脱イベントをレンダラープロセスに送信
            event.sender.send('nfc-tag-removed');
          }
        } catch (e) {
          // JSONパースエラーは無視（デバッグ用ログのみ）
          // console.error('JSON Parse Error:', e);
        }
      });
    });
    
    // 標準エラー出力を取得
    monitorProcess.stderr.on('data', (data) => {
      console.error('Monitor Error:', data.toString());
    });
    
    // プロセス終了時の処理
    monitorProcess.on('close', (code) => {
      console.log(`Monitor process exited with code ${code}`);
      monitorProcess = null;
    });
  });

  // NFC監視停止のハンドラ
  ipcMain.on('stop-nfc-monitor', () => {
    if (monitorProcess) {
      console.log('Stopping NFC monitor...');
      monitorProcess.kill();
      monitorProcess = null;
    }
  });

  // ============================================
  // DBデータ取得のハンドラ
  // ============================================
  ipcMain.handle('get-db-data', async (event, uid) => {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, 'python/get_db_data.py');
      console.log('Fetching DB data for UID:', uid);

      const pythonProcess = spawn('python', [scriptPath, uid]);
      
      let outputString = '';
      let errorString = '';

      pythonProcess.stdout.on('data', (data) => {
        outputString += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
        console.error('DB Fetch stderr:', data.toString());
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(outputString);
            resolve(result);
          } catch (e) {
            reject(`JSON Parse Error: ${e.message}, Output: ${outputString}`);
          }
        } else {
          reject(`Process exited with code ${code}: ${errorString}`);
        }
      });
    });
  });

  // ウィンドウを作成
  createWindow();

  // macOS用：アクティブになった時にウィンドウがなければ再作成
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 全てのウィンドウが閉じられたらアプリを終了（macOS以外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
