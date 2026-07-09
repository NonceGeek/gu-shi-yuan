export type PoemBodyStructure = {
  chapters: string[][];
};

/** 正文解析：章 = 空行分隔的段，句 = 一行一句。 */
export function parsePoemBody(body: string): PoemBodyStructure {
  return {
    chapters: body
      .split(/\n\n+/)
      .map((chapter) =>
        chapter.split("\n").filter((line) => line.trim() !== ""),
      ),
  };
}
