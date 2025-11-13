import sys
import json
import io
from smartcard.System import readers
from smartcard.util import toHexString
import time # Added for polling loop

# --- 標準入出力のエンコーディングをUTF-8に設定 ---
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

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

def write_page(connection, page, data):
    """指定されたページにデータを書き込む。データは4バイトにパディングされる。"""
    if len(data) > 4:
        raise ValueError("書き込みデータは4バイト以内でなければなりません。")
    
    # データを4バイトにパディング (足りない分を0x00で埋める)
    padded_data = data + [0x00] * (4 - len(data))
    
    # 書き込みコマンドを作成
    write_command = [0xFF, 0xD6, 0x00, page, 0x04] + padded_data
    _, sw1, sw2 = connection.transmit(write_command)
    return sw1 == 0x90 and sw2 == 0x00

def main():
    try:
        # ============================================
        # 1. コマンドライン引数の受け取りと検証
        # ============================================
        args = sys.argv[1:]
        if len(args) != 8:
            print("エラー: 8つの引数（名前, 所持金, パワー, スタミナ, スピード, テクニック, ラック, クラス）が必要です。", file=sys.stderr)
            sys.exit(1)

        name, money, power, stamina, speed, technique, luck, player_class = args

        # ============================================
        # 2. NFCリーダーの検出とカード接続
        # ============================================
        
        # リーダーを検出
        r = readers()
        if not r:
            print("エラー: リーダーが見つかりません。USB接続を確認してください。", file=sys.stderr)
            sys.exit(1)
        
        connection = r[0].createConnection()
        
        # --- カード待機処理 (nfc_test.pyを参考) ---
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
        # 4. 残りのページをゼロでクリア
        # ============================================
        print("残りのデータ領域をクリアしています...", file=sys.stderr)
        
        # ページ13から39までをゼロで埋める
        zero_data = [0x00, 0x00, 0x00, 0x00]
        for page in range(13, 40):
            if not write_page(connection, page, zero_data):
                print(f"エラー: ページ {page} のクリアに失敗しました。", file=sys.stderr)
                sys.exit(1)

        # ============================================
        # 5. 成功メッセージの出力
        # ============================================
        # このメッセージが main.js に渡され、画面に表示される
        print("✅ NFCカードへの書き込みが成功しました！")

    except Exception as e:
        # 予期せぬエラーが発生した場合
        print(f"予期せぬエラーが発生しました: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
