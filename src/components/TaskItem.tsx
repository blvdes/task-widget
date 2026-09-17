import { useEffect, useRef, useState } from "react";
import type { KeywordConfig, TagConfig, TaskNode } from "../lib/types";
import { extractUrls } from "../lib/markdown";
import * as api from "../lib/api";

interface Props {
  task: TaskNode;
  depth?: number;
  fontSize: number;
  keywords: KeywordConfig[];
  tags: TagConfig[];
  stale?: boolean;
  collapsed?: boolean;
  draggable?: boolean;
  onToggle: (id: string) => void;
  onTextChange: (id: string, text: string) => void;
  onFollowUp: (id: string, text: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onToggleCollapse: (id: string) => void;
  onDragStart?: (id: string) => void;
  onDragOver?: (e: React.DragEvent, id: string) => void;
  onDrop?: (e: React.DragEvent, id: string) => void;
}

function keywordColor(text: string, keywords: KeywordConfig[]): string | undefined {
  const upper = text.toUpperCase();
  for (const k of keywords) {
    if (upper.includes(k.word.toUpperCase())) return k.color;
  }
  return undefined;
}

function renderText(text: string) {
  const urls = extractUrls(text);
  if (urls.length === 0) return text;

  let parts: (string | JSX.Element)[] = [text];
  for (const url of urls) {
    parts = parts.flatMap((part, i) => {
      if (typeof part !== "string") return [part];
      const idx = part.indexOf(url);
      if (idx === -1) return [part];
      return [
        part.slice(0, idx),
        <a
          key={`${url}-${i}`}
          href={url}
          onClick={(e) => {
            e.preventDefault();
            if (e.ctrlKey || e.metaKey) void api.openUrl(url);
          }}
        >
          {url}
        </a>,
        part.slice(idx + url.length),
      ];
    });
  }
  return parts;
}

export function TaskItem({
  task,
  depth = 0,
  fontSize,
  keywords,
  tags,
  stale,
  collapsed,
  draggable,
  onToggle,
  onTextChange,
  onFollowUp,
  onContextMenu,
  onToggleCollapse,
  onDragStart,
  onDragOver,
  onDrop,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [followUp, setFollowUp] = useState("");
  const followUpRef = useRef<HTMLInputElement>(null);
  const prevChecked = useRef(task.checked);

  useEffect(() => {
    if (!prevChecked.current && task.checked) {
      followUpRef.current?.focus();
    }
    prevChecked.current = task.checked;
  }, [task.checked]);

  const borderColor = keywordColor(task.text, keywords);
  const isCheckbox = task.text !== "" && !task.text.startsWith("~~");
  const hasChildren = task.children.length > 0;

  return (
    <li
      className={`task-item ${task.checked ? "done" : ""} ${stale ? "stale" : ""}`}
      style={{ borderLeftColor: borderColor ?? "transparent" }}
      draggable={draggable && depth === 0}
      onDragStart={() => onDragStart?.(task.id)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(e, task.id);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDrop?.(e, task.id);
      }}
    >
      <div className="task-row">
        {draggable && depth === 0 && (
          <span className="drag-grip" title="Drag to reorder">
            ⠿
          </span>
        )}
        {hasChildren && (
          <button
            type="button"
            className="collapse-btn"
            onClick={() => onToggleCollapse(task.id)}
            aria-label={collapsed ? "Expand subtasks" : "Collapse subtasks"}
          >
            {collapsed ? "▸" : "▾"}
          </button>
        )}
        {isCheckbox ? (
          <input
            type="checkbox"
            className="checkbox"
            checked={task.checked}
            onChange={() => onToggle(task.id)}
          />
        ) : (
          <span className="checkbox-spacer" />
        )}
        <div className="task-body">
          {editing ? (
            <input
              className="follow-up-input"
              value={editText}
              autoFocus
              onChange={(e) => setEditText(e.target.value)}
              onBlur={() => {
                onTextChange(task.id, editText);
                setEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onTextChange(task.id, editText);
                  setEditing(false);
                }
                if (e.key === "Escape") setEditing(false);
              }}
            />
          ) : (
            <div
              className="task-text"
              style={{ fontSize }}
              onDoubleClick={() => {
                setEditText(task.text);
                setEditing(true);
              }}
              onContextMenu={(e) => onContextMenu(e, task.id)}
            >
              {renderText(task.text)}
            </div>
          )}
          <div className="task-meta">
            {task.dueDate && <span className="due">📅 {task.dueDate}</span>}
            {task.tags.map((t) => {
              const cfg = tags.find((x) => x.name === t);
              return (
                <span key={t} className="tag" style={{ background: cfg?.color ?? undefined }}>
                  #{t}
                </span>
              );
            })}
          </div>
          {task.checked && (
            <input
              ref={followUpRef}
              className="follow-up-input"
              placeholder="Add follow-up…"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && followUp.trim()) {
                  onFollowUp(task.id, followUp.trim());
                  setFollowUp("");
                }
              }}
            />
          )}
        </div>
      </div>
      {hasChildren && !collapsed && (
        <ul className="task-list children">
          {task.children.map((child) => (
            <TaskItem
              key={child.id}
              task={child}
              depth={depth + 1}
              fontSize={fontSize}
              keywords={keywords}
              tags={tags}
              onToggle={onToggle}
              onTextChange={onTextChange}
              onFollowUp={onFollowUp}
              onContextMenu={onContextMenu}
              onToggleCollapse={onToggleCollapse}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
