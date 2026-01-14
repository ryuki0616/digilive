// トップページのロジック
// カード認証機能を含む

document.addEventListener('DOMContentLoaded', () => {
    // 要素の取得
    const editButton = document.getElementById('edit-button'); // 編集ボタン (aタグからbuttonに変更予定)
    const modal = document.getElementById('auth-modal');
    const modalCloseBtn = document.getElementById('auth-modal-close');
    const modalMessage = document.getElementById('auth-modal-message');

    // 認証監視中フラグ
    let isMonitoringAuth = false;

    // 編集ボタンクリック時の処理
    if (editButton) {
        editButton.addEventListener('click', (e) => {
            e.preventDefault(); // リンク遷移を防止
            openAuthModal();
        });
    }

    // モーダルを閉じるボタン
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            closeAuthModal();
        });
    }

    // 認証モーダルを開く
    function openAuthModal() {
        if (!modal) return;
        
        modal.style.display = 'flex';
        modalMessage.textContent = '認証のため、NFCカードをタッチしてください...';
        modalMessage.style.color = '#ffffff';
        
        // NFC監視開始
        startAuthMonitor();
    }

    // 認証モーダルを閉じる
    function closeAuthModal() {
        if (!modal) return;
        
        modal.style.display = 'none';
        
        // NFC監視停止
        stopAuthMonitor();
    }

    // NFC監視開始
    function startAuthMonitor() {
        if (isMonitoringAuth) return;
        
        console.log('Starting auth monitor...');
        window.electronAPI.startNfcMonitor();
        isMonitoringAuth = true;
    }

    // NFC監視停止
    function stopAuthMonitor() {
        if (!isMonitoringAuth) return;
        
        console.log('Stopping auth monitor...');
        window.electronAPI.stopNfcMonitor();
        isMonitoringAuth = false;
    }

    // NFCデータ受信時の処理 (認証ロジック)
    window.electronAPI.onNfcDataRead((data) => {
        if (!isMonitoringAuth) return;

        console.log('Auth check data:', data);
        
        // ステータスの取得 (read.jsの最新のマッピングに基づく)
        // status[0]: 所持金
        // status[1]: パワー
        // status[2]: スタミナ
        // status[3]: スピード
        // status[4]: テクニック
        // status[5]: ラック
        // status[6]: クラス
        const status = data.status || [];
        const playerClass = status[6];

        if (playerClass === undefined) {
            updateAuthMessage('データの読み取りに失敗しました。', 'red');
            return;
        }

        console.log('Detected Class:', playerClass);

        // クラス0 を管理者（編集権限あり）とみなす
        if (playerClass === 65535) {
            updateAuthMessage(`認証成功！ (Class: ${playerClass})`, '#00ff00');
            
            // 少し待ってから遷移 (UX向上)
            setTimeout(() => {
                stopAuthMonitor();
                window.location.href = 'edit.html';
            }, 1000);
        } else {
            updateAuthMessage(`権限がありません (Class: ${playerClass})`, 'red');
        }
    });

    // タグ離脱時
    window.electronAPI.onNfcTagRemoved(() => {
        if (isMonitoringAuth) {
            updateAuthMessage('NFCカードをタッチしてください...', '#ffffff');
        }
    });

    // メッセージ更新ヘルパー
    function updateAuthMessage(text, color) {
        if (modalMessage) {
            modalMessage.textContent = text;
            modalMessage.style.color = color;
        }
    }
});

// ページ離脱時に念のため監視停止
window.addEventListener('beforeunload', () => {
    window.electronAPI.stopNfcMonitor();
});

