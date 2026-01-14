import sys
import json
import os
import mysql.connector
from dotenv import load_dotenv
import io

# 文字化け対策
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# .env読み込み
load_dotenv()

def get_db_data(nfc_uid):
    """
    指定されたUIDに対応するデータをデータベースから取得する
    """
    conn = None
    try:
        # DB接続設定
        db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD', ''),
            'database': os.getenv('DB_NAME', 'nfc_game_db'),
            'port': int(os.getenv('DB_PORT', 3306))
        }

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True) # 結果を辞書形式で取得

        sql = "SELECT * FROM player_status WHERE nfc_card_id = %s"
        cursor.execute(sql, (nfc_uid,))
        
        result = cursor.fetchone()
        
        if result:
            # datetime型などはJSONシリアライズできないため、文字列に変換するか除外する
            # ここではシンプルに必要なフィールドだけ返す形にするか、default=strで逃げる
            # 今回は必要なデータだけ抽出して返す
            response_data = {
                'found': True,
                'data': {
                    'nfc_card_id': result['nfc_card_id'],
                    'user_name': result['user_name'],
                    'age': result['age'],
                    'money': result['money'],
                    'power': result['power'],
                    'stamina': result['stamina'],
                    'speed': result['speed'],
                    'technique': result['technique'],
                    'luck': result['luck'],
                    'class': result['class']
                }
            }
        else:
            response_data = {
                'found': False,
                'message': 'Data not found in database'
            }

        print(json.dumps(response_data, ensure_ascii=False))

    except mysql.connector.Error as err:
        print(json.dumps({
            'found': False,
            'error': f"Database error: {err}"
        }, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({
            'found': False,
            'error': f"Unexpected error: {e}"
        }, ensure_ascii=False))
    finally:
        if conn and conn.is_connected():
            conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({
            'found': False,
            'error': 'UID argument is required'
        }, ensure_ascii=False))
        sys.exit(1)
    
    uid = sys.argv[1]
    get_db_data(uid)

