// ============================================
// NFC読み取り画面のロジック
// ============================================

// ページが読み込まれたら実行される処理
document.addEventListener('DOMContentLoaded', () => {
    const messageElement = document.getElementById('message');
    
    // 監視開始のメッセージを表示
    messageElement.textContent = "NFCタグをタッチしてください...";
    messageElement.style.color = 'white';
    
    // メインプロセスにNFC監視の開始をリクエスト
    window.electronAPI.startNfcMonitor();
    
    // --- データ読み取り時の処理 ---
    window.electronAPI.onNfcDataRead((data) => {
        // --- デバッグ用詳細表示 (コンソール) ---
        console.group('📦 NFCタグデータ受信');
        console.log('IDm:', data.idm);
        console.log('名前:', data.name);
        console.log('ステータス:', data.status);
        
        if (data.inventory && data.inventory.length > 0) {
            console.log('▼ インベントリ (全ページデータ):');
            console.table(data.inventory);
        } else {
            console.log('インベントリ: データなし');
        }
        
        console.log('全データオブジェクト:', data);
        console.groupEnd();
        // ------------------------------------
        
        // Python側でエラーが発生していた場合
        if (data.error) {
            messageElement.textContent = `エラー: ${data.error}`;
            messageElement.style.color = 'red';
            return;
        }

        // --- 画面へのデータ表示 ---

        // 名前 (なければ '不明')
        document.getElementById('nfc-name').textContent = data.name || '不明';
        
        // ステータスリストの取得（なければ空配列）
        const status = data.status || [];
        
        // ステータスの割り当て
        // status[0]: パワー
        // status[1]: スタミナ
        // status[2]: スピード
        // status[3]: テクニック
        // status[4]: ラック
        // status[5]: クラス
        // status[6]: 所持金
        
        // 各要素に値をセット（値がない場合はハイフンを表示）
        document.getElementById('nfc-power').textContent = status[0] !== undefined ? status[0] : '-';
        document.getElementById('nfc-stamina').textContent = status[1] !== undefined ? status[1] : '-';
        document.getElementById('nfc-speed').textContent = status[2] !== undefined ? status[2] : '-';
        document.getElementById('nfc-technique').textContent = status[3] !== undefined ? status[3] : '-';
        document.getElementById('nfc-luck').textContent = status[4] !== undefined ? status[4] : '-';
        document.getElementById('nfc-class').textContent = status[5] !== undefined ? status[5] : '-';
        document.getElementById('nfc-money').textContent = status[6] !== undefined ? status[6] : '-';
        
        // 読み取り完了メッセージ
        messageElement.textContent = "読み取り中...";
        messageElement.style.color = '#00ff00'; // 緑色
    });
    
    // --- タグが離された時の処理 ---
    window.electronAPI.onNfcTagRemoved(() => {
        console.log('NFC Tag Removed');
        
        // 表示をクリア
        document.getElementById('nfc-name').textContent = '';
        document.getElementById('nfc-power').textContent = '';
        document.getElementById('nfc-stamina').textContent = '';
        document.getElementById('nfc-speed').textContent = '';
        document.getElementById('nfc-technique').textContent = '';
        document.getElementById('nfc-luck').textContent = '';
        document.getElementById('nfc-class').textContent = '';
        document.getElementById('nfc-money').textContent = '';
        
        // 待機メッセージに戻す
        messageElement.textContent = "NFCタグをタッチしてください...";
        messageElement.style.color = 'white';
    });
});

// ページを離れる時に監視を停止
// これを忘れると、バックグラウンドでPythonプロセスが動き続けてしまう
window.addEventListener('beforeunload', () => {
    window.electronAPI.stopNfcMonitor();
});
