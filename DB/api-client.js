/**
 * API クライアント
 * バックエンドAPIとの通信を管理
 */

class APIClient {
    constructor(baseURL = 'http://localhost:3001/api') {
        this.baseURL = baseURL;
    }

    /**
     * APIリクエストの基本メソッド
     * @param {string} endpoint - エンドポイント
     * @param {Object} options - リクエストオプション
     * @returns {Promise<Object>} レスポンスデータ
     */
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * サーバーのヘルスチェック
     * @returns {Promise<Object>} ヘルスチェック結果
     */
    async healthCheck() {
        return await this.request('/health');
    }

    /**
     * データベース接続テスト
     * @returns {Promise<Object>} データベース接続結果
     */
    async testDatabaseConnection() {
        return await this.request('/db/test');
    }

    /**
     * 参加者データを取得
     * @returns {Promise<Array>} 参加者リスト
     */
    async getParticipants() {
        const response = await this.request('/participants');
        return response.data;
    }

    /**
     * 特定の参加者データを取得
     * @param {number} participantId - 参加者ID
     * @returns {Promise<Object>} 参加者データ
     */
    async getParticipantById(participantId) {
        const response = await this.request(`/participants/${participantId}`);
        return response.data;
    }

    /**
     * ブースデータを取得
     * @returns {Promise<Array>} ブースリスト
     */
    async getBooths() {
        const response = await this.request('/booths');
        return response.data;
    }

    /**
     * 活動ログデータを取得
     * @returns {Promise<Array>} 活動ログリスト
     */
    async getActivityLogs() {
        const response = await this.request('/activity-logs');
        return response.data;
    }

    /**
     * ショップアイテムデータを取得
     * @returns {Promise<Array>} ショップアイテムリスト
     */
    async getShopItems() {
        const response = await this.request('/shop-items');
        return response.data;
    }

    /**
     * 購入ログデータを取得
     * @returns {Promise<Array>} 購入ログリスト
     */
    async getPurchaseLogs() {
        const response = await this.request('/purchase-logs');
        return response.data;
    }

    /**
     * 統計情報を取得
     * @returns {Promise<Object>} 統計データ
     */
    async getStats() {
        const response = await this.request('/stats');
        return response.data;
    }
}

// グローバルAPIクライアントインスタンス
const apiClient = new APIClient();

/**
 * 参加者テーブルを動的に生成
 * @param {Array} participants - 参加者データ
 */
function generateParticipantsTable(participants) {
    const tableContainer = document.querySelector('.data-table-container');
    if (!tableContainer) {
        console.error('テーブルコンテナが見つかりません');
        return;
    }

    const table = document.createElement('table');
    table.className = 'sample-table';

    // ヘッダー行
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = [
        'participant_id', 'nfc_card_id', 'nickname', 'age',
        'power', 'stamina', 'speed', 'technique', 'luck', 'money',
        'created_at', 'updated_at'
    ];

    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // データ行
    const tbody = document.createElement('tbody');
    participants.forEach(participant => {
        const row = document.createElement('tr');
        const values = [
            participant.participant_id,
            participant.nfc_card_id,
            participant.nickname,
            participant.age,
            participant.power,
            participant.stamina,
            participant.speed,
            participant.technique,
            participant.luck,
            participant.money,
            new Date(participant.created_at).toLocaleString('ja-JP'),
            new Date(participant.updated_at).toLocaleString('ja-JP')
        ];

        values.forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    // 既存のテーブルを置き換え
    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
}

/**
 * ローディング状態を表示
 */
function showLoading() {
    const tableContainer = document.querySelector('.data-table-container');
    if (tableContainer) {
        tableContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
                <div>データを読み込み中...</div>
            </div>
        `;
    }
}

/**
 * エラー状態を表示
 * @param {string} message - エラーメッセージ
 */
function showError(message) {
    const tableContainer = document.querySelector('.data-table-container');
    if (tableContainer) {
        tableContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #e74c3c;">
                <div style="font-size: 2rem; margin-bottom: 1rem;">❌</div>
                <div>エラー: ${message}</div>
                <button onclick="loadParticipantsData()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    再試行
                </button>
            </div>
        `;
    }
}

/**
 * 参加者データを読み込み
 */
async function loadParticipantsData() {
    try {
        showLoading();
        
        // サーバーのヘルスチェック
        await apiClient.healthCheck();
        console.log('✅ サーバーに接続しました');

        // データベース接続テスト
        await apiClient.testDatabaseConnection();
        console.log('✅ データベースに接続しました');

        // 参加者データを取得
        const participants = await apiClient.getParticipants();
        console.log(`✅ ${participants.length}件の参加者データを取得しました`);

        // テーブルを生成
        generateParticipantsTable(participants);

    } catch (error) {
        console.error('❌ データの読み込みに失敗しました:', error);
        showError(error.message);
    }
}

/**
 * 統計情報を更新
 */
async function updateStatistics() {
    try {
        const stats = await apiClient.getStats();
        
        // 統計情報を表示（必要に応じて）
        console.log('📊 統計情報:', stats);
        
    } catch (error) {
        console.error('❌ 統計情報の取得に失敗しました:', error);
    }
}

// グローバル関数として公開
window.apiClient = apiClient;
window.loadParticipantsData = loadParticipantsData;
window.updateStatistics = updateStatistics;
window.generateParticipantsTable = generateParticipantsTable;

console.log('🔌 API クライアントが読み込まれました');
