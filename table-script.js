/**
 * テーブル詳細ページ用のJavaScript
 * ページの初期化、アニメーション効果、インタラクティブな機能を提供
 */

/**
 * ページ読み込み完了時の初期化処理
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('テーブル詳細ページを初期化中...');
    
    // スクロールアニメーションの設定
    setupScrollAnimations();
    
    // フィールドアイテムのホバー効果設定
    setupFieldHoverEffects();
    
    // SQLコードのコピー機能設定
    setupCodeCopyButtons();
    
    console.log('テーブル詳細ページの初期化が完了しました');
});

/**
 * スクロールアニメーションの設定
 * @description 要素が画面に入ったときにアニメーションを実行
 */
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // アニメーション対象の要素を監視
    const animatedElements = document.querySelectorAll('.overview-card, .field-item, .relationship-card, .example-card');
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(element);
    });
}

/**
 * フィールドアイテムのホバー効果設定
 * @description フィールドアイテムにマウスオーバー時の詳細情報表示
 */
function setupFieldHoverEffects() {
    const fieldItems = document.querySelectorAll('.field-item');
    
    fieldItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            // ホバー時の追加効果
            this.style.borderLeftWidth = '6px';
            this.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
        });
        
        item.addEventListener('mouseleave', function() {
            // ホバー終了時の元に戻す
            this.style.borderLeftWidth = '4px';
            this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        });
    });
}

/**
 * SQLコードのコピー機能設定
 * @description SQLコードブロックにコピーボタンを追加
 */
function setupCodeCopyButtons() {
    const sqlExamples = document.querySelectorAll('.sql-example');
    
    sqlExamples.forEach(example => {
        // コピーボタンを作成
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = '📋 コピー';
        copyButton.title = 'SQLコードをクリップボードにコピー';
        
        // コピーボタンのスタイル
        copyButton.style.cssText = `
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: #333333;
            color: #ffffff;
            border: none;
            border-radius: 5px;
            padding: 0.25rem 0.5rem;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.3s ease;
            opacity: 0;
        `;
        
        // ホバー効果
        copyButton.addEventListener('mouseenter', function() {
            this.style.background = '#555555';
            this.style.transform = 'scale(1.05)';
        });
        
        copyButton.addEventListener('mouseleave', function() {
            this.style.background = '#333333';
            this.style.transform = 'scale(1)';
        });
        
        // コピー機能
        copyButton.addEventListener('click', function() {
            const codeElement = example.querySelector('code');
            const codeText = codeElement.textContent;
            
            // クリップボードにコピー
            navigator.clipboard.writeText(codeText).then(() => {
                // 成功時のフィードバック
                const originalText = this.innerHTML;
                this.innerHTML = '✅ コピー完了';
                this.style.background = '#2ecc71';
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.style.background = '#333333';
                }, 2000);
            }).catch(err => {
                console.error('コピーに失敗しました:', err);
                // フォールバック: テキストエリアを使用
                fallbackCopyTextToClipboard(codeText);
            });
        });
        
        // 親要素を相対位置に設定
        example.style.position = 'relative';
        
        // ホバー時にコピーボタンを表示
        example.addEventListener('mouseenter', function() {
            copyButton.style.opacity = '1';
        });
        
        example.addEventListener('mouseleave', function() {
            copyButton.style.opacity = '0';
        });
        
        // コピーボタンを追加
        example.appendChild(copyButton);
    });
}

/**
 * フォールバック用のコピー機能
 * @param {string} text - コピーするテキスト
 * @description モダンブラウザでない場合のフォールバック
 */
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            console.log('フォールバックコピーが成功しました');
        } else {
            console.error('フォールバックコピーが失敗しました');
        }
    } catch (err) {
        console.error('フォールバックコピーでエラーが発生しました:', err);
    }
    
    document.body.removeChild(textArea);
}

/**
 * テーブル関係の詳細表示機能
 * @description 関係カードをクリックしたときの詳細表示
 */
function setupRelationshipDetails() {
    const relationshipCards = document.querySelectorAll('.relationship-card');
    
    relationshipCards.forEach(card => {
        card.addEventListener('click', function() {
            const tableName = this.querySelector('.table-name').textContent;
            
            // 関係テーブルの詳細ページに遷移
            const tablePageMap = {
                'activity_logs': 'table-activity-logs.html',
                'purchase_logs': 'table-purchase-logs.html',
                'booths': 'table-booths.html',
                'shop_items': 'table-shop-items.html'
            };
            
            const targetPage = tablePageMap[tableName];
            if (targetPage) {
                window.location.href = targetPage;
            }
        });
        
        // クリック可能であることを示すカーソル
        card.style.cursor = 'pointer';
    });
}

/**
 * フィールドタイプの色分け機能
 * @description フィールドタイプに応じた色分け表示
 */
function setupFieldTypeColors() {
    const fieldTypes = document.querySelectorAll('.field-type');
    
    fieldTypes.forEach(typeElement => {
        const type = typeElement.textContent.toLowerCase();
        let backgroundColor = '#333333';
        
        // タイプに応じた色分け
        switch (type) {
            case 'int':
                backgroundColor = '#e74c3c';
                break;
            case 'varchar':
                backgroundColor = '#3498db';
                break;
            case 'text':
                backgroundColor = '#2ecc71';
                break;
            case 'datetime':
                backgroundColor = '#9b59b6';
                break;
            case 'timestamp':
                backgroundColor = '#f39c12';
                break;
            default:
                backgroundColor = '#333333';
        }
        
        typeElement.style.backgroundColor = backgroundColor;
    });
}

/**
 * 統計情報のアニメーション
 * @description 統計数値のカウントアップアニメーション
 */
function animateStatistics() {
    const statValues = document.querySelectorAll('.stat-value');
    
    statValues.forEach(stat => {
        const finalValue = parseInt(stat.textContent);
        if (!isNaN(finalValue)) {
            animateCountUp(stat, finalValue);
        }
    });
}

/**
 * カウントアップアニメーション
 * @param {HTMLElement} element - アニメーション対象の要素
 * @param {number} targetValue - 目標値
 */
function animateCountUp(element, targetValue) {
    const duration = 2000;
    const startTime = performance.now();
    
    function updateCount(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // イージング関数（easeOutQuart）
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(easeOutQuart * targetValue);
        
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateCount);
        }
    }
    
    requestAnimationFrame(updateCount);
}

/**
 * エラーハンドリング関数
 * @param {Error} error - 発生したエラー
 * @param {string} context - エラーが発生したコンテキスト
 */
function handleError(error, context) {
    console.error(`エラーが発生しました (${context}):`, error);
    
    // ユーザーにエラーメッセージを表示
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `
        <div style="background: #e74c3c; color: white; padding: 1rem; border-radius: 5px; margin: 1rem 0;">
            <strong>エラーが発生しました</strong><br>
            ${context}: ${error.message}
        </div>
    `;
    
    document.querySelector('.container').insertBefore(errorMessage, document.querySelector('.container').firstChild);
}

// グローバルエラーハンドラーを設定
window.addEventListener('error', function(event) {
    handleError(event.error, 'グローバルエラー');
});

// 未処理のPromise拒否をキャッチ
window.addEventListener('unhandledrejection', function(event) {
    handleError(event.reason, '未処理のPromise拒否');
});

// ページ読み込み完了後に追加の初期化処理を実行
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        setupRelationshipDetails();
        setupFieldTypeColors();
        animateStatistics();
    }, 500);
});

console.log('テーブル詳細ページ用JavaScriptが読み込まれました');
