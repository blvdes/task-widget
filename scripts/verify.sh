#!/usr/bin/env bash
# TaskPane verification (Linux/macOS — full Tauri build)
set -euo pipefail
cd "$(dirname "$0")/.."

echo "TaskPane verify..."

command -v node >/dev/null || { echo "Node.js required: https://nodejs.org/"; exit 1; }

npm install
npm test
npm run build

if ! command -v cargo >/dev/null; then
  echo "Rust not found — skipping Tauri build. Install from https://rustup.rs/"
  exit 0
fi

npm run tauri:build
echo "OK — bundles in src-tauri/target/release/bundle/"
