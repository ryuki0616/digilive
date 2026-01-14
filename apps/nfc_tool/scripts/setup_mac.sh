#!/usr/bin/env bash

set -euo pipefail

echo "NFC Tool macOS セットアップ"
echo "======================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${PROJECT_DIR}"

require_cmd() {
  local cmd="$1"
  local hint="$2"

  if ! command -v "${cmd}" >/dev/null 2>&1; then
    echo ""
    echo "エラー: ${cmd} が見つかりません。"
    echo "${hint}"
    exit 1
  fi
}

brew_install_if_missing() {
  local pkg="$1"

  if brew list --versions "${pkg}" >/dev/null 2>&1; then
    echo "✓ ${pkg} はインストール済み"
    return 0
  fi

  echo "→ ${pkg} をインストールします..."
  brew install "${pkg}"
}

# --------------------------------------------
# 0) Homebrew
# --------------------------------------------
if ! command -v brew >/dev/null 2>&1; then
  echo "エラー: Homebrew が見つかりません。"
  echo "以下を参考にHomebrewをインストールしてから再実行してください。"
  echo "  https://brew.sh/"
  exit 1
fi

# --------------------------------------------
# 1) 依存導入（Homebrew）
# --------------------------------------------
echo ""
echo "[1/4] Homebrew依存の確認/導入"

brew_install_if_missing node
brew_install_if_missing python
brew_install_if_missing swig
brew_install_if_missing mysql

# pcsc-lite は環境によって不要/導入不可な場合があるため、失敗しても続行
if brew list --versions pcsc-lite >/dev/null 2>&1; then
  echo "✓ pcsc-lite はインストール済み"
else
  echo "→ pcsc-lite をインストールします...（不要な場合があります）"
  if ! brew install pcsc-lite; then
    echo "⚠ pcsc-lite のインストールに失敗しました。環境によっては不要です。"
  fi
fi

require_cmd node "Homebrewで node を導入してください: brew install node"
require_cmd python3 "Homebrewで python を導入してください: brew install python"

# --------------------------------------------
# 2) Node依存導入
# --------------------------------------------
echo ""
echo "[2/4] Node.js 依存の導入"

if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

# --------------------------------------------
# 3) Python依存導入（venv）
# --------------------------------------------
echo ""
echo "[3/4] Python 依存の導入（.venv）"

if [[ ! -d .venv ]]; then
  python3 -m venv .venv
fi

./.venv/bin/python -m pip install --upgrade pip
./.venv/bin/pip install -r requirements.txt

# --------------------------------------------
# 4) 環境設定ファイル
# --------------------------------------------
echo ""
echo "[4/4] .env の準備"

if [[ ! -f .env ]]; then
  if [[ -f env.template ]]; then
    cp env.template .env
    echo "✓ .env を作成しました（env.template からコピー）"
    echo "  必要に応じて apps/nfc_tool/.env を編集してください。"
  else
    echo "⚠ env.template が見つかりません。手動で .env を作成してください。"
  fi
else
  echo "✓ .env は既に存在します"
fi

echo ""
echo "セットアップ完了！"
echo "起動するには以下を実行してください:"
echo "  cd \"${PROJECT_DIR}\""
echo "  npm start"

