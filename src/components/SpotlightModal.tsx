import { useEffect, useRef, useState } from "react";
import type { Section } from "../lib/types";

interface Props {
  sections: Section[];
  defaultSectionId?: string;
  onSubmit: (sectionId: string, text: string) => void;
  onClose: () => void;
}

export function SpotlightModal({ sections, defaultSectionId, onSubmit, onClose }: Props) {
  const [text, setText] = useState("");
  const [sectionId, setSectionId] = useState(
    defaultSectionId ?? sections[0]?.id ?? "inbox",
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="spotlight-overlay" onClick={onClose}>
      <div className="spotlight-panel" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: 0, fontSize: 14, opacity: 0.7 }}>Quick add task</h3>
        <select
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          style={{
            width: "100%",
            marginTop: 12,
            padding: 10,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.35)",
            color: "white",
          }}
        >
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          ref={inputRef}
          placeholder="What needs doing?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && text.trim()) {
              onSubmit(sectionId, text.trim());
              onClose();
            }
          }}
        />
        <p style={{ fontSize: 11, opacity: 0.45, margin: "10px 0 0" }}>
          Enter to save · Esc to close
        </p>
      </div>
    </div>
  );
}
