export interface TaskNode {
  id: string;
  text: string;
  checked: boolean;
  children: TaskNode[];
  lineIndex: number;
  dueDate?: string;
  softDueDate?: string;
  tags: string[];
}

export interface Section {
  id: string;
  name: string;
  tasks: TaskNode[];
  collapsed: boolean;
}

export interface TaskDocument {
  filePath: string;
  sections: Section[];
  archiveSection?: Section;
  rawLines: string[];
}

export interface TagConfig {
  name: string;
  color: string;
}

export interface KeywordConfig {
  word: string;
  color: string;
}

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  rolledUp: boolean;
}

export interface AppConfig {
  files: string[];
  activeFileIndex: number;
  openOnStartup: boolean;
  rolledUpOnStartup: boolean;
  fontFamily: string;
  fontSize: number;
  opacity: number;
  blur: number;
  peekHotkey: string;
  tags: TagConfig[];
  keywords: KeywordConfig[];
  window: WindowState;
  sectionCollapse: Record<string, boolean>;
  taskCollapse: Record<string, boolean>;
  hideCompleted: boolean;
  solidBackground: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
  files: [],
  activeFileIndex: 0,
  openOnStartup: true,
  rolledUpOnStartup: true,
  fontFamily: "Segoe UI Variable",
  fontSize: 13,
  opacity: 0.88,
  blur: 24,
  peekHotkey: "Ctrl+Win+Space",
  tags: [
    { name: "urgent", color: "#ff6b6b" },
    { name: "waiting", color: "#ffd166" },
  ],
  keywords: [
    { word: "IMPOSSIBLE", color: "#ff6b6b" },
    { word: "MUST", color: "#ffd166" },
    { word: "COMPLETED", color: "#06d6a0" },
  ],
  window: { x: 40, y: 80, width: 340, height: 560, rolledUp: true },
  sectionCollapse: {},
  taskCollapse: {},
  hideCompleted: false,
  solidBackground: false,
};
