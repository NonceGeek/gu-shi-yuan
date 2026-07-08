import { preload } from "react-dom";

export const WENKAI_SUBSET_PATH = "/fonts/wenkai/wenkai-subset.woff2";

export function preloadWenkaiSubset(): void {
  preload(WENKAI_SUBSET_PATH, {
    as: "font",
    crossOrigin: "anonymous",
    type: "font/woff2",
  });
}
