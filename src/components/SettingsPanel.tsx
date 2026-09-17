import type { AppConfig } from "../lib/types";
import { pickTaskFile, setSolidBackground } from "../lib/api";

interface Props {
  config: AppConfig;
  onChange: (config: AppConfig) => void;
  onClose: () => void;
  onAddFile: (path: string) => void;
  onImport: (path: string) => void;
  onExportMarkdown?: () => void;
}

export function SettingsPanel({
  config,
  onChange,
  onClose,
  onAddFile,
  onImport,
  onExportMarkdown,
}: Props) {
  const update = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Settings</h3>

        <div className="settings-row">
          <label>Open on Windows startup</label>
          <input
            type="checkbox"
            checked={config.openOnStartup}
            onChange={(e) => update("openOnStartup", e.target.checked)}
          />
        </div>

        <div className="settings-row">
          <label>Hide completed tasks (archive keeps them)</label>
          <input
            type="checkbox"
            checked={config.hideCompleted}
            onChange={(e) => update("hideCompleted", e.target.checked)}
          />
        </div>

        <div className="settings-row">
          <label>Rolled up on startup</label>
          <input
            type="checkbox"
            checked={config.rolledUpOnStartup}
            onChange={(e) => update("rolledUpOnStartup", e.target.checked)}
          />
        </div>

        <div className="settings-row">
          <label>Solid background (fix invisible pane)</label>
          <input
            type="checkbox"
            checked={config.solidBackground}
            onChange={(e) => {
              update("solidBackground", e.target.checked);
              void setSolidBackground(e.target.checked);
            }}
          />
        </div>

        <div className="settings-row">
          <label>Font family</label>
          <select
            value={config.fontFamily}
            onChange={(e) => update("fontFamily", e.target.value)}
          >
            <option value="Inter">Inter</option>
            <option value="Segoe UI Variable">Segoe UI Variable</option>
            <option value="JetBrains Mono">JetBrains Mono</option>
          </select>
        </div>

        <div className="settings-row">
          <label>Font size ({config.fontSize}px)</label>
          <input
            type="range"
            min={11}
            max={18}
            value={config.fontSize}
            onChange={(e) => update("fontSize", Number(e.target.value))}
          />
        </div>

        <div className="settings-row">
          <label>Opacity ({Math.round(config.opacity * 100)}%)</label>
          <input
            type="range"
            min={0.5}
            max={1}
            step={0.02}
            value={config.opacity}
            onChange={(e) => update("opacity", Number(e.target.value))}
          />
        </div>

        <div className="settings-row">
          <label>Blur ({config.blur}px)</label>
          <input
            type="range"
            min={0}
            max={40}
            value={config.blur}
            onChange={(e) => update("blur", Number(e.target.value))}
          />
        </div>

        <div className="settings-row">
          <label>Status keywords (colour accents on tree)</label>
          {config.keywords.map((kw, i) => (
            <div key={i} style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <input
                value={kw.word}
                placeholder="WORD"
                onChange={(e) => {
                  const keywords = [...config.keywords];
                  keywords[i] = { ...kw, word: e.target.value.toUpperCase() };
                  update("keywords", keywords);
                }}
              />
              <input
                type="color"
                value={kw.color}
                onChange={(e) => {
                  const keywords = [...config.keywords];
                  keywords[i] = { ...kw, color: e.target.value };
                  update("keywords", keywords);
                }}
                style={{ width: 40, padding: 2 }}
              />
              <button
                type="button"
                className="quick-add-btn"
                onClick={() => update("keywords", config.keywords.filter((_, j) => j !== i))}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            className="quick-add-btn"
            style={{ marginTop: 8 }}
            onClick={() =>
              update("keywords", [...config.keywords, { word: "NEW", color: "#6c9eff" }])
            }
          >
            + Add keyword
          </button>
        </div>

        <div className="settings-row">
          <label>Task files (one path per line)</label>
          <textarea
            style={{
              width: "100%",
              minHeight: 80,
              marginTop: 8,
              padding: 10,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(0,0,0,0.35)",
              color: "white",
              fontFamily: "monospace",
              fontSize: 11,
            }}
            value={config.files.join("\n")}
            onChange={(e) =>
              update(
                "files",
                e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
              )
            }
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
          {onExportMarkdown && (
            <button type="button" className="quick-add-btn" onClick={onExportMarkdown}>
              Export Markdown copy
            </button>
          )}
          <button
            type="button"
            className="quick-add-btn"
            onClick={async () => {
              const path = await pickTaskFile();
              if (path) onAddFile(path);
            }}
          >
            Add task file…
          </button>
          <button
            type="button"
            className="quick-add-btn"
            onClick={async () => {
              const path = await pickTaskFile();
              if (path) onImport(path);
            }}
          >
            Import .txt → .md
          </button>
          <button type="button" className="quick-add-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
