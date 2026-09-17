# TaskPane — Windows setup

## Prerequisites (one-time)

1. **Node.js 18+** — https://nodejs.org/
2. **Rust** — https://rustup.rs/ → then restart terminal
3. **Visual Studio Build Tools** — install **Desktop development with C++**
4. **WebView2** — usually preinstalled on Windows 11

Verify:

```powershell
node -v
cargo -v
```

## Clone and run (dev)

```powershell
git clone <your-repo-url>
cd taskpane
.\scripts\dev.bat
```

(`dev.bat` runs `npm install` if needed, then `tauri:dev`.)

First launch creates:

- `Documents\TaskPane\tasks.md` — your task list (seeded from `sample/tasks.md`)
- `%APPDATA%\TaskPane\config.json` — settings + window position

## Build installer

```powershell
npm run tauri:build
```

Output:

- `src-tauri\target\release\bundle\msi\TaskPane_0.1.0_x64_en-US.msi`
- `src-tauri\target\release\TaskPane.exe` (portable)

## Import your existing Notepad file

1. Open **Settings (⚙)**
2. Click **Import .txt → .md** and pick your `ADMIN.txt` in the file dialog
3. Or click **Add task file…** to open an existing `.md` list
4. Or **drag the file** onto the TaskPane window

## Tray shortcuts

| Action | Result |
|--------|--------|
| Single-click tray | Peek + quick-add (merged) |
| Double-click tray | Bring pane to front |
| `Ctrl+Win+Space` | Peek + quick-add — pane above windows, task input focused |

## Beside Stardock Fences

- Place TaskPane on the **left** of your desktop (empty wallpaper area)
- Fences stay on the **right** — no overlap
- TaskPane uses the **desktop layer** (WorkerW) — sits on wallpaper like icons
- Click away from TaskPane to send it back behind app windows

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `link.exe` not found | Install VS Build Tools C++ workload |
| WebView2 error | Install WebView2 Runtime from Microsoft |
| Pane not on desktop layer | Tray → **Send to desktop layer**; or restart TaskPane (WorkerW is best-effort on Win11/Fences) |
| Pane invisible / blank | Update GPU drivers; in Settings lower opacity or raise blur; WebView2 must be installed |
| Tasks not updating from Notepad | Wait ~2.5s (auto-reload) or click into TaskPane |

## Full verify script

```powershell
.\scripts\verify.ps1
```
