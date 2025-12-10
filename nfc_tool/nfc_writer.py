import sys
import json
import io
import os
from smartcard.System import readers
from smartcard.util import toHexString
import time
import mysql.connector
from dotenv import load_dotenv

# .envファイルを読み込む
load_dotenv()

# ============================================
# 設定と初期化
# ============================================

# --- 標準入出力のエンコーディングをUTF-8に設定 ---
# 日本語を含むデータを正しく扱うために必要です
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# ============================================
# データマッピング定義
# ============================================

# 各データを書き込むNFCカードのページ番号を定義
# 1ページの最大容量は4バイトです。
# ページ4～7: 名前（16バイト, 4ページ分）※1ページ4バイト
# ページ8:    所持金（4バイト, 1ページ）
# ページ9:    パワー（4バイト, 1ページ）
# ページ10:   スタミナ（4バイト, 1ページ）
# ページ11:   スピード（4バイト, 1ページ）
# ページ12:   テクニック（4バイト, 1ページ）
# ページ13:   ラック（4バイト, 1ページ）
# ページ14:   クラス（4バイト, 1ページ）

PAGE_MAPPING = {
    'name': 4,               # 名前（ページ4から5ページ使用: 4, 5, 6, 7, 8）
    'money_power': 9,        # 所持金 + パワー（ページ9）
    'stamina_speed': 10,     # スタミナ + スピード（ページ10）
    'technique_luck': 11,    # テクニック + ラック（ページ11）
    'class': 12              # クラス（ページ12）
}

# ============================================
# ヘルパー関数
# ============================================

def write_page(connection, page, data):
    """
    指定されたページにデータを書き込む関数
    
    Args:
        connection: カードリーダーとの接続オブジェクト
        page: 書き込むページ番号
        data: 書き込むデータ (バイトリスト, 最大4バイト)
        
    Returns:
        bool: 書き込み成功ならTrue
    """
    if len(data) > 4:
        raise ValueError("書き込みデータは4バイト以内でなければなりません。")
    
    # データを4バイトにパディング (足りない分を0x00で埋める)
    padded_data = data + [0x00] * (4 - len(data))
    
    # 書き込みコマンド: [Class, INS, P1, P2, Le] + Data
    # 0xFF: Class, 0xD6: Update Binary, 0x00: P1, page: P2, 0x04: Le
    write_command = [0xFF, 0xD6, 0x00, page, 0x04] + padded_data
    _, sw1, sw2 = connection.transmit(write_command)
    return sw1 == 0x90 and sw2 == 0x00

def get_uid(connection):
    """
    NFCカードのUID (Unique Identifier) を取得する関数
    """
    # GET DATA コマンド (UID取得)
    # Class: 0xFF, INS: 0xCA, P1: 0x00, P2: 0x00, Le: 0x00
    get_uid_command = [0xFF, 0xCA, 0x00, 0x00, 0x00]
    data, sw1, sw2 = connection.transmit(get_uid_command)
    
    if sw1 == 0x90 and sw2 == 0x00:
        # UIDを16進数文字列に変換 (例: "04:A1:B2:C3:D4:E5:F6")
        return toHexString(data).replace(' ', ':')
    return None

