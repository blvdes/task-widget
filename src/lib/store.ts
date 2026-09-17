import type { Section, TaskDocument, TaskNode } from "./types";

export interface StoredTask {
  id: string;
  text: string;
  checked: boolean;
  children: StoredTask[];
  dueDate?: string;
  softDueDate?: string;
  tags: string[];
}

export interface StoredSection {
  id: string;
  name: string;
  collapsed: boolean;
  tasks: StoredTask[];
}

export interface StoredDocument {
  version: 1;
  filePath: string;
  sections: StoredSection[];
  archiveSection?: StoredSection;
}

export function isJsonPath(path: string): boolean {
  return path.toLowerCase().endsWith(".json");
}

export function mdExportPath(jsonPath: string): string {
  return jsonPath.replace(/\.json$/i, ".md");
}

export function jsonPathFromMd(mdPath: string): string {
  return mdPath.replace(/\.md$/i, ".json");
}

function taskToStored(node: TaskNode): StoredTask {
  return {
    id: node.id,
    text: node.text,
    checked: node.checked,
    children: node.children.map(taskToStored),
    dueDate: node.dueDate,
    softDueDate: node.softDueDate,
    tags: node.tags,
  };
}

function storedToTask(node: StoredTask, lineIndex: number): TaskNode {
  return {
    id: node.id,
    text: node.text,
    checked: node.checked,
    children: node.children.map((c, i) => storedToTask(c, lineIndex + i + 1)),
    lineIndex,
    dueDate: node.dueDate,
    softDueDate: node.softDueDate,
    tags: node.tags ?? [],
  };
}

function sectionToStored(section: Section): StoredSection {
  return {
    id: section.id,
    name: section.name,
    collapsed: section.collapsed,
    tasks: section.tasks.map(taskToStored),
  };
}

function storedToSection(section: StoredSection): Section {
  return {
    id: section.id,
    name: section.name,
    collapsed: section.collapsed,
    tasks: section.tasks.map((t, i) => storedToTask(t, i)),
  };
}

export function docToStored(doc: TaskDocument): StoredDocument {
  return {
    version: 1,
    filePath: doc.filePath,
    sections: doc.sections.map(sectionToStored),
    archiveSection: doc.archiveSection ? sectionToStored(doc.archiveSection) : undefined,
  };
}

export function storedToDoc(stored: StoredDocument, filePath: string): TaskDocument {
  return {
    filePath,
    sections: stored.sections.map(storedToSection),
    archiveSection: stored.archiveSection ? storedToSection(stored.archiveSection) : undefined,
    rawLines: [],
  };
}
