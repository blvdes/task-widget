import { describe, expect, it } from "vitest";
import { importPlainText, parseMarkdown, serializeMarkdown } from "./markdown";

const SAMPLE = `## ADMIN

- [ ] RE REGISTER FOR SFE
  - 2 IMPOSSIBLE ACTIONS, MUST CHECK APP STATUS
- [x] RE REGISTER FOR UNI
`;

describe("markdown", () => {
  it("parses sections and tasks", () => {
    const doc = parseMarkdown(SAMPLE, "/test.md");
    expect(doc.sections[0].name).toBe("ADMIN");
    expect(doc.sections[0].tasks).toHaveLength(2);
    expect(doc.sections[0].tasks[0].children[0].text).toContain("IMPOSSIBLE");
    expect(doc.sections[0].tasks[1].checked).toBe(true);
  });

  it("round-trips serialize", () => {
    const doc = parseMarkdown(SAMPLE, "/test.md");
    const out = serializeMarkdown(doc);
    const reparsed = parseMarkdown(out, "/test.md");
    expect(reparsed.sections[0].tasks[0].text).toBe("RE REGISTER FOR SFE");
  });

  it("parses due dates and tags", () => {
    const md = `## WORK\n\n- [ ] Ship feature 📅 2026-09-20 #urgent\n`;
    const doc = parseMarkdown(md, "/t.md");
    expect(doc.sections[0].tasks[0].dueDate).toBe("2026-09-20");
    expect(doc.sections[0].tasks[0].tags).toContain("urgent");
  });

  it("imports legacy ALL-CAPS txt", () => {
    const raw = `ADMIN:
RE REGISTER FOR SFE
RE REGISTER FOR UNI: COMPLETED`;
    const md = importPlainText(raw);
    expect(md).toContain("## ADMIN");
    expect(md).toContain("- [ ] RE REGISTER FOR SFE");
    expect(md).toContain("- [x]");
  });

  it("serializes archive section", () => {
    const md = `## WORK

- [ ] Active task

## ARCHIVE

- [x] Old task _(archived 2026-09-17)_
`;
    const doc = parseMarkdown(md, "/t.md");
    expect(doc.archiveSection?.tasks).toHaveLength(1);
    const out = serializeMarkdown(doc);
    expect(out).toContain("## ARCHIVE");
    expect(out).toContain("Old task");
  });

  it("preserves follow-up child lines", () => {
    const md = `## ADMIN

- [x] DONE ITEM
  - ~~DONE ITEM~~ → CHECK BACK TOMORROW
`;
    const doc = parseMarkdown(md, "/t.md");
    expect(doc.sections[0].tasks[0].children[0].text).toContain("CHECK BACK");
    const out = serializeMarkdown(doc);
    expect(out).toContain("CHECK BACK TOMORROW");
  });
});
