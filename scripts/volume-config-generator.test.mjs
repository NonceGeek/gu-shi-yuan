import { describe, expect, it } from "vitest";
import {
  GENERATION_ORDER,
  VOLUME_CONFIG_SPECS,
} from "./volume-config-specs.mjs";
import {
  assignSlugs,
  authorSlugFor,
  parseBeiChaoCatalogEntries,
  parseStandardCatalogEntries,
  toSlug,
} from "./generate-volume-config.mjs";

/** Baseline expected entry counts (Step 1 invariants). */
const EXPECTED_COUNTS = {
  han: 134,
  wei: 63,
  jin: 103,
  song: 83,
  qi: 43,
  liang: 86,
  chen: 22,
  "bei-chao": 38,
  sui: 27,
};

describe("volume-config-specs", () => {
  it("spec keys equal GENERATION_ORDER", () => {
    expect(Object.keys(VOLUME_CONFIG_SPECS)).toEqual(GENERATION_ORDER);
  });

  it("export names and volume slugs are unique", () => {
    const exportNames = GENERATION_ORDER.map(
      (v) => VOLUME_CONFIG_SPECS[v].exportName,
    );
    const volumes = GENERATION_ORDER.map((v) => VOLUME_CONFIG_SPECS[v].volume);
    expect(new Set(exportNames).size).toBe(exportNames.length);
    expect(new Set(volumes).size).toBe(volumes.length);
    expect(volumes).toEqual(GENERATION_ORDER);
  });

  it("every reserved volume precedes its consumer", () => {
    const index = Object.fromEntries(GENERATION_ORDER.map((v, i) => [v, i]));
    for (const volume of GENERATION_ORDER) {
      const spec = VOLUME_CONFIG_SPECS[volume];
      for (const reserved of spec.reservedVolumes) {
        expect(index[reserved]).toBeLessThan(index[volume]);
      }
    }
  });

  it("Han and Wei do not reserve prior generated volumes or 古逸", () => {
    expect(VOLUME_CONFIG_SPECS.han.reserveGuYi).toBe(false);
    expect(VOLUME_CONFIG_SPECS.han.reservedVolumes).toEqual([]);
    expect(VOLUME_CONFIG_SPECS.wei.reserveGuYi).toBe(false);
    expect(VOLUME_CONFIG_SPECS.wei.reservedVolumes).toEqual([]);
  });

  it("北朝 uses the special parser", () => {
    expect(VOLUME_CONFIG_SPECS["bei-chao"].parser).toBe("bei-chao");
    for (const volume of GENERATION_ORDER) {
      if (volume === "bei-chao") continue;
      expect(VOLUME_CONFIG_SPECS[volume].parser).toBe("standard");
    }
  });

  it("all expected counts equal the baseline", () => {
    for (const volume of GENERATION_ORDER) {
      expect(VOLUME_CONFIG_SPECS[volume].expectedCount).toBe(
        EXPECTED_COUNTS[volume],
      );
    }
  });

  it("records representative load-bearing slug overrides", () => {
    expect(VOLUME_CONFIG_SPECS.han.slugOverrides["乐府歌辞|长歌行"]).toBe(
      "chang-ge-xing",
    );
    expect(VOLUME_CONFIG_SPECS.wei.slugOverrides["武帝|短歌行"]).toBe(
      "duan-ge-xing",
    );
    expect(VOLUME_CONFIG_SPECS.jin.slugDisambiguation["陶潜|杂诗"]).toBe(
      "tao-qian-za-shi",
    );
    expect(
      VOLUME_CONFIG_SPECS["bei-chao"].slugDisambiguation["常景|王褒"],
    ).toBe("chang-jing-wang-bao");
  });
});

describe("toSlug / authorSlugFor", () => {
  it("slugifies Chinese titles with pinyin", () => {
    expect(toSlug("大风歌")).toBe("da-feng-ge");
  });

  it("applies per-volume author slug overrides", () => {
    expect(authorSlugFor("乐府歌辞", VOLUME_CONFIG_SPECS.han)).toBe(
      "yue-fu-ge-ci",
    );
    expect(authorSlugFor("渔父", VOLUME_CONFIG_SPECS.song)).toBe("yu-fu");
    expect(authorSlugFor("斛律金", VOLUME_CONFIG_SPECS["bei-chao"])).toBe(
      "hu-lu-jin",
    );
    expect(authorSlugFor("炀帝", VOLUME_CONFIG_SPECS.sui)).toBe("yang-di");
  });
});

