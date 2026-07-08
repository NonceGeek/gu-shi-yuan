import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type PoemMeta = {
  slug: string;
  title: string;
  author: string;
  dynasty: string;
};

export type Poem = PoemMeta & {
  body: string;
};

const POEMS_DIR = path.join(process.cwd(), "content", "poems");

function parsePoemFile(slug: string): Poem {
  const filePath = path.join(POEMS_DIR, `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: String(data.title),
    author: String(data.author),
    dynasty: String(data.dynasty),
    body: content.trim(),
  };
}

export function getAllPoems(): PoemMeta[] {
  const files = fs.readdirSync(POEMS_DIR).filter((f) => f.endsWith(".md"));

  return files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const { title, author, dynasty } = parsePoemFile(slug);
      return { slug, title, author, dynasty };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug, "zh-CN"));
}

export function getPoemBySlug(slug: string): Poem | undefined {
  const filePath = path.join(POEMS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return undefined;
  }
  return parsePoemFile(slug);
}
