import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalPosition, LogicalSize } from "@tauri-apps/api/dpi";
import { listen } from "@tauri-apps/api/event";
import { motion } from "framer-motion";
import * as api from "./lib/api";
import { isTauri } from "./lib/platform";
import { formatDate, importPlainText, parseMarkdown, serializeMarkdown } from "./lib/markdown";
import type { AppConfig, Section, TaskDocument, TaskNode } from "./lib/types";
import { DEFAULT_CONFIG } from "./lib/types";
import { SectionBlock } from "./components/SectionBlock";
import { SettingsPanel } from "./components/SettingsPanel";
import { SpotlightModal } from "./components/SpotlightModal";

function findTask(sections: Section[], id: string): { section: Section; task: TaskNode; parent?: TaskNode } | null {
  const walk = (tasks: TaskNode[], section: Section, parent?: TaskNode): ReturnType<typeof findTask> => {
    for (const t of tasks) {
      if (t.id === id) return { section, task: t, parent };
      const found = walk(t.children, section, t);
      if (found) return found;
    }
    return null;
  };
  for (const s of sections) {
    const found = walk(s.tasks, s);
    if (found) return found;
  }
  return null;
}

function findTaskInDoc(doc: TaskDocument, id: string): ReturnType<typeof findTask> {
  const sections = doc.archiveSection ? [...doc.sections, doc.archiveSection] : doc.sections;
  return findTask(sections, id);
}

function getInitialFileFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("file");
}

const ROLLED_HEIGHT = 36;

