import os
import sys
import mysql.connector
from dotenv import load_dotenv

# .envファイルを読み込む
load_dotenv()

def delete_test_data():
    print("=== テストデータ削除ツール ===")

    # 削除対象のUID (insert_test_data.pyで使用したものと同じ)
    target_uid = 'TEST:DUMMY:UID:001'

    print(f"削除対象UID: {target_uid}")

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

        # 削除前の確認
        cursor.execute("SELECT * FROM player_status WHERE nfc_card_id = %s", (target_uid,))
        row = cursor.fetchone()
        
        if not row:
            print("⚠️ 削除対象のデータが見つかりませんでした。")
            return

        print(f"削除するデータ: {row}")
        
        # 確認プロンプト (オプション)
        # confirm = input("このデータを削除しますか？ (y/n): ")
        # if confirm.lower() != 'y':
        #     print("キャンセルしました。")
        #     return

        # 削除実行
        sql = "DELETE FROM player_status WHERE nfc_card_id = %s"
        cursor.execute(sql, (target_uid,))
        conn.commit()

        print(f"✅ 削除に成功しました。 (削除件数: {cursor.rowcount})")

    except mysql.connector.Error as err:
        print(f"❌ データベースエラー: {err}")
    finally:
        if conn and conn.is_connected():
            conn.close()
            print("接続を閉じました。")

if __name__ == "__main__":
    delete_test_data()

