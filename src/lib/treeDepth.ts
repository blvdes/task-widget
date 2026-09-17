import type { Section, TaskDocument, TaskNode } from "./types";

export function defaultTaskCollapsed(task: TaskNode, taskCollapse: Record<string, boolean>): boolean {
  if (task.id in taskCollapse) return taskCollapse[task.id]!;
  return task.children.length > 2;
}

export function maxVisibleTreeDepth(
  doc: TaskDocument | null,
  taskCollapse: Record<string, boolean>,
  sectionCollapse: Record<string, boolean>,
  hideCompleted: boolean,
): number {
  if (!doc) return 0;

  let max = 0;

  const walk = (tasks: TaskNode[], depth: number) => {
    for (const t of tasks) {
      if (hideCompleted && t.checked) continue;
      max = Math.max(max, depth);
      if (t.children.length === 0) continue;
      if (defaultTaskCollapsed(t, taskCollapse)) continue;
      walk(t.children, depth + 1);
    }
  };

  const visitSection = (section: Section) => {
    if (sectionCollapse[section.id]) return;
    walk(section.tasks, 0);
  };

  doc.sections.forEach(visitSection);
  if (doc.archiveSection) visitSection(doc.archiveSection);

  return max;
}

export function widthForTreeDepth(baseWidth: number, depth: number): number {
  return Math.min(720, Math.max(baseWidth, 300 + depth * 22));
}
