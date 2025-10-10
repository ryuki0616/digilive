/**
 * MySQLデータベース接続モジュール
 */

const mysql = require('mysql2/promise');
const config = require('./config');

// 接続プールの作成
const pool = mysql.createPool({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
    charset: config.database.charset,
    timezone: config.database.timezone,
    acquireTimeout: config.database.acquireTimeout,
    timeout: config.database.timeout,
    reconnect: config.database.reconnect,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * データベース接続テスト
 */
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ データベース接続に成功しました');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ データベース接続に失敗しました:', error.message);
        return false;
    }
}

/**
 * クエリ実行のヘルパー関数
 * @param {string} query - SQLクエリ
 * @param {Array} params - パラメータ
 * @returns {Promise<Array>} クエリ結果
 */
async function executeQuery(query, params = []) {
    try {
        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('クエリ実行エラー:', error);
        throw error;
    }
}

/**
 * 参加者データを取得
 * @returns {Promise<Array>} 参加者リスト
 */
async function getParticipants() {
    const query = `
        SELECT 
            participant_id,
            nfc_card_id,
            nickname,
            age,
            power,
            stamina,
            speed,
            technique,
            luck,
            money,
            created_at,
            updated_at
        FROM participants 
        ORDER BY participant_id ASC
    `;
    return await executeQuery(query);
}

/**
 * 特定の参加者データを取得
 * @param {number} participantId - 参加者ID
 * @returns {Promise<Object|null>} 参加者データ
 */
async function getParticipantById(participantId) {
    const query = `
        SELECT 
            participant_id,
            nfc_card_id,
            nickname,
            age,
            power,
            stamina,
            speed,
            technique,
            luck,
            money,
            created_at,
            updated_at
        FROM participants 
        WHERE participant_id = ?
    `;
    const results = await executeQuery(query, [participantId]);
    return results.length > 0 ? results[0] : null;
}

/**
 * ブースデータを取得
 * @returns {Promise<Array>} ブースリスト
 */
async function getBooths() {
    const query = `
        SELECT 
            booth_id,
            booth_name,
            description,
            booth_type
        FROM booths 
        ORDER BY booth_id ASC
    `;
    return await executeQuery(query);
}

/**
 * 活動ログデータを取得
 * @returns {Promise<Array>} 活動ログリスト
 */
async function getActivityLogs() {
    const query = `
        SELECT 
            al.log_id,
            al.participant_id,
            al.booth_id,
            al.money_change,
            al.power_change,
            al.stamina_change,
            al.speed_change,
            al.technique_change,
            al.luck_change,
            al.created_at,
            p.nickname as participant_name,
            b.booth_name
        FROM activity_logs al
        LEFT JOIN participants p ON al.participant_id = p.participant_id
        LEFT JOIN booths b ON al.booth_id = b.booth_id
        ORDER BY al.created_at DESC
    `;
    return await executeQuery(query);
}

/**
 * ショップアイテムデータを取得
 * @returns {Promise<Array>} ショップアイテムリスト
 */
async function getShopItems() {
    const query = `
        SELECT 
            item_id,
            item_name,
            price,
            effect_type,
            effect_value,
            description
        FROM shop_items 
        ORDER BY item_id ASC
    `;
    return await executeQuery(query);
}

/**
 * 購入ログデータを取得
 * @returns {Promise<Array>} 購入ログリスト
 */
async function getPurchaseLogs() {
    const query = `
        SELECT 
            pl.purchase_id,
            pl.participant_id,
            pl.item_id,
            pl.quantity,
            pl.total_price,
            pl.created_at,
            p.nickname as participant_name,
            si.item_name,
            si.effect_type,
            si.effect_value
        FROM purchase_logs pl
        LEFT JOIN participants p ON pl.participant_id = p.participant_id
        LEFT JOIN shop_items si ON pl.item_id = si.item_id
        ORDER BY pl.created_at DESC
    `;
    return await executeQuery(query);
}

module.exports = {
    pool,
    testConnection,
    executeQuery,
    getParticipants,
    getParticipantById,
    getBooths,
    getActivityLogs,
    getShopItems,
    getPurchaseLogs
};