def save_to_db(player_data):
    """
    プレイヤーデータをMySQLデータベースに保存する関数
    """
    try:
        # DB接続設定
        db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD', ''),
            'database': os.getenv('DB_NAME', 'nfc_game_db'),
            'port': int(os.getenv('DB_PORT', 3306))
        }

        # データベースに接続
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # UPSERT文 (INSERT ... ON DUPLICATE KEY UPDATE)
        # nfc_card_id が重複する場合は既存レコードを更新
        sql = """
        INSERT INTO player_status (
            nfc_card_id, user_name, age, money, power, stamina, speed, technique, luck, class
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
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

        val = (
            player_data['nfc_card_id'],
            player_data['name'],
            player_data['age'],
            player_data['money'],
            player_data['power'],
            player_data['stamina'],
            player_data['speed'],
            player_data['technique'],
            player_data['luck'],
            player_data['class']
        )

        cursor.execute(sql, val)
        conn.commit()
        
        print(f"データベースへの保存が完了しました。ID: {cursor.lastrowid}", file=sys.stderr)
        
        cursor.close()
        conn.close()
        return True

    except mysql.connector.Error as err:
        print(f"データベースエラー: {err}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"DB保存中に予期せぬエラーが発生しました: {e}", file=sys.stderr)
        return False

# ============================================
# メイン処理
# ============================================

def main():
    try:
        # ============================================
        # 1. コマンドライン引数の受け取りと検証
        # ============================================
        # main.js から spawn で呼び出される際に引数が渡されます
        args = sys.argv[1:]
        if len(args) != 9:
            print(f"エラー: 9つの引数（名前, 年齢, 所持金, パワー, スタミナ, スピード, テクニック, ラック, クラス）が必要です。受信: {len(args)}", file=sys.stderr)
            sys.exit(1)

        name, age, money, power, stamina, speed, technique, luck, player_class = args

        # ============================================
        # 2. NFCリーダーの検出とカード接続
        # ============================================
        
        # リーダーを検出
        r = readers()
        if not r:
            print("エラー: リーダーが見つかりません。USB接続を確認してください。", file=sys.stderr)
            sys.exit(1)
        
        connection = r[0].createConnection()
        
        # --- カード待機処理 ---
        print("NFCカードをタッチしてください...", file=sys.stderr) # このメッセージはmain.jsのログに出力される
        
        card_found = False
        timeout = 5  # 5秒間のタイムアウト
        start_time = time.time()
        
        # タイムアウトするまでカードの検出を試みる
        while time.time() - start_time < timeout:
            try:
                connection.connect()
                # 接続に成功したらループを抜ける
                card_found = True
                break
            except Exception:
                # 接続に失敗した場合 (カードがまだ置かれていない)
                time.sleep(0.2) # 0.2秒待ってから再試行
        
        # タイムアウトした場合のエラー処理
        if not card_found:
            print(f"エラー: {timeout}秒以内にカードが検出されませんでした。", file=sys.stderr)
            sys.exit(1)
            
        print("カードを検出しました。書き込みを開始します...", file=sys.stderr)

        # ============================================
        # 3. 各データのNFCカードへの書き込み
        # ============================================

        # --- 名前の書き込み ---
        # 名前をUTF-8形式のバイト列に変換
        name_bytes = name.encode('utf-8')
        # 20バイトに満たない場合は0x00で埋め、20バイトを超える場合は切り捨て
        name_bytes = name_bytes.ljust(20, b'\x00')[:20]
        
        # 20バイトのデータを4バイトずつ5ページに分けて書き込む
        for i in range(5):
            chunk = list(name_bytes[i*4:(i+1)*4])
            page_to_write = PAGE_MAPPING['name'] + i
            if not write_page(connection, page_to_write, chunk):
                print(f"エラー: 名前の書き込みに失敗しました (ページ {page_to_write})", file=sys.stderr)
                sys.exit(1)

        # --- ステータスのペア書き込み ---
        
        # 値を検証し、2バイトのバイト列に変換するヘルパー関数
        def validate_and_convert(key, value):
            try:
                numeric_value = int(value)
                if not (0 <= numeric_value <= 65535):
                    print(f"エラー: {key} の値 '{value}' は0から65535の範囲外です。", file=sys.stderr)
                    sys.exit(1)
                # 整数を2バイトのリトルエンディアン形式のバイト列に変換
                return numeric_value.to_bytes(2, 'little')
            except ValueError:
                print(f"エラー: {key} の値 '{value}' は有効な数値ではありません。", file=sys.stderr)
                sys.exit(1)

        # 1. 所持金 (money) と パワー (power) をページ9に書き込む
        money_bytes = validate_and_convert('money', money)
        power_bytes = validate_and_convert('power', power)
        combined_data = list(money_bytes + power_bytes) # 2バイト + 2バイト = 4バイト
        if not write_page(connection, PAGE_MAPPING['money_power'], combined_data):
            print(f"エラー: money/power の書き込みに失敗しました (ページ {PAGE_MAPPING['money_power']})", file=sys.stderr)
            sys.exit(1)
            
        # 2. スタミナ (stamina) と スピード (speed) をページ10に書き込む
        stamina_bytes = validate_and_convert('stamina', stamina)
        speed_bytes = validate_and_convert('speed', speed)
        combined_data = list(stamina_bytes + speed_bytes)
        if not write_page(connection, PAGE_MAPPING['stamina_speed'], combined_data):
            print(f"エラー: stamina/speed の書き込みに失敗しました (ページ {PAGE_MAPPING['stamina_speed']})", file=sys.stderr)
            sys.exit(1)
            
        # 3. テクニック (technique) と ラック (luck) をページ11に書き込む
        technique_bytes = validate_and_convert('technique', technique)
        luck_bytes = validate_and_convert('luck', luck)
        combined_data = list(technique_bytes + luck_bytes)
        if not write_page(connection, PAGE_MAPPING['technique_luck'], combined_data):
            print(f"エラー: technique/luck の書き込みに失敗しました (ページ {PAGE_MAPPING['technique_luck']})", file=sys.stderr)
            sys.exit(1)
            
        # 4. クラス (class) をページ12に書き込む (残りの2バイトはパディングされる)
        class_bytes = validate_and_convert('class', player_class)
        if not write_page(connection, PAGE_MAPPING['class'], list(class_bytes)):
            print(f"エラー: class の書き込みに失敗しました (ページ {PAGE_MAPPING['class']})", file=sys.stderr)
            sys.exit(1)

        # ============================================
        # 4. 残りのページをゼロでクリア (無効化)
        # ============================================
        # ※ インベントリデータを保持するため、クリア処理はコメントアウトしています
        
        # print("残りのデータ領域をクリアしています...", file=sys.stderr)
        # zero_data = [0x00, 0x00, 0x00, 0x00]
        # for page in range(13, 40):
        #     if not write_page(connection, page, zero_data):
        #         print(f"エラー: ページ {page} のクリアに失敗しました。", file=sys.stderr)
        #         sys.exit(1)

        # ============================================
        # 5. データベースへの保存
        # ============================================
        
        # NFCカードのUIDを取得
        uid = get_uid(connection)
        if uid:
            print(f"カードUID: {uid}", file=sys.stderr)
            
            # DB保存用のデータ辞書を作成
            db_data = {
                'nfc_card_id': uid,
                'name': name,
                'age': age if age and age.isdigit() else None,
                'money': int(money),
                'power': int(power),
                'stamina': int(stamina),
                'speed': int(speed),
                'technique': int(technique),
                'luck': int(luck),
                'class': int(player_class)
            }
            
            # DB保存を実行
            save_to_db(db_data)
        else:
            print("警告: UIDが取得できなかったため、データベースへの保存をスキップしました。", file=sys.stderr)

        # ============================================
        # 6. 成功メッセージの出力
        # ============================================
        # このメッセージが main.js に渡され、画面に表示される
        print("✅ NFCカードへの書き込みが成功しました！")

    except Exception as e:
        # 予期せぬエラーが発生した場合
        print(f"予期せぬエラーが発生しました: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
