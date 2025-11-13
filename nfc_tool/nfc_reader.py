# ============================================
# 必要なライブラリのインポート
# ============================================

# システム関連の機能を使用するためのライブラリ
import sys
# 時間待機（sleep）機能を使用するためのライブラリ
import time
# オペレーティングシステム関連の機能を使用するためのライブラリ
import os
# NFCリーダーを検出するためのライブラリ
from smartcard.System import readers
# データを16進数文字列に変換するためのライブラリ
from smartcard.util import toHexString

# ============================================
# 標準出力のバッファリング設定
# ============================================

# try-except文：エラーが発生してもプログラムを止めずに処理を続ける
try:
    # 標準出力のバッファリングを無効化（リアルタイムで出力されるようにする）
    sys.stdout.reconfigure(line_buffering=True)
    sys.stderr.reconfigure(line_buffering=True)
    print("デバッグ: 標準出力のバッファリングを無効化しました。", file=sys.stderr)
except TypeError:
    # 古いPythonバージョン用の設定方法
    sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', 1)
    sys.stderr = os.fdopen(sys.stderr.fileno(), 'w', 1)
    print("デバッグ: (旧式) 標準出力のバッファリングを無効化しました。", file=sys.stderr)

# ============================================
# NFCカード読み取りのメイン関数
# ============================================

def start_nfc_polling(): 
    """
    NFCカードの読み取りを開始する関数
    カードが検出されるまで繰り返し読み取りを試みます
    """
    try:
        # NFCリーダーを検出する
        # readers()：接続されているNFCリーダーのリストを取得
        r = readers()
        
        # リーダーが見つからない場合の処理
        # if not r：rが空（リーダーが見つからない）場合
        if not r:
            print("エラー: NFCリーダーが見つかりません。ACR122Uが接続されているか確認してください。", file=sys.stderr)
            return  # 関数を終了する
        
        # 最初に見つかったリーダーを使用する
        # r[0]：リストの最初の要素（最初に見つかったリーダー）
        reader = r[0] 
        print(f"デバッグ: リーダーを検出 - {reader}", file=sys.stderr)
        
        # リーダーとの接続を作成する
        # createConnection()：リーダーと通信するための接続オブジェクトを作成
        connection = reader.createConnection()
        
    except Exception as e:
        # エラーが発生した場合の処理
        # Exception：すべてのエラーの種類を表す
        # as e：エラーの内容を変数eに格納
        print(f"エラー: リーダーの初期化に失敗しました - {e}", file=sys.stderr)
        return  # 関数を終了する

    # カードの待機を開始することを表示
    print("NFCカードの待機を開始します...", file=sys.stderr)
    
    # 最後に読み取ったIDmを保存する変数（重複読み取りを防ぐため）
    last_idm = None
    
    # 無限ループ：カードの読み取りを繰り返す
    # while True：条件が真の間繰り返す（無限ループ）
    while True:
        try:
            # リーダーに接続する
            # connect()：リーダーと通信を開始する
            connection.connect()
            
            # IDm（カードのID）を取得するコマンド
            # [0xFF, 0xCA, 0x00, 0x00, 0x00]：NFCリーダーへの命令コード
            GET_IDM_COMMAND = [0xFF, 0xCA, 0x00, 0x00, 0x00]
            
            # コマンドを送信して応答を受信する
            # transmit()：コマンドを送信し、応答データを受け取る
            # data：応答データ
            # sw1, sw2：ステータスワード（コマンドの実行結果を示す）
            data, sw1, sw2 = connection.transmit(GET_IDM_COMMAND)
            
            # コマンドが正常に実行された場合の処理
            # sw1 == 0x90 and sw2 == 0x00：正常終了を示すステータスワード
            if sw1 == 0x90 and sw2 == 0x00:
                # データを16進数文字列に変換する
                # toHexString()：バイトデータを16進数文字列に変換
                idm = toHexString(data) 
                
                # 前回読み取ったIDmと異なる場合のみ表示する（重複を防ぐ）
                if idm != last_idm:
                    # IDmを標準出力に出力（JavaScriptで読み取る）
                    print(f"IDm:{idm}") 
                    # 最後に読み取ったIDmを保存
                    last_idm = idm
            else:
                # エラーが発生した場合の処理
                # {sw1:02X}：sw1を2桁の16進数で表示
                print(f"デバッグ: カードからの応答エラー SW1={sw1:02X}, SW2={sw2:02X}", file=sys.stderr)

            # リーダーとの接続を切断する
            connection.disconnect()
            
            # 2秒待機してから次の読み取りに進む
            # sleep()：指定した秒数だけ処理を停止する
            time.sleep(2) 
            
        except Exception as e:
            # エラーが発生した場合（カードが離れたなど）
            # 最後に読み取ったIDmをリセット
            last_idm = None 
            # 0.5秒待機してから次の読み取りに進む
            time.sleep(0.5) 

# ============================================
# プログラムの実行開始
# ============================================

# このファイルが直接実行された場合のみ関数を呼び出す
# __name__ == "__main__"：このファイルが直接実行された場合のみ真になる
# （他のファイルからインポートされた場合は実行されない）
if __name__ == "__main__":
    # NFCカード読み取りを開始する
    start_nfc_polling()