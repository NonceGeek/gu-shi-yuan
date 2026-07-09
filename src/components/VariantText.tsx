"use client";

import { useVariantText } from "@/components/ScriptVariantProvider";
import type { VariantableText } from "@/lib/script-variant";

export function VariantText({ text }: { text: VariantableText }) {
  return <>{useVariantText(text)}</>;
}
