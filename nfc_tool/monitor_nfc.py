import sys
import json
import time
import io
from smartcard.System import readers
from smartcard.util import toHexString
from smartcard.Exceptions import CardConnectionException

# --- 文字化けを防ぐための設定 ---
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def read_page(connection, page_num):
    """指定されたページを読み取る"""
    cmd = [0xFF, 0xB0, 0x00, page_num, 0x04]
    try:
        data, sw1, sw2 = connection.transmit(cmd)
        if sw1 == 0x90 and sw2 == 0x00:
            return data
        else:
            return None
    except:
        return None

def read_nfc_data(connection):
    """NFCカードからデータを読み取る"""
    # IDm取得
    cmd_get_idm = [0xFF, 0xCA, 0x00, 0x00, 0x00]
    idm_data, sw1, sw2 = connection.transmit(cmd_get_idm)
    if sw1 != 0x90 or sw2 != 0x00:
        return None
    
    # 名前（ページ4-8）
    name_bytes = []
    for page in range(4, 9):
        data = read_page(connection, page)
        if data: name_bytes.extend(data)
        else: return None
    
    try:
        name = bytes(name_bytes).decode('utf-8').rstrip('\x00')
    except:
        name = "Unknown"

    # ステータス（ページ9-12）
    status_list = []
    status_bytes = []
    for page in range(9, 13):
        data = read_page(connection, page)
        if data: status_bytes.extend(data)
        else: return None
    
    for i in range(0, len(status_bytes), 2):
        if i + 1 < len(status_bytes):
            val = status_bytes[i] + (status_bytes[i+1] << 8)
            status_list.append(val)

    # インベントリ（ページ13-39）
    inventory_list = []
    for page in range(13, 40):
        data = read_page(connection, page)
        if data:
            inventory_list.append({
                "page": page,
                "data": toHexString(data)
            })
        else:
            break
            
    return {
        "idm": toHexString(idm_data),
        "name": name,
        "status": status_list,
        "inventory": inventory_list
    }

def main():
    """メインループ：カードの監視を行う"""
    last_status = "removed" # 現在の状態 (removed: なし, present: あり)
    
    # 起動確認用メッセージ
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
            
            connection = r[0].createConnection()
            try:
                connection.connect()
                
                # --- カードを検知 ---
                
                # 前回の状態が「なし」だった場合（＝新しくタッチされた）
                if last_status == "removed":
                    # データを読み取る
                    data = read_nfc_data(connection)
                    if data:
                        # 読み取り成功：データを送信
                        print(json.dumps({"type": "data", "payload": data}, ensure_ascii=False), file=sys.stdout)
                        sys.stdout.flush()
                        last_status = "present"
                
                # --- カードが置かれている間のループ ---
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

