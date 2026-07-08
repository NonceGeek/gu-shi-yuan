import type { Poem } from "@/lib/poems";

type PoemReaderProps = {
  poem: Poem;
};

export function PoemReader({ poem }: PoemReaderProps) {
  const lines = poem.body.split("\n").filter(Boolean);

  return (
    <article className="flex min-h-dvh flex-col items-center justify-center px-8 py-16 md:px-12 md:py-24">
      <header className="mb-12 text-center md:mb-16">
        <h1 className="poem-reader__title">{poem.title}</h1>
        <p className="poem-reader__meta">
          {poem.dynasty} · {poem.author}
        </p>
      </header>
      <div className="max-w-md text-center">
        {lines.map((line) => (
          <p key={line} className="poem-reader__line">
            {line}
          </p>
        ))}
      </div>
    </article>
  );
}
