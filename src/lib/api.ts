import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import sampleTasks from "../../sample/tasks.md?raw";
import type { AppConfig } from "./types";
import { DEFAULT_CONFIG } from "./types";
import { isTauri } from "./platform";

const TASK_FILE_FILTER = [{ name: "Task files", extensions: ["md", "txt"] }];

const LS_CONFIG = "taskpane:config";
const LS_META = "taskpane:meta";
const fileKey = (path: string) => `taskpane:file:${path}`;

const PREVIEW_PATH = "preview/tasks.md";

function browserLoadConfig(): AppConfig {
  const raw = localStorage.getItem(LS_CONFIG);
  if (!raw) return { ...DEFAULT_CONFIG, files: [PREVIEW_PATH] };
  return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
}

function browserSaveConfig(config: AppConfig): void {
  localStorage.setItem(LS_CONFIG, JSON.stringify(config));
}

function browserEnsureSample(): void {
  if (!localStorage.getItem(fileKey(PREVIEW_PATH))) {
    localStorage.setItem(fileKey(PREVIEW_PATH), sampleTasks);
  }
}

export async function readFile(path: string): Promise<string> {
  if (isTauri()) return invoke<string>("read_file", { path });
  browserEnsureSample();
  return localStorage.getItem(fileKey(path)) ?? "";
}

export async function writeFile(path: string, content: string): Promise<void> {
  if (isTauri()) return invoke("write_file", { path, content });
  localStorage.setItem(fileKey(path), content);
}

export async function loadConfig(): Promise<AppConfig> {
  if (isTauri()) return invoke<AppConfig>("load_config");
  browserEnsureSample();
  return browserLoadConfig();
}

export async function saveConfig(config: AppConfig): Promise<void> {
  if (isTauri()) return invoke("save_config", { config });
  browserSaveConfig(config);
}

export async function getDefaultTasksPath(): Promise<string> {
  if (isTauri()) return invoke<string>("get_default_tasks_path");
  browserEnsureSample();
  return PREVIEW_PATH;
}

export async function importTxt(path: string): Promise<string> {
  if (isTauri()) return invoke<string>("import_txt", { path });
  return readFile(path);
}

export async function openUrl(url: string): Promise<void> {
  if (isTauri()) return invoke("open_url", { url });
  window.open(url, "_blank");
}

export async function setStartup(enabled: boolean): Promise<void> {
  if (isTauri()) return invoke("set_startup", { enabled });
}

export async function showSpotlight(): Promise<void> {
  if (isTauri()) return invoke("show_spotlight");
}

export async function bringToFront(): Promise<void> {
  if (isTauri()) return invoke("bring_to_front");
}

export async function sendToDesktopLayer(): Promise<void> {
  if (isTauri()) return invoke("send_to_desktop_layer");
}

export async function loadMeta(): Promise<Record<string, number>> {
  if (isTauri()) return invoke<Record<string, number>>("load_meta");
  const raw = localStorage.getItem(LS_META);
  return raw ? JSON.parse(raw) : {};
}

export async function saveMeta(meta: Record<string, number>): Promise<void> {
  if (isTauri()) return invoke("save_meta", { meta });
  localStorage.setItem(LS_META, JSON.stringify(meta));
}

export async function detachPane(filePath: string): Promise<void> {
  if (isTauri()) return invoke("detach_pane", { filePath });
  window.open(`${window.location.pathname}?file=${encodeURIComponent(filePath)}`, "_blank");
}

export async function fileMtime(path: string): Promise<number> {
  if (isTauri()) return invoke<number>("file_mtime", { path });
  return localStorage.getItem(fileKey(path)) ? Math.floor(Date.now() / 1000) : 0;
}

export async function setSolidBackground(solid: boolean): Promise<void> {
  if (isTauri()) return invoke("set_solid_background", { solid });
}

function browserPickFile(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".md,.txt,text/plain,text/markdown";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const path = `preview/${file.name}`;
        localStorage.setItem(fileKey(path), String(reader.result ?? ""));
        resolve(path);
      };
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}

export async function pickTaskFile(): Promise<string | null> {
  if (isTauri()) {
    const result = await open({ multiple: false, filters: TASK_FILE_FILTER });
    return typeof result === "string" ? result : null;
  }
  return browserPickFile();
}
