# TaskPane — START HERE

Desktop task widget for Windows (beside Stardock Fences). **Planning done. v1.1 built in Cloud.** Windows Local verify is the last step — see [docs/STATUS.md](docs/STATUS.md).

## You are here

| Step | Action |
|------|--------|
| 1 | Get code on your PC (see **Get the code** below) |
| 2 | Open **Local Cursor agent** on Windows |
| 3 | Paste from **`docs/LOCAL-AGENT-PROMPT.md`** |
| 4 | Run `npm install` then `.\scripts\dev.bat` (see **First run** below) |

### First run (Windows PowerShell)

```powershell
cd task-widget
npm install
.\scripts\dev.bat
```

Then paste **`docs/LOCAL-AGENT-PROMPT.md`** into a **Local** agent and test beside Fences.

### Get the code (pick one)

**A — GitHub:** https://github.com/blvdes/task-widget

> **Important:** GitHub may lag the Cloud build. Run the check in **[docs/SYNC-CODE.md](docs/SYNC-CODE.md)** — if `src/lib/store.ts` is missing, use **Open in Local** from the Cloud agent run instead of an old clone.

If the repo looks empty or broken, force-push from a synced copy:

```powershell
.\scripts\push-to-github.ps1
```

Then clone on Windows:

```powershell
git clone https://github.com/blvdes/task-widget.git
cd task-widget
npm install
.\scripts\dev.bat
```

**B — Already have this folder in Cursor Local:** skip clone; run `npm install` and `.\scripts\dev.bat`.

**C — Sync from Cloud agent:** use **Open in Local** on this run, then `.\scripts\push-to-github.ps1` if you want GitHub too.

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

Reply **`works`** or send errors/screenshots. Cloud-side v1.1 is complete; Local agent continues from `docs/LOCAL-AGENT-PROMPT.md`.
