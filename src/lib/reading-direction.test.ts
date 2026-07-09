import { describe, expect, it, vi } from "vitest";
import {
  alignVerticalScrollToFirstColumn,
  chapterSentenceOffsets,
  DEFAULT_READING_DIRECTION,
  groupHorizontalRows,
  groupHorizontalRowsByChapter,
  groupVerticalColumnsByChapter,
  groupVerticalLineColumns,
  READING_DIRECTION_STORAGE_KEY,
  overlaySideForReadingDirection,
  parseReadingDirection,
  persistReadingDirection,
  readStoredReadingDirection,
  verticalReadingScrollLeft,
} from "./reading-direction";

describe("parseReadingDirection", () => {
  it("returns vertical only for the vertical token", () => {
    expect(parseReadingDirection("vertical")).toBe("vertical");
  });

  it("falls back to horizontal for missing or unknown values", () => {
    expect(parseReadingDirection(null)).toBe("horizontal");
    expect(parseReadingDirection("")).toBe("horizontal");
    expect(parseReadingDirection("landscape")).toBe("horizontal");
  });
});

describe("readStoredReadingDirection", () => {
  it("reads the persisted direction from storage", () => {
    const storage = {
      getItem: vi.fn().mockReturnValue("vertical"),
    };

    expect(readStoredReadingDirection(storage)).toBe("vertical");
    expect(storage.getItem).toHaveBeenCalledWith(READING_DIRECTION_STORAGE_KEY);
  });

  it("returns the default when nothing is stored", () => {
    const storage = {
      getItem: vi.fn().mockReturnValue(null),
    };

    expect(readStoredReadingDirection(storage)).toBe(DEFAULT_READING_DIRECTION);
  });
});

describe("persistReadingDirection", () => {
  it("writes the direction to storage", () => {
    const storage = {
      setItem: vi.fn(),
    };

    persistReadingDirection(storage, "vertical");

    expect(storage.setItem).toHaveBeenCalledWith(
      READING_DIRECTION_STORAGE_KEY,
      "vertical",
    );
  });
});

describe("overlaySideForReadingDirection", () => {
  it("opens popovers below in horizontal mode", () => {
    expect(overlaySideForReadingDirection("horizontal", "popover")).toBe(
      "bottom",
    );
  });

  it("opens tooltips above in horizontal mode", () => {
    expect(overlaySideForReadingDirection("horizontal", "tooltip")).toBe("top");
  });

  it("opens overlays to the left in vertical mode", () => {
    expect(overlaySideForReadingDirection("vertical", "popover")).toBe("left");
    expect(overlaySideForReadingDirection("vertical", "tooltip")).toBe("left");
  });
});

describe("verticalReadingScrollLeft", () => {
  it("returns zero when content fits the viewport", () => {
    expect(verticalReadingScrollLeft(320, 320)).toBe(0);
    expect(verticalReadingScrollLeft(280, 320)).toBe(0);
  });

  it("returns overflow when content is wider than the viewport", () => {
    expect(verticalReadingScrollLeft(800, 320)).toBe(480);
  });
});

describe("chapterSentenceOffsets", () => {
  it("assigns continuous global sentence indexes across chapters", () => {
    const chapters = [
      ["句1。", "句2。", "句3。", "句4。", "句5。"],
      ["句6。", "句7。", "句8。"],
    ];

    expect(chapterSentenceOffsets(chapters)).toEqual([0, 5]);
  });
});

describe("groupHorizontalRows", () => {
  const sentences = (count: number) =>
    Array.from({ length: count }, (_, i) => `句${i + 1}。`);

  it.each([
    { count: 1, expected: [["句1。"]] },
    { count: 2, expected: [["句1。", "句2。"]] },
    { count: 4, expected: [["句1。", "句2。"], ["句3。", "句4。"]] },
    {
      count: 5,
      expected: [["句1。", "句2。"], ["句3。", "句4。"], ["句5。"]],
    },
  ])("pairs $count sentences into rows of two", ({ count, expected }) => {
    expect(groupHorizontalRows(sentences(count))).toEqual(expected);
  });
});

