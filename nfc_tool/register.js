// 「登録」ボタンの要素を取得
const registerButton = document.getElementById('register_button');
// エラーメッセージ表示要素を取得
const errorMessage = document.getElementById('error-message');
// ニックネーム入力欄の要素を取得
const userNameInput = document.getElementById('user_name');
// バイト数カウンターの要素を取得
const nameByteCount = document.getElementById('name-byte-count');

/**
 * 文字列のUTF-8エンコード時のバイト数を計算する関数
 * @param {string} str - 対象の文字列
 * @returns {number} バイト数
 */
function getByteLength(str) {
    // Blobを使って効率的にバイト数を計算
    return new Blob([str]).size;
}

// --- ニックネーム入力時のリアルタイムバイト数チェック ---
if (userNameInput && nameByteCount) {
    userNameInput.addEventListener('input', () => {
        const userName = userNameInput.value;
        const byteLength = getByteLength(userName);
        
        // バイト数を表示
        nameByteCount.textContent = `現在のバイト数: ${byteLength} / 20`;
        
        // 20バイトを超えた場合はエラー表示
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
    // 3秒後に自動的に非表示にする（オプション）
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 3000);
}

// 「登録」ボタンがクリックされたときの処理を追加
registerButton.addEventListener('click', () => {
    // エラーメッセージを非表示にする
    errorMessage.style.display = 'none';
    
    // ニックネーム入力欄の値を取得
    const userName = userNameInput.value.trim();
    // 年齢入力欄の値を取得
    const userAge = document.getElementById('user_age').value.trim();
    
    // 入力値の検証
    if (!userName) { // 未入力チェック
        showError('ニックネームを入力してください。');
        userNameInput.focus();
        return;
    }
    
    // バイト数チェック
    const byteLength = getByteLength(userName);
    if (byteLength > 20) {
        showError(`ニックネームは20バイト以内で入力してください。(現在: ${byteLength}バイト)`);
        userNameInput.focus();
        return;
    }
    
    if (!userAge) { // 年齢の未入力チェック
        showError('年齢を入力してください。');
        document.getElementById('user_age').focus();
        return;
    }
    
    // 年齢の数値と範囲をチェック
    const age = parseInt(userAge, 10);
    if (isNaN(age) || age < 0 || age > 120) {
        showError('年齢は0歳から120歳の間で入力してください。');
        document.getElementById('user_age').focus();
        return;
    }
    
    // 入力情報をコンソールに出力（デバッグ用）
    console.log(userName, userAge);
    
    // 次のページに遷移（URLパラメータで情報を渡す）
    window.location.href = `next.html?name=${encodeURIComponent(userName)}&age=${encodeURIComponent(userAge)}`;
});