"use client";

import Link from "next/link";
import {
  useScriptVariant,
  useUiText,
} from "@/components/ScriptVariantProvider";
import type { PoemMeta } from "@/lib/poems";
import { textForScriptVariant } from "@/lib/script-variant";

type PoemNavMeta = PoemMeta & {
  titleTraditional?: string;
};

type PoemNavProps = {
  prev?: PoemNavMeta;
  next?: PoemNavMeta;
};

function PoemNavTitle({ poem }: { poem: PoemNavMeta }) {
  const { variant } = useScriptVariant();

  return textForScriptVariant(
    {
      simplified: poem.title,
      traditional: poem.titleTraditional ?? poem.title,
    },
    variant,
  );
}

export function PoemNav({ prev, next }: PoemNavProps) {
  const ariaLabel = useUiText("poemNavAria");
  const prevLabel = useUiText("prevPoem");
  const nextLabel = useUiText("nextPoem");

  if (!prev && !next) {
    return null;
  }

  return (
    <nav aria-label={ariaLabel} className="poem-nav">
      {prev ? (
        <Link href={`/p/${prev.slug}`} className="poem-nav__link poem-nav__link--prev">
          <span className="poem-nav__label">{prevLabel}</span>
          <span className="poem-nav__title">
            <PoemNavTitle poem={prev} />
          </span>
        </Link>
      ) : (
        <span className="poem-nav__spacer" />
      )}
      {next ? (
        <Link href={`/p/${next.slug}`} className="poem-nav__link poem-nav__link--next">
          <span className="poem-nav__label">{nextLabel}</span>
          <span className="poem-nav__title">
            <PoemNavTitle poem={next} />
          </span>
        </Link>
      ) : (
        <span className="poem-nav__spacer" />
      )}
    </nav>
  );
}
