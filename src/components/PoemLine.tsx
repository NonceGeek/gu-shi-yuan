"use client";

import type { LineageClue } from "@/lib/lineage-types";
import { LineageHint } from "@/components/LineageHint";

type LineageClueWithTraditional = Omit<LineageClue, "streams"> & {
  streams: (LineageClue["streams"][number] & {
    textTraditional?: string;
    authorTraditional?: string;
    workTraditional?: string;
    relationTraditional?: string;
    sourceTraditional?: string;
  })[];
};

type PoemSentenceProps = {
  sentence: string;
  lineIndex: number;
  lineageClue?: LineageClueWithTraditional;
  inline?: boolean;
};

export function PoemSentence({
  sentence,
  lineIndex,
  lineageClue,
  inline = false,
}: PoemSentenceProps) {
  if (lineageClue) {
    return (
      <LineageHint clue={lineageClue} lineIndex={lineIndex} inline={inline}>
        {sentence}
      </LineageHint>
    );
  }

  if (inline) {
    return (
      <span id={`line-${lineIndex}`} className="poem-reader__sentence">
        {sentence}
      </span>
    );
  }

  return (
    <p id={`line-${lineIndex}`} className="poem-reader__line">
      {sentence}
    </p>
  );
}

type PoemLineProps = {
  line: string;
  lineIndex: number;
  lineageClue?: LineageClueWithTraditional;
};

export function PoemLine({ line, lineIndex, lineageClue }: PoemLineProps) {
  return (
    <PoemSentence
      sentence={line}
      lineIndex={lineIndex}
      lineageClue={lineageClue}
    />
  );
}

type PoemRowProps = {
  sentences: string[];
  startLineIndex: number;
  lineageByLine: Map<number, LineageClueWithTraditional>;
};

export function PoemRow({
  sentences,
  startLineIndex,
  lineageByLine,
}: PoemRowProps) {
  return (
    <p className="poem-reader__line">
      {sentences.map((sentence, offset) => {
        const lineIndex = startLineIndex + offset;
        return (
          <PoemSentence
            key={`${lineIndex}-${sentence}`}
            sentence={sentence}
            lineIndex={lineIndex}
            lineageClue={lineageByLine.get(lineIndex)}
            inline
          />
        );
      })}
    </p>
  );
}
