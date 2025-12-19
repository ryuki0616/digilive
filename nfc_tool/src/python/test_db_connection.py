import os
import mysql.connector
from dotenv import load_dotenv
import sys

# .envファイルを読み込む
load_dotenv()

def test_connection():
    print("=== データベース接続テスト開始 ===")
    
    # 環境変数の取得と表示（パスワードは隠す）
    host = os.getenv('DB_HOST', 'localhost')
    user = os.getenv('DB_USER', 'root')
    password = os.getenv('DB_PASSWORD', '')
    dbname = os.getenv('DB_NAME', 'nfc_game_db')
    port = os.getenv('DB_PORT', 3306)
    
    # パスワードのマスク表示
    masked_password = '*' * len(password) if password else '(空)'
    
    print(f"設定: HOST={host}, USER={user}, PASS={masked_password}, DB={dbname}, PORT={port}")
    
    config = {
        'host': host,
        'user': user,
        'password': password,
        'database': dbname,
        'port': int(port)
    }

    conn = None
    try:
        # 接続試行
        print("接続を試みています...")
        conn = mysql.connector.connect(**config)
        
        if conn.is_connected():
            print("✅ データベース接続成功！")
            
            # サーバー情報の取得
            db_info = conn.get_server_info()
            print(f"MySQLサーバーバージョン: {db_info}")
            
            # カーソル作成
            cursor = conn.cursor()
            
            # 現在のデータベースを表示
            cursor.execute("SELECT DATABASE();")
            record = cursor.fetchone()
            print(f"接続中のデータベース: {record[0]}")
            
            # テーブル一覧を表示
            print("\n--- テーブル一覧 ---")
            cursor.execute("SHOW TABLES;")
            tables = cursor.fetchall()
            if tables:
                for table in tables:
                    print(f"- {table[0]}")
            else:
                print("(テーブルが見つかりません)")
                
            # player_statusテーブルの確認
            print("\n--- player_statusテーブル構造確認 ---")
            try:
                cursor.execute("DESCRIBE player_status;")
                columns = cursor.fetchall()
                for col in columns:
                    print(f"{col[0]} ({col[1]})")
            except mysql.connector.Error as err:
                if err.errno == 1146: # Table doesn't exist
                    print("⚠️ player_statusテーブルが存在しません。")
                    print("  作成するには以下のSQLを実行してください:")
                    print("""
CREATE TABLE IF NOT EXISTS player_status (
    player_id INT AUTO_INCREMENT PRIMARY KEY,
    nfc_card_id VARCHAR(255) NOT NULL UNIQUE,
    user_name VARCHAR(50) NOT NULL,
    age INT,
    power INT NOT NULL DEFAULT 0,
    stamina INT NOT NULL DEFAULT 0,
    speed INT NOT NULL DEFAULT 0,
    technique INT NOT NULL DEFAULT 0,
    luck INT NOT NULL DEFAULT 0,
    class INT NOT NULL DEFAULT 1,
    money INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);""")
                else:
                    print(f"エラー: {err}")

    except mysql.connector.Error as err:
        print(f"❌ 接続エラー: {err}")
        if err.errno == 1045:
            print("  ヒント: ユーザー名またはパスワードが間違っています。")
        elif err.errno == 2003:
            print(f"  ヒント: ホスト '{host}' に接続できません。IPアドレスやファイアウォール設定を確認してください。")
        elif err.errno == 1049:
            print(f"  ヒント: データベース '{dbname}' が見つかりません。")
            
    except Exception as e:
        print(f"❌ 予期せぬエラー: {e}")
    finally:
        if conn is not None and conn.is_connected():
            conn.close()
            print("\n接続を閉じました。")
        print("=== テスト終了 ===")

if __name__ == "__main__":
    test_connection()

