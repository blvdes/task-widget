# Paste this into a Local Cursor agent

```
I'm running TaskPane locally (desktop task widget beside Stardock Fences on Windows).
Repo: task-widget — already cloned on my PC.

READ FIRST:
- docs/STATUS.md — what's built vs what I must verify
- docs/HANDOFF.md — run commands
- docs/PLANNING-LOCKED.md — my locked scope

RUN (PowerShell in repo root):
npm install
.\scripts\dev.bat

FIRST-RUN CHECKLIST beside Fences:
1. Pane on desktop/wallpaper layer (not floating over apps). Tray → "Send to desktop layer" if wrong.
2. Ctrl+Win+Space → pane above windows + quick-add input focused
3. Esc → pane goes back to desktop layer
4. Check-off → follow-up field; sections ADMIN/LIFE/WORK visible
5. Tree: WORK/ folders, ├─/└─ subtasks, keyword colours on branches
6. Right-click task → ⏳ start-by and 📅 due dates
7. Documents\TaskPane\tasks.json exists; tasks.md auto-exported beside it
8. Settings → keywords, export Markdown, import sample/tasks.md if needed

Do NOT mod Fences — complementary widget only.

If build fails: docs/SETUP-WINDOWS.md (Node, Rust, VS Build Tools C++, WebView2).

Reply with: works / or list what's broken with errors or screenshots.
My task sample: sample/tasks.md
```
