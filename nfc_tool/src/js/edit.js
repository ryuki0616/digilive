// 編集画面のロジック

document.addEventListener('DOMContentLoaded', () => {
    const messageElement = document.getElementById('message');
    const saveButton = document.getElementById('save_button');
    
    // 監視開始
    window.electronAPI.startNfcMonitor();
    
    // データ読み取り時の処理
    window.electronAPI.onNfcDataRead(async (nfcData) => {
        // UID取得
        const uid = nfcData.idm; // monitor_nfc.py は "idm" キーでUIDを返す
        if (!uid) return;

        console.log('NFC detected, UID:', uid);
        messageElement.textContent = `データ取得中... (UID: ${uid})`;
        messageElement.style.color = 'yellow';

        try {
            // DBからデータ取得
            const dbResult = await window.electronAPI.getDbData(uid);
            let displayData = {};

            if (dbResult.found && dbResult.data) {
                console.log('DB Data used:', dbResult.data);
                messageElement.textContent = 'データベースの情報をロードしました。';
                
                // DBデータをマッピング
                displayData = {
                    name: dbResult.data.user_name,
                    age: dbResult.data.age,
                    money: dbResult.data.money,
                    power: dbResult.data.power,
                    stamina: dbResult.data.stamina,
                    speed: dbResult.data.speed,
                    technique: dbResult.data.technique,
                    luck: dbResult.data.luck,
                    class: dbResult.data.class
                };
            } else {
                console.log('NFC Data used:', nfcData);
                messageElement.textContent = 'カードの情報をロードしました（DBデータなし）。';
                
                // NFCデータをマッピング
                // nfcData.status = [power, stamina, speed, technique, luck, class, money]
                // ※注: Python側(read_nfc_data)の実装により、statusの順序はNFCメモリ読み出し順に依存します。
                // ページ9: money(2byte) + power(2byte) -> [money, power] (リトルエンディアンで数値化されている場合)
                // しかし monitor_nfc.py の実装を確認すると:
                // status_list は 2バイトごとに数値化したリスト
                // ページ9 (money, power), ページ10 (stamina, speed)...
                // status[0]=money, status[1]=power, status[2]=stamina, status[3]=speed... となるはずですが
                // 既存のコメントには "status[0]: パワー, ... status[6]: 所持金" とあり、不整合の可能性があります。
                // ユーザーの指摘に基づき、「パワー」と「所持金」の位置関係を修正します。
                
                const s = nfcData.status || [];
                displayData = {
                    name: nfcData.name,
                    age: 0, // NFCには年齢データがないためデフォルト0
                    money: s[0] !== undefined ? s[0] : 0, // 0:Money
                    power: s[1] !== undefined ? s[1] : 0, // 1:Power
                    stamina: s[2] !== undefined ? s[2] : 0, // 2:Stamina
                    speed: s[3] !== undefined ? s[3] : 0, // 3:Speed
                    technique: s[4] !== undefined ? s[4] : 0, // 4:Technique
                    luck: s[5] !== undefined ? s[5] : 0, // 5:Luck
                    class: s[6] !== undefined ? s[6] : 1 // 6:Class
                };
            }
            messageElement.style.color = '#00ff00';

            // フォームにセット
            document.getElementById('edit-name').value = displayData.name || '';
            document.getElementById('edit-age').value = displayData.age || 0;
            document.getElementById('edit-uid').value = uid;
            
            document.getElementById('edit-money').value = displayData.money;
            document.getElementById('edit-power').value = displayData.power;
            document.getElementById('edit-stamina').value = displayData.stamina;
            document.getElementById('edit-speed').value = displayData.speed;
            document.getElementById('edit-technique').value = displayData.technique;
            document.getElementById('edit-luck').value = displayData.luck;
            document.getElementById('edit-class').value = displayData.class;

            // 保存ボタン有効化
            saveButton.disabled = false;

        } catch (error) {
            console.error('Error fetching DB data:', error);
            messageElement.textContent = `エラー: ${error}`;
            messageElement.style.color = 'red';
        }
    });

    // タグ離脱時
    window.electronAPI.onNfcTagRemoved(() => {
        // 編集中はデータをクリアしない（UX向上のため）
        // ただしメッセージだけ更新
        messageElement.textContent = "編集モード: カードを離してもデータは保持されます。書き込み時は再度タッチしてください。";
        messageElement.style.color = 'orange';
    });

    // 保存ボタンクリック時
    saveButton.addEventListener('click', () => {
        messageElement.textContent = "書き込み中...";
        messageElement.style.color = 'yellow';
        saveButton.disabled = true;

        const writeData = {
            topBox1: document.getElementById('edit-name').value,
            age: document.getElementById('edit-age').value,
            topBox2: document.getElementById('edit-money').value,
            box1: document.getElementById('edit-power').value,
            box2: document.getElementById('edit-stamina').value,
            box3: document.getElementById('edit-speed').value,
            box4: document.getElementById('edit-technique').value,
            box5: document.getElementById('edit-luck').value,
            box6: document.getElementById('edit-class').value
        };

        window.electronAPI.writeNfcData(writeData);
    });

    // 書き込み結果受信
    window.electronAPI.onWriteNfcResult((result) => {
        console.log('Write result:', result);
        if (result.includes('エラー')) {
            messageElement.textContent = result;
            messageElement.style.color = 'red';
            saveButton.disabled = false; // エラー時は再試行可能に
        } else {
            messageElement.textContent = "書き込み成功！";
            messageElement.style.color = '#00ff00';
            setTimeout(() => {
                // 成功したら少し待ってから戻る、あるいはそのまま
                messageElement.textContent = "NFCカードをタッチして再編集できます。";
                saveButton.disabled = false;
            }, 2000);
        }
    });
});

// ページ離脱時に監視停止
window.addEventListener('beforeunload', () => {
    window.electronAPI.stopNfcMonitor();
});

