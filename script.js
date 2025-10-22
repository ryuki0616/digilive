/* 
    🚀 ディジタライブ・アドベンチャー - メインJavaScriptファイル
    ========================================================
    
    このファイルは、デジタルとリアルを融合した新しい体験を提供する
    Webアプリケーションのインタラクティブな機能を実装します。
    
    🎯 主な機能:
    - ページ読み込み時のアニメーション効果
    - キーボードショートカット（Ubuntu愛好家らしい操作感）
    - マウス移動による視差効果（実験的なインタラクション）
    - スムーズなトランジションとアニメーション
    
    🎮 インタラクション設計:
    - 直感的なキーボード操作
    - 視覚的フィードバックの即座の提供
    - ユーザーが楽しめる仕掛けや仕組み
    
    🛠️ 技術的特徴:
    - モダンなJavaScript（ES6+）
    - 非同期処理の適切な使用
    - イベント駆動型のアーキテクチャ
    - パフォーマンスを考慮した実装
    
    📝 開発者メモ:
    - Ubuntu愛好家らしい遊び心のあるコメント
    - 実験的なアプローチで新しい機能を試す
    - オープンソース精神を反映したシンプルな実装
*/

/* ========================================
   グローバル変数と設定
   ======================================== */

// アプリケーションの設定（将来的な拡張を見据えた設計）
const APP_CONFIG = {
    name: 'ディジタライブ・アドベンチャー',
    version: '1.0.0',
    animationDuration: 600,      // アニメーションの持続時間（ms）
    parallaxIntensity: 50,       // 視差効果の強度（%）
    debugMode: false             // デバッグモード（開発時のみ）
};

/* ========================================
   ユーティリティ関数
   ======================================== */

/**
 * デバッグログを出力する関数
 * @param {string} message - ログメッセージ
 * @param {string} type - ログタイプ（info, warn, error）
 */
function debugLog(message, type = 'info') {
    if (APP_CONFIG.debugMode) {
        const timestamp = new Date().toISOString();
        console[type](`[${timestamp}] ${message}`);
    }
}

/**
 * 要素にアニメーション効果を適用する関数
 * @param {HTMLElement} element - アニメーション対象の要素
 * @param {Object} options - アニメーションオプション
 */
function animateElement(element, options = {}) {
    const {
        duration = APP_CONFIG.animationDuration,
        delay = 0,
        from = { opacity: 0, transform: 'translateY(30px)' },
        to = { opacity: 1, transform: 'translateY(0)' }
    } = options;

    // 初期状態を設定
    Object.assign(element.style, from);
    
    // 遅延後にアニメーション実行
    setTimeout(() => {
        element.style.transition = `all ${duration}ms ease-out`;
        Object.assign(element.style, to);
    }, delay);
}

/* ========================================
   ページ初期化処理
   ======================================== */

/**
 * DOM読み込み完了時の処理
 * ページの初期化とアニメーション効果の設定を行う
 */
document.addEventListener('DOMContentLoaded', function() {
    // アプリケーション開始のログ出力（Ubuntu愛好家らしい遊び心）
    console.log('🚀 ディジタライブ・アドベンチャーが開始されました！');
    console.log('💡 Ubuntu精神: 「他者との共存」を大切にした開発スタイル');
    console.log('🎮 キーボードショートカット: R（リロード）, H（ヘルプ）');
    
    debugLog('ページの初期化を開始', 'info');
    
    // コンテンツボックスにアニメーション効果を追加
    const contentBox = document.querySelector('.content-box');
    if (contentBox) {
        debugLog('コンテンツボックスのアニメーションを設定', 'info');
        
        // フェードインアニメーションを適用
        animateElement(contentBox, {
            duration: APP_CONFIG.animationDuration,
            delay: 500,  // 500ms遅延でスムーズな演出
            from: { opacity: '0', transform: 'translateY(30px)' },
            to: { opacity: '1', transform: 'translateY(0)' }
        });
    } else {
        debugLog('コンテンツボックスが見つかりません', 'warn');
    }
    
    debugLog('ページの初期化が完了', 'info');
});

/* ========================================
   キーボードショートカット処理
   ======================================== */

/**
 * キーボード入力イベントの処理
 * Ubuntu愛好家らしい直感的なキーボード操作を提供
 * @param {KeyboardEvent} event - キーボードイベント
 */
document.addEventListener('keydown', function(event) {
    // 大文字小文字を区別しない処理
    const key = event.key.toLowerCase();
    
    debugLog(`キーが押されました: ${key}`, 'info');
    
    switch(key) {
        case 'r':
            // ページリロード（Ubuntuの再起動コマンドにインスパイア）
            console.log('🔄 ページをリロードします...');
            location.reload();
            break;
            
        case 'h':
            // ヘルプメッセージ表示（Ubuntuのhelpコマンドにインスパイア）
            console.log('❓ ヘルプを表示します...');
            showHelpDialog();
            break;
            
        case 'escape':
            // ESCキーでヘルプを閉じる（標準的なUX）
            closeHelpDialog();
            break;
            
        default:
            // その他のキーは何もしない（静かな動作）
            break;
    }
});

/**
 * ヘルプダイアログを表示する関数
 * ユーザーにキーボードショートカットの説明を提供
 */
function showHelpDialog() {
    const helpMessage = `
🎮 ディジタライブ・アドベンチャー キーボードショートカット

R - ページリロード（Ubuntuの再起動コマンドにインスパイア）
H - ヘルプ表示（このダイアログ）
ESC - ヘルプを閉じる

💡 Ubuntu精神: 「他者との共存」を大切にした開発スタイル
🚀 実験的アプローチ: 新しい技術やアイデアを積極的に試す
    `.trim();
    
    // シンプルなアラートでヘルプを表示（将来的にはモーダルダイアログに変更予定）
    alert(helpMessage);
}

/**
 * ヘルプダイアログを閉じる関数
 * 将来的なモーダルダイアログ実装を見据えた設計
 */
function closeHelpDialog() {
    // 現在はアラートを使用しているため、特別な処理は不要
    // 将来的にモーダルダイアログを実装する際に使用
    debugLog('ヘルプダイアログを閉じる', 'info');
}

/* ========================================
   インタラクティブ効果 - 視差効果
   ======================================== */

/**
 * マウス移動による視差効果
 * 実験的なインタラクションでユーザー体験を向上
 * @param {MouseEvent} event - マウスイベント
 */
document.addEventListener('mousemove', function(event) {
    // マウス位置を0-1の範囲で正規化
    const x = event.clientX / window.innerWidth;
    const y = event.clientY / window.innerHeight;
    
    // 視差効果の強度を調整（実験的な値）
    const intensity = APP_CONFIG.parallaxIntensity;
    
    // 背景位置をマウス位置に応じて調整（視差効果）
    document.body.style.backgroundPosition = `${x * intensity}% ${y * intensity}%`;
    
    debugLog(`視差効果を適用: x=${x.toFixed(2)}, y=${y.toFixed(2)}`, 'info');
});

/* ========================================
   パフォーマンス監視とデバッグ
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
        
        // パフォーマンスが悪い場合の警告
        if (loadTime > 3000) {
            console.warn('⚠️ 読み込み時間が長いです。最適化を検討してください。');
        }
    }
    
    debugLog('ページの読み込み処理が完了', 'info');
});

/* ========================================
   将来の拡張用機能（コメントアウト）
   ======================================== */

/* 
将来的に実装予定の機能:

// AR機能の初期化
function initializeAR() {
    console.log('🔮 AR機能を初期化中...');
    // WebXR APIを使用したAR機能の実装
}

// NFC機能の初期化
function initializeNFC() {
    console.log('📱 NFC機能を初期化中...');
    // Web NFC APIを使用したNFC機能の実装
}

// リアルタイムランキング機能
function initializeRanking() {
    console.log('🏆 ランキング機能を初期化中...');
    // WebSocketを使用したリアルタイム通信の実装
}

// PWA機能の初期化
function initializePWA() {
    console.log('📱 PWA機能を初期化中...');
    // Service Workerの登録とオフライン機能の実装
}
*/

/* ========================================
   エラーハンドリング
   ======================================== */

/**
 * グローバルエラーハンドラー
 * 予期しないエラーをキャッチして適切に処理
 */
window.addEventListener('error', function(event) {
    console.error('❌ 予期しないエラーが発生しました:', event.error);
    debugLog(`エラー: ${event.error.message}`, 'error');
    
    // ユーザーに分かりやすいエラーメッセージを表示
    if (APP_CONFIG.debugMode) {
        alert('エラーが発生しました。コンソールを確認してください。');
    }
});

/**
 * 未処理のPromise拒否をキャッチ
 * 非同期処理でのエラーを適切に処理
 */
window.addEventListener('unhandledrejection', function(event) {
    console.error('❌ 未処理のPromise拒否が発生しました:', event.reason);
    debugLog(`Promise拒否: ${event.reason}`, 'error');
    
    // デフォルトの動作を防ぐ
    event.preventDefault();
});

/* ========================================
   アプリケーション終了処理
   ======================================== */

/**
 * ページがアンロードされる前の処理
 * リソースのクリーンアップとデータの保存
 */
window.addEventListener('beforeunload', function(event) {
    debugLog('アプリケーションを終了します', 'info');
    
    // 必要に応じてデータを保存
    // localStorage.setItem('lastVisit', new Date().toISOString());
    
    // クリーンアップ処理
    // cleanupResources();
});

console.log('🎉 ディジタライブ・アドベンチャー JavaScriptが読み込まれました！');
console.log('💡 Ubuntu精神とオープンソース文化を大切にした開発スタイル');
console.log('🚀 実験的アプローチで新しい技術やアイデアを積極的に試す');