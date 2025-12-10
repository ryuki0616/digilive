// ============================================
// URLパラメータから登録情報を取得
// ============================================

// URLパラメータから登録情報を取得
// 例: next.html?name=太郎&age=25 のようなURLから情報を取得
// window.location.search：URLの「?」以降の部分を取得（例：「?name=太郎&age=25」）
// URLSearchParams：URLパラメータを扱うためのオブジェクト
const urlParams = new URLSearchParams(window.location.search);

// get()：パラメータの値を取得する関数
// 'name'：パラメータ名（例：?name=太郎 の「name」部分）
const name = urlParams.get('name');
const age = urlParams.get('age');

// ============================================
// ボックスの名前を管理する変数
// ============================================

// ボックスの上に表示される名前を変数で管理します
// ここで値を変更すると、ページ上のラベルに自動的に反映されます
const boxNames = {
    // 上部左側のボックスの名前
    topBox1: 'ユーザーネーム',
    // 上部右側のボックスの名前
    topBox2: '所持金',
    // メイングリッドのボックス（1行目）の名前
    box1: 'パワー',
    box2: 'スタミナ',
    box3: 'スピード',
    // メイングリッドのボックス（2行目）の名前
    box4: 'テクニック',
    box5: 'ラック',
    box6: 'クラス'
};

// ============================================
// ボックスのテキストを管理する変数
// ============================================

// ボックス内に表示するテキストを変数で管理します
// ここで値を変更すると、ページ上のボックスに自動的に反映されます

// 上部の2つのボックスのテキスト
const boxTexts = {
    // 上部左側のボックス：index.htmlで入力されたニックネームを表示
    // nameが存在する場合はその値を使用し、ない場合はデフォルト値を表示
    topBox1: name || 'トップボックス 1',
    // 上部右側のボックス
    topBox2: 100,
    // メイングリッドのボックス（1行目）
    box1: 1,
    box2: 1,
    box3: 1,
    // メイングリッドのボックス（2行目）
    box4: 1,
    box5: 1,
    box6: 1
};

// ============================================
// ボックスの名前を設定する関数
// ============================================

// ページが読み込まれたときに、変数の値をラベルに設定する関数
function updateBoxNames() {
    // 各ラベルの要素を取得して、名前を設定します
    
    // 上部のボックス1のラベルを設定
    const labelTopBox1 = document.getElementById('label-top-box-1');
    if (labelTopBox1) {
        labelTopBox1.textContent = boxNames.topBox1;
    }
    
    // 上部のボックス2のラベルを設定
    const labelTopBox2 = document.getElementById('label-top-box-2');
    if (labelTopBox2) {
        labelTopBox2.textContent = boxNames.topBox2;
    }
    
    // メイングリッドのボックス1のラベルを設定
    const labelBox1 = document.getElementById('label-box-1');
    if (labelBox1) {
        labelBox1.textContent = boxNames.box1;
    }
    
    // メイングリッドのボックス2のラベルを設定
    const labelBox2 = document.getElementById('label-box-2');
    if (labelBox2) {
        labelBox2.textContent = boxNames.box2;
    }
    
    // メイングリッドのボックス3のラベルを設定
    const labelBox3 = document.getElementById('label-box-3');
    if (labelBox3) {
        labelBox3.textContent = boxNames.box3;
    }
    
    // メイングリッドのボックス4のラベルを設定
    const labelBox4 = document.getElementById('label-box-4');
    if (labelBox4) {
        labelBox4.textContent = boxNames.box4;
    }
    
    // メイングリッドのボックス5のラベルを設定
    const labelBox5 = document.getElementById('label-box-5');
    if (labelBox5) {
        labelBox5.textContent = boxNames.box5;
    }
    
    // メイングリッドのボックス6のラベルを設定
    const labelBox6 = document.getElementById('label-box-6');
    if (labelBox6) {
        labelBox6.textContent = boxNames.box6;
    }
}

// ============================================
// ボックスのテキストを設定する関数
// ============================================

