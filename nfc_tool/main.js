const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // index.htmlを読み込む (main.jsと同じディレクトリにあるため)
  win.loadFile('index.html');
  
  // 開発者ツールを開く（デバッグ用）
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  // NFC読み取り処理のハンドラ
  ipcMain.handle('read-nfc', async () => {
    return new Promise((resolve, reject) => {
      // Pythonスクリプトのパス (main.jsと同じディレクトリにある send.py)
      const scriptPath = path.join(__dirname, 'send.py');
      
      // Pythonプロセスを起動
      const pythonProcess = spawn('python', [scriptPath]);

      let dataString = '';
      let errorString = '';

      // 標準出力を取得
      pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
      });

      // 標準エラー出力を取得
      pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
      });

      // プロセス終了時の処理
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python script exited with code ${code}: ${errorString}`);
          reject(new Error(`読み取りエラー (Code ${code}): ${errorString}`));
          return;
        }
        
        try {
          // JSONをパースして返す
          const result = JSON.parse(dataString);
          resolve(result);
        } catch (e) {
          console.error(`JSON Parse Error: ${e.message}, Data: ${dataString}`);
          reject(new Error('データの解析に失敗しました。'));
        }
      });
    });
  });

  // NFC書き込み処理のハンドラ
  ipcMain.on('write-nfc-data', (event, data) => {
    const scriptPath = path.join(__dirname, 'nfc_writer.py');
    
    // 引数の順序: name, money, power, stamina, speed, technique, luck, class
    // next.js の boxTexts オブジェクトのキーに対応させる
    const args = [
      scriptPath,
      data.topBox1, // name
      String(data.topBox2), // money
      String(data.box1),    // power
      String(data.box2),    // stamina
      String(data.box3),    // speed
      String(data.box4),    // technique
      String(data.box5),    // luck
      String(data.box6)     // class
    ];

    console.log('Running writer with args:', args);

    const pythonProcess = spawn('python', args);
    let outputString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
      outputString += data.toString();
      console.log('Writer stdout:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
      console.error('Writer stderr:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        // 成功時は標準出力の最後の行などを返すか、特定のメッセージを探す
        // nfc_writer.py は "✅ NFCカードへの書き込みが成功しました！" を出力する
        event.sender.send('write-nfc-result', outputString.trim());
      } else {
        event.sender.send('write-nfc-result', `エラー (Code ${code}): ${errorString}`);
      }
    });
  });

  // NFC監視プロセスの管理用変数
  let monitorProcess = null;

  // NFC監視開始のハンドラ
  ipcMain.on('start-nfc-monitor', (event) => {
    // 既に起動している場合は一度終了する
    if (monitorProcess) {
      monitorProcess.kill();
    }
    
    const scriptPath = path.join(__dirname, 'monitor_nfc.py');
    console.log('Starting NFC monitor:', scriptPath);
    
    // Pythonプロセスを起動
    monitorProcess = spawn('python', [scriptPath]);
    
    // 標準出力を取得
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
            
            // 読み取りデータを送信
            event.sender.send('nfc-data-read', json.payload);
          } else if (json.type === 'removed') {
            // カード離脱イベントを送信
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

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
