// 「登録」ボタンの要素を取得
const registerButton = document.getElementById('register_button');
// エラーメッセージ表示要素を取得
const errorMessage = document.getElementById('error-message');

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
    const userName = document.getElementById('user_name').value.trim();
    // 年齢入力欄の値を取得
    const userAge = document.getElementById('user_age').value.trim();
    
    // 入力値の検証
    if (!userName || !userAge) {
        showError('ニックネームと年齢を入力してください。');
        // 空の入力欄にフォーカスを戻す
        if (!userName) {
            document.getElementById('user_name').focus();
        } else {
            document.getElementById('user_age').focus();
        }
        return;
    }
    
    // 入力情報をコンソールに出力（デバッグ用）
    console.log(userName, userAge);
    
    // 次のページに遷移（URLパラメータで情報を渡す）
    window.location.href = `next.html?name=${encodeURIComponent(userName)}&age=${encodeURIComponent(userAge)}`;
});