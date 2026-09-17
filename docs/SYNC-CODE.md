# Wrong code? Check here first

GitHub **`blvdes/task-widget`** may be **behind** the Cloud agent build. If you `git clone` from GitHub only, you can get an **old partial copy** (no JSON store, no tree UI, no merged peek).

## Quick check (PowerShell in repo root)

```powershell
Test-Path src\lib\store.ts
Test-Path src\lib\documentStorage.ts
Select-String -Path src\App.tsx -Pattern "documentStorage"
```

| Result | Meaning |
|--------|---------|
| All **True** / match found | You have the latest v1.1 code |
| Any **False** | Stale clone — fix below |

## Fix A — Recommended (Cursor sync)

1. Open the **Cloud Agent run** that built TaskPane (this session).
2. Click **Open in Local** (or sync project to your PC).
3. Use **that folder** — not an empty/old GitHub clone.

## Fix B — GitHub after force-push

On a machine that already has the latest code (synced from Cloud):

```powershell
.\scripts\push-to-github.ps1
```

Then on your PC:

```powershell
git pull
```

## Fix C — UI-only smoke test (any copy)

```powershell
npm install
npm run preview:ui
```

Open http://127.0.0.1:4317 — browser preview only, not the desktop widget.

## Full desktop app (needs correct copy + Windows)

```powershell
npm install
.\scripts\dev.bat
```

See `docs/SETUP-WINDOWS.md` if build fails.