export default function App() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [doc, setDoc] = useState<TaskDocument | null>(null);
  const [rolledUp, setRolledUp] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddText, setQuickAddText] = useState("");
  const [lastSectionId, setLastSectionId] = useState("inbox");
  const [meta, setMeta] = useState<Record<string, number>>({});
  const [dragging, setDragging] = useState(false);
  const [dragFrom, setDragFrom] = useState<{ sectionId: string; taskId: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; taskId: string } | null>(null);
  const [dueDateInput, setDueDateInput] = useState("");
  const resizeRef = useRef<{ w: number; h: number; x: number; y: number } | null>(null);
  const windowReady = useRef(false);
  const expandedHeight = useRef(DEFAULT_CONFIG.window.height);
  const lastMtime = useRef(0);
  const editingLock = useRef(false);

  const activePath = config.files[config.activeFileIndex] ?? "";

  const persistWindowState = useCallback(
    async (cfg: AppConfig, rolled: boolean, heightOverride?: number) => {
      if (!isTauri()) return;
      try {
        const win = getCurrentWindow();
        const pos = await win.outerPosition();
        const size = await win.outerSize();
        const next: AppConfig = {
          ...cfg,
          window: {
            x: pos.x,
            y: pos.y,
            width: size.width,
            height: heightOverride ?? (rolled ? cfg.window.height : size.height),
            rolledUp: rolled,
          },
        };
        setConfig(next);
        await api.saveConfig(next);
      } catch {
        /* browser preview */
      }
    },
    [],
  );

  const applyWindowGeometry = useCallback(async (cfg: AppConfig, rolled: boolean) => {
    if (!isTauri()) return;
    try {
      const win = getCurrentWindow();
      await win.setPosition(new LogicalPosition(cfg.window.x, cfg.window.y));
      await win.setSize(
        new LogicalSize(cfg.window.width, rolled ? ROLLED_HEIGHT : cfg.window.height),
      );
    } catch {
      /* browser preview */
    }
  }, []);

  const touchAndSave = useCallback((id: string) => {
    setMeta((prev) => {
      const next = { ...prev, [id]: Date.now() };
      void api.saveMeta(next);
      return next;
    });
  }, []);

  const staleIds = useMemo(() => {
    const ids = new Set<string>();
    const week = 7 * 24 * 60 * 60 * 1000;
    if (!doc) return ids;
    for (const s of doc.sections) {
      const visit = (t: TaskNode) => {
        if (!t.checked) {
          const touched = meta[t.id];
          if (touched && Date.now() - touched > week) ids.add(t.id);
        }
        t.children.forEach(visit);
      };
      s.tasks.forEach(visit);
    }
    return ids;
  }, [doc, meta]);

  const persist = useCallback(
    async (nextDoc: TaskDocument, nextConfig?: AppConfig) => {
      setDoc(nextDoc);
      editingLock.current = true;
      await api.writeFile(nextDoc.filePath, serializeMarkdown(nextDoc));
      lastMtime.current = await api.fileMtime(nextDoc.filePath);
      window.setTimeout(() => {
        editingLock.current = false;
      }, 500);
      if (nextConfig) {
        setConfig(nextConfig);
        await api.saveConfig(nextConfig);
      }
    },
    [],
  );

  const loadFile = useCallback(async (path: string, cfg: AppConfig) => {
    let content = "";
    try {
      content = await api.readFile(path);
    } catch {
      content = "## INBOX\n\n";
      await api.writeFile(path, content);
    }
    const parsed = parseMarkdown(content, path);
    parsed.sections = parsed.sections.map((s) => ({
      ...s,
      collapsed: cfg.sectionCollapse[s.id] ?? false,
    }));
    setDoc(parsed);

    const mtimeMs = (await api.fileMtime(path)) * 1000;
    setMeta((prev) => {
      const next = { ...prev };
      let changed = false;
      const seed = (t: TaskNode) => {
        if (!t.checked && next[t.id] === undefined) {
          next[t.id] = mtimeMs;
          changed = true;
        }
        t.children.forEach(seed);
      };
      parsed.sections.forEach((s) => s.tasks.forEach(seed));
      if (changed) void api.saveMeta(next);
      return changed ? next : prev;
    });
  }, []);

  const addFilePath = useCallback(
    async (path: string, cfg: AppConfig) => {
      const next = {
        ...cfg,
        files: [...new Set([...cfg.files, path])],
        activeFileIndex: cfg.files.indexOf(path) >= 0 ? cfg.files.indexOf(path) : cfg.files.length,
      };
      if (!cfg.files.includes(path)) {
        next.files = [...cfg.files, path];
        next.activeFileIndex = next.files.length - 1;
      }
      setConfig(next);
      await api.saveConfig(next);
      await loadFile(path, next);
    },
    [loadFile],
  );

  useEffect(() => {
    void (async () => {
      const [cfg, savedMeta] = await Promise.all([api.loadConfig(), api.loadMeta()]);
      let nextCfg = cfg;
      if (nextCfg.files.length === 0) {
        const defaultPath = await api.getDefaultTasksPath();
        nextCfg = { ...nextCfg, files: [defaultPath] };
        await api.saveConfig(nextCfg);
      }
      setConfig(nextCfg);
      setMeta(savedMeta);
      expandedHeight.current = nextCfg.window.height;
      const rolled = nextCfg.rolledUpOnStartup;
      setRolledUp(rolled);
      if (isTauri()) await applyWindowGeometry(nextCfg, rolled);

      const urlFile = getInitialFileFromUrl();
      const path = urlFile ?? nextCfg.files[nextCfg.activeFileIndex] ?? nextCfg.files[0];
      await loadFile(path, nextCfg);
      windowReady.current = true;
    })();
  }, [loadFile, applyWindowGeometry]);

  const rollupInitialized = useRef(false);

  useEffect(() => {
    if (!windowReady.current || !isTauri()) return;
    if (!rollupInitialized.current) {
      rollupInitialized.current = true;
      return;
    }
    void (async () => {
      if (rolledUp) {
        try {
          const size = await getCurrentWindow().outerSize();
          if (size.height > ROLLED_HEIGHT + 8) {
            expandedHeight.current = size.height;
            await persistWindowState(config, true, expandedHeight.current);
          }
          await getCurrentWindow().setSize(new LogicalSize(config.window.width, ROLLED_HEIGHT));
        } catch {
          /* noop */
        }
      } else {
        await getCurrentWindow().setSize(
          new LogicalSize(config.window.width, expandedHeight.current),
        );
      }
    })();
  }, [rolledUp]);

  useEffect(() => {
    if (!windowReady.current || !isTauri()) return;
    const win = getCurrentWindow();
    const debounce = { t: 0 };
    const scheduleSave = () => {
      window.clearTimeout(debounce.t);
      debounce.t = window.setTimeout(() => {
        void persistWindowState(config, rolledUp, expandedHeight.current);
      }, 400);
    };
    const unsubs = [
      win.onMoved(scheduleSave),
      win.onResized(() => {
        void win.outerSize().then((s) => {
          if (!rolledUp) expandedHeight.current = s.height;
          scheduleSave();
        });
      }),
    ];
    return () => {
      void Promise.all(unsubs.map((u) => u.then((f) => f())));
    };
  }, [config, rolledUp, persistWindowState]);

  useEffect(() => {
    if (!isTauri()) return;
    const win = getCurrentWindow();
    const unlistenBlur = win.listen("tauri://blur", () => {
      void api.sendToDesktopLayer();
    });
    const unlistenFocus = win.listen("tauri://focus", () => {
      void win.setAlwaysOnTop(true);
    });
    const unlistenDrop = win.onDragDropEvent((event) => {
      if (event.payload.type === "drop") {
        const path = event.payload.paths[0];
        if (path) void addFilePath(path, config);
      }
    });

    return () => {
      void Promise.all([
        unlistenBlur.then((f) => f()),
        unlistenFocus.then((f) => f()),
        unlistenDrop.then((f) => f()),
      ]);
    };
  }, [config, addFilePath]);

  useEffect(() => {
    if (!isTauri()) return;
    const unsubs = [
      listen("spotlight-open", () => setShowSpotlight(true)),
      listen("tray-focus", () => {
        setRolledUp(false);
        void api.bringToFront();
      }),
      listen("peek-toggle", () => {
        setRolledUp(false);
        void api.bringToFront();
      }),
      listen("file-dropped", (e) => {
        const path = e.payload as string;
        void addFilePath(path, config);
      }),
    ];
    return () => {
      void Promise.all(unsubs.map((u) => u.then((f) => f())));
    };
  }, [config, addFilePath]);

  useEffect(() => {
    if (!activePath) return;
    const poll = window.setInterval(() => {
      if (editingLock.current) return;
      void api.fileMtime(activePath).then(async (mtime) => {
        if (lastMtime.current && mtime > lastMtime.current && doc) {
          const content = await api.readFile(activePath);
          const parsed = parseMarkdown(content, activePath);
          parsed.sections = parsed.sections.map((s) => ({
            ...s,
            collapsed: config.sectionCollapse[s.id] ?? false,
          }));
          setDoc(parsed);
        }
        lastMtime.current = mtime;
      });
    }, 2500);
    void api.fileMtime(activePath).then((m) => {
      lastMtime.current = m;
    });
    return () => window.clearInterval(poll);
  }, [activePath, config.sectionCollapse]);

  const updateDoc = (updater: (d: TaskDocument) => TaskDocument) => {
    if (!doc) return;
    const next = updater(structuredClone(doc));
    void persist(next);
  };

  const handleToggle = (id: string) => {
    touchAndSave(id);
    updateDoc((d) => {
      const found = findTaskInDoc(d, id);
      if (!found) return d;
      found.task.checked = !found.task.checked;
      return d;
    });
  };

  const handleTextChange = (id: string, text: string) => {
    touchAndSave(id);
    updateDoc((d) => {
      const found = findTaskInDoc(d, id);
      if (!found) return d;
      found.task.text = text;
      return d;
    });
  };

  const handleFollowUp = (id: string, text: string) => {
    touchAndSave(id);
    updateDoc((d) => {
      const found = findTaskInDoc(d, id);
      if (!found) return d;
      found.task.children.push({
        id: `${id}-f-${Date.now()}`,
        text: `~~${found.task.text}~~ → ${text.toUpperCase()}`,
        checked: true,
        children: [],
        lineIndex: -1,
        tags: [],
      });
      return d;
    });
  };

  const handleSetDueDate = (id: string, date: string) => {
    touchAndSave(id);
    updateDoc((d) => {
      const found = findTaskInDoc(d, id);
      if (!found) return d;
      found.task.dueDate = date || undefined;
      return d;
    });
    setContextMenu(null);
  };

  const handleArchive = (id: string) => {
    updateDoc((d) => {
      const found = findTaskInDoc(d, id);
      if (!found) return d;
      if (!d.archiveSection) {
        d.archiveSection = { id: "archive", name: "ARCHIVE", tasks: [], collapsed: false };
      }
      found.task.text += ` _(archived ${formatDate(new Date())})_`;
      d.archiveSection.tasks.unshift(found.task);
      found.section.tasks = found.section.tasks.filter((t) => t.id !== id);
      return d;
    });
    setContextMenu(null);
  };

  const handleAddTag = (id: string, tag: string) => {
    touchAndSave(id);
    updateDoc((d) => {
      const found = findTaskInDoc(d, id);
      if (!found) return d;
      if (!found.task.tags.includes(tag)) found.task.tags.push(tag);
      return d;
    });
    setContextMenu(null);
  };

  const handleToggleTaskCollapse = (id: string) => {
    const next = { ...config.taskCollapse, [id]: !(config.taskCollapse[id] ?? false) };
    const nextCfg = { ...config, taskCollapse: next };
    setConfig(nextCfg);
    void api.saveConfig(nextCfg);
  };

  const handleToggleSection = (id: string) => {
    if (!doc) return;
    if (id === "__all__") {
      const anyOpen = doc.sections.some((s) => !s.collapsed);
      const nextSections = doc.sections.map((s) => ({ ...s, collapsed: anyOpen }));
      const collapseMap = Object.fromEntries(nextSections.map((s) => [s.id, s.collapsed]));
      const nextCfg = { ...config, sectionCollapse: collapseMap };
      setConfig(nextCfg);
      setDoc({ ...doc, sections: nextSections });
      void api.saveConfig(nextCfg);
      return;
    }
    const nextSections = doc.sections.map((s) =>
      s.id === id ? { ...s, collapsed: !s.collapsed } : s,
    );
    const collapseMap = {
      ...config.sectionCollapse,
      [id]: nextSections.find((s) => s.id === id)!.collapsed,
    };
    const nextCfg = { ...config, sectionCollapse: collapseMap };
    setDoc({ ...doc, sections: nextSections });
    void api.saveConfig(nextCfg);
    setConfig(nextCfg);
    setLastSectionId(id);
  };

  const handleQuickAdd = (sectionId: string, text: string) => {
    const newId = `new-${Date.now()}`;
    touchAndSave(newId);
    updateDoc((d) => {
      const section = d.sections.find((s) => s.id === sectionId) ?? d.sections[0];
      section.tasks.push({
        id: newId,
        text,
        checked: false,
        children: [],
        lineIndex: -1,
        tags: [],
      });
      setLastSectionId(section.id);
      return d;
    });
    setQuickAddText("");
    setQuickAddOpen(false);
  };

  const handleDragStart = (sectionId: string, taskId: string) => {
    setDragFrom({ sectionId, taskId });
  };

  const handleDropTask = (sectionId: string, targetId: string) => {
    if (!dragFrom || dragFrom.sectionId !== sectionId) return;
    updateDoc((d) => {
      const section = d.sections.find((s) => s.id === sectionId);
      if (!section) return d;
      const fromIdx = section.tasks.findIndex((t) => t.id === dragFrom.taskId);
      const toIdx = section.tasks.findIndex((t) => t.id === targetId);
      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return d;
      const [item] = section.tasks.splice(fromIdx, 1);
      section.tasks.splice(toIdx, 0, item);
      return d;
    });
    setDragFrom(null);
  };

  const startWindowDrag = async () => {
    if (!isTauri()) return;
    setDragging(true);
    await getCurrentWindow().startDragging();
    setDragging(false);
  };

  const startResize = async (e: React.MouseEvent) => {
    if (!isTauri()) return;
    e.preventDefault();
    e.stopPropagation();
    const win = getCurrentWindow();
    const size = await win.innerSize();
    resizeRef.current = { w: size.width, h: size.height, x: e.screenX, y: e.screenY };

    const onMove = async (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const dw = ev.screenX - resizeRef.current.x;
      const dh = ev.screenY - resizeRef.current.y;
      await win.setSize(
        new LogicalSize(
          Math.max(280, resizeRef.current.w + dw),
          Math.max(160, resizeRef.current.h + dh),
        ),
      );
    };
    const onUp = () => {
      resizeRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const fileName = activePath.split(/[/\\]/).pop() ?? "TaskPane";

  const sectionProps = {
    fontSize: config.fontSize,
    keywords: config.keywords,
    tags: config.tags,
    staleIds,
    taskCollapse: config.taskCollapse,
    dragTaskId: dragFrom?.taskId ?? null,
    hideCompleted: config.hideCompleted,
    onToggle: handleToggle,
    onTextChange: handleTextChange,
    onFollowUp: handleFollowUp,
    onToggleTaskCollapse: handleToggleTaskCollapse,
    onDragStart: handleDragStart,
    onDragOverTask: (_sectionId: string, _taskId: string) => {},
    onDropTask: handleDropTask,
    onContextMenu: (e: React.MouseEvent, taskId: string) => {
      e.preventDefault();
      const found = doc ? findTaskInDoc(doc, taskId) : null;
      setDueDateInput(found?.task.dueDate ?? "");
      setContextMenu({ x: e.clientX, y: e.clientY, taskId });
    },
  };

  return (
    <motion.div
      className={`app-shell ${rolledUp ? "rolling" : ""} ${config.solidBackground ? "solid" : ""}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={
        {
          "--blur": `${config.blur}px`,
          "--font-size": `${config.fontSize}px`,
          opacity: config.opacity,
          fontFamily: config.fontFamily,
        } as React.CSSProperties
      }
      onClick={() => setContextMenu(null)}
    >
      <header
        className={`titlebar ${!rolledUp ? "draggable" : ""}`}
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          if (!rolledUp) void startWindowDrag();
        }}
        onDoubleClick={() => {
          setRolledUp((r) => {
            const next = !r;
            void persistWindowState(config, next, expandedHeight.current);
            return next;
          });
        }}
      >
        <span className="title">
          {dragging ? "Moving…" : (
            <>
              TaskPane
              <span className="title-file">{fileName}</span>
            </>
          )}
        </span>
        <div className="controls">
          <button type="button" className="icon-btn" title="Quick add" onClick={() => setShowSpotlight(true)}>
            +
          </button>
          <button type="button" className="icon-btn" title="Settings" onClick={() => setShowSettings(true)}>
            ⚙
          </button>
          <button
            type="button"
            className="icon-btn"
            title={rolledUp ? "Expand" : "Roll up"}
            onClick={() => {
              setRolledUp((r) => {
                const next = !r;
                void persistWindowState(config, next, expandedHeight.current);
                return next;
              });
            }}
          >
            {rolledUp ? "▾" : "▴"}
          </button>
        </div>
      </header>

      <div className="rolled-content">
        {config.files.length >= 1 && (
          <div className="tabs">
            {config.files.map((f, i) => (
              <div key={f} className="tab-group">
                <button
                  type="button"
                  className={`tab ${i === config.activeFileIndex ? "active" : ""}`}
                  onClick={() => {
                    const next = { ...config, activeFileIndex: i };
                    setConfig(next);
                    void api.saveConfig(next);
                    void loadFile(f, next);
                  }}
                >
                  {f.split(/[/\\]/).pop()}
                </button>
                <button
                  type="button"
                  className="tab-detach"
                  title="Open in new window"
                  onClick={() => void api.detachPane(f)}
                >
                  ⤢
                </button>
              </div>
            ))}
          </div>
        )}

        <main className="content">
          {doc?.sections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              onToggleSection={handleToggleSection}
              {...sectionProps}
            />
          ))}
          {doc?.archiveSection && doc.archiveSection.tasks.length > 0 && (
            <SectionBlock
              section={doc.archiveSection}
              onToggleSection={handleToggleSection}
              {...sectionProps}
            />
          )}
        </main>

        <div className="quick-add-bar">
          {quickAddOpen ? (
            <input
              className="quick-add-input"
              autoFocus
              placeholder="New task…"
              value={quickAddText}
              onChange={(e) => setQuickAddText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && quickAddText.trim()) {
                  handleQuickAdd(lastSectionId, quickAddText.trim());
                }
                if (e.key === "Escape") setQuickAddOpen(false);
              }}
              onBlur={() => {
                if (!quickAddText.trim()) setQuickAddOpen(false);
              }}
            />
          ) : (
            <button type="button" className="quick-add-btn" onClick={() => setQuickAddOpen(true)}>
              + Add task
            </button>
          )}
        </div>

        <div className="resize-handle" title="Resize" onMouseDown={startResize} />
      </div>

      {showSettings && (
        <SettingsPanel
          config={config}
          onChange={async (c) => {
            setConfig(c);
            await api.saveConfig(c);
            await api.setStartup(c.openOnStartup);
          }}
          onClose={() => setShowSettings(false)}
          onAddFile={(path) => void addFilePath(path, config)}
          onImport={async (path) => {
            const raw = await api.readFile(path);
            const md = importPlainText(raw);
            const out = path.replace(/\.txt$/i, ".md");
            await api.writeFile(out, md);
            await addFilePath(out, config);
          }}
        />
      )}

      {showSpotlight && doc && (
        <SpotlightModal
          sections={doc.sections}
          defaultSectionId={lastSectionId}
          onSubmit={handleQuickAdd}
          onClose={() => setShowSpotlight(false)}
        />
      )}

      {contextMenu && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="settings-row" style={{ padding: "4px 8px" }}>
            <label style={{ fontSize: 11, opacity: 0.6 }}>Due date</label>
            <input
              type="date"
              value={dueDateInput}
              onChange={(e) => setDueDateInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSetDueDate(contextMenu.taskId, dueDateInput);
              }}
            />
            <button type="button" onClick={() => handleSetDueDate(contextMenu.taskId, dueDateInput)}>
              Set date
            </button>
          </div>
          {config.tags.map((t) => (
            <button key={t.name} type="button" onClick={() => handleAddTag(contextMenu.taskId, t.name)}>
              Tag #{t.name}
            </button>
          ))}
          <button type="button" onClick={() => handleArchive(contextMenu.taskId)}>
            Archive
          </button>
          <button type="button" onClick={() => setContextMenu(null)}>
            Cancel
          </button>
        </div>
      )}
    </motion.div>
  );
}
