/**
 * アプリケーション設定ファイル
 */

module.exports = {
    // データベース設定
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'digilive_adventure',
        charset: 'utf8mb4',
        timezone: '+09:00',
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
    },
    
    // サーバー設定
    server: {
        port: process.env.PORT || 3001,
        host: process.env.HOST || 'localhost'
    },
    
    // CORS設定
    cors: {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'file://'
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }
};
