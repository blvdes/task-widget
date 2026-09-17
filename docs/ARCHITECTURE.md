# TaskPane — Architecture (locked)

> Planning answers: `docs/PLANNING-LOCKED.md`  
> **v0.1** = prototype to verify on Windows · **v1.1** = your locked UX deltas + storage revisit

---

## v1 scope (what you asked for)

| Area | v0.1 (now) | v1.1 (next) |
|------|------------|-------------|
| **Storage** | `.md` files + JSON config/meta | **`tasks.json` canonical** + auto-exported `tasks.md` |
| **UI** | Dark glass pane, section headers | Terminal-style tree expand; status colour accents |
| **Desktop** | WorkerW embed; peek above windows | Same + Esc blur; merged peek/quick pane |
| **Input** | Check-off, follow-up, drag reorder | Checked → bottom + recency sort; soft + hard deadlines |
| **Quick add** | Spotlight + bottom bar | Merged with peek; `Ctrl+Win+Space`; smart placement |
| **Multi-context** | Tabs + detach windows | Keep |
| **ADHD UX** | Minimal steps, no magic parsers | Customisable status labels; concise pre-filled section |

**Explicit non-goals:** Fences modding, server sync, account/auth, database in cloud.

---

## v0.1 stack (built)

```
┌─────────────────────────────────────────┐
│  React UI (Vite)                        │
│  - sections, tasks, settings, spotlight │
└─────────────────┬───────────────────────┘
                  │ Tauri invoke
┌─────────────────▼───────────────────────┐
│  Rust (src-tauri)                       │
│  - read/write files, config, meta       │
│  - system tray, global shortcut         │
│  - WorkerW desktop embed (Windows)      │
└─────────────────┬───────────────────────┘
                  │
     tasks.md  config.json  meta.json
     (Documents/TaskPane)  (%APPDATA%/TaskPane)
```

---

## v1.1 storage direction (your #2 priority fix)

Files were blocking UI evolution. Target shape:

1. **Canonical model** in app memory + on disk as structured JSON (or SQLite if queries needed).
2. **Views** render tree, deadlines, status — not constrained by Markdown line syntax.
3. **Export/import** Markdown for portability and Notepad compatibility.
4. **Migration** from v0.1 `tasks.md` on first v1.1 launch.

Decision deferred to Local agent after UX test — prototype validates desktop layer first.

---

## Config paths (Windows)

| File | Path |
|------|------|
| Tasks (canonical) | `%USERPROFILE%\Documents\TaskPane\tasks.json` |
| Markdown export | `%USERPROFILE%\Documents\TaskPane\tasks.md` |
| Config | `%APPDATA%\TaskPane\config.json` |
| Touch meta (stale) | `%APPDATA%\TaskPane\meta.json` |

---

## Peek / layer behaviour (locked)

| Mode | Z-order | Trigger |
|------|---------|---------|
| **Widget** | Desktop layer (WorkerW) | Default; click away |
| **Peek** | Above all windows | Hotkey, tray; v1.1 = `Ctrl+Win+Space` merged pane |
