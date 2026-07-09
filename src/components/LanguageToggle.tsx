"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  useScriptVariant,
  useUiText,
} from "@/components/ScriptVariantProvider";

export function LanguageToggle() {
  const { variant, setVariant } = useScriptVariant();
  const ariaLabel = useUiText("languageToggleAria");
  const simplified = useUiText("languageSimplified");
  const traditional = useUiText("languageTraditional");

  return (
    <ToggleGroup
      value={[variant]}
      onValueChange={(value) => {
        const nextVariant = value.at(-1);
        if (nextVariant === "simplified" || nextVariant === "traditional") {
          setVariant(nextVariant);
        }
      }}
      variant="outline"
      size="sm"
      spacing={0}
      aria-label={ariaLabel}
    >
      <ToggleGroupItem value="simplified" aria-label={simplified}>
        {simplified}
      </ToggleGroupItem>
      <ToggleGroupItem value="traditional" aria-label={traditional}>
        {traditional}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
