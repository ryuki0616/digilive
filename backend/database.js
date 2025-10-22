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


module.exports = {
    pool,
    testConnection,
    executeQuery
};
