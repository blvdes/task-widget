# TaskPane → Local agent handoff

> **Planning:** ✅ complete — see `docs/PLANNING-LOCKED.md` + `docs/ARCHITECTURE.md`  
> **Paste prompt:** `docs/LOCAL-AGENT-PROMPT.md`  
> **Your repo:** `task-widget` on GitHub  
> **Do not mod Fences** — complementary widget only

---

## What to do right now (Windows)

### 0. Prerequisites (one-time)

Install if missing:

- [Node.js 18+](https://nodejs.org/)
- [Rust](https://rustup.rs/) → restart terminal after install
- **Visual Studio Build Tools** → “Desktop development with C++”
- [WebView2](https://developer.microsoft.com/microsoft-edge/webview2/) (usually on Win11)

Verify:

```powershell
node -v
cargo -v
```

### 1. Get the code

```powershell
git clone https://github.com/YOUR_USER/task-widget.git
cd task-widget
```

If Cloud agent already pushed to your remote, just:

```powershell
cd task-widget
git pull
```

### 2. Fastest preview (no Rust — UI only)

```powershell
npm install
npm run preview:ui
```

Open **http://127.0.0.1:4317** — sample tasks from `sample/tasks.md` in browser.

### 3. Full desktop app (what you actually want)

```powershell
npm install
.\scripts\dev.bat
```

Or manually:

```powershell
npm install
npm run tauri:dev
```

First launch creates:

- `%USERPROFILE%\Documents\TaskPane\tasks.md` (your task list from `sample/tasks.md`)
- `%APPDATA%\TaskPane\config.json`

### 4. Build installer (optional)

```powershell
npm run tauri:build
```

Output: `src-tauri\target\release\bundle\` (`.msi` / `.exe`)

### 5. Full verify

```powershell
.\scripts\verify.ps1
```

---

## What v0.1 already does (test these)

| Feature | How to test |
|---------|-------------|
| Dark glass pane | Left side of desktop, beside Fences |
| Desktop layer | Pane on wallpaper; click app → pane behind; **tray → Send to desktop layer** if wrong |
| Peek | `Ctrl+Shift+Space` (v0.1) — v1.1 → `Ctrl+Win+Space` merged with quick-add |
| Check off + follow-up | Check task → follow-up field focuses |
| Sections | ADMIN, LIFE, WORK, … (these are your category headers) |
| Quick add | Bottom bar or tray single-click spotlight |
| Import file | Settings ⚙ → **Import .txt → .md** or **Add task file…** |
| Solid background | Settings if pane invisible (GPU/transparency) |

---

## Planning decisions YOU locked (implement after v0.1 works)

See **`docs/PLANNING-LOCKED.md`** — summary:

1. **Revisit file storage** — files OK for prototype; v1.1 needs structured store + export  
2. **Merge peek + quick-add** — one pane, smart placement, `Ctrl+Win+Space`  
3. **Checked tasks → bottom** — auto-sort, recency within checked group  
4. **Tree UI (2E)** — terminal-inspired expand downward  
5. **Soft + hard deadlines**  
6. **Custom status labels** — colours accent the tree  
7. **Default file: `tasks.md`**  
8. **Esc blurs** back to desktop layer  
9. **Q14:** persist window position (already in v0.1)

---

## Repo layout

```
src/                 React UI
src-tauri/           Rust — files, tray, WorkerW embed, config
sample/tasks.md      Your task list (planning upload)
sample/ADMIN.md      Legacy sample name (v0.1 still references)
docs/
  PLANNING-LOCKED.md ← your poll answers
  REQUIREMENTS.md    ← v0.1 checklist
  SETUP-WINDOWS.md   ← troubleshooting
scripts/
  dev.bat            ← double-click or run in PowerShell
  verify.ps1         ← full Windows verify
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `link.exe` not found | Install VS Build Tools C++ |
| Blank/invisible pane | Settings → **Solid background**; check WebView2 |
| Pane floats over apps | Tray → **Send to desktop layer** |
| “Never made a repo” | Use `task-widget` — clone URL from GitHub after push |
| Files feel limiting | Expected — v1.1 storage revisit per planning; v0.1 still valid for UX test |

---

## Paste into Local Cursor agent

Copy the block from **`docs/LOCAL-AGENT-PROMPT.md`** — it has full context for the Local session.

## Tell the Local agent

- **`works`** — desktop layer + UX good enough to start v1.1 backlog  
- **Or paste:** errors, screenshots, what feels high-friction for ADHD  
- **Reference:** `docs/PLANNING-LOCKED.md` for all scope changes
