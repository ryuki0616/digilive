/**
 * データベース表示ページ用のJavaScript
 * テーブル詳細の表示、ER図の生成、インタラクティブな機能を提供
 */

// データベーススキーマの定義
const databaseSchema = {
    participants: {
        name: "参加者テーブル",
        description: "NFCカードと連携した参加者情報とステータス管理",
        fields: [
            { name: "participant_id", type: "INT", constraint: "PK", description: "参加者ID" },
            { name: "nfc_card_id", type: "VARCHAR", constraint: "UNIQUE", description: "NFCカードID" },
            { name: "nickname", type: "VARCHAR", constraint: "NOT NULL", description: "ニックネーム" },
            { name: "age", type: "INT", constraint: "NOT NULL", description: "年齢" },
            { name: "power", type: "INT", constraint: "DEFAULT 0", description: "パワー" },
            { name: "stamina", type: "INT", constraint: "DEFAULT 0", description: "スタミナ" },
            { name: "speed", type: "INT", constraint: "DEFAULT 0", description: "スピード" },
            { name: "technique", type: "INT", constraint: "DEFAULT 0", description: "テクニック" },
            { name: "luck", type: "INT", constraint: "DEFAULT 0", description: "ラック" },
            { name: "money", type: "INT", constraint: "DEFAULT 0", description: "所持金" },
            { name: "created_at", type: "DATETIME", constraint: "DEFAULT CURRENT_TIMESTAMP", description: "登録日時" },
            { name: "updated_at", type: "DATETIME", constraint: "DEFAULT CURRENT_TIMESTAMP ON UPDATE", description: "更新日時" }
        ]
    },
    booths: {
        name: "ブーステーブル",
        description: "ゲームブースとショップブースの情報管理",
        fields: [
            { name: "booth_id", type: "INT", constraint: "PK", description: "ブースID" },
            { name: "booth_name", type: "VARCHAR", constraint: "NOT NULL", description: "ブース名" },
            { name: "description", type: "TEXT", constraint: "", description: "説明" },
            { name: "booth_type", type: "VARCHAR", constraint: "NOT NULL", description: "ブースタイプ" }
        ]
    },
    activity_logs: {
        name: "活動ログテーブル",
        description: "参加者の活動履歴とステータス変動の記録",
        fields: [
            { name: "log_id", type: "INT", constraint: "PK", description: "ログID" },
            { name: "participant_id", type: "INT", constraint: "FK", description: "参加者ID" },
            { name: "booth_id", type: "INT", constraint: "FK", description: "ブースID" },
            { name: "money_change", type: "INT", constraint: "DEFAULT 0", description: "所持金変動" },
            { name: "power_change", type: "INT", constraint: "DEFAULT 0", description: "パワー変動" },
            { name: "stamina_change", type: "INT", constraint: "DEFAULT 0", description: "スタミナ変動" },
            { name: "speed_change", type: "INT", constraint: "DEFAULT 0", description: "スピード変動" },
            { name: "technique_change", type: "INT", constraint: "DEFAULT 0", description: "テクニック変動" },
            { name: "luck_change", type: "INT", constraint: "DEFAULT 0", description: "ラック変動" },
            { name: "created_at", type: "DATETIME", constraint: "DEFAULT CURRENT_TIMESTAMP", description: "記録日時" }
        ]
    },
    shop_items: {
        name: "ショップアイテムテーブル",
        description: "ステータスアップアイテムの情報管理",
        fields: [
            { name: "item_id", type: "INT", constraint: "PK", description: "アイテムID" },
            { name: "item_name", type: "VARCHAR", constraint: "NOT NULL", description: "アイテム名" },
            { name: "price", type: "INT", constraint: "NOT NULL", description: "価格" },
            { name: "effect_type", type: "VARCHAR", constraint: "NOT NULL", description: "効果タイプ" },
            { name: "effect_value", type: "INT", constraint: "NOT NULL", description: "効果値" },
            { name: "description", type: "TEXT", constraint: "", description: "説明" }
        ]
    },
    purchase_logs: {
        name: "購入ログテーブル",
        description: "ショップでの購入履歴を管理",
        fields: [
            { name: "purchase_id", type: "INT", constraint: "PK", description: "購入ID" },
            { name: "participant_id", type: "INT", constraint: "FK", description: "参加者ID" },
            { name: "item_id", type: "INT", constraint: "FK", description: "アイテムID" },
            { name: "quantity", type: "INT", constraint: "DEFAULT 1", description: "数量" },
            { name: "total_price", type: "INT", constraint: "NOT NULL", description: "合計価格" },
            { name: "created_at", type: "DATETIME", constraint: "DEFAULT CURRENT_TIMESTAMP", description: "購入日時" }
        ]
    }
};

