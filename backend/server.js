/**
 * デジタライブ・アドベンチャー バックエンドAPI サーバー
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const db = require('./database');

const app = express();
const PORT = config.server.port;

// ミドルウェア設定
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイルの提供（フロントエンド用）
app.use(express.static(path.join(__dirname, '../')));

// ヘルスチェックエンドポイント
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'デジタライブ・アドベンチャー API サーバーが正常に動作しています',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// データベース接続テスト
app.get('/api/db/test', async (req, res) => {
    try {
        const isConnected = await db.testConnection();
        if (isConnected) {
            res.json({
                status: 'success',
                message: 'データベース接続に成功しました'
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'データベース接続に失敗しました'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'データベース接続エラー',
            error: error.message
        });
    }
});

// 参加者データ取得API
app.get('/api/participants', async (req, res) => {
    try {
        const participants = await db.getParticipants();
        res.json({
            status: 'success',
            data: participants,
            count: participants.length
        });
    } catch (error) {
        console.error('参加者データ取得エラー:', error);
        res.status(500).json({
            status: 'error',
            message: '参加者データの取得に失敗しました',
            error: error.message
        });
    }
});

// 特定の参加者データ取得API
app.get('/api/participants/:id', async (req, res) => {
    try {
        const participantId = parseInt(req.params.id);
        if (isNaN(participantId)) {
            return res.status(400).json({
                status: 'error',
                message: '無効な参加者IDです'
            });
        }

        const participant = await db.getParticipantById(participantId);
        if (!participant) {
            return res.status(404).json({
                status: 'error',
                message: '指定された参加者が見つかりません'
            });
        }

        res.json({
            status: 'success',
            data: participant
        });
    } catch (error) {
        console.error('参加者データ取得エラー:', error);
        res.status(500).json({
            status: 'error',
            message: '参加者データの取得に失敗しました',
            error: error.message
        });
    }
});

// ブースデータ取得API
app.get('/api/booths', async (req, res) => {
    try {
        const booths = await db.getBooths();
        res.json({
            status: 'success',
            data: booths,
            count: booths.length
        });
    } catch (error) {
        console.error('ブースデータ取得エラー:', error);
        res.status(500).json({
            status: 'error',
            message: 'ブースデータの取得に失敗しました',
            error: error.message
        });
    }
});

// 活動ログデータ取得API
app.get('/api/activity-logs', async (req, res) => {
    try {
        const activityLogs = await db.getActivityLogs();
        res.json({
            status: 'success',
            data: activityLogs,
            count: activityLogs.length
        });
    } catch (error) {
        console.error('活動ログデータ取得エラー:', error);
        res.status(500).json({
            status: 'error',
            message: '活動ログデータの取得に失敗しました',
            error: error.message
        });
    }
});

// ショップアイテムデータ取得API
app.get('/api/shop-items', async (req, res) => {
    try {
        const shopItems = await db.getShopItems();
        res.json({
            status: 'success',
            data: shopItems,
            count: shopItems.length
        });
    } catch (error) {
        console.error('ショップアイテムデータ取得エラー:', error);
        res.status(500).json({
            status: 'error',
            message: 'ショップアイテムデータの取得に失敗しました',
            error: error.message
        });
    }
});

// 購入ログデータ取得API
app.get('/api/purchase-logs', async (req, res) => {
    try {
        const purchaseLogs = await db.getPurchaseLogs();
        res.json({
            status: 'success',
            data: purchaseLogs,
            count: purchaseLogs.length
        });
    } catch (error) {
        console.error('購入ログデータ取得エラー:', error);
        res.status(500).json({
            status: 'error',
            message: '購入ログデータの取得に失敗しました',
            error: error.message
        });
    }
});

// 統計情報取得API
app.get('/api/stats', async (req, res) => {
    try {
        const [participants, booths, activityLogs, shopItems, purchaseLogs] = await Promise.all([
            db.getParticipants(),
            db.getBooths(),
            db.getActivityLogs(),
            db.getShopItems(),
            db.getPurchaseLogs()
        ]);

        res.json({
            status: 'success',
            data: {
                totalParticipants: participants.length,
                totalBooths: booths.length,
                totalActivityLogs: activityLogs.length,
                totalShopItems: shopItems.length,
                totalPurchaseLogs: purchaseLogs.length
            }
        });
    } catch (error) {
        console.error('統計情報取得エラー:', error);
        res.status(500).json({
            status: 'error',
            message: '統計情報の取得に失敗しました',
            error: error.message
        });
    }
});

// 404エラーハンドリング
app.use('/api/*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: '指定されたAPIエンドポイントが見つかりません'
    });
});

// フロントエンドのルーティング（SPA対応）
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// エラーハンドリング
app.use((error, req, res, next) => {
    console.error('サーバーエラー:', error);
    res.status(500).json({
        status: 'error',
        message: 'サーバー内部エラーが発生しました',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`🚀 デジタライブ・アドベンチャー API サーバーが起動しました`);
    console.log(`📡 ポート: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api/health`);
    
    // データベース接続テスト
    db.testConnection();
});

// グレースフルシャットダウン
process.on('SIGTERM', () => {
    console.log('🛑 サーバーをシャットダウンしています...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 サーバーをシャットダウンしています...');
    process.exit(0);
});
