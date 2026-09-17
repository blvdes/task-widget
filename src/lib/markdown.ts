import type { Section, TaskDocument, TaskNode } from "./types";

const SECTION_RE = /^##\s+(.+)$/;
const LEGACY_SECTION_RE = /^([A-Z][A-Z0-9 /&]+):\s*$/;
const DUE_RE = / 📅 (\d{4}-\d{2}-\d{2})/;
const TAG_RE = / #([\w-]+)/g;
const URL_RE = /https?:\/\/[^\s)]+/g;

function hashId(filePath: string, lineIndex: number, text: string): string {
  let h = 0;
  const s = `${filePath}:${lineIndex}:${text}`;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return `t${Math.abs(h)}`;
}

function getIndent(line: string): number {
  const m = line.match(/^(\s*)/);
  return m ? m[1].length : 0;
}

export function parseMarkdown(content: string, filePath: string): TaskDocument {
  const lines = content.split(/\r?\n/);
  const sections: Section[] = [];
  let archiveSection: Section | undefined;
  let current: Section | null = null;
  const stack: { indent: number; node: TaskNode }[] = [];

  const ensureSection = (name: string) => {
    const id = name.toLowerCase().replace(/\s+/g, "-");
    const isArchive = id === "archive";
    const section: Section = {
      id,
      name,
      tasks: [],
      collapsed: false,
    };
    if (isArchive) {
      archiveSection = section;
      current = section;
    } else {
      sections.push(section);
      current = section;
    }
  };

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const sectionMatch = trimmed.match(SECTION_RE);
    if (sectionMatch) {
      ensureSection(sectionMatch[1].trim());
      stack.length = 0;
      return;
    }

    if (!current && LEGACY_SECTION_RE.test(trimmed)) {
      ensureSection(trimmed.replace(/:$/, "").trim());
      stack.length = 0;
      return;
    }

    if (!current) {
      ensureSection("INBOX");
    }

    const taskMatch = line.match(/^(\s*)- \[([ xX])\] (.*)$/);
    if (taskMatch) {
      const indent = taskMatch[1].length;
      let body = taskMatch[3];
      const tags: string[] = [];
      let dueDate: string | undefined;
      const due = body.match(DUE_RE);
      if (due) {
        dueDate = due[1];
        body = body.replace(DUE_RE, "");
      }
      let tagMatch: RegExpExecArray | null;
      while ((tagMatch = TAG_RE.exec(body)) !== null) tags.push(tagMatch[1]);
      body = body.replace(/ #([\w-]+)/g, "").trim();
      const parsed = { checked: taskMatch[2].toLowerCase() === "x", text: body, dueDate, tags };
      const node: TaskNode = {
        id: hashId(filePath, lineIndex, parsed.text),
        text: parsed.text,
        checked: parsed.checked,
        children: [],
        lineIndex,
        dueDate: parsed.dueDate,
        tags: parsed.tags,
      };

      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      if (stack.length === 0) {
        current!.tasks.push(node);
      } else {
        stack[stack.length - 1].node.children.push(node);
      }
      stack.push({ indent, node });
      return;
    }

    const childMatch = line.match(/^(\s*)- (.*)$/);
    if (childMatch && current) {
      const indent = childMatch[1].length;
      const text = childMatch[2].trim();
      const node: TaskNode = {
        id: hashId(filePath, lineIndex, text),
        text,
        checked: text.includes("~~") && text.includes("→"),
        children: [],
        lineIndex,
        tags: [],
      };

      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      if (stack.length === 0) {
        current.tasks.push(node);
      } else {
        stack[stack.length - 1].node.children.push(node);
      }
      stack.push({ indent, node });
    }
  });

  if (sections.length === 0 && !archiveSection) {
    sections.push({ id: "inbox", name: "INBOX", tasks: [], collapsed: false });
  }

  return { filePath, sections, archiveSection, rawLines: lines };
}

function isCheckboxTask(node: TaskNode): boolean {
  return !node.text.includes("→") && !node.text.startsWith("~~");
}

function serializeTask(node: TaskNode, indent: number): string[] {
  const pad = " ".repeat(indent);
  let text = node.text;
  if (node.dueDate) text += ` 📅 ${node.dueDate}`;
  if (node.tags.length) text += node.tags.map((t) => ` #${t}`).join("");

  const lines: string[] = [];
  if (isCheckboxTask(node)) {
    lines.push(`${pad}- [${node.checked ? "x" : " "}] ${text}`);
  } else {
    lines.push(`${pad}- ${text}`);
  }

  for (const child of node.children) {
    lines.push(...serializeTask(child, indent + 2));
  }
  return lines;
}

export function serializeMarkdown(doc: TaskDocument): string {
  const out: string[] = [];

  for (const section of doc.sections) {
    out.push(`## ${section.name}`, "");
    for (const task of section.tasks) {
      out.push(...serializeTask(task, 0));
    }
    out.push("");
  }

  if (doc.archiveSection && doc.archiveSection.tasks.length > 0) {
    out.push(`## ${doc.archiveSection.name}`, "");
    for (const task of doc.archiveSection.tasks) {
      out.push(...serializeTask(task, 0));
    }
    out.push("");
  }

  return out.join("\n").trimEnd() + "\n";
}

export function importPlainText(content: string): string {
  const lines = content.split(/\r?\n/);
  const out: string[] = [];
  let currentSection = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (LEGACY_SECTION_RE.test(trimmed)) {
      currentSection = trimmed.replace(/:$/, "").trim();
      out.push(`## ${currentSection}`, "");
      continue;
    }

    if (!currentSection) {
      currentSection = "INBOX";
      out.push(`## ${currentSection}`, "");
    }

    const indent = getIndent(line);
    const pad = " ".repeat(Math.max(0, indent));
    if (trimmed.toUpperCase().includes("COMPLETED")) {
      out.push(`${pad}- [x] ${trimmed}`);
    } else {
      out.push(`${pad}- [ ] ${trimmed}`);
    }
  }

  return out.join("\n").trimEnd() + "\n";
}

export function extractUrls(text: string): string[] {
  return text.match(URL_RE) ?? [];
}

export function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
