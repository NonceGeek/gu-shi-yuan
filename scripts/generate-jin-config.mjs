/** Compatibility wrapper — prefer scripts/generate-volume-config.mjs jin */
import { generateVolumeConfig, resolveEpubPath } from "./generate-volume-config.mjs";

const epubPath = resolveEpubPath(process.argv[2]);
if (!epubPath) {
  console.error("Usage: node scripts/generate-jin-config.mjs <epub-path>");
  process.exit(1);
}
const { outputPath, entries } = await generateVolumeConfig("jin", epubPath);
console.log(`Wrote ${entries.length} entries to ${outputPath}`);
