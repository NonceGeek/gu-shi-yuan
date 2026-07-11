/**
 * Shared EPUB volume catalog config generator.
 * Volume-specific data: scripts/volume-config-specs.mjs
 *
 * Usage:
 *   node scripts/generate-volume-config.mjs han /path/to/古诗源.epub
 *   node scripts/generate-volume-config.mjs --all /path/to/古诗源.epub
 *   node scripts/generate-volume-config.mjs --all /path/to/古诗源.epub --output-dir /tmp/gushiyuan-configs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { pinyin } from "pinyin-pro";
import {
  extractTitleFromHeading,
  firstLineTitle,
  iterateMergedH4Entries,
  readEpubHtmlParts,
  stripPoemHtml,
} from "./epub-poem-utils.mjs";
import {
  GENERATION_ORDER,
  SINGLE_LONG_NODES,
  SPLIT_NODES,
  VOLUME_CONFIG_SPECS,
} from "./volume-config-specs.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @param {string} text
 */
export function toSlug(text) {
  return pinyin(text, { toneType: "none", type: "array" })
    .join("-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * @param {string} author
 * @param {{ authorSlugOverrides: Record<string, string> }} spec
 */
export function authorSlugFor(author, spec) {
  return spec.authorSlugOverrides[author] ?? toSlug(author);
}

/**
 * @param {string} section
 * @param {object} [dynastyFields]
 */
function parseAuthorSection(section, dynastyFields = null) {
  const entries = [];
  const h3Matches = [
    ...section.matchAll(/<h3 class="kindle-cn-heading3"[^>]*>([\s\S]*?)<\/h3>/gi),
  ];

  for (let i = 0; i < h3Matches.length; i++) {
    const author = extractTitleFromHeading(h3Matches[i][0]);
    const sectionStart = h3Matches[i].index + h3Matches[i][0].length;
    const sectionEnd =
      i + 1 < h3Matches.length ? h3Matches[i + 1].index : section.length;
    const authorSection = section.slice(sectionStart, sectionEnd);

    const h4Matches = [
      ...authorSection.matchAll(
        /<h4 class="kindle-cn-heading1">([\s\S]*?)<\/h4>/gi,
      ),
    ];

    if (h4Matches.length === 0) {
      const poemBlocks = [
        ...authorSection.matchAll(
          /<p class="kindle-cn-poem-left">([\s\S]*?)<\/p>/gi,
        ),
      ];

      if (SINGLE_LONG_NODES.has(author)) {
        entries.push({
          author,
          title: author,
          mode: "multi-chapter",
          ...(dynastyFields ?? {}),
        });
        continue;
      }

      if (SPLIT_NODES.has(author)) {
        for (const block of poemBlocks) {
          const text = stripPoemHtml(block[1]);
          entries.push({
            author,
            title: firstLineTitle(text),
            mode: "single",
            ...(dynastyFields ?? {}),
          });
        }
        continue;
      }

      throw new Error(`Unexpected no-h4 node: ${author}`);
    }

    for (const { title, mode } of iterateMergedH4Entries(
      authorSection,
      h4Matches,
    )) {
      entries.push({ author, title, mode, ...(dynastyFields ?? {}) });
    }
  }

  return entries;
}

/**
 * @param {string} html
 * @param {object} _spec
 */
export function parseStandardCatalogEntries(html, _spec) {
  return parseAuthorSection(html);
}

/**
 * @param {string} h2Title
 */
function dynastyFromH2(h2Title) {
  const match = h2Title.match(/^(北魏|北齐|北周)/);
  if (!match) {
    throw new Error(`Unexpected h2 dynasty heading: ${h2Title}`);
  }
  return match[1];
}

/**
 * @param {string} html
 * @param {object} _spec
 */
export function parseBeiChaoCatalogEntries(html, _spec) {
  const entries = [];
  const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];

  for (let i = 0; i < h2Matches.length; i++) {
    const dynasty = dynastyFromH2(extractTitleFromHeading(h2Matches[i][0]));
    const sectionStart = h2Matches[i].index + h2Matches[i][0].length;
    const sectionEnd =
      i + 1 < h2Matches.length ? h2Matches[i + 1].index : html.length;
    const section = html.slice(sectionStart, sectionEnd);
    entries.push(...parseAuthorSection(section, { dynasty }));
  }

  return entries;
}

/**
 * @param {Array<{ author: string, title: string, mode: string, dynasty?: string }>} entries
 * @param {object} spec
 * @param {Set<string>} reservedSlugs
 */
export function assignSlugs(entries, spec, reservedSlugs) {
  const usedSlugs = new Set(reservedSlugs);
  const result = [];

  for (const entry of entries) {
    const key = `${entry.author}|${entry.title}`;
    let slug =
      spec.slugOverrides[key] ??
      spec.slugDisambiguation[key] ??
      toSlug(entry.title);

    if (usedSlugs.has(slug)) {
      const authorPrefix = authorSlugFor(entry.author, spec);
      slug = `${authorPrefix}-${slug}`;
    }

    if (usedSlugs.has(slug)) {
      throw new Error(`Duplicate slug "${slug}" for ${key}`);
    }

    usedSlugs.add(slug);

    /** @type {Record<string, string>} */
    const assigned = {
      slug,
      title: entry.title,
      author: entry.author,
      authorSlug: authorSlugFor(entry.author, spec),
    };
    if (entry.dynasty !== undefined) {
      assigned.dynasty = entry.dynasty;
    }
    assigned.mode = entry.mode;
    result.push(assigned);
  }

  return result;
}

/**
 * @param {object} spec
 * @param {Array<Record<string, string>>} entries
 */
export function renderConfigModule(spec, entries) {
  const lines = entries.map((entry) => {
    if (entry.dynasty !== undefined) {
      return `  { slug: ${JSON.stringify(entry.slug)}, title: ${JSON.stringify(entry.title)}, author: ${JSON.stringify(entry.author)}, authorSlug: ${JSON.stringify(entry.authorSlug)}, dynasty: ${JSON.stringify(entry.dynasty)}, mode: ${JSON.stringify(entry.mode)} }`;
    }
    return `  { slug: ${JSON.stringify(entry.slug)}, title: ${JSON.stringify(entry.title)}, author: ${JSON.stringify(entry.author)}, authorSlug: ${JSON.stringify(entry.authorSlug)}, mode: ${JSON.stringify(entry.mode)} }`;
  });

  return `/**
 * ${titleCaseVolume(spec.volume)} volume catalog config (${spec.sourceLabel}).
 * Generated by scripts/generate-volume-config.mjs — edit overrides in
 * scripts/volume-config-specs.mjs, then regenerate.
 */
export const ${spec.exportName} = {
  volume: ${JSON.stringify(spec.volume)},
  dynasty: ${JSON.stringify(spec.dynasty)},
  epubParts: ${JSON.stringify(spec.epubParts, null, 2).replace(/\n/g, "\n  ")},
  expectedCount: ${entries.length},
  entries: [
${lines.join(",\n")}
  ],
};
`;
}

/**
 * @param {string} volume
 */
function titleCaseVolume(volume) {
  if (volume === "bei-chao") return "Bei-chao";
  return volume.charAt(0).toUpperCase() + volume.slice(1);
}

/**
 * @param {string} configPath
 * @param {string} exportName
 * @returns {Promise<Set<string>>}
 */
async function loadSlugsFromConfigFile(configPath, exportName) {
  const mod = await import(pathToFileURL(configPath).href);
  const config = mod[exportName];
  if (!config?.entries) {
    throw new Error(`Missing ${exportName} in ${configPath}`);
  }
  return new Set(config.entries.map((entry) => entry.slug));
}

/**
 * @param {object} spec
 * @param {string} configDir directory containing <volume>-config.mjs files
 * @returns {Promise<Set<string>>}
 */
async function loadReservedSlugs(spec, configDir) {
  const reserved = new Set();

  if (spec.reserveGuYi) {
    const guYiManifest = path.join(
      __dirname,
      "..",
      "content",
      "volumes",
      "gu-yi-manifest.json",
    );
    for (const slug of JSON.parse(fs.readFileSync(guYiManifest, "utf8"))) {
      reserved.add(slug);
    }
  }

  for (const volume of spec.reservedVolumes) {
    const reservedSpec = VOLUME_CONFIG_SPECS[volume];
    const configPath = path.join(configDir, `${volume}-config.mjs`);
    const slugs = await loadSlugsFromConfigFile(
      configPath,
      reservedSpec.exportName,
    );
    for (const slug of slugs) {
      reserved.add(slug);
    }
  }

  return reserved;
}

/**
 * Resolve EPUB path: explicit arg, else GUSHIYUAN_EPUB. Never a machine default.
 * @param {string | undefined} explicit
 */
export function resolveEpubPath(explicit) {
  const epubPath = explicit || process.env.GUSHIYUAN_EPUB;
  if (!epubPath || !fs.existsSync(epubPath)) {
    return null;
  }
  try {
    fs.accessSync(epubPath, fs.constants.R_OK);
  } catch {
    return null;
  }
  return epubPath;
}

/**
 * @param {string} volumeSlug
 * @param {string} epubPath
 * @param {{ outputDir?: string, reservedConfigDir?: string }} [options]
 */
export async function generateVolumeConfig(volumeSlug, epubPath, options = {}) {
  const spec = VOLUME_CONFIG_SPECS[volumeSlug];
  if (!spec) {
    throw new Error(`Unknown volume: ${volumeSlug}`);
  }

  const outputDir = options.outputDir ?? __dirname;
  const reservedConfigDir = options.reservedConfigDir ?? __dirname;
  const outputPath = path.join(outputDir, `${volumeSlug}-config.mjs`);

  const html = readEpubHtmlParts(epubPath, spec.epubParts);
  const catalog =
    spec.parser === "bei-chao"
      ? parseBeiChaoCatalogEntries(html, spec)
      : parseStandardCatalogEntries(html, spec);

  const reservedSlugs = await loadReservedSlugs(spec, reservedConfigDir);
  const entries = assignSlugs(catalog, spec, reservedSlugs);

  if (entries.length !== spec.expectedCount) {
    throw new Error(
      `${volumeSlug}: expected ${spec.expectedCount} entries, got ${entries.length}`,
    );
  }

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, renderConfigModule(spec, entries));
  return { outputPath, entries };
}

