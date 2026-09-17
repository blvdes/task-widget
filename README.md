# TaskPane

> **New?** Read **[START-HERE.md](START-HERE.md)** first.

A desktop task pane for Windows — file-backed Markdown, dark glass UI, built to sit beside [Stardock Fences](https://www.stardock.com/products/fences/).

Your tasks live in plain `.md` files on disk. No database, no account. TaskPane is the primary editor; you can still open the same files in Notepad.

![TaskPane concept](docs/REQUIREMENTS.md)

## Features (v0.1)

- **Markdown task files** — sections, checkboxes, indented subtasks/follow-ups
- **Dark glass UI** — transparency, blur, Inter font (configurable)
- **Rolled up on startup** — double-click title bar or ▴ to expand
- **Check off + follow-ups** — strikethrough completed; inline follow-up field
- **Section collapse** — click to toggle; double-click header to collapse all
- **Subtask collapse** — ▸ on tasks with children
- **Drag reorder** — ⠿ grip on top-level tasks within a section
- **Quick add bar** — always-visible `+ Add task` at bottom
- **Spotlight quick-add** — overlay (`+` button or tray single-click)
- **Tray icon** — 1-click quick-add, 2-click bring pane to front
- **Peek + quick-add** — `Ctrl+Win+Space` expands pane above windows with task input focused (browser preview: `Ctrl+Shift+Space`)
- **OS drag-and-drop** — drop a `.md`/`.txt` onto the pane
- **Multi-file tabs** — switch files; **⤒** detaches tab to new window
- **Due dates** — right-click task → date picker → `📅 YYYY-MM-DD` in file
- **Tags** — right-click → `#tag` appended to line
- **Archive** — right-click → `## ARCHIVE` with timestamp
- **Keyword highlights** — configurable words → coloured left border
- **Stale nudge** — subtle highlight after 7 days without edit
- **Desktop layer (Windows)** — embeds into wallpaper layer via WorkerW (best-effort)
- **Import** — Settings → convert legacy `.txt` to `.md`
- **Settings** — startup, rolled up, font, opacity, blur, file paths

## Requirements

- **Windows 10/11** (primary target)
- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) stable
- **MSVC Build Tools** (Visual Studio Build Tools → C++ workload)
- [WebView2](https://developer.microsoft.com/microsoft-edge/webview2/) (usually preinstalled on Windows 11)

## Setup

**Repo:** `task-widget` on GitHub. See **[docs/HANDOFF.md](docs/HANDOFF.md)** for Local agent start guide and **[docs/PLANNING-LOCKED.md](docs/PLANNING-LOCKED.md)** for your scope decisions.

See **[docs/SETUP-WINDOWS.md](docs/SETUP-WINDOWS.md)** for prerequisites and troubleshooting.

```powershell
git clone https://github.com/blvdes/task-widget.git
cd task-widget
npm install
```

## Development

```powershell
npm run tauri:dev
```

Or double-click **`scripts\dev.bat`** (installs deps if needed, then starts dev).

**UI-only preview** (no Rust/Tauri — uses sample ADMIN.md in browser):

```powershell
npm run preview:ui
```

Open http://127.0.0.1:4317

## Build installer

```powershell
npm run tauri:build
```

Output: `src-tauri/target/release/bundle/` (`.msi` / `.exe`).

## First run

1. Launch TaskPane — it creates `Documents\TaskPane\tasks.json` (and exports `tasks.md`). Existing `.md` files migrate automatically.
2. **Settings (⚙)** → add your existing file paths, or drag `ADMIN.txt` onto the window.
3. **Import .txt → .md** in Settings if migrating from Notepad format.
4. Enable **Open on Windows startup** if desired.

Config is stored at:

```
%APPDATA%\TaskPane\config.json
```

## Markdown format

```markdown
## WORK

- [ ] FINISH PRESENTATION 📅 2026-09-20 #urgent
  - slides 13-16 need updating
- [x] SEND EMAIL
  - ~~SEND EMAIL~~ → COMPLETED, CHECK BACK TOMORROW
```

| Element | Syntax |
|---------|--------|
| Section | `## SECTION NAME` |
| Task | `- [ ]` or `- [x]` |
| Subtask / note | indent with 2 spaces + `- line` |
| Follow-up | add under checked task (widget helps format) |
| Soft deadline (start by) | `⏳ YYYY-MM-DD` (right-click → start-by) |
| Hard deadline (due) | `📅 YYYY-MM-DD` (right-click → due date) |
| Tag | `#tagname` (via right-click) |

## Tray behaviour

| Action | Result |
|--------|--------|
| Single-click tray | Peek + quick-add (merged) |
| Double-click tray | Bring TaskPane above windows |
| Right-click tray | Menu: Quick add / Bring to front / Send to desktop layer / Quit |

## Desktop layer (Windows)

TaskPane embeds into the **desktop wallpaper layer** (WorkerW) like icons/Fences. Click the pane to focus it above apps; click away to send it back. **Tray double-click** or **`Ctrl+Win+Space`** opens peek with quick-add focused.

> **Note:** Full desktop-layer embedding uses Windows-specific APIs and is best verified on your machine in a **Local** Cursor agent session.

## Project structure

```
├── src/                 React UI
├── src-tauri/           Rust backend (files, tray, config)
├── sample/ADMIN.md      Example task file
├── sample/tasks.md      Your task list (planning)
└── docs/PLANNING-LOCKED.md  Locked scope from planning polls
```

## Tests

```powershell
npm test
```

Runs Markdown parse/import unit tests (no Tauri runtime required).

Full Windows verification (tests + frontend + Tauri installer):

```powershell
.\scripts\verify.ps1
```

## Local vs Cloud development

This repo was scaffolded in a Cloud Agent (Linux). To iterate on your actual desktop beside Fences:

1. Cursor → **New Agent** → **Local**
2. Open this repo and run `npm run tauri:dev`

## License

Private / personal use.