/**
 * ページ読み込み完了時の初期化処理
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('データベース表示ページを初期化中...');
    
    // サイドバーの初期化
    initializeSidebar();
    
    // ER図の生成
    generateERDiagram();
    
    // テーブル詳細の初期表示
    showTableDetail('participants');
    
    // タブボタンのイベントリスナー設定
    setupTabButtons();
    
    // 統計情報の更新
    updateStatistics();
    
    console.log('データベース表示ページの初期化が完了しました');
});

/**
 * サイドバーの初期化処理
 * @description サイドバーの開閉機能とテーブル選択機能を設定
 */
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarOpenBtn = document.getElementById('sidebarOpenBtn');
    const tableItems = document.querySelectorAll('.table-item');
    
    // サイドバーオーバーレイを作成
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    
    // サイドバーを開くボタンのイベントリスナー
    if (sidebarOpenBtn) {
        sidebarOpenBtn.addEventListener('click', function() {
            openSidebar();
        });
    }
    
    // サイドバーを閉じるボタンのイベントリスナー
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            closeSidebar();
        });
    }
    
    // オーバーレイクリックでサイドバーを閉じる
    overlay.addEventListener('click', function() {
        closeSidebar();
    });
    
    // テーブルアイテムのクリックイベント
    tableItems.forEach(item => {
        item.addEventListener('click', function() {
            const tableName = this.getAttribute('data-table');
            
            // アクティブなアイテムを更新
            tableItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // テーブル詳細を表示
            showTableDetail(tableName);
            
            // タブボタンも更新
            updateTabButtons(tableName);
            
            // モバイルの場合はサイドバーを閉じる
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });
    
    // ESCキーでサイドバーを閉じる
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
    
    console.log('サイドバーの初期化が完了しました');
}

/**
 * サイドバーを開く関数
 * @description サイドバーとオーバーレイを表示
 */
function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // スクロールを無効化
    
    console.log('サイドバーを開きました');
}

/**
 * サイドバーを閉じる関数
 * @description サイドバーとオーバーレイを非表示
 */
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = ''; // スクロールを有効化
    
    console.log('サイドバーを閉じました');
}

/**
 * タブボタンを更新する関数
 * @param {string} tableName - アクティブにするテーブル名
 * @description サイドバーでテーブルを選択したときにタブボタンも同期
 */
function updateTabButtons(tableName) {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-table') === tableName) {
            button.classList.add('active');
        }
    });
}

/**
 * ER図を動的に生成する関数
 * @description テーブル間の関係性を視覚的に表示
 */
