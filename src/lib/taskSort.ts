import type { Section, TaskDocument, TaskNode } from "./types";

/** Unchecked first (preserve order); checked at bottom, most recently checked first. */
export function sortTopLevelTasks(
  tasks: TaskNode[],
  checkedAt: Record<string, number>,
): TaskNode[] {
  const open: TaskNode[] = [];
  const done: TaskNode[] = [];
  for (const t of tasks) {
    if (t.checked) done.push(t);
    else open.push(t);
  }
  done.sort((a, b) => (checkedAt[b.id] ?? 0) - (checkedAt[a.id] ?? 0));
  return [...open, ...done];
}

export function sortDocumentTasks(
  doc: TaskDocument,
  checkedAt: Record<string, number>,
): TaskDocument {
  const sortSection = (s: Section): Section => ({
    ...s,
    tasks: sortTopLevelTasks(s.tasks, checkedAt),
  });
  return {
    ...doc,
    sections: doc.sections.map(sortSection),
    archiveSection: doc.archiveSection ? sortSection(doc.archiveSection) : undefined,
  };
}
