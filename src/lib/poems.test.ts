import { describe, expect, it } from "vitest";
import { getAllPoems, getPoemBySlug } from "./poems";

describe("getPoemBySlug", () => {
  it("returns poem metadata and body for a known slug", () => {
    const poem = getPoemBySlug("duan-ge-xing");

    expect(poem).toBeDefined();
    expect(poem?.title).toBe("短歌行");
    expect(poem?.author).toBe("曹操");
    expect(poem?.dynasty).toBe("魏");
    expect(poem?.body).toContain("对酒当歌，人生几何！");
    expect(poem?.body).toContain("周公吐哺，天下归心。");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getPoemBySlug("not-a-poem")).toBeUndefined();
  });
});

describe("getAllPoems", () => {
  it("lists every poem with slug and metadata", () => {
    const poems = getAllPoems();

    expect(poems.length).toBeGreaterThanOrEqual(1);
    expect(poems.some((p) => p.slug === "duan-ge-xing")).toBe(true);
    expect(poems.every((p) => p.title && p.author && p.dynasty)).toBe(true);
  });
});