function generateERDiagram() {
    const erDiagramContainer = document.getElementById('erDiagram');
    
    // ER図のHTMLを生成
    const erDiagramHTML = `
        <div class="er-diagram-content">
            <div class="er-table participants-table">
                <div class="table-header">👥 participants</div>
                <div class="table-fields">
                    <div class="field pk">participant_id (PK)</div>
                    <div class="field">nfc_card_id</div>
                    <div class="field">nickname</div>
                    <div class="field">money</div>
                </div>
            </div>
            
            <div class="er-relationship">
                <div class="relationship-line">1</div>
                <div class="relationship-label">has</div>
                <div class="relationship-line">∞</div>
            </div>
            
            <div class="er-table activity-table">
                <div class="table-header">📈 activity_logs</div>
                <div class="table-fields">
                    <div class="field pk">log_id (PK)</div>
                    <div class="field fk">participant_id (FK)</div>
                    <div class="field fk">booth_id (FK)</div>
                    <div class="field">money_change</div>
                </div>
            </div>
            
            <div class="er-relationship">
                <div class="relationship-line">1</div>
                <div class="relationship-label">related to</div>
                <div class="relationship-line">∞</div>
            </div>
            
            <div class="er-table booths-table">
                <div class="table-header">🎮 booths</div>
                <div class="table-fields">
                    <div class="field pk">booth_id (PK)</div>
                    <div class="field">booth_name</div>
                    <div class="field">booth_type</div>
                </div>
            </div>
            
            <div class="er-relationship">
                <div class="relationship-line">1</div>
                <div class="relationship-label">buys</div>
                <div class="relationship-line">∞</div>
            </div>
            
            <div class="er-table purchase-table">
                <div class="table-header">🛒 purchase_logs</div>
                <div class="table-fields">
                    <div class="field pk">purchase_id (PK)</div>
                    <div class="field fk">participant_id (FK)</div>
                    <div class="field fk">item_id (FK)</div>
                    <div class="field">total_price</div>
                </div>
            </div>
            
            <div class="er-relationship">
                <div class="relationship-line">1</div>
                <div class="relationship-label">is purchased</div>
                <div class="relationship-line">∞</div>
            </div>
            
            <div class="er-table shop-table">
                <div class="table-header">🛍️ shop_items</div>
                <div class="table-fields">
                    <div class="field pk">item_id (PK)</div>
                    <div class="field">item_name</div>
                    <div class="field">price</div>
                    <div class="field">effect_type</div>
                </div>
            </div>
        </div>
    `;
    
    erDiagramContainer.innerHTML = erDiagramHTML;
    
    // ER図のスタイルを動的に追加
    addERDiagramStyles();
}

/**
 * ER図のスタイルを動的に追加する関数
 * @description ER図の見た目を整えるためのCSSを追加
 */
function addERDiagramStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .er-diagram-content {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            padding: 2rem;
            align-items: start;
        }
        
        .er-table {
            background: #ffffff;
            border: 2px solid #333333;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }
        
        .er-table:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        
        .table-header {
            background: #000000;
            color: #ffffff;
            padding: 1rem;
            font-weight: 600;
            text-align: center;
            font-size: 1.1rem;
        }
        
        .table-fields {
            padding: 1rem;
        }
        
        .field {
            padding: 0.5rem;
            margin-bottom: 0.5rem;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
        }
        
        .field.pk {
            background: #e74c3c;
            color: #ffffff;
            font-weight: 600;
        }
        
        .field.fk {
            background: #3498db;
            color: #ffffff;
            font-weight: 600;
        }
        
        .field:not(.pk):not(.fk) {
            background: #f8f9fa;
            color: #333333;
        }
        
        .er-relationship {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100px;
        }
        
        .relationship-line {
            width: 2px;
            height: 20px;
            background: #333333;
            margin: 0.5rem 0;
        }
        
        .relationship-label {
            background: #333333;
            color: #ffffff;
            padding: 0.5rem 1rem;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        @media (max-width: 768px) {
            .er-diagram-content {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .er-relationship {
                flex-direction: row;
                min-height: auto;
            }
            
            .relationship-line {
                width: 20px;
                height: 2px;
                margin: 0 0.5rem;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * タブボタンのイベントリスナーを設定する関数
 * @description テーブル詳細の切り替え機能を提供
 */
function setupTabButtons() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tableName = this.getAttribute('data-table');
            
            // アクティブなタブを更新
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // テーブル詳細を表示
            showTableDetail(tableName);
            
            // サイドバーのアクティブアイテムも更新
            updateSidebarActiveItem(tableName);
        });
    });
}

