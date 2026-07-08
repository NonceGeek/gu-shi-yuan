import Link from "next/link";
import type { PoemMeta } from "@/lib/poems";

type PoemNavProps = {
  prev?: PoemMeta;
  next?: PoemMeta;
};

export function PoemNav({ prev, next }: PoemNavProps) {
  if (!prev && !next) {
    return null;
  }

  return (
    <nav aria-label="同卷诗作" className="poem-nav">
      {prev ? (
        <Link href={`/p/${prev.slug}`} className="poem-nav__link poem-nav__link--prev">
          <span className="poem-nav__label">上一首</span>
          <span className="poem-nav__title">{prev.title}</span>
        </Link>
      ) : (
        <span className="poem-nav__spacer" />
      )}
      {next ? (
        <Link href={`/p/${next.slug}`} className="poem-nav__link poem-nav__link--next">
          <span className="poem-nav__label">下一首</span>
          <span className="poem-nav__title">{next.title}</span>
        </Link>
      ) : (
        <span className="poem-nav__spacer" />
      )}
    </nav>
  );
}
