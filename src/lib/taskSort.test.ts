import { describe, expect, it } from "vitest";
import { sortTopLevelTasks } from "./taskSort";
import type { TaskNode } from "./types";

function task(id: string, checked: boolean): TaskNode {
  return { id, text: id, checked, children: [], lineIndex: 0, tags: [] };
}

describe("sortTopLevelTasks", () => {
  it("keeps unchecked first, checked at bottom by recency", () => {
    const tasks = [task("a", false), task("b", true), task("c", false), task("d", true)];
    const meta = { b: 100, d: 200 };
    const sorted = sortTopLevelTasks(tasks, meta);
    expect(sorted.map((t) => t.id)).toEqual(["a", "c", "d", "b"]);
  });
});
