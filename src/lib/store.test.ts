import { describe, expect, it } from "vitest";
import { parseMarkdown, serializeMarkdown } from "./markdown";
import { docToStored, jsonPathFromMd, mdExportPath, storedToDoc } from "./store";

describe("store", () => {
  it("round-trips document through JSON", () => {
    const md = `## WORK\n\n- [ ] Task ⏳ 2026-09-18 📅 2026-09-20 #urgent\n`;
    const doc = parseMarkdown(md, "/t.json");
    const stored = docToStored(doc);
    const back = storedToDoc(stored, "/t.json");
    expect(back.sections[0].tasks[0].softDueDate).toBe("2026-09-18");
    expect(serializeMarkdown(back)).toContain("Task");
  });

  it("maps md/json paths", () => {
    expect(jsonPathFromMd("/a/tasks.md")).toBe("/a/tasks.json");
    expect(mdExportPath("/a/tasks.json")).toBe("/a/tasks.md");
  });
});
