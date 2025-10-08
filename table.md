# SHOW TABLE STATUS の結果の見方

## 表示されたテーブル情報の解説

### 基本情報
- **Name**: テーブル名
  - `booths`: ブース情報テーブル
  - `participants`: 参加者情報テーブル  
  - `status_logs`: ステータスログテーブル

### エンジン・バージョン情報
- **Engine**: ストレージエンジン（全てInnoDB）
- **Version**: テーブルフォーマットのバージョン（10）
- **Row_format**: 行フォーマット（Dynamic）

### データ量情報
- **Rows**: テーブル内の推定行数
  - `booths`: 5行
  - `participants`: 0行（空のテーブル）
  - `status_logs`: 0行（空のテーブル）

- **Avg_row_length**: 平均行長（バイト）
  - `booths`: 3,276バイト（約3.2KB）

- **Data_length**: データ部分のサイズ（バイト）
  - 全て16,384バイト（16KB）- 最小サイズ

- **Index_length**: インデックス部分のサイズ（バイト）
  - `booths`: 0バイト（インデックスなし）
  - `participants`: 16,384バイト（16KB）
  - `status_logs`: 32,768バイト（32KB）

### その他の情報
- **Auto_increment**: 次のAUTO_INCREMENT値
  - `booths`: 6（現在5行なので次は6）
  - 他は1（空のテーブル）

- **Create_time**: テーブル作成日時
  - 全て2025-09-17 05:31:39に作成

- **Collation**: 文字セット照合順序
  - 全て`utf8mb4_unicode_ci`

## この結果から読み取れること

### 1. テーブルの使用状況
```sql
-- 実際の行数を確認（推定値ではない）
SELECT COUNT(*) FROM booths;
SELECT COUNT(*) FROM participants;
SELECT COUNT(*) FROM status_logs;
```

### 2. データサイズの確認
```sql
-- より詳細なサイズ情報
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024), 2) AS 'Total Size (KB)',
    ROUND((data_length / 1024), 2) AS 'Data Size (KB)',
    ROUND((index_length / 1024), 2) AS 'Index Size (KB)',
    table_rows
FROM information_schema.tables 
WHERE table_schema = DATABASE()
ORDER BY (data_length + index_length) DESC;
```

### 3. テーブル構造の確認
```sql
-- 各テーブルの構造を確認
DESCRIBE booths;
DESCRIBE participants;
DESCRIBE status_logs;

-- または
SHOW CREATE TABLE booths;
SHOW CREATE TABLE participants;
SHOW CREATE TABLE status_logs;
```

## 分析結果

### 現在の状況
- **boothsテーブル**: 5行のデータがあり、実際に使用されている
- **participantsテーブル**: 空のテーブル（インデックスは設定済み）
- **status_logsテーブル**: 空のテーブル（インデックスは設定済み）

### 推奨アクション
1. **participants**と**status_logs**テーブルが空なので、用途を確認
2. **booths**テーブルは使用中なので、定期的なメンテナンスを検討
3. インデックスの使用状況を確認

```sql
-- インデックスの確認
SHOW INDEX FROM booths;
SHOW INDEX FROM participants;
SHOW INDEX FROM status_logs;
```

## 定期的な監視コマンド

```sql
-- テーブルサイズの推移を監視
SELECT 
    table_name,
    table_rows,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
    create_time,
    update_time
FROM information_schema.tables 
WHERE table_schema = DATABASE()
ORDER BY (data_length + index_length) DESC;

-- 空のテーブルの確認
SELECT table_name, table_rows 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_rows = 0;
```
