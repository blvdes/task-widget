import type { KeywordConfig, Section, TagConfig } from "../lib/types";
import { TaskItem } from "./TaskItem";

interface Props {
  section: Section;
  fontSize: number;
  keywords: KeywordConfig[];
  tags: TagConfig[];
  staleIds: Set<string>;
  taskCollapse: Record<string, boolean>;
  dragTaskId: string | null;
  hideCompleted: boolean;
  onToggleSection: (id: string) => void;
  onToggle: (id: string) => void;
  onTextChange: (id: string, text: string) => void;
  onFollowUp: (id: string, text: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onToggleTaskCollapse: (id: string) => void;
  onDragStart: (sectionId: string, taskId: string) => void;
  onDragOverTask: (sectionId: string, taskId: string) => void;
  onDropTask: (sectionId: string, targetId: string) => void;
}

export function SectionBlock({
  section,
  fontSize,
  keywords,
  tags,
  staleIds,
  taskCollapse,
  dragTaskId,
  hideCompleted,
  onToggleSection,
  onToggle,
  onTextChange,
  onFollowUp,
  onContextMenu,
  onToggleTaskCollapse,
  onDragStart,
  onDragOverTask,
  onDropTask,
}: Props) {
  const visibleTasks = hideCompleted ? section.tasks.filter((t) => !t.checked) : section.tasks;
  const openCount = section.tasks.filter((t) => !t.checked).length;

  return (
    <section className="section">
      <div
        className="section-header"
        onClick={() => onToggleSection(section.id)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onToggleSection("__all__");
        }}
      >
        <span className="section-name">
          {section.collapsed ? "▸" : "▾"} {section.name}
        </span>
        <span className="section-count">{openCount} open</span>
      </div>
      {!section.collapsed && (
        <ul className="task-list">
          {visibleTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              fontSize={fontSize}
              keywords={keywords}
              tags={tags}
              stale={staleIds.has(task.id)}
              collapsed={taskCollapse[task.id] ?? false}
              draggable
              onToggle={onToggle}
              onTextChange={onTextChange}
              onFollowUp={onFollowUp}
              onContextMenu={onContextMenu}
              onToggleCollapse={onToggleTaskCollapse}
              onDragStart={() => onDragStart(section.id, task.id)}
              onDragOver={() => onDragOverTask(section.id, task.id)}
              onDrop={() => onDropTask(section.id, task.id)}
            />
          ))}
        </ul>
      )}
      {dragTaskId && !section.collapsed && (
        <span className="sr-only">Dragging {dragTaskId}</span>
      )}
    </section>
  );
}