// ページが読み込まれたときに、変数の値をボックスに設定する関数
function updateBoxTexts() {
    // 各ボックスの要素を取得して、テキストを設定します
    
    // 上部のボックス1のテキストを設定
    const topBox1Element = document.getElementById('top-box-1');
    if (topBox1Element) {
        topBox1Element.textContent = boxTexts.topBox1;
    }
    
    // 上部のボックス2のテキストを設定
    const topBox2Element = document.getElementById('top-box-2');
    if (topBox2Element) {
        topBox2Element.textContent = boxTexts.topBox2;
    }
    
    // メイングリッドのボックス1のテキストを設定
    const box1Element = document.getElementById('box-1');
    if (box1Element) {
        box1Element.textContent = boxTexts.box1;
    }
    
    // メイングリッドのボックス2のテキストを設定
    const box2Element = document.getElementById('box-2');
    if (box2Element) {
        box2Element.textContent = boxTexts.box2;
    }
    
    // メイングリッドのボックス3のテキストを設定
    const box3Element = document.getElementById('box-3');
    if (box3Element) {
        box3Element.textContent = boxTexts.box3;
    }
    
    // メイングリッドのボックス4のテキストを設定
    const box4Element = document.getElementById('box-4');
    if (box4Element) {
        box4Element.textContent = boxTexts.box4;
    }
    
    // メイングリッドのボックス5のテキストを設定
    const box5Element = document.getElementById('box-5');
    if (box5Element) {
        box5Element.textContent = boxTexts.box5;
    }
    
    // メイングリッドのボックス6のテキストを設定
    const box6Element = document.getElementById('box-6');
    if (box6Element) {
        box6Element.textContent = boxTexts.box6;
    }
}

// ページが読み込まれたときに、ボックスの名前とテキストを設定する
// DOMContentLoaded：HTMLの読み込みが完了したときに実行されるイベント
document.addEventListener('DOMContentLoaded', () => {
    updateBoxNames();  // まずボックスの名前を設定
    updateBoxTexts();  // 次にボックスのテキストを設定
});

// ============================================
// 戻るボタンの処理
// ============================================

// 「戻る」ボタンの要素を取得
// document.getElementById()：HTML内のIDで要素を探して取得する関数
const backButton = document.getElementById('back_button');

// 「戻る」ボタンがクリックされたときの処理
// if文：backButtonが存在する場合のみ処理を実行（エラーを防ぐため）
if (backButton) {
    // addEventListener()：要素にイベント（クリックなど）が発生したときの処理を設定
    // 'click'：クリックイベント
    // () => { ... }：アロー関数（関数の短い書き方）
    backButton.addEventListener('click', () => {
        // 前のページ（index.html）に戻る
        // window.location.href：現在のページのURLを変更する（ページ遷移）
        window.location.href = 'index.html';
    });
}

// ============================================
// モーダルダイアログの制御
// ============================================

