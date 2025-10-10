# デジタライブ・アドベンチャー バックエンドAPI

## 概要

デジタライブ・アドベンチャーの参加者管理システム用のバックエンドAPIサーバーです。MySQLデータベースと連携し、参加者データ、ブース情報、活動ログなどを管理します。

## 必要な環境

- Node.js (v16以上)
- MySQL (v8.0以上)
- npm または yarn

## セットアップ手順

### 1. 依存関係のインストール

```bash
cd backend
npm install
```

### 2. データベースの準備

MySQLでデータベースとテーブルを作成してください：

```sql
-- データベース作成
CREATE DATABASE digilive_adventure CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- データベース選択
USE digilive_adventure;

-- participantsテーブル
CREATE TABLE participants (
    participant_id INT AUTO_INCREMENT PRIMARY KEY,
    nfc_card_id VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    age INT NOT NULL,
    power INT DEFAULT 0,
    stamina INT DEFAULT 0,
    speed INT DEFAULT 0,
    technique INT DEFAULT 0,
    luck INT DEFAULT 0,
    money INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- boothsテーブル
CREATE TABLE booths (
    booth_id INT AUTO_INCREMENT PRIMARY KEY,
    booth_name VARCHAR(100) NOT NULL,
    description TEXT,
    booth_type VARCHAR(20) NOT NULL
);

-- activity_logsテーブル
CREATE TABLE activity_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    participant_id INT NOT NULL,
    booth_id INT NOT NULL,
    money_change INT DEFAULT 0,
    power_change INT DEFAULT 0,
    stamina_change INT DEFAULT 0,
    speed_change INT DEFAULT 0,
    technique_change INT DEFAULT 0,
    luck_change INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_id) REFERENCES participants(participant_id),
    FOREIGN KEY (booth_id) REFERENCES booths(booth_id)
);

-- shop_itemsテーブル
CREATE TABLE shop_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    effect_type VARCHAR(20) NOT NULL,
    effect_value INT NOT NULL,
    description TEXT
);

-- purchase_logsテーブル
CREATE TABLE purchase_logs (
    purchase_id INT AUTO_INCREMENT PRIMARY KEY,
    participant_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT DEFAULT 1,
    total_price INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_id) REFERENCES participants(participant_id),
    FOREIGN KEY (item_id) REFERENCES shop_items(item_id)
);

-- サンプルデータの挿入
INSERT INTO participants (nfc_card_id, nickname, age, power, stamina, speed, technique, luck, money) VALUES
('NFC001', 'リュウキ', 10, 50, 50, 50, 50, 50, 1000),
('NFC002', 'ハナ', 8, 45, 55, 60, 40, 70, 1000),
('NFC003', 'ケンタ', 12, 60, 40, 55, 50, 45, 1000),
('NFC004', 'ユイ', 9, 52, 48, 58, 62, 55, 1000),
('NFC005', 'ソラ', 7, 40, 60, 50, 45, 80, 1000),
('NFC006', 'ダイチ', 11, 70, 30, 45, 55, 50, 1000),
('NFC007', 'ミオ', 10, 48, 52, 53, 58, 65, 1000),
('NFC008', 'ハヤト', 8, 55, 45, 65, 40, 60, 1000),
('NFC009', 'リン', 12, 65, 35, 50, 65, 40, 1000),
('NFC010', 'アカリ', 9, 50, 50, 50, 50, 75, 1000);

INSERT INTO booths (booth_name, description, booth_type) VALUES
('パワーチャージ・ステーション', 'ボタン連打でパワーとスタミナを獲得', 'game'),
('リアクション・スプリンター', '反射神経を鍛えてスピードとテクニックアップ', 'game'),
('トレジャー・ハント', '謎解きでテクニックを向上', 'game'),
('バーチャル・ランナー', 'ランニングでスタミナとスピードを向上', 'game'),
('ミラクル・タッチ', 'ランダムなステータス上昇', 'game'),
('パワーアップショップ', 'ステータスアップアイテムを販売', 'shop');
```

### 3. 環境設定

`config.js`ファイルでデータベース接続情報を設定してください：

```javascript
// config.js を編集
database: {
    host: 'localhost',        // MySQLのホスト
    port: 3306,              // MySQLのポート
    user: 'root',            // MySQLのユーザー名
    password: 'your_password', // MySQLのパスワード
    database: 'digilive_adventure', // データベース名
    // ... その他の設定
}
```

### 4. サーバーの起動

```bash
# 開発モード（自動再起動）
npm run dev

# 本番モード
npm start
```

## API エンドポイント

### ヘルスチェック
- `GET /api/health` - サーバーの状態確認
- `GET /api/db/test` - データベース接続テスト

### 参加者管理
- `GET /api/participants` - 全参加者データ取得
- `GET /api/participants/:id` - 特定の参加者データ取得

### ブース管理
- `GET /api/booths` - 全ブースデータ取得

### 活動ログ
- `GET /api/activity-logs` - 全活動ログ取得

### ショップ管理
- `GET /api/shop-items` - 全ショップアイテム取得
- `GET /api/purchase-logs` - 全購入ログ取得

### 統計情報
- `GET /api/stats` - システム統計情報取得

## 使用方法

1. サーバーを起動後、`http://localhost:3001` にアクセス
2. フロントエンドページから動的にデータベースの内容を表示
3. APIエンドポイントから直接データを取得可能

## トラブルシューティング

### データベース接続エラー
- MySQLが起動しているか確認
- 接続情報（ホスト、ポート、ユーザー名、パスワード）が正しいか確認
- データベースが存在するか確認

### CORS エラー
- `config.js`の`cors.origin`設定を確認
- フロントエンドのURLが許可されているか確認

### ポート競合
- ポート3001が使用されていないか確認
- `config.js`で別のポートを指定

## 開発者向け情報

- ログはコンソールに出力されます
- エラー発生時は詳細なエラー情報が表示されます
- 開発時は`npm run dev`でホットリロードが有効です
