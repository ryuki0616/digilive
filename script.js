/* ========================================
   ディジタライブ・アドベンチャー JavaScript
   ======================================== */

/**
 * DOM要素の取得
 * 現在はcontentBoxが削除されているため、将来の機能拡張用に保持
 */
const contentBox = document.getElementById('content');

/**
 * ディジタライブ・アドベンチャー用のメッセージ配列
 * 将来的にコンテンツエリアが追加された際に使用
 */
const adventureMessages = [
    "デジタルとリアルを融合した新しい体験が始まります！",
    "体を動かして、デジタルワールドを探索しよう！",
    "AR技術で現実世界がゲームフィールドに変わります！",
    "友達と一緒に冒険の旅に出かけましょう！",
    "新しい発見があなたを待っています！🌟"
];

// メッセージインデックス（配列の現在位置を管理）
let messageIndex = 0;

/* ========================================
   ページ読み込み時のアニメーション
   ======================================== */

/**
 * DOM読み込み完了時の処理
 * 要素を順番にフェードインアニメーションで表示
 */
document.addEventListener('DOMContentLoaded', function() {
    // コンテナ内の全要素を取得
    const elements = document.querySelectorAll('.container > *');
    
    // 各要素に対して順次アニメーションを適用
    elements.forEach((element, index) => {
        // 初期状態：透明で下にずらす
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        // 遅延を設けてアニメーション実行
        setTimeout(() => {
            element.style.transition = 'all 0.6s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);  // 200ms間隔で順次表示
    });
});

/* ========================================
   キーボードショートカット
   ======================================== */

/**
 * キーボード入力イベントの処理
 * @param {KeyboardEvent} event - キーボードイベント
 */
document.addEventListener('keydown', function(event) {
    switch(event.key.toLowerCase()) {  // 大文字小文字を区別しない
        case 'm':
            // メッセージ変更機能（コンテンツボックスが存在する場合のみ）
            if (contentBox) {
                messageIndex = (messageIndex + 1) % adventureMessages.length;
                
                // スケールダウンアニメーション
                contentBox.style.transform = 'scale(0.95)';
                contentBox.style.opacity = '0.7';
                
                // 150ms後にメッセージを更新してスケールアップ
                setTimeout(() => {
                    contentBox.innerHTML = `<p>${adventureMessages[messageIndex]}</p>`;
                    contentBox.style.transform = 'scale(1)';
                    contentBox.style.opacity = '1';
                }, 150);
            }
            break;
            
        case 'r':
            // ページリセット機能
            location.reload();
            break;
            
        default:
            // その他のキーは何もしない
            break;
    }
});

/* ========================================
   インタラクティブ効果
   ======================================== */

/**
 * マウス移動による視差効果
 * マウスの位置に応じて背景の位置を微妙に変化させる
 * @param {MouseEvent} event - マウスイベント
 */
document.addEventListener('mousemove', function(event) {
    // マウス位置を0-1の範囲で正規化
    const x = event.clientX / window.innerWidth;
    const y = event.clientY / window.innerHeight;
    
    // 背景位置をマウス位置に応じて調整（視差効果）
    document.body.style.backgroundPosition = `${x * 50}% ${y * 50}%`;
});

/* ========================================
   デバッグ・ログ出力
   ======================================== */

/**
 * コンソールにメッセージを表示
 * 開発者向けの情報とキーボードショートカットの説明
 */
console.log('🚀 ディジタライブ・アドベンチャーが開始されました！');
console.log('💡 キーボードショートカット:');
console.log('   M - メッセージ変更（コンテンツエリアが存在する場合）');
console.log('   R - リセット');

/* ========================================
   パフォーマンス監視
   ======================================== */

/**
 * ページ読み込み完了時の処理
 * パフォーマンス監視とデバッグ情報の出力
 */
window.addEventListener('load', function() {
    console.log('⚡ ページの読み込みが完了しました！');
    
    // パフォーマンス情報の出力（デバッグ用）
    if (window.performance && window.performance.timing) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log(`📊 読み込み時間: ${loadTime}ms`);
    }
});
