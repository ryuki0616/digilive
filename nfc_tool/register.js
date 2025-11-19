// ============================================
// 要素の取得
// ============================================

// 「登録」ボタンの要素を取得
const registerButton = document.getElementById('register_button');
// エラーメッセージ表示要素を取得
const errorMessage = document.getElementById('error-message');
// ニックネーム入力欄の要素を取得
const userNameInput = document.getElementById('user_name');
// 年齢入力欄の要素を取得
const userAgeInput = document.getElementById('user_age');
// バイト数カウンターの要素を取得
const nameByteCount = document.getElementById('name-byte-count');

/**
 * ページ読み込み時の初期化処理
 * - 入力フォームのクリア
 * - フォーカスの設定
 */
document.addEventListener('DOMContentLoaded', () => {
    // 入力フィールドをクリア
    if (userNameInput) userNameInput.value = '';
    if (userAgeInput) userAgeInput.value = '';
    
    // バイト数カウンターをリセット
    if (nameByteCount) nameByteCount.textContent = '';
    
    // エラーメッセージを非表示
    if (errorMessage) errorMessage.style.display = 'none';
    
    // ニックネーム入力欄にフォーカスを当てる（ユーザーがすぐに入力できるように）
    if (userNameInput) {
        setTimeout(() => {
            userNameInput.focus();
        }, 100);
    }
});

/**
 * 文字列のUTF-8エンコード時のバイト数を計算する関数
 * NFCタグのメモリ容量には制限があるため、バイト数をチェックする必要があります
 * @param {string} str - 対象の文字列
 * @returns {number} バイト数
 */
function getByteLength(str) {
    // Blobを使って効率的にバイト数を計算
    return new Blob([str]).size;
}

// ============================================
// イベントリスナーの設定
// ============================================

// --- ニックネーム入力時のリアルタイムバイト数チェック ---
if (userNameInput && nameByteCount) {
    userNameInput.addEventListener('input', () => {
        const userName = userNameInput.value;
        const byteLength = getByteLength(userName);
        
        // バイト数を表示
        nameByteCount.textContent = `現在のバイト数: ${byteLength} / 20`;
        
        // 20バイトを超えた場合はエラー表示（クラスを追加して赤くする）
        if (byteLength > 20) {
            nameByteCount.classList.add('error');
        } else {
            nameByteCount.classList.remove('error');
        }
    });
}

// エラーメッセージを表示する関数
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    // 3秒後に自動的に非表示にする
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 3000);
}

// --- 「登録」ボタンがクリックされたときの処理 ---
registerButton.addEventListener('click', () => {
    // エラーメッセージを一旦非表示にする
    errorMessage.style.display = 'none';
    
    // 入力値を取得
    const userName = userNameInput.value.trim();
    const userAge = userAgeInput.value.trim();
    
    // --- バリデーション（入力チェック） ---
    
    // ニックネームの未入力チェック
    if (!userName) {
        showError('ニックネームを入力してください。');
        userNameInput.focus();
        return;
    }
    
    // ニックネームのバイト数チェック（20バイト以内）
    const byteLength = getByteLength(userName);
    if (byteLength > 20) {
        showError(`ニックネームは20バイト以内で入力してください。(現在: ${byteLength}バイト)`);
        userNameInput.focus();
        return;
    }
    
    // 年齢の未入力チェック
    if (!userAge) {
        showError('年齢を入力してください。');
        userAgeInput.focus();
        return;
    }
    
    // 年齢の数値チェックと範囲チェック（0〜120歳）
    const age = parseInt(userAge, 10);
    if (isNaN(age) || age < 0 || age > 120) {
        showError('年齢は0歳から120歳の間で入力してください。');
        userAgeInput.focus();
        return;
    }
    
    // デバッグ用ログ
    console.log('登録情報:', userName, userAge);
    
    // 次のページ (next.html) に遷移
    // URLパラメータとして名前と年齢を渡す
    window.location.href = `next.html?name=${encodeURIComponent(userName)}&age=${encodeURIComponent(userAge)}`;
});
