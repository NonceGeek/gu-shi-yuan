import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { buildSearchIndex } from "../src/lib/search-index";
import type { SearchIndex } from "../src/lib/search-index-types";

const SEARCH_INDEX_PATH = path.join(process.cwd(), "public/search-index.json");

function readSearchIndexArtifact(): SearchIndex {
  if (!fs.existsSync(SEARCH_INDEX_PATH)) {
    throw new Error(`Missing generated artifact: ${SEARCH_INDEX_PATH}`);
  }

  let raw: string;
  try {
    raw = fs.readFileSync(SEARCH_INDEX_PATH, "utf8");
  } catch (error) {
    throw new Error(`Unable to read generated artifact: ${SEARCH_INDEX_PATH}`, {
      cause: error,
    });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON in generated artifact: ${SEARCH_INDEX_PATH}`, {
      cause: error,
    });
  }

  return parsed as SearchIndex;
}

const artifact = readSearchIndexArtifact();
const expected = buildSearchIndex();

try {
  assert.deepStrictEqual(artifact, expected);
} catch (error) {
  throw new Error(
    `Generated search index does not match buildSearchIndex(): ${SEARCH_INDEX_PATH}`,
    { cause: error },
  );
}

console.log(
  `Generated artifacts verified: ${expected.poems.length} poems, ${expected.authors.length} authors`,
);
