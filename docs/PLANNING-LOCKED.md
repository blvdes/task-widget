# TaskPane — Planning locked (your answers)

> **Phase:** ✅ Planning complete — start Local agent for v0.1 Windows test  
> **Architecture:** `docs/ARCHITECTURE.md`  
> **Run guide:** `docs/HANDOFF.md` · **Paste prompt:** `docs/LOCAL-AGENT-PROMPT.md`  
> **Repo:** `task-widget` (your GitHub)  
> **Drop:** Fences modding (complement only, never mod)

### Sync code to `task-widget` (if needed)

Cloud agent pushes to Cursor git remote. Mirror to your GitHub:

```powershell
git remote add github https://github.com/YOUR_USER/task-widget.git
git push github main
```

Or clone from Cursor remote if that's where the latest code lives.

---

## Priority rethink (important)

You flagged **#2 priority (file-backed storage) as wrong for long-term evolution**. Files limit UI/features/options.

| Layer | Decision |
|-------|----------|
| **v0.1 (built now)** | File-backed `.md` — usable prototype for UX/desktop-layer testing |
| **v1.1 (revisit soon)** | Evaluate structured local store (JSON/SQLite) as source of truth, with optional Markdown export/import — **do not let file format block UI** |
| **Principle** | ADHD-low-friction UX > storage dogma; storage must support tree UI, multi-deadline, status accents, peek pane |

---

## Round 2 — your answers

| ID | Question area | Your choice | Notes |
|----|---------------|-------------|-------|
| **2A** | Startup state | **B** | Not rolled-up-by-default (revisit after UX test) |
| **2B** | Task format | **D + A & B** | Hybrid freeform — **revisit when storage architecture changes** |
| **2C** | Check-off behavior | **A + sort rules** | Inline follow-up; if follow-up skipped, checked task **moves to bottom after a moment**; checked tasks **auto-sort to bottom** (inner order: most → least recently checked) |
| **2D** | Indent / child types | **B** | (See 2E — tree UI may supersede) |
| **2E** | Side branches / tree | **Lean: terminal-style tree** | Indented expand downward; auto-resize width if needed; directory-tree inspired, polished — not raw terminal |
| **2F** | Tags | **C** | (Right-click / picker pattern — confirm in Local UX pass) |
| **2G** | Deadlines | **A + soft deadlines** | Hard deadline + **soft deadline** (“start working by…”) — scope multi-deadline |
| **2H** | Status / keywords | **Customisable labels** | Keep status labels; easy customisation; **colour = accent on expand/tree chrome** |
| **2I** | Multi-file / windows | **C** | Tabs + detach (keep; aligns with multi-context) |
| **2J** | Quick-add target | **C, prefilled like A** | **Sections** = category headers in one file (ADMIN, LIFE, WORK, UNI, PERSONAL PROJECTS) — not separate files. Quick-add **pre-fills last section** but input stays **concise / out of the way** |
| **2K** | Desktop layer + peek | **A + Fences-like** | Default: **desktop widget layer**; **peek** (hotkey + tray) brings pane **above windows**; otherwise sits on desktop |
| **2L** | Stale nudge | **B** | (Confirm: likely show stale without clearing aggressively — verify in Local) |
| **2M** | Import ADMIN.txt | **Maybe N/A** | Less relevant if moving off pure `.txt` workflow |
| **2N** | Font | **Glass-aesthetic match** | Not locked to Inter — pick font that fits dark glass |
| **2O** | Stack | **D** | Confirm Tauri variant in Local (v0.1 uses Tauri 2) |

**Q14 (QOL):** Persist window position/size (and related chrome state) — always, low friction.

---

## Round 3 — your answers

| ID | Decision | Notes |
|----|----------|-------|
| **3A** | **Merge peek + quick-add** | Single “command center” surface: `Ctrl+Win+Space` default (**customisable**); pane **avoids overlapping windows by default**, user can **drag to overlap**; tray click triggers same peek |
| **3B** | **B** | |
| **3C** | **A** | Auto-focus follow-up on check-off |
| **3D** | **B** | **Esc = blur** (same as clicking away — return to desktop layer) |
| **3E** | **`tasks.md`** | Default task file name (not ADMIN.md) |

---

## v0.1 already built (Cloud prototype)

Use for **first Local run** — then iterate toward rows above.

- Tauri 2 + React, dark glass UI
- Markdown files, sections, check-off, follow-up, archive, drag reorder
- Tray, peek (`Ctrl+Shift+Space` in v0.1 — change to `Ctrl+Win+Space` in v1.1)
- WorkerW desktop embed + “Send to desktop layer” tray action
- Browser preview: `npm run preview:ui`

---

## v1.1 backlog (after Local confirms desktop layer)

1. **Storage revisit** — structured local store; Markdown as export not prison  
2. **Merged peek + quick-add pane** — `Ctrl+Win+Space`, smart placement, draggable overlap  
3. **Checked-task auto-sort** — bottom bucket, recency order inside bucket  
4. **Tree / terminal-style expand** — 2E design pass  
5. **Soft + hard deadlines**  
6. **Customisable status labels + colour accents on tree**  
7. **Rename default file → `tasks.md`**  
8. **Font pass for glass aesthetic**  
9. **Esc → blur / desktop layer**

---

## Your task data (source)

Uploaded planning snapshot saved as `sample/tasks.md` (from your ADMIN list).
