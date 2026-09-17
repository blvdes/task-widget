import { describe, expect, it } from "vitest";
import { maxVisibleTreeDepth, widthForTreeDepth } from "./treeDepth";
import type { TaskDocument, TaskNode } from "./types";

function node(id: string, children: TaskNode[] = []): TaskNode {
  return { id, text: id, checked: false, children, lineIndex: 0, tags: [] };
}

describe("treeDepth", () => {
  it("counts expanded nested depth", () => {
    const doc: TaskDocument = {
      filePath: "/t.md",
      rawLines: [],
      sections: [
        {
          id: "work",
          name: "WORK",
          collapsed: false,
          tasks: [node("a", [node("b", [node("c")])])],
        },
      ],
    };
    expect(maxVisibleTreeDepth(doc, {}, {}, false)).toBe(2);
  });

  it("respects collapsed branches", () => {
    const doc: TaskDocument = {
      filePath: "/t.md",
      rawLines: [],
      sections: [
        {
          id: "work",
          name: "WORK",
          collapsed: false,
          tasks: [node("a", [node("b", [node("c")])])],
        },
      ],
    };
    expect(maxVisibleTreeDepth(doc, { a: true }, {}, false)).toBe(0);
  });

  it("grows width with depth", () => {
    expect(widthForTreeDepth(340, 0)).toBe(340);
    expect(widthForTreeDepth(340, 3)).toBe(366);
  });
});