describe("groupHorizontalRowsByChapter", () => {
  it("groups each chapter independently", () => {
    const chapters = [
      ["日出而作。", "日入而息。", "凿井而饮。", "耕田而食。", "帝力于我何有哉。"],
      ["麛裘而鞸。", "投之无戾。", "鞸之麛裘。", "投之无邮。"],
    ];

    expect(groupHorizontalRowsByChapter(chapters)).toEqual([
      [
        ["日出而作。", "日入而息。"],
        ["凿井而饮。", "耕田而食。"],
        ["帝力于我何有哉。"],
      ],
      [
        ["麛裘而鞸。", "投之无戾。"],
        ["鞸之麛裘。", "投之无邮。"],
      ],
    ]);
  });
});

describe("groupVerticalLineColumns", () => {
  const lines = (count: number) =>
    Array.from({ length: count }, (_, i) => `line-${i + 1}`);

  it("keeps short poems in a single column", () => {
    expect(groupVerticalLineColumns(lines(3))).toEqual([lines(3)]);
    expect(groupVerticalLineColumns(lines(4))).toEqual([lines(4)]);
    expect(groupVerticalLineColumns(lines(5))).toEqual([lines(5)]);
  });

  it("chunks by five when the count is a multiple of five", () => {
    expect(groupVerticalLineColumns(lines(10))).toEqual([
      lines(5),
      ["line-6", "line-7", "line-8", "line-9", "line-10"],
    ]);
  });

  it("balances six lines into two columns of three", () => {
    expect(groupVerticalLineColumns(lines(6))).toEqual([
      lines(3),
      ["line-4", "line-5", "line-6"],
    ]);
  });

  it("splits nine lines into five and four", () => {
    expect(groupVerticalLineColumns(lines(9))).toEqual([
      lines(5),
      ["line-6", "line-7", "line-8", "line-9"],
    ]);
  });

  it("balances eleven lines without a single-line orphan column", () => {
    expect(groupVerticalLineColumns(lines(11))).toEqual([
      lines(4),
      ["line-5", "line-6", "line-7", "line-8"],
      ["line-9", "line-10", "line-11"],
    ]);
  });
});

describe("groupVerticalColumnsByChapter", () => {
  it("keeps 击壤歌 in one column and 孔子诵 in two single columns", () => {
    const chapters = [
      [
        "日出而作。",
        "日入而息。",
        "凿井而饮。",
        "耕田而食。",
        "帝力于我何有哉。",
      ],
      ["麛裘而鞸。", "投之无戾。", "鞸之麛裘。", "投之无邮。"],
      ["衮衣章甫。", "实获我所。", "章甫衮衣。", "惠我无私。"],
    ];

    expect(groupVerticalColumnsByChapter(chapters)).toEqual([
      [chapters[0]],
      [chapters[1]],
      [chapters[2]],
    ]);
  });
});

describe("alignVerticalScrollToFirstColumn", () => {
  type FakeViewport = {
    scrollWidth: number;
    clientWidth: number;
    scrollLeft: number;
    scrollTo: ReturnType<typeof vi.fn>;
  };

  function makeViewport(
    scrollWidth: number,
    clientWidth: number,
  ): FakeViewport {
    const el: FakeViewport = {
      scrollWidth,
      clientWidth,
      scrollLeft: 0,
      scrollTo: vi.fn((opts: { left: number }) => {
        el.scrollLeft = opts.left;
      }),
    };
    return el;
  }

  it("scrolls to the positive origin when the browser supports it", () => {
    const viewport = makeViewport(800, 320);
    alignVerticalScrollToFirstColumn(
      viewport as unknown as HTMLElement,
      480,
    );
    expect(viewport.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ left: 480 }),
    );
  });

  it("does not attempt negative fallback when target is zero", () => {
    const viewport = makeViewport(320, 320);
    alignVerticalScrollToFirstColumn(
      viewport as unknown as HTMLElement,
      0,
    );
    expect(viewport.scrollTo).toHaveBeenCalledTimes(1);
    expect(viewport.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ left: 0 }),
    );
  });
});
