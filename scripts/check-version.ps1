# Verify this folder has v1.1 TaskPane code
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

$ok = $true
foreach ($f in @("src/lib/store.ts", "src/lib/documentStorage.ts", "src/lib/taskSort.ts")) {
  if (-not (Test-Path $f)) {
    Write-Host "MISSING: $f" -ForegroundColor Red
    $ok = $false
  }
}
if (-not (Select-String -Path "src/App.tsx" -Pattern "documentStorage" -Quiet)) {
  Write-Host "STALE: src/App.tsx (no documentStorage import)" -ForegroundColor Red
  $ok = $false
}

if ($ok) {
  Write-Host "OK — v1.1 codebase detected. Run: .\scripts\dev.bat" -ForegroundColor Green
  exit 0
}

Write-Host ""
Write-Host "Stale clone. Read docs/SYNC-CODE.md — use Open in Local from Cloud agent, or git pull after push-to-github." -ForegroundColor Yellow
exit 1
