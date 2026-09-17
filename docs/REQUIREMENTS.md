# TaskPane — Requirements

> **Planning:** Locked — see `docs/PLANNING-LOCKED.md` (your poll answers)  
> **Prototype:** v0.1 built in Cloud — verify on Windows Local  
> **Stack:** Tauri 2 + React + TypeScript  
> **Repo:** `task-widget`

---

## Architecture (evolving)

| Phase | Storage | Status |
|-------|---------|--------|
| **v0.1** | `.md` files on disk | Built — test UX + desktop layer |
| **v1.1** | Revisit structured local store + export | **`tasks.json` + `.md` export** (Local verify) |

Config paths (v0.1):

- `%APPDATA%\TaskPane\config.json`
- `%APPDATA%\TaskPane\meta.json`
- Tasks: `%USERPROFILE%\Documents\TaskPane\tasks.json` (+ exported `tasks.md`)

---

## Round 1 (locked)

| ID | Decision |
|----|----------|
| 1A | Complement Fences — **no modding** |
| 1B | ~~File-backed only forever~~ → **v0.1 files; v1.1 revisit storage** |
| 1C | ADHD-low-friction UX |
| 1D | Dark glass aesthetic |
| 1E | Desktop-layer widget; peek above windows |
| 1F | Check off, follow-ups, tree/subtasks, deadlines, reorder, archive |
| 1G | Multi-file, quick-add, tray, startup |
| 1H | Windows 10/11, Tauri 2 |

**Your answers:** `docs/PLANNING-LOCKED.md`

---

## v0.1 prototype checklist

Built in Cloud (Local must verify on Windows):

- [x] Tauri app + dark glass UI
- [x] Markdown parse/render, sections, check-off, follow-ups
- [x] Drag reorder, subtask collapse, archive, dates, tags
- [x] Spotlight + tray + peek hotkey
- [x] Desktop WorkerW embed + tray re-attach
- [x] Multi-file tabs + detach
- [x] File picker import
- [x] Tests + CI + README
- [ ] **Windows runtime beside Fences** ← Local agent

---

## v1.1 backlog (from planning)

- [x] Storage architecture revisit (`tasks.json` + Markdown export)
- [x] Merge peek + quick-add (`Ctrl+Win+Space`; browser preview: `Ctrl+Shift+Space`)
- [x] Checked tasks → bottom + recency sort (v1.1 partial — Local verify)
- [x] Terminal-style tree expand (2E) — Local verify polish
- [x] Soft + hard deadlines (`⏳` start-by, `📅` due)
- [x] Customisable status labels + colour accents (Settings)
- [x] Default `tasks.md`
- [x] Esc → blur to desktop layer (Local verify)
- [ ] Glass-matched font