// 数値入力モーダルを表示する関数
function showNumberInputModal(message, targetBoxes) {
    // モーダルの要素を取得
    const modal = document.getElementById('number-input-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const inputField = document.getElementById('number-input-field');
    
    // 要素が存在しない場合はエラー
    if (!modal || !modalTitle || !modalMessage || !inputField) {
        console.error('❌ モーダルの要素が見つかりません');
        alert('❌ エラー：モーダルの要素が見つかりません');
        return;
    }
    
    // モーダルのタイトルとメッセージを設定
    modalTitle.textContent = '数値変更';
    modalMessage.textContent = message;
    
    // 入力フィールドをクリア
    inputField.value = '';
    
    // モーダルを表示
    modal.style.display = 'flex';
    
    // 入力フィールドにフォーカスを設定
    setTimeout(() => {
        inputField.focus();
    }, 100);
    
    // モーダルを閉じる関数
    const closeModal = () => {
        modal.style.display = 'none';
        // コマンド実行後、履歴をリセット
        keySequence = [];
        typedString = '';
    };
    
    // 数値を適用する関数
    const applyValues = () => {
        // 入力された文字列を取得
        const userInput = inputField.value.trim();
        
        // 入力が空の場合、エラーメッセージを表示
        if (userInput === '') {
            alert('❌ 数値が入力されていません。');
            inputField.focus();
            return;
        }
        
        // カンマで区切って配列に変換
        const values = userInput.split(',').map(v => v.trim());
        
        // 各ボックスに値を設定
        values.forEach((value, index) => {
            if (index < targetBoxes.length) {
                const numValue = Number(value);
                if (!isNaN(numValue)) {
                    boxTexts[targetBoxes[index]] = numValue;
                } else {
                    boxTexts[targetBoxes[index]] = value;
                }
            }
        });
        
        // ボックスの表示を更新
        updateBoxTexts();
        
        // 成功メッセージを表示
        alert(`✅ 数値を変更しました！\n\n入力された値: ${values.join(', ')}`);
        
        // モーダルを閉じる
        closeModal();
    };
    
    // イベントリスナーを設定（一度だけ設定するため、既存のリスナーを削除）
    const applyButton = document.getElementById('modal-apply-btn');
    const cancelButton = document.getElementById('modal-cancel-btn');
    const closeButton = document.getElementById('modal-close-btn');
    
    // 既存のイベントリスナーを削除するために、要素をクローンして置き換え
    const newApplyBtn = applyButton.cloneNode(true);
    const newCancelBtn = cancelButton.cloneNode(true);
    const newCloseBtn = closeButton.cloneNode(true);
    applyButton.parentNode.replaceChild(newApplyBtn, applyButton);
    cancelButton.parentNode.replaceChild(newCancelBtn, cancelButton);
    closeButton.parentNode.replaceChild(newCloseBtn, closeButton);
    
    // 新しい要素にイベントリスナーを設定
    newApplyBtn.addEventListener('click', applyValues);
    newCancelBtn.addEventListener('click', closeModal);
    newCloseBtn.addEventListener('click', closeModal);
    
    // 背景をクリックしたときもモーダルを閉じる（一度だけ設定）
    const handleBackgroundClick = (event) => {
        // モーダルのコンテンツ部分をクリックした場合は閉じない
        if (event.target === modal) {
            closeModal();
            modal.removeEventListener('click', handleBackgroundClick);
        }
    };
    modal.addEventListener('click', handleBackgroundClick);
    
    // Enterキーで適用、Escapeキーでキャンセル（一度だけ設定）
    const handleKeydown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            applyValues();
            inputField.removeEventListener('keydown', handleKeydown);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            closeModal();
            inputField.removeEventListener('keydown', handleKeydown);
        }
    };
    inputField.addEventListener('keydown', handleKeydown);
}

// ============================================
// 隠しコマンドの実装
// ============================================

// 隠しコマンド用の変数
// 入力されたキーの履歴を保存する配列
let keySequence = [];
// 入力された文字列を保存する変数
let typedString = '';
// 最後にキーが押された時刻を保存する変数（タイムアウト用）
let lastKeyTime = Date.now();

// 隠しコマンドが実行されたときに呼ばれる関数
function executeSecretCommand(commandType) {
    // コンソールにメッセージを表示（開発者ツールで確認可能）
    console.log(`🎉 隠しコマンド発動！: ${commandType}`);
    
    // リセットコマンドの場合は、数値入力なしでリセット処理を実行
    if (commandType === 'reset') {
        // リセットコマンドが発動したときの処理
        boxTexts.topBox1 = name || 'トップボックス 1';
        boxTexts.topBox2 = 100;
        boxTexts.box1 = 1;
        boxTexts.box2 = 1;
        boxTexts.box3 = 1;
        boxTexts.box4 = 1;
        boxTexts.box5 = 1;
        boxTexts.box6 = 1;
        updateBoxTexts();
        
        // アラートでリセット完了を表示
        alert('🔄 リセット完了！');
        
        // コマンド実行後、履歴をリセット
        keySequence = [];
        typedString = '';
        return; // 処理を終了
    }
    
    // ============================================
    // 数値入力プロンプトの表示
    // ============================================
    
    // コマンドに応じたメッセージを設定
    let promptMessage = '';
    let targetBoxes = [];
    
    if (commandType === 'konami') {
        promptMessage = '🎉 コナミコマンド発動！\n\n変更する数値を入力してください：\n\n例：100, 200, 10, 20, 30, 40, 50, 60\n（カンマ区切りで複数入力可能）';
        targetBoxes = ['topBox1', 'topBox2', 'box1', 'box2', 'box3', 'box4', 'box5', 'box6'];
    } else if (commandType === 'secret') {
        promptMessage = '🔐 シークレットコマンド発動！\n\n変更する数値を入力してください：\n\n例：100, 200, 10, 20, 30, 40, 50, 60\n（カンマ区切りで複数入力可能）';
        targetBoxes = ['topBox1', 'topBox2', 'box1', 'box2', 'box3', 'box4', 'box5', 'box6'];
    } else {
        // 未知のコマンドタイプの場合
        console.error('❌ 未知のコマンドタイプ:', commandType);
        alert(`❌ エラー：未知のコマンドタイプ「${commandType}」です。`);
        return;
    }
    
    // モーダルダイアログを表示する
    showNumberInputModal(promptMessage, targetBoxes);
}

