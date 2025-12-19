import os
import sys
import mysql.connector
from dotenv import load_dotenv

# .envファイルを読み込む
load_dotenv()

def insert_test_data():
    print("=== テストデータ挿入ツール ===")

    # テスト用データ定義
    # ※ 何度実行しても同じレコードを更新するようにUIDを固定しています
    test_data = {
        'nfc_card_id': 'TEST:DUMMY:UID:001',
        'user_name': 'テスト太郎',
        'age': 20,
        'money': 5000,
        'power': 50,
        'stamina': 50,
        'speed': 50,
        'technique': 50,
        'luck': 50,
        'class': 1
    }

    print(f"書き込むデータ: {test_data['user_name']} (UID: {test_data['nfc_card_id']})")

    # DB接続設定
    db_config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', ''),
        'database': os.getenv('DB_NAME', 'nfc_game_db'),
        'port': int(os.getenv('DB_PORT', 3306))
    }

    conn = None
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # UPSERT文 (重複時は更新)
        sql = """
        INSERT INTO player_status (
            nfc_card_id, user_name, age, money, power, stamina, speed, technique, luck, class
        ) VALUES (
            %(nfc_card_id)s, %(user_name)s, %(age)s, %(money)s, %(power)s, 
            %(stamina)s, %(speed)s, %(technique)s, %(luck)s, %(class)s
        ) ON DUPLICATE KEY UPDATE
            user_name = VALUES(user_name),
            age = VALUES(age),
            money = VALUES(money),
            power = VALUES(power),
            stamina = VALUES(stamina),
            speed = VALUES(speed),
            technique = VALUES(technique),
            luck = VALUES(luck),
            class = VALUES(class),
            updated_at = CURRENT_TIMESTAMP
        """

        cursor.execute(sql, test_data)
        conn.commit()

        print("✅ テストデータの書き込みに成功しました！")
        
        # 確認のためにデータを取得して表示
        cursor.execute("SELECT * FROM player_status WHERE nfc_card_id = %s", (test_data['nfc_card_id'],))
        row = cursor.fetchone()
        print(f"DB上のデータ: {row}")

    except mysql.connector.Error as err:
        print(f"❌ データベースエラー: {err}")
    finally:
        if conn and conn.is_connected():
            conn.close()
            print("接続を閉じました。")

if __name__ == "__main__":
    insert_test_data()