describe("assignSlugs", () => {
  it("prefers Han/Wei explicit slug overrides over disambiguation and title", () => {
    const entries = [
      { author: "乐府歌辞", title: "长歌行", mode: "single" },
      { author: "武帝", title: "短歌行", mode: "single" },
    ];
    const han = assignSlugs(entries.slice(0, 1), VOLUME_CONFIG_SPECS.han, new Set());
    expect(han[0].slug).toBe("chang-ge-xing");
    const wei = assignSlugs(entries.slice(1), VOLUME_CONFIG_SPECS.wei, new Set());
    expect(wei[0].slug).toBe("duan-ge-xing");
  });

  it("falls back to author-prefix on prior-volume collision", () => {
    const reserved = new Set(["za-shi"]);
    const entries = [{ author: "张华", title: "杂诗", mode: "single" }];
    // Without disambiguation, collision would use author prefix; with
    // disambiguation map, jin uses an explicit slug.
    const withDisambig = assignSlugs(
      entries,
      VOLUME_CONFIG_SPECS.jin,
      new Set(reserved),
    );
    expect(withDisambig[0].slug).toBe("zhang-hua-za-shi");

    const noDisambigSpec = {
      ...VOLUME_CONFIG_SPECS.song,
      slugOverrides: {},
      slugDisambiguation: {},
    };
    const collision = assignSlugs(
      [{ author: "王徽", title: "杂诗", mode: "single" }],
      noDisambigSpec,
      reserved,
    );
    expect(collision[0].slug).toBe("wang-hui-za-shi");
  });

  it("throws on unresolvable duplicate slugs", () => {
    const reserved = new Set(["za-shi", "zhang-hua-za-shi"]);
    const spec = {
      ...VOLUME_CONFIG_SPECS.jin,
      slugOverrides: {},
      slugDisambiguation: {},
      authorSlugOverrides: { 张华: "zhang-hua" },
    };
    expect(() =>
      assignSlugs(
        [{ author: "张华", title: "杂诗", mode: "single" }],
        spec,
        reserved,
      ),
    ).toThrow(/Duplicate slug/);
  });

  it("retains 北朝 per-entry dynasty on assigned entries", () => {
    const entries = [
      {
        author: "常景",
        title: "王褒",
        dynasty: "北魏",
        mode: "single",
      },
    ];
    const result = assignSlugs(
      entries,
      VOLUME_CONFIG_SPECS["bei-chao"],
      new Set(),
    );
    expect(result[0]).toMatchObject({
      slug: "chang-jing-wang-bao",
      dynasty: "北魏",
      authorSlug: "chang-jing",
    });
  });
});

describe("parseStandardCatalogEntries", () => {
  const hanSpec = VOLUME_CONFIG_SPECS.han;

  it("parses standard h3/h4 catalog entries", () => {
    const html = `
<h3 class="kindle-cn-heading3">高帝</h3>
<h4 class="kindle-cn-heading1">大风歌</h4>
<p class="kindle-cn-poem-left">大风起兮云飞扬。</p>
<h4 class="kindle-cn-heading1">鸿鹄歌</h4>
<p class="kindle-cn-poem-left">鸿鹄高飞。一举千里。</p>
`;
    const entries = parseStandardCatalogEntries(html, hanSpec);
    expect(entries).toEqual([
      { author: "高帝", title: "大风歌", mode: "single" },
      { author: "高帝", title: "鸿鹄歌", mode: "single" },
    ]);
  });

  it("splits no-h4 split nodes by first line", () => {
    const html = `
<h3 class="kindle-cn-heading3">古诗</h3>
<p class="kindle-cn-poem-left">上山采蘼芜。下山逢故夫。</p>
<p class="kindle-cn-poem-left">十五从军征。八十始得归。</p>
`;
    const entries = parseStandardCatalogEntries(html, hanSpec);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      author: "古诗",
      title: "上山采蘼芜",
      mode: "single",
    });
    expect(entries[1]).toMatchObject({
      author: "古诗",
      title: "十五从军征",
      mode: "single",
    });
  });

  it("treats single long nodes as multi-chapter", () => {
    const html = `
<h3 class="kindle-cn-heading3">古诗为焦仲卿妻作</h3>
<p class="kindle-cn-poem-left">孔雀东南飞。五里一徘徊。</p>
`;
    const entries = parseStandardCatalogEntries(html, hanSpec);
    expect(entries).toEqual([
      {
        author: "古诗为焦仲卿妻作",
        title: "古诗为焦仲卿妻作",
        mode: "multi-chapter",
      },
    ]);
  });
});

describe("parseBeiChaoCatalogEntries", () => {
  it("derives dynasty from h2 headings", () => {
    const html = `
<h2>北魏诗</h2>
<h3 class="kindle-cn-heading3">刘昶</h3>
<h4 class="kindle-cn-heading1">断句</h4>
<p class="kindle-cn-poem-left">白云山上尽。清风松下来。</p>
<h2>北齐诗</h2>
<h3 class="kindle-cn-heading3">邢邵</h3>
<h4 class="kindle-cn-heading1">思公子</h4>
<p class="kindle-cn-poem-left">绮罗日向暮。方知美色衰。</p>
`;
    const entries = parseBeiChaoCatalogEntries(
      html,
      VOLUME_CONFIG_SPECS["bei-chao"],
    );
    expect(entries).toEqual([
      {
        author: "刘昶",
        title: "断句",
        dynasty: "北魏",
        mode: "single",
      },
      {
        author: "邢邵",
        title: "思公子",
        dynasty: "北齐",
        mode: "single",
      },
    ]);
  });
});

describe("committed volume configs", () => {
  it("match expected baseline counts and a 北朝 dynasty entry", async () => {
    const { BEI_CHAO_CONFIG } = await import("./bei-chao-config.mjs");
    for (const volume of GENERATION_ORDER) {
      const mod = await import(`./${volume}-config.mjs`);
      const config = Object.values(mod)[0];
      expect(config.expectedCount).toBe(EXPECTED_COUNTS[volume]);
      expect(config.entries).toHaveLength(EXPECTED_COUNTS[volume]);
    }
    const sample = BEI_CHAO_CONFIG.entries.find(
      (entry) => entry.slug === "chang-jing-wang-bao",
    );
    expect(sample).toMatchObject({
      title: "王褒",
      author: "常景",
      dynasty: "北魏",
    });
  });
});
