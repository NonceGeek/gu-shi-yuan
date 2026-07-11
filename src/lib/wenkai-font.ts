import { preload } from "react-dom";
import { WENKAI_SUBSET_PATHS } from "@/lib/wenkai-subset-path.generated";

export { WENKAI_SUBSET_PATHS };

/** Preload only the first unicode-range slice (UI/fallback glyphs). */
export function preloadWenkaiSubset(): void {
  const firstSlice = WENKAI_SUBSET_PATHS[0];
  if (!firstSlice) {
    return;
  }

  preload(firstSlice, {
    as: "font",
    crossOrigin: "anonymous",
    type: "font/woff2",
  });
}
