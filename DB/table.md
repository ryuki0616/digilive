erDiagram
    participants {
        INT participant_id PK "参加者ID"
        VARCHAR nfc_card_id "NFCカードID"
        VARCHAR nickname "ニックネーム"
        INT age "年齢"
        INT power "パワー"
        INT stamina "スタミナ"
        INT speed "スピード"
        INT technique "テクニック"
        INT luck "ラック"
        INT money "所持金"
        DATETIME created_at "登録日時"
        DATETIME updated_at "更新日時"
    }

    booths {
        INT booth_id PK "ブースID"
        VARCHAR booth_name "ブース名"
        TEXT description "説明"
        VARCHAR booth_type "ブースタイプ"
    }

    activity_logs {
        INT log_id PK "ログID"
        INT participant_id FK "参加者ID"
        INT booth_id FK "ブースID"
        INT money_change "所持金変動"
        INT power_change "パワー変動"
        INT stamina_change "スタミナ変動"
        INT speed_change "スピード変動"
        INT technique_change "テクニック変動"
        INT luck_change "ラック変動"
        DATETIME created_at "記録日時"
    }

    shop_items {
        INT item_id PK "アイテムID"
        VARCHAR item_name "アイテム名"
        INT price "価格"
        VARCHAR effect_type "効果タイプ"
        INT effect_value "効果値"
        TEXT description "説明"
    }

    purchase_logs {
        INT purchase_id PK "購入ID"
        INT participant_id FK "参加者ID"
        INT item_id FK "アイテムID"
        INT quantity "数量"
        INT total_price "合計価格"
        DATETIME created_at "購入日時"
    }

    participants ||--o{ activity_logs : "has"
    booths ||--o{ activity_logs : "is related to"
    participants ||--o{ purchase_logs : "buys"
    shop_items ||--o{ purchase_logs : "is purchased"
```

## テーブル設計の詳細

### 1. participants（参加者テーブル）
- **主キー**: participant_id
- **NFCカード管理**: nfc_card_idでNFCカードと紐づけ
- **ステータス管理**: 5つのステータス（パワー、スタミナ、スピード、テクニック、ラック）
- **所持金管理**: moneyでゲーム内通貨を管理

### 2. booths（ブーステーブル）
- **主キー**: booth_id
- **ブース情報**: 名前、説明、タイプを管理
- **ブースタイプ**: ゲームブース、ショップブースなど

### 3. activity_logs（活動ログテーブル）
- **主キー**: log_id
- **外部キー**: participant_id, booth_id
- **変動記録**: 各ステータスと所持金の変動を記録
- **履歴管理**: 全ての活動履歴を保持

### 4. shop_items（ショップアイテムテーブル）
- **主キー**: item_id
- **アイテム情報**: 名前、価格、効果を管理
- **効果システム**: ステータスアップアイテムを提供

### 5. purchase_logs（購入ログテーブル）
- **主キー**: purchase_id
- **外部キー**: participant_id, item_id
- **購入履歴**: ショップでの購入記録を管理

## データベースの関係性

### 主要な関係
1. **participants ↔ activity_logs**: 1対多（1人の参加者が複数の活動ログを持つ）
2. **booths ↔ activity_logs**: 1対多（1つのブースが複数の活動ログを持つ）
3. **participants ↔ purchase_logs**: 1対多（1人の参加者が複数の購入記録を持つ）
4. **shop_items ↔ purchase_logs**: 1対多（1つのアイテムが複数の購入記録を持つ）

### データフロー
1. **参加者登録**: participantsテーブルに新規参加者を追加
2. **ブース体験**: activity_logsテーブルに活動記録を追加
3. **ショップ利用**: purchase_logsテーブルに購入記録を追加
4. **ランキング生成**: 各テーブルからデータを集計してランキングを作成