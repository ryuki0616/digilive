import sys
import json
import time
import io
from smartcard.System import readers
from smartcard.util import toHexString
from smartcard.Exceptions import CardConnectionException

# ============================================
# 設定と初期化
# ============================================

# --- 文字化けを防ぐための設定 ---
# Pythonが標準出力やエラー出力に文字を表示する際、
# 強制的に「UTF-8」エンコーディングを使用するように設定します。
# これにより、日本語が含まれていても文字化けしにくくなります。
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# ============================================
# ヘルパー関数
# ============================================

def read_page(connection, page_num):
    """
    指定されたページを読み取る関数
    
    Args:
        connection: カードリーダーとの接続オブジェクト
        page_num: 読み取るページ番号 (0-39など)
        
    Returns:
        list: 読み取った4バイトのデータ (成功時)
        None: 読み取り失敗時
    """
    # 読み取りコマンド: [Class, INS, P1, P2, Le]
    # 0xFF: Class, 0xB0: Read Binary, 0x00: P1, page_num: P2, 0x04: Le (4 bytes)
    cmd = [0xFF, 0xB0, 0x00, page_num, 0x04]
    try:
        data, sw1, sw2 = connection.transmit(cmd)
        # sw1=0x90, sw2=0x00 は成功を意味する
        if sw1 == 0x90 and sw2 == 0x00:
            return data
        else:
            return None
    except:
        return None

def read_nfc_data(connection):
    """
    NFCカードから全データを読み取って構造化する関数
    
    Args:
        connection: カードリーダーとの接続オブジェクト
        
    Returns:
        dict: 読み取ったデータを含む辞書オブジェクト
        None: 読み取り失敗時
    """
    # --- 1. IDm (シリアルナンバー) の取得 ---
    cmd_get_idm = [0xFF, 0xCA, 0x00, 0x00, 0x00]
    idm_data, sw1, sw2 = connection.transmit(cmd_get_idm)
    if sw1 != 0x90 or sw2 != 0x00:
        return None
    
    # --- 2. 名前の読み取り (ページ4-8) ---
    # 名前は20バイト (4バイト x 5ページ)
    name_bytes = []
    for page in range(4, 9):
        data = read_page(connection, page)
        if data: name_bytes.extend(data)
        else: return None
    
    try:
        # バイト列をUTF-8文字列にデコードし、末尾のNULL文字を削除
        name = bytes(name_bytes).decode('utf-8').rstrip('\x00')
    except:
        name = "Unknown"

    # --- 3. ステータスの読み取り (ページ9-12) ---
    # ステータスは16バイト (4バイト x 4ページ)
    # 各ステータス値は2バイト (リトルエンディアン)
    status_list = []
    status_bytes = []
    for page in range(9, 13):
        data = read_page(connection, page)
        if data: status_bytes.extend(data)
        else: return None
    
    # 2バイトごとに数値に変換
    for i in range(0, len(status_bytes), 2):
        if i + 1 < len(status_bytes):
            # リトルエンディアン変換: 下位バイト + (上位バイト << 8)
            val = status_bytes[i] + (status_bytes[i+1] << 8)
            status_list.append(val)

    # --- 4. インベントリの読み取り (ページ13-39) ---
    # 残りの領域をインベントリとして読み取る
    inventory_list = []
    for page in range(13, 40):
        data = read_page(connection, page)
        if data:
            inventory_list.append({
                "page": page,
                "data": toHexString(data)
            })
        else:
            # 読み取りエラーが発生したらそこで終了 (容量オーバーなど)
            break
            
    # 結果を辞書として返す
    return {
        "idm": toHexString(idm_data).replace(' ', ':'), # DB保存形式と一致させるためコロン区切りに変換
        "name": name,
        "status": status_list,
        "inventory": inventory_list
    }

# ============================================
# メイン処理
# ============================================

def main():
    """
    メインループ：カードの監視を行う
    
    このスクリプトは常駐し、以下の動作を繰り返します：
    1. カードリーダーを検出
    2. カードがタッチされたかチェック
    3. タッチされたらデータを読み取ってJSON形式で出力
    4. カードが離されるまで待機
    5. 離されたら「removed」イベントを出力
    """
    last_status = "removed" # 現在の状態 (removed: なし, present: あり)
    
    # 起動確認用メッセージ (デバッグ用)
    # print(json.dumps({"type": "status", "message": "monitoring_started"}), file=sys.stdout)
    # sys.stdout.flush()

    while True:
        try:
            # リーダーを探す
            r = readers()
            if not r:
                # リーダーが見つからない場合は少し待って再試行
                time.sleep(1)
                continue
            
            # 最初のリーダーを使用
            connection = r[0].createConnection()
            try:
                connection.connect()
                
                # --- カードを検知 ---
                
                # 前回の状態が「なし」だった場合（＝新しくタッチされた）
                if last_status == "removed":
                    # データを読み取る
                    data = read_nfc_data(connection)
                    if data:
                        # 読み取り成功：データをJSON形式で標準出力に送信
                        # main.js がこれを受け取って画面に表示する
                        print(json.dumps({"type": "data", "payload": data}, ensure_ascii=False), file=sys.stdout)
                        sys.stdout.flush()
                        last_status = "present"
                
                # --- カードが置かれている間のループ ---
                # カードが存在し続ける限り、ここでループする
                while True:
                    try:
                        # カードが存在するか確認するために軽いコマンドを送る (IDm取得)
                        connection.transmit([0xFF, 0xCA, 0x00, 0x00, 0x00])
                        time.sleep(0.2) # 0.2秒ごとにチェック
                    except Exception:
                        # エラーが出たらカードが離されたと判断
                        raise Exception("Card removed")
                        
            except Exception:
                # 接続エラーやカード離脱時の処理
                if last_status == "present":
                     # 前回までカードがあったなら、「離された」イベントを送信
                     print(json.dumps({"type": "removed"}), file=sys.stdout)
                     sys.stdout.flush()
                     last_status = "removed"
                
                # 次の検出まで少し待つ
                time.sleep(0.2)
                
        except Exception as e:
            # その他の予期せぬエラー（リーダー切断など）
            # print(f"Error: {e}", file=sys.stderr)
            time.sleep(1)

if __name__ == "__main__":
    main()
