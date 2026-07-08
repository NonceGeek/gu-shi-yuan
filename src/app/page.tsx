import { PoemReader } from "@/components/PoemReader";
import { getAllPoems, getPoemBySlug } from "@/lib/poems";

export default function HomePage() {
  const poems = getAllPoems();
  const poem = poems[0] ? getPoemBySlug(poems[0].slug) : undefined;
  if (!poem) {
    return null;
  }
  return <PoemReader poem={poem} />;
}
