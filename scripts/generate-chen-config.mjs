/** Compatibility wrapper — prefer scripts/generate-volume-config.mjs chen */
import { generateVolumeConfig, resolveEpubPath } from "./generate-volume-config.mjs";

const epubPath = resolveEpubPath(process.argv[2]);
if (!epubPath) {
  console.error("Usage: node scripts/generate-chen-config.mjs <epub-path>");
  process.exit(1);
}
const { outputPath, entries } = await generateVolumeConfig("chen", epubPath);
console.log(`Wrote ${entries.length} entries to ${outputPath}`);