/**
 * サイドバーのアクティブアイテムを更新する関数
 * @param {string} tableName - アクティブにするテーブル名
 * @description タブボタンでテーブルを選択したときにサイドバーも同期
 */
function updateSidebarActiveItem(tableName) {
    const tableItems = document.querySelectorAll('.table-item');
    
    tableItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-table') === tableName) {
            item.classList.add('active');
        }
    });
}

/**
 * 指定されたテーブルの詳細を表示する関数
 * @param {string} tableName - 表示するテーブル名
 */
function showTableDetail(tableName) {
    const tableContent = document.querySelector('.table-content');
    const tableData = databaseSchema[tableName];
    
    if (!tableData) {
        console.error(`テーブル "${tableName}" のデータが見つかりません`);
        return;
    }
    
    // テーブル詳細のHTMLを生成
    const tableDetailHTML = `
        <div class="table-detail active">
            <div class="table-schema">
                <h3>${tableData.name}</h3>
                <p class="table-description">${tableData.description}</p>
                
                <h4>フィールド一覧</h4>
                <ul class="field-list">
                    ${tableData.fields.map(field => `
                        <li class="field-item">
                            <div class="field-info">
                                <span class="field-name">${field.name}</span>
                                <span class="field-description">${field.description}</span>
                            </div>
                            <div class="field-meta">
                                <span class="field-type">${field.type}</span>
                                ${field.constraint ? `<span class="field-constraint">${field.constraint}</span>` : ''}
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `;
    
    tableContent.innerHTML = tableDetailHTML;
    
    // アニメーション効果を追加
    const tableDetail = tableContent.querySelector('.table-detail');
    tableDetail.style.opacity = '0';
    tableDetail.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        tableDetail.style.transition = 'all 0.3s ease';
        tableDetail.style.opacity = '1';
        tableDetail.style.transform = 'translateY(0)';
    }, 100);
}

/**
 * 統計情報を更新する関数
 * @description データベースの統計情報を動的に計算・表示
 */
function updateStatistics() {
    const totalTables = Object.keys(databaseSchema).length;
    const totalFields = Object.values(databaseSchema).reduce((sum, table) => sum + table.fields.length, 0);
    const totalRelations = 4; // 固定値（participants→activity_logs, booths→activity_logs, participants→purchase_logs, shop_items→purchase_logs）
    const totalIndexes = 8; // 推定値（各テーブルの主キー + 外部キー + ユニークキー）
    
    // 統計値を更新
    document.getElementById('totalTables').textContent = totalTables;
    document.getElementById('totalFields').textContent = totalFields;
    document.getElementById('totalRelations').textContent = totalRelations;
    document.getElementById('totalIndexes').textContent = totalIndexes;
    
    // カウントアップアニメーション
    animateCountUp('totalTables', totalTables);
    animateCountUp('totalFields', totalFields);
    animateCountUp('totalRelations', totalRelations);
    animateCountUp('totalIndexes', totalIndexes);
}

/**
 * カウントアップアニメーションを実行する関数
 * @param {string} elementId - アニメーション対象の要素ID
 * @param {number} targetValue - 目標値
 */
function animateCountUp(elementId, targetValue) {
    const element = document.getElementById(elementId);
    const duration = 2000; // 2秒
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
 * ページのスクロール位置に応じたアニメーション効果
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
    const animatedElements = document.querySelectorAll('.overview-card, .stat-card, .table-content, .diagram-container, .flow-container');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease';
        observer.observe(element);
    });
}

// ページ読み込み完了後にスクロールアニメーションを設定
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(setupScrollAnimations, 500);
});

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

console.log('データベース表示用JavaScriptが読み込まれました');