function printUsage() {
  console.error(`Usage:
  node scripts/generate-volume-config.mjs <volume> <epub-path>
  node scripts/generate-volume-config.mjs --all <epub-path> [--output-dir DIR]

Volumes: ${GENERATION_ORDER.join(", ")}
EPUB path may also be supplied via GUSHIYUAN_EPUB.`);
}

/**
 * @param {string[]} argv
 */
export async function main(argv = process.argv.slice(2)) {
  const args = [...argv];
  let all = false;
  let outputDir;
  /** @type {string[]} */
  const positional = [];

  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--all") {
      all = true;
    } else if (arg === "--output-dir") {
      outputDir = args.shift();
      if (!outputDir) {
        printUsage();
        process.exitCode = 1;
        return;
      }
    } else if (arg === "--help" || arg === "-h") {
      printUsage();
      return;
    } else {
      positional.push(arg);
    }
  }

  let volumeSlug;
  let epubArg;
  if (all) {
    epubArg = positional[0];
  } else {
    volumeSlug = positional[0];
    epubArg = positional[1];
    if (!volumeSlug || !VOLUME_CONFIG_SPECS[volumeSlug]) {
      printUsage();
      process.exitCode = 1;
      return;
    }
  }

  const epubPath = resolveEpubPath(epubArg);
  if (!epubPath) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const volumes = all ? GENERATION_ORDER : [volumeSlug];

  for (const volume of volumes) {
    const { outputPath, entries } = await generateVolumeConfig(
      volume,
      epubPath,
      {
        outputDir,
        // --all: load reservations from this run's output dir (earlier volumes
        // already written). Single-volume: load from committed scripts/.
        reservedConfigDir: all ? (outputDir ?? __dirname) : __dirname,
      },
    );
    console.log(`Wrote ${entries.length} entries to ${outputPath}`);
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
