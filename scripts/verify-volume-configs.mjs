/**
 * Compare regenerated volume configs against committed scripts/*-config.mjs.
 *
 * Usage:
 *   node scripts/verify-volume-configs.mjs /tmp/gushiyuan-configs
 *
 * Requires an explicit candidate directory — never compares committed configs
 * with themselves.
 */
import assert from "assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import {
  GENERATION_ORDER,
  VOLUME_CONFIG_SPECS,
} from "./volume-config-specs.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SEMANTIC_FIELDS = [
  "volume",
  "dynasty",
  "epubParts",
  "expectedCount",
  "entries",
];

/**
 * @param {string} configPath
 * @param {string} exportName
 */
async function loadConfig(configPath, exportName) {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Missing config file: ${configPath}`);
  }
  // Bust import cache so temp regenerations are re-read.
  const url = `${pathToFileURL(configPath).href}?t=${Date.now()}`;
  const mod = await import(url);
  const config = mod[exportName];
  if (!config) {
    throw new Error(`Missing export ${exportName} in ${configPath}`);
  }
  return config;
}

/**
 * @param {object} config
 */
function semanticSlice(config) {
  /** @type {Record<string, unknown>} */
  const slice = {};
  for (const field of SEMANTIC_FIELDS) {
    slice[field] = config[field];
  }
  return slice;
}

function printUsage() {
  console.error(`Usage:
  node scripts/verify-volume-configs.mjs <candidate-dir>

Compares each <volume>-config.mjs in <candidate-dir> against the committed
scripts/<volume>-config.mjs. A candidate directory is required.`);
}

/**
 * @param {string[]} argv
 */
export async function main(argv = process.argv.slice(2)) {
  const candidateDir = argv[0];
  if (!candidateDir || candidateDir.startsWith("-")) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const resolvedCandidate = path.resolve(candidateDir);
  if (!fs.existsSync(resolvedCandidate) || !fs.statSync(resolvedCandidate).isDirectory()) {
    console.error(`Not a directory: ${resolvedCandidate}`);
    process.exitCode = 1;
    return;
  }

  for (const volume of GENERATION_ORDER) {
    const spec = VOLUME_CONFIG_SPECS[volume];
    const committedPath = path.join(__dirname, `${volume}-config.mjs`);
    const candidatePath = path.join(resolvedCandidate, `${volume}-config.mjs`);

    const committed = await loadConfig(committedPath, spec.exportName);
    const candidate = await loadConfig(candidatePath, spec.exportName);

    try {
      assert.deepStrictEqual(
        semanticSlice(candidate),
        semanticSlice(committed),
      );
    } catch (error) {
      console.error(`Mismatch: ${volume}`);
      console.error(error.message);
      process.exitCode = 1;
      return;
    }

    console.log(`OK ${volume} (${candidate.expectedCount} entries)`);
  }
}

const isDirectRun = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (isDirectRun) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
