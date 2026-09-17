# TaskPane — one-command dev launch (Windows)
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Install Node.js: https://nodejs.org/" -ForegroundColor Red
  exit 1
}
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
  Write-Host "Install Rust: https://rustup.rs/" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path node_modules)) {
  Write-Host "Installing dependencies..." -ForegroundColor Cyan
  npm install
}

Write-Host "Starting TaskPane (dev)..." -ForegroundColor Green
npm run tauri:dev
