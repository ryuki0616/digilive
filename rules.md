# digilive プロジェクト コーディング規約

## プロジェクト概要
WebアプリケーションとNFCツールを含むマルチプラットフォームプロジェクトです。ElectronとPythonを組み合わせて、リッチなUIとハードウェア（NFCリーダー）制御を実現しています。

## 技術スタック
- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **デスクトップアプリ**: Electron (Main Process + Renderer Process)
- **バックエンド**: Python 3.x
- **データベース**: MySQL
- **ライブラリ**: pyscard, mysql-connector-python, dotenv

## コーディング規約

### JavaScript (ES6+)

#### 基本構文
- ES6+のモダンな構文を使用
- `const`を優先、再代入が必要な場合のみ`let`を使用
- `var`は使用しない
- アロー関数を積極的に使用

```javascript
// 良い例
const userName = 'John';
let counter = 0;

const handleClick = (event) => {
    event.preventDefault();
    // 処理
};
```

#### インデント
- 2スペースを使用

#### 命名規則
- 変数・関数: `camelCase`
- 定数: `UPPER_SNAKE_CASE`
- クラス: `PascalCase`

### Python

#### 基本構文
- Python 3.xを使用
- 型ヒントを積極的に使用（可能な範囲で）
- パス操作は`pathlib.Path`を使用

#### インデント
- 4スペースを使用

#### 命名規則
- 変数・関数: `snake_case`
- 定数: `UPPER_SNAKE_CASE`
- クラス: `PascalCase`

### HTML

#### マークアップ
- セマンティックなHTML5要素を使用
- アクセシビリティを考慮した構造

### CSS

#### スタイリング
- モダンなCSS（Flexbox、Grid）を使用
- クラス名は意味のある名前を使用
- レスポンシブデザインを考慮

## コメントの書き方

### JavaScript

#### 関数のコメント
関数の目的、引数、戻り値をJSDoc形式で日本語で記述します。

```javascript
/**
 * 認証モーダルを開く
 * NFCカードの認証を開始し、モーダルを表示します
 *
 * @returns {void}
 */
function openAuthModal() {
    if (!modal) return;

    modal.style.display = 'flex';
    modalMessage.textContent = '認証のため、NFCカードをタッチしてください...';

    // NFC監視開始
    startAuthMonitor();
}
```

#### インラインコメント
処理の意図や理由を日本語で説明します。

```javascript
// 要素の取得
const editButton = document.getElementById('edit-button');
const modal = document.getElementById('auth-modal');

// 認証監視中フラグ（重複監視を防ぐため）
let isMonitoringAuth = false;

// 編集ボタンクリック時の処理
if (editButton) {
    editButton.addEventListener('click', (e) => {
        e.preventDefault(); // リンク遷移を防止
        openAuthModal();
    });
}
```

#### セクションコメント
大きな処理ブロックの前にセクションの目的を説明します。

```javascript
// ============================================
// 認証処理
// ============================================

// カード認証の監視を開始
function startAuthMonitor() {
    // 処理内容
}
```

### HTML

#### セクションのコメント
HTMLの各セクションの役割をコメントで説明します。

```html
<!-- トップページのメインコンテンツ -->
<main class="main-content">
    <!-- 編集ボタン -->
    <button id="edit-button">編集</button>

    <!-- 認証モーダル -->
    <div id="auth-modal" class="modal">
        <!-- モーダルの内容 -->
    </div>
</main>
```

### CSS

#### スタイルの意図を説明
CSSの各スタイルの目的や用途をコメントで説明します。

```css
/* メインコンテナ: フレックスボックスで中央配置 */
.main-content {
    display: flex;
    justify-content: center;
    align-items: center;
}

/* モーダル: 画面全体を覆うオーバーレイ */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
}

/* レスポンシブ: モバイル端末での表示調整 */
@media (max-width: 768px) {
    .main-content {
        flex-direction: column;
    }
}
```

### Python

#### Docstring
関数の目的、引数、戻り値をdocstringで日本語で記述します。

```python
def write_page(connection, page: int, data: bytes) -> bool:
    """
    NFCカードの指定ページにデータを書き込む

    Args:
        connection: NFCカードへの接続オブジェクト
        page: 書き込むページ番号
        data: 書き込むデータ（4バイト）

    Returns:
        書き込み成功時True、失敗時False

    Raises:
        Exception: カードへの書き込みに失敗した場合
    """
    pass
```

#### インラインコメント
複雑な処理や意図が明確でない箇所にコメントを記述します。

```python
# ============================================
# 設定と初期化
# ============================================

# 標準入出力のエンコーディングをUTF-8に設定
# 日本語を含むデータを正しく扱うために必要です
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# ============================================
# データマッピング定義
# ============================================

# 各データを書き込むNFCカードのページ番号を定義
# 1ページの最大容量は4バイトです
PAGE_MAPPING = {
    'name': 4,               # 名前（ページ4から5ページ使用）
    'money_power': 9,        # 所持金 + パワー（ページ9）
    'stamina_speed': 10,     # スタミナ + スピード（ページ10）
}
```

#### 定数の説明
定数の意味と単位をコメントで説明します。

```python
# ページ4～7: 名前（16バイト, 4ページ分）※1ページ4バイト
# ページ8:    所持金（4バイト, 1ページ）
# ページ9:    パワー（4バイト, 1ページ）
```

### Electron

#### IPC通信のコメント
ElectronのIPC通信の処理をコメントで説明します。

```javascript
// Main ProcessからRenderer Processへの通信
// カード認証結果を通知
ipcRenderer.on('auth-result', (event, result) => {
    if (result.success) {
        // 認証成功時の処理
        console.log('認証に成功しました');
    } else {
        // 認証失敗時の処理
        console.error('認証に失敗しました:', result.error);
    }
});
```

## ファイル構造

### ディレクトリ構成
```
digilive/
├── index.html          # メインHTML
├── styles.css          # スタイルシート
├── script.js           # JavaScript
├── nfc_tool/           # NFCツール
│   ├── src/
│   │   ├── html/       # HTMLファイル
│   │   ├── js/         # JavaScriptファイル
│   │   ├── css/        # CSSファイル
│   │   └── python/     # Pythonスクリプト
│   ├── main.js         # Electron Main Process
│   └── preload.js      # Preload Script
└── requirements.txt    # Python依存関係
```

## その他の注意事項

### 環境変数
- `.env`ファイルでデータベース接続情報を管理
- `.env`ファイルはGitにコミットしない

### エラーハンドリング
- JavaScript: try-catch文を使用
- Python: try-except文を使用
- エラーメッセージは日本語でわかりやすく記述

### データベース
- MySQL接続は`mysql-connector-python`を使用
- 接続情報は環境変数から取得

### NFCカード操作
- `pyscard`ライブラリを使用
- ページマッピングは定数として定義
- エラーハンドリングを適切に実装

