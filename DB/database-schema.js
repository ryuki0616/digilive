/**
 * データベーススキーマ定義
 * 全ページで共有されるデータベース構造の定義
 */

// データベーススキーマをグローバル変数として定義
const databaseSchema = {
    participants: {
        name: "参加者テーブル",
        description: "NFCカードと連携した参加者情報とステータス管理",
        icon: "👥",
        fields: [
            { name: "participant_id", type: "INT", constraint: "PRIMARY KEY AUTO_INCREMENT", description: "参加者ID" },
            { name: "nfc_card_id", type: "VARCHAR(255)", constraint: "UNIQUE NOT NULL", description: "NFCカードID" },
            { name: "nickname", type: "VARCHAR(50)", constraint: "NOT NULL", description: "ニックネーム" },
            { name: "age", type: "INT", constraint: "NOT NULL", description: "年齢" },
            { name: "power", type: "INT", constraint: "DEFAULT 0", description: "パワー" },
            { name: "stamina", type: "INT", constraint: "DEFAULT 0", description: "スタミナ" },
            { name: "speed", type: "INT", constraint: "DEFAULT 0", description: "スピード" },
            { name: "technique", type: "INT", constraint: "DEFAULT 0", description: "テクニック" },
            { name: "luck", type: "INT", constraint: "DEFAULT 0", description: "ラック" },
            { name: "money", type: "INT", constraint: "DEFAULT 0", description: "所持金" },
            { name: "created_at", type: "DATETIME", constraint: "DEFAULT CURRENT_TIMESTAMP", description: "登録日時" },
            { name: "updated_at", type: "DATETIME", constraint: "DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP", description: "更新日時" }
        ],
        relationships: [
            { type: "1対多", target: "activity_logs", description: "1人の参加者は複数の活動ログを持つ" },
            { type: "1対多", target: "purchase_logs", description: "1人の参加者は複数の購入ログを持つ" }
        ]
    },
    booths: {
        name: "ブーステーブル",
        description: "ゲームブースとショップブースの情報管理",
        icon: "🎮",
        fields: [
            { name: "booth_id", type: "INT", constraint: "PRIMARY KEY AUTO_INCREMENT", description: "ブースID" },
            { name: "booth_name", type: "VARCHAR(100)", constraint: "NOT NULL", description: "ブース名" },
            { name: "description", type: "TEXT", constraint: "", description: "説明" },
            { name: "booth_type", type: "VARCHAR(20)", constraint: "NOT NULL", description: "ブースタイプ（game/shop）" }
        ],
        relationships: [
            { type: "1対多", target: "activity_logs", description: "1つのブースは複数の活動ログを持つ" }
        ]
    },
    activity_logs: {
        name: "活動ログテーブル",
        description: "参加者の活動履歴とステータス変動の記録",
        icon: "📈",
        fields: [
            { name: "log_id", type: "INT", constraint: "PRIMARY KEY AUTO_INCREMENT", description: "ログID" },
            { name: "participant_id", type: "INT", constraint: "FOREIGN KEY NOT NULL", description: "参加者ID（participantsテーブル参照）" },
            { name: "booth_id", type: "INT", constraint: "FOREIGN KEY NOT NULL", description: "ブースID（boothsテーブル参照）" },
            { name: "money_change", type: "INT", constraint: "DEFAULT 0", description: "所持金変動" },
            { name: "power_change", type: "INT", constraint: "DEFAULT 0", description: "パワー変動" },
            { name: "stamina_change", type: "INT", constraint: "DEFAULT 0", description: "スタミナ変動" },
            { name: "speed_change", type: "INT", constraint: "DEFAULT 0", description: "スピード変動" },
            { name: "technique_change", type: "INT", constraint: "DEFAULT 0", description: "テクニック変動" },
            { name: "luck_change", type: "INT", constraint: "DEFAULT 0", description: "ラック変動" },
            { name: "created_at", type: "DATETIME", constraint: "DEFAULT CURRENT_TIMESTAMP", description: "記録日時" }
        ],
        relationships: [
            { type: "多対1", target: "participants", description: "複数の活動ログは1人の参加者に属する" },
            { type: "多対1", target: "booths", description: "複数の活動ログは1つのブースに属する" }
        ]
    },
    shop_items: {
        name: "ショップアイテムテーブル",
        description: "ステータスアップアイテムの情報管理",
        icon: "🛍️",
        fields: [
            { name: "item_id", type: "INT", constraint: "PRIMARY KEY AUTO_INCREMENT", description: "アイテムID" },
            { name: "item_name", type: "VARCHAR(100)", constraint: "NOT NULL", description: "アイテム名" },
            { name: "price", type: "INT", constraint: "NOT NULL", description: "価格" },
            { name: "effect_type", type: "VARCHAR(20)", constraint: "NOT NULL", description: "効果タイプ（power/stamina/speed/technique/luck）" },
            { name: "effect_value", type: "INT", constraint: "NOT NULL", description: "効果値" },
            { name: "description", type: "TEXT", constraint: "", description: "説明" }
        ],
        relationships: [
            { type: "1対多", target: "purchase_logs", description: "1つのアイテムは複数の購入ログを持つ" }
        ]
    },
    purchase_logs: {
        name: "購入ログテーブル",
        description: "ショップでの購入履歴を管理",
        icon: "🛒",
        fields: [
            { name: "purchase_id", type: "INT", constraint: "PRIMARY KEY AUTO_INCREMENT", description: "購入ID" },
            { name: "participant_id", type: "INT", constraint: "FOREIGN KEY NOT NULL", description: "参加者ID（participantsテーブル参照）" },
            { name: "item_id", type: "INT", constraint: "FOREIGN KEY NOT NULL", description: "アイテムID（shop_itemsテーブル参照）" },
            { name: "quantity", type: "INT", constraint: "DEFAULT 1", description: "数量" },
            { name: "total_price", type: "INT", constraint: "NOT NULL", description: "合計価格" },
            { name: "created_at", type: "DATETIME", constraint: "DEFAULT CURRENT_TIMESTAMP", description: "購入日時" }
        ],
        relationships: [
            { type: "多対1", target: "participants", description: "複数の購入ログは1人の参加者に属する" },
            { type: "多対1", target: "shop_items", description: "複数の購入ログは1つのアイテムに属する" }
        ]
    }
};

console.log('データベーススキーマが読み込まれました');

