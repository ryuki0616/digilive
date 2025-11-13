import sys
import json
from smartcard.System import readers
from smartcard.util import toHexString

# 各データを書き込むNFCカードのページ番号を定義
PAGE_MAPPING = {
    'name': 4,       # 名前 (16バイト, 4ページ分)
    'money': 8,      # 所持金 (4バイト, 1ページ)
    'power': 9,      # パワー (4バイト, 1ページ)
    'stamina': 10,   # スタミナ (4バイト, 1ページ)
    'speed': 11,     # スピード (4バイト, 1ページ)
    'technique': 12, # テクニック (4バイト, 1ページ)
    'luck': 13,      # ラック (4バイト, 1ページ)
    'class': 14      # クラス (4バイト, 1ページ)
}

def write_page(connection, page, data):
    """指定されたページに4バイトのデータを書き込む"""
    # 書き込みコマンドを作成
    write_command = [0xFF, 0xD6, 0x00, page, 0x04] + data
    _, sw1, sw2 = connection.transmit(write_command)
    return sw1 == 0x90 and sw2 == 0x00

def main():
    try:
        # コマンドライン引数を取得
        args = sys.argv[1:]
        if len(args) != 8:
            print("エラー: 8つの引数（名前, 所持金, パワー, スタミナ, スピード, テクニック, ラック, クラス）が必要です。", file=sys.stderr)
            sys.exit(1)

        name, money, power, stamina, speed, technique, luck, player_class = args

        # NFCリーダーを検出
        r = readers()
        if not r:
            print("エラー: リーダーが見つかりません。", file=sys.stderr)
            sys.exit(1)
        
        connection = r[0].createConnection()
        connection.connect()

        # 名前の書き込み (最大16文字をUTF-8でエンコード)
        name_bytes = name.encode('utf-8')
        # 16バイトに満たない場合は0x00でパディング、超える場合は切り捨て
        name_bytes = name_bytes.ljust(16, b'\x00')[:16]
        for i in range(4):
            chunk = list(name_bytes[i*4:(i+1)*4])
            if not write_page(connection, PAGE_MAPPING['name'] + i, chunk):
                print(f"エラー: 名前の書き込みに失敗しました (ページ {PAGE_MAPPING['name'] + i})", file=sys.stderr)
                sys.exit(1)

        # 数値データの書き込み (4バイトのリトルエンディアンとして)
        def write_int(key, value):
            # 整数を4バイトのリトルエンディアンに変換
            data = int(value).to_bytes(4, 'little')
            if not write_page(connection, PAGE_MAPPING[key], list(data)):
                print(f"エラー: {key}の書き込みに失敗しました", file=sys.stderr)
                sys.exit(1)

        write_int('money', money)
        write_int('power', power)
        write_int('stamina', stamina)
        write_int('speed', speed)
        write_int('technique', technique)
        write_int('luck', luck)
        write_int('class', player_class)

        print("✅ NFCカードへの書き込みが成功しました！")

    except Exception as e:
        print(f"予期せぬエラー: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
