/**
 * データベース接続テストスクリプト
 * 設定した接続情報が正しいかテストします
 */

const mysql = require('mysql2/promise');
const config = require('./config');

async function testDatabaseConnection() {
    console.log('🔍 データベース接続設定をテストしています...\n');
    
    // 設定情報を表示
    console.log('📋 接続設定:');
    console.log(`   ホスト: ${config.database.host}`);
    console.log(`   ポート: ${config.database.port}`);
    console.log(`   ユーザー: ${config.database.user}`);
    console.log(`   パスワード: ${'*'.repeat(config.database.password.length)}`);
    console.log(`   データベース: ${config.database.database}\n`);

    try {
        // データベース接続をテスト
        const connection = await mysql.createConnection({
            host: config.database.host,
            port: config.database.port,
            user: config.database.user,
            password: config.database.password,
            database: config.database.database,
            charset: config.database.charset,
            timezone: config.database.timezone
        });

        console.log('✅ データベース接続に成功しました！\n');

        // データベースの基本情報を取得
        const [databases] = await connection.execute('SHOW DATABASES');
        console.log('📊 利用可能なデータベース:');
        databases.forEach(db => {
            const marker = db.Database === config.database.database ? '👉' : '  ';
            console.log(`   ${marker} ${db.Database}`);
        });
        console.log('');

        // テーブルの存在確認
        const [tables] = await connection.execute('SHOW TABLES');
        if (tables.length > 0) {
            console.log('📋 存在するテーブル:');
            tables.forEach(table => {
                console.log(`   📄 ${Object.values(table)[0]}`);
            });
            console.log('');

            // participantsテーブルのレコード数を確認
            try {
                const [participants] = await connection.execute('SELECT COUNT(*) as count FROM participants');
                console.log(`👥 participantsテーブルのレコード数: ${participants[0].count}件`);
            } catch (error) {
                console.log('⚠️  participantsテーブルが見つかりません');
            }

            // boothsテーブルのレコード数を確認
            try {
                const [booths] = await connection.execute('SELECT COUNT(*) as count FROM booths');
                console.log(`🎮 boothsテーブルのレコード数: ${booths[0].count}件`);
            } catch (error) {
                console.log('⚠️  boothsテーブルが見つかりません');
            }
        } else {
            console.log('⚠️  テーブルが見つかりません。データベースが空の可能性があります。');
        }

        await connection.end();
        console.log('\n🎉 テストが完了しました！');

    } catch (error) {
        console.error('❌ データベース接続に失敗しました:');
        console.error(`   エラー: ${error.message}\n`);
        
        // よくあるエラーパターンをチェック
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 解決方法:');
            console.log('   1. ユーザー名とパスワードが正しいか確認');
            console.log('   2. ユーザーにデータベースへのアクセス権限があるか確認');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('💡 解決方法:');
            console.log('   1. データベースが存在するか確認');
            console.log('   2. データベース名のスペルが正しいか確認');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('💡 解決方法:');
            console.log('   1. MySQLサーバーが起動しているか確認');
            console.log('   2. ポート番号が正しいか確認');
        } else if (error.code === 'ENOTFOUND') {
            console.log('💡 解決方法:');
            console.log('   1. ホスト名が正しいか確認');
            console.log('   2. ネットワーク接続を確認');
        }
        
        process.exit(1);
    }
}

// テスト実行
testDatabaseConnection();