// コナミコマンドのパターン（上上下下左右左右BA）
// ArrowUp：上矢印キー、ArrowDown：下矢印キー、ArrowLeft：左矢印キー、ArrowRight：右矢印キー
// 'a'：Aキー、'b'：Bキー
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

// キーボードリスナーが既に設定されているかどうかを示すフラグ
// 重複登録を防ぐために使用します
let keyboardListenersSetup = false;

// キーボードイベントリスナーを設定する関数
function setupKeyboardListeners() {
    // 既に設定されている場合は、重複登録を防ぐために処理を終了
    if (keyboardListenersSetup) {
        console.log('⚠️ キーボードリスナーは既に設定されています（重複登録を防止）');
        return;
    }
    
    // フラグを設定して、これ以降は登録されないようにする
    keyboardListenersSetup = true;
    
    // キーボードのキーが押されたときに実行される処理
    document.addEventListener('keydown', (event) => {
        // event：キーボードイベントの情報が入ったオブジェクト
        // event.key：押されたキーの名前
        
        // デバッグ用：押されたキーをコンソールに表示（開発者ツールで確認可能）
        // コメントアウトを外すと、押されたキーがすべて表示されます
        console.log('押されたキー:', event.key, '| 履歴:', keySequence.slice(-5));
        
        // 現在の時刻を取得
        const currentTime = Date.now();
        
        // 3秒以上経過していたら、履歴をリセット（タイムアウト）
        // 3000：3秒（ミリ秒）
        if (currentTime - lastKeyTime > 3000) {
            keySequence = [];
            typedString = '';
        }
        
        // 最後にキーが押された時刻を更新
        lastKeyTime = currentTime;
    
    // ============================================
    // コナミコマンドの検出
    // ============================================
    
    // 押されたキーを履歴に追加
    keySequence.push(event.key);
    
    // 履歴が長すぎる場合は、古いものを削除（最新の20個だけ保持）
    if (keySequence.length > 20) {
        keySequence.shift(); // shift()：配列の最初の要素を削除
    }
    
    // コナミコマンドのパターンと一致するかチェック
    // slice(-konamiCode.length)：配列の最後のN個を取得（Nはコナミコマンドの長さ）
    // every()：すべての要素が条件を満たすかチェック
    // (key, index) => key === konamiCode[index]：各要素がコナミコマンドの対応する位置のキーと一致するか
    const recentKeys = keySequence.slice(-konamiCode.length);
    if (recentKeys.length === konamiCode.length && 
        recentKeys.every((key, index) => key === konamiCode[index])) {
        // コナミコマンドが検出された！
        executeSecretCommand('konami');
        return; // 処理を終了
    }
    
    // ============================================
    // 文字列入力による隠しコマンドの検出
    // ============================================
    
    // 通常の文字キー（a-z, A-Z, 0-9など）が押された場合
    // event.key.length === 1：1文字のキー（特殊キーではない）
    if (event.key.length === 1) {
        // 入力された文字を文字列に追加
        typedString += event.key.toLowerCase(); // toLowerCase()：小文字に変換
        
        // 文字列が長すぎる場合は、古いものを削除（最新の20文字だけ保持）
        if (typedString.length > 20) {
            typedString = typedString.slice(-20); // slice(-20)：最後の20文字を取得
        }
        
        // 'secret'という文字列が入力されたかチェック
        if (typedString.includes('secret')) {
            executeSecretCommand('secret');
            return; // 処理を終了
        }
        
        // 'reset'という文字列が入力されたかチェック
        if (typedString.includes('reset')) {
            executeSecretCommand('reset');
            return; // 処理を終了
        }
    }
    
    // ============================================
    // 特定のキーの組み合わせによる隠しコマンド
    // ============================================
    
    // Ctrl+Shift+S：シークレットコマンド
    // event.ctrlKey：Ctrlキーが押されている
    // event.shiftKey：Shiftキーが押されている
    // event.key === 's'：Sキーが押されている
    if (event.ctrlKey && event.shiftKey && event.key === 's') {
        event.preventDefault(); // デフォルトの動作を防ぐ（保存ダイアログを表示しない）
        executeSecretCommand('secret');
        return; // 処理を終了
    }
    
    // Ctrl+Shift+R：リセットコマンド
    if (event.ctrlKey && event.shiftKey && event.key === 'r') {
        event.preventDefault(); // デフォルトの動作を防ぐ
        executeSecretCommand('reset');
        return; // 処理を終了
    }
    
    // ============================================
    // 簡単なテスト用コマンド（デバッグ用）
    // ============================================
    
    // F12キー：シークレットコマンドを実行（テスト用）
    // F12：F12キーの名前
    if (event.key === 'F12') {
        event.preventDefault(); // デフォルトの動作を防ぐ（開発者ツールを開かない）
        console.log('F12キーが押されました - シークレットコマンドを実行します');
        executeSecretCommand('secret');
        return; // 処理を終了
    }
    
    // F11キー：リセットコマンドを実行（テスト用）
    if (event.key === 'F11') {
        event.preventDefault(); // デフォルトの動作を防ぐ（全画面表示をしない）
        console.log('F11キーが押されました - リセットコマンドを実行します');
        executeSecretCommand('reset');
        return; // 処理を終了
    }
    });
    
    // デバッグ用：キーボードリスナーが設定されたことを表示
    console.log('✅ 隠しコマンドのキーボードリスナーが設定されました');
}

