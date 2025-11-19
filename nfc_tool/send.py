import sys  # システム関連の機能を使うためのライブラリ（エラー終了や標準出力などに使用）
import json # データをJSON形式（Webや他のプログラムで扱いやすい形式）に変換するためのライブラリ
import time # 時間に関する機能を使うためのライブラリ（今回は直接は使っていませんが、待機処理などでよく使います）
from smartcard.System import readers # PCに接続されたICカードリーダーを見つけるための機能
from smartcard.util import toHexString # バイトデータ（数値の羅列）を16進数の文字列（例: "0A 1B"）に変換する機能
import io   # 入出力に関する機能を使うためのライブラリ（文字コードの設定に使用）

# --- 文字化けを防ぐための設定 ---
# Pythonが画面（標準出力）やエラー出力に文字を表示する際、
# 強制的に「UTF-8」という文字コードを使うように設定します。
# これにより、日本語が含まれていても文字化けしにくくなります。
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def read_page(connection, page_num):
    """
    NFCカードの指定された「ページ」からデータを読み取る関数です。
    
    引数:
        connection: カードリーダーとの接続情報
        page_num: 読み取りたいページ番号（例: 4）
        
    戻り値:
        読み取ったデータ（成功時） または None（失敗時）
    """
    # カードに送る「読み取り命令（コマンド）」を作ります
    # [Class, INS, P1, P2, Le] という5つの数値で構成されます
    # 0xFF: おまじない（Class）
    # 0xB0: 「読み取れ」という命令（Read Binary）
    # 0x00: パラメータ1（通常は0）
    # page_num: 読み取るページ番号
    # 0x04: 読み取る長さ（4バイト＝1ページ分）
    cmd = [0xFF, 0xB0, 0x00, page_num, 0x04]
    
    # コマンドをカードに送信し、結果を受け取ります
    # data: 読み取ったデータの中身
    # sw1, sw2: 成功したかどうかを表すステータスコード（成績表のようなもの）
    data, sw1, sw2 = connection.transmit(cmd)
    
    # sw1が0x90、sw2が0x00なら「成功」という意味です
    if sw1 == 0x90 and sw2 == 0x00:
        return data # 読み取ったデータを返します
    else:
        return None # 失敗したので「なし」を返します

def main():
    """メインの処理を行う関数"""
    
    # --- 1. NFCリーダーを探して接続する ---
    try:
        # PCに接続されているリーダーの一覧を取得します
        r = readers()
        
        # リーダーが見つからなかった場合
        if not r:
            # エラーメッセージをJSON形式で表示して、プログラムを終了します
            print(json.dumps({"error": "リーダーが見つかりません。USB接続を確認してください。"}), file=sys.stdout)
            sys.exit(1) # 異常終了を表す「1」で終わります

        # 最初に見つかったリーダーを使います
        connection = r[0].createConnection()
        connection.connect() # リーダーに接続します

        # --- 2. カードのID（IDm）を取得する ---
        # IDを取得するためのコマンド: [0xFF, 0xCA, 0x00, 0x00, 0x00]
        cmd_get_idm = [0xFF, 0xCA, 0x00, 0x00, 0x00]
        idm_data, sw1, sw2 = connection.transmit(cmd_get_idm)
        
        # 読み取りに失敗した場合
        if sw1 != 0x90 or sw2 != 0x00:
             print(json.dumps({"error": "カードの読み取りに失敗しました。"}), file=sys.stdout)
             sys.exit(1)
             
        # デバッグ用: IDを表示したい場合はコメントを外してください
        # print(f"NFCカードのID: {toHexString(idm_data)}", file=sys.stderr)

        # --- 3. データを読み取って解析する ---
        
        # === 名前の読み取り（ページ4〜8） ===
        # 名前はページ4から8までの合計20バイト（4バイト×5ページ）に保存されています
        name_bytes = []
        for page in range(4, 9): # 4から8まで繰り返す
            data = read_page(connection, page)
            if data:
                name_bytes.extend(data) # 読み取ったデータをリストに追加
            else:
                # 読み取りに失敗したらエラーを表示して終了
                print(json.dumps({"error": f"ページ{page}の読み取りに失敗しました。"}), file=sys.stdout)
                sys.exit(1)
        
        # 読み取ったバイトデータ（数値の羅列）を文字（UTF-8）に変換します
        try:
            # rstrip('\x00') は、データの末尾にある余分な空データ（Null文字）を削除します
            name = bytes(name_bytes).decode('utf-8').rstrip('\x00')
        except UnicodeDecodeError:
            # 文字として正しく変換できなかった場合
            name = "Unknown (Decode Error)"

        # === ステータスの読み取り（ページ9〜12） ===
        # ステータスはページ9から12までの合計16バイトに保存されています
        # 2バイトで1つの数値を表すので、全部で8個の数値になります
        status_list = []
        status_bytes = []
        for page in range(9, 13): # 9から12まで繰り返す
            data = read_page(connection, page)
            if data:
                status_bytes.extend(data)
            else:
                print(json.dumps({"error": f"ページ{page}の読み取りに失敗しました。"}), file=sys.stdout)
                sys.exit(1)

        # 2バイトごとに1つの数値に変換します
        # 例: [100, 0] -> 100, [232, 3] -> 1000 (リトルエンディアンという方式)
        for i in range(0, len(status_bytes), 2):
            if i + 1 < len(status_bytes):
                # 下位バイト + (上位バイト × 256) で数値を計算します
                val = status_bytes[i] + (status_bytes[i+1] << 8)
                status_list.append(val)

        # === インベントリの読み取り（ページ13〜39） ===
        # 残りのページ（13ページ以降）をインベントリとして読み取ります
        # ここでは39ページまで読み取る設定にしていますが、カードの種類によって上限は異なります
        inventory_list = []
        for page in range(13, 40): # 13から39まで繰り返す
            data = read_page(connection, page)
            if data:
                # 読み取った1ページ分のデータ（4バイト）を16進数の文字列（例: "01 02 03 04"）に変換してリストに追加
                inventory_list.append({
                    "page": page,
                    "data": toHexString(data)
                })
            else:
                # 読み取りに失敗した場合（カードの容量オーバーなど）は、そこで読み取りを終了します
                # エラーにはせず、そこまでのデータを有効とします
                break

        # --- 4. 結果をJSON形式で出力する ---
        # 読み取ったデータを辞書（キーと値のペア）にまとめます
        result = {
            "idm": toHexString(idm_data), # カードのID（16進数文字列）
            "name": name,                 # 名前
            "status": status_list,        # ステータスのリスト（数値の配列）
            "inventory": inventory_list   # インベントリのリスト（ページごとのデータ）
        }
        
        # 辞書をJSON文字列に変換して表示します
        # ensure_ascii=False は、日本語をそのまま表示するための設定です
        print(json.dumps(result, ensure_ascii=False), file=sys.stdout)

    except Exception as e:
        # 予期せぬエラーが発生した場合
        # エラー内容をJSON形式で表示して終了します
        print(json.dumps({"error": str(e)}), file=sys.stdout)
        sys.exit(1)

# このファイルが直接実行されたときに、main関数を呼び出します
if __name__ == "__main__":
    main()
