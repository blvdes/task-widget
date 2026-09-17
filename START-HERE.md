# TaskPane — START HERE

Desktop task widget for Windows (beside Stardock Fences). **Planning is done.** v0.1 prototype is built.

## You are here

| Step | Action |
|------|--------|
| 1 | Get code on your PC (see **Get the code** below) |
| 2 | Open **Local Cursor agent** on Windows |
| 3 | Paste from **`docs/LOCAL-AGENT-PROMPT.md`** |
| 4 | Run `npm install` then `.\scripts\dev.bat` |

### Get the code (pick one)

**A — Repo exists (may be empty until you push):** https://github.com/blvdes/task-widget

Push code once from Cursor (Create repo pill) **or** from a terminal with GitHub auth:

```powershell
git remote add github https://github.com/blvdes/task-widget.git
git push -u github main
```

Then on Windows:

```powershell
git clone https://github.com/blvdes/task-widget.git
cd task-widget
npm install
.\scripts\dev.bat
```

**B — Skip GitHub:** open this project folder in **Cursor Local** if you already have the files synced.

**C — Open this folder directly in Cursor Local** if you already synced it another way.

## Quick links

- **Run on Windows:** [docs/HANDOFF.md](docs/HANDOFF.md)
- **Your poll answers:** [docs/PLANNING-LOCKED.md](docs/PLANNING-LOCKED.md)
- **Architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Troubleshooting:** [docs/SETUP-WINDOWS.md](docs/SETUP-WINDOWS.md)

## UI preview (no Rust)

```powershell
npm install
npm run preview:ui
```

Open http://127.0.0.1:4317

## After first run

Reply **`works`** or send errors/screenshots. v1.1 backlog is in `docs/PLANNING-LOCKED.md`.
