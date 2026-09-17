# TaskPane verification script (run on Windows)
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host "TaskPane verify..." -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js is required. Install from https://nodejs.org/"
}

npm install
npm test
if ($LASTEXITCODE -ne 0) { throw "Tests failed" }

npm run build
if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }

if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
  Write-Host "Rust not found — skipping Tauri build. Install from https://rustup.rs/" -ForegroundColor Yellow
  exit 0
}

npm run tauri:build
if ($LASTEXITCODE -ne 0) { throw "Tauri build failed" }

Write-Host "OK — installer in src-tauri\target\release\bundle\" -ForegroundColor Green
