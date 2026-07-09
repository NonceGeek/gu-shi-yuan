import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_SCRIPT_VARIANT,
  SCRIPT_VARIANT_STORAGE_KEY,
  langForScriptVariant,
  parseScriptVariant,
  persistScriptVariant,
  readStoredScriptVariant,
  textForScriptVariant,
} from "@/lib/script-variant";

describe("parseScriptVariant", () => {
  it("returns traditional only for the traditional token", () => {
    expect(parseScriptVariant("traditional")).toBe("traditional");
  });

  it("falls back to simplified for missing or unknown values", () => {
    expect(parseScriptVariant(null)).toBe(DEFAULT_SCRIPT_VARIANT);
    expect(parseScriptVariant("")).toBe(DEFAULT_SCRIPT_VARIANT);
    expect(parseScriptVariant("zh-Hant")).toBe(DEFAULT_SCRIPT_VARIANT);
  });
});

describe("script variant storage", () => {
  it("reads the persisted variant from storage", () => {
    const storage = {
      getItem: vi.fn().mockReturnValue("traditional"),
    };

    expect(readStoredScriptVariant(storage)).toBe("traditional");
    expect(storage.getItem).toHaveBeenCalledWith(SCRIPT_VARIANT_STORAGE_KEY);
  });

  it("writes the variant to storage", () => {
    const storage = {
      setItem: vi.fn(),
    };

    persistScriptVariant(storage, "traditional");

    expect(storage.setItem).toHaveBeenCalledWith(
      SCRIPT_VARIANT_STORAGE_KEY,
      "traditional",
    );
  });
});

describe("textForScriptVariant", () => {
  it("selects the requested text variant", () => {
    const text = { simplified: "古诗源", traditional: "古詩源" };

    expect(textForScriptVariant(text, "simplified")).toBe("古诗源");
    expect(textForScriptVariant(text, "traditional")).toBe("古詩源");
  });

  it("passes plain strings through", () => {
    expect(textForScriptVariant("古诗源", "traditional")).toBe("古诗源");
  });
});

describe("langForScriptVariant", () => {
  it("maps variants to html lang values", () => {
    expect(langForScriptVariant("simplified")).toBe("zh-CN");
    expect(langForScriptVariant("traditional")).toBe("zh-Hant");
  });
});
