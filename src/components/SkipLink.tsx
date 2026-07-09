"use client";

import { useUiText } from "@/components/ScriptVariantProvider";

export function SkipLink() {
  const label = useUiText("skipLink");

  return (
    <a href="#main-content" className="skip-link">
      {label}
    </a>
  );
}
