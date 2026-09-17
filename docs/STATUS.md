# TaskPane — build status

> **Last Cloud commit:** `main` on Cursor origin  
> **Gate before "done":** Windows Local run beside Fences → reply **`works`**

## Completed (verified in Cloud)

| Area | Evidence |
|------|----------|
| Planning locked | `docs/PLANNING-LOCKED.md`, `docs/ARCHITECTURE.md` |
| Tauri 2 + React app | `src/`, `src-tauri/` |
| Tests | `npm test` — 16 passing |
| Full build | `npm run verify` — frontend + Tauri release |
| README + handoff | `README.md`, `START-HERE.md`, `docs/HANDOFF.md` |
| v1.1 features | See checklist below |

## v1.1 feature checklist (code complete)

- [x] JSON store (`tasks.json`) + Markdown export (`tasks.md`)
- [x] Migrate existing `.md` on first open; re-import if `.md` edited in Notepad
- [x] Merged peek + quick-add (`Ctrl+Win+Space`)
- [x] Terminal-style tree UI + keyword colour accents
- [x] Checked tasks → bottom + recency sort
- [x] Soft (`⏳`) + hard (`📅`) deadlines
- [x] Custom keywords in Settings
- [x] Esc → desktop layer blur
- [x] Multi-file tabs, detach, tray, archive, drag reorder
- [x] Windows desktop layer stub (WorkerW)

## Not verified here (needs your PC)

- [ ] Pane on wallpaper layer beside Fences
- [ ] Peek/tray/hotkey on real Windows
- [ ] Installer `.msi` smoke test

## Your next commands

```powershell
.\scripts\push-to-github.ps1
git clone https://github.com/blvdes/task-widget.git
cd task-widget
npm install
.\scripts\dev.bat
```

Paste **`docs/LOCAL-AGENT-PROMPT.md`** into a Local Cursor agent.
