# Paste this into a Local Cursor agent

```
I'm continuing TaskPane (desktop task widget beside Stardock Fences on Windows).

READ FIRST:
- docs/HANDOFF.md — how to run
- docs/PLANNING-LOCKED.md — my locked poll answers (storage revisit, merged peek, tree UI, etc.)

CONTEXT:
- v0.1 prototype is built (Tauri 2 + React). Test it before v1.1 work.
- Repo name: task-widget
- Do NOT mod Fences — complementary widget only
- I questioned file-only storage (#2 priority) — v1.1 should revisit structured local store

RUN:
cd task-widget
npm install
.\scripts\dev.bat

VERIFY beside Fences:
1. Pane sits on desktop layer (wallpaper), not always-on-top over apps
2. Tray → Send to desktop layer if needed
3. Ctrl+Shift+Space peek (v0.1) brings pane above windows
4. Check-off → follow-up field; sections ADMIN/LIFE/WORK
5. Settings → import my tasks if needed

THEN implement v1.1 backlog from PLANNING-LOCKED.md starting with:
- Ctrl+Win+Space merged peek + quick-add
- Default tasks.md
- Checked tasks sort to bottom

Reply with what works / what's broken. My task sample: sample/tasks.md
```
