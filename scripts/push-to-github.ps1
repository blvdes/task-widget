# One-shot mirror to GitHub (run from repo root on Windows)
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

$remote = "https://github.com/blvdes/task-widget.git"
if (-not (git remote | Select-String -Pattern "^github$" -Quiet)) {
  git remote add github $remote
}

Write-Host "Force-pushing main -> github (blvdes/task-widget)..." -ForegroundColor Cyan
git push -u github main --force
Write-Host "Done. Clone: git clone $remote" -ForegroundColor Green