// ページが読み込まれたときに、キーボードリスナーを設定する
// DOMContentLoaded：HTMLの読み込みが完了したときに実行されるイベント
// または、既に読み込み完了している場合は、すぐに設定
if (document.readyState === 'loading') {
    // まだ読み込み中の場合は、DOMContentLoadedを待つ
    document.addEventListener('DOMContentLoaded', setupKeyboardListeners);
} else {
    // 既に読み込み完了している場合は、すぐに設定
    setupKeyboardListeners();
}

// ============================================
// URLパラメータから取得した情報を表示（オプション）
// ============================================

// nameとageの両方が存在する場合のみ処理を実行
// &&：AND演算子（両方の条件が真の場合のみ）
if (name && age) {
    // 結果メッセージを表示する要素を取得
    const resultMessage = document.getElementById('result-message');
    
    // 要素が存在する場合のみ処理を実行（エラーを防ぐため）
    if (resultMessage) {
        // innerHTML：要素の中身（HTML）を設定する
        // テンプレートリテラル（`...`）：文字列の中に変数を埋め込める
        // ${name}：変数nameの値を文字列に埋め込む
        // <br>：改行タグ
        resultMessage.innerHTML = `登録が完了しました！<br>ニックネーム: ${name}<br>年齢: ${age}`;
    }
}

// ============================================
// NFC書き込み処理
// ============================================

// 「NFCカードに登録」ボタンの要素を取得
const writeNfcButton = document.getElementById('write-nfc-button');
const nfcWriteStatus = document.getElementById('nfc-write-status');

if (writeNfcButton && nfcWriteStatus) {
    // ボタンがクリックされたときの処理
    writeNfcButton.addEventListener('click', () => {
        console.log('NFC書き込みボタンがクリックされました');
        nfcWriteStatus.textContent = 'NFCカードをリーダーにタッチしてください...';
        
        // メインプロセスに書き込みをリクエスト
        // boxTextsオブジェクトのデータを送信
        // ageも含めて送信する
        const dataToSend = { ...boxTexts, age: age };
        window.electronAPI.writeNfcData(dataToSend);
    });
    
    // メインプロセスから書き込み結果を受信
    window.electronAPI.onWriteNfcResult((result) => {
        console.log('NFC書き込み結果:', result);
        
        // 書き込みが成功したかどうかを判定 (成功メッセージは '✅' で始まると仮定)
        if (result.startsWith('✅')) {
            // 成功した場合
            // ステータスメッセージを更新
            nfcWriteStatus.textContent = '✅ 書き込み成功！3秒後にトップページに戻ります...';
            nfcWriteStatus.style.color = '#00ff00'; // 緑色にする

            // 3秒後に最初のページ (index.html) にリダイレクト
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        } else {
            // 失敗した場合
            // 結果をステータスエリアに表示
            nfcWriteStatus.textContent = result;
            
            // 5秒後にメッセージをクリア（オプション）
            setTimeout(() => {
                nfcWriteStatus.textContent = '';
            }, 5000);
        }
    });
}
