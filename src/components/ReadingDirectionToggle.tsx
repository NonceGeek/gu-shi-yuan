"use client";

import { useUiText } from "@/components/ScriptVariantProvider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ReadingDirection } from "@/lib/reading-direction";

type ReadingDirectionToggleProps = {
  direction: ReadingDirection;
  onDirectionChange: (direction: ReadingDirection) => void;
};

export function ReadingDirectionToggle({
  direction,
  onDirectionChange,
}: ReadingDirectionToggleProps) {
  const ariaLabel = useUiText("readingDirectionAria");
  const horizontal = useUiText("readingHorizontal");
  const vertical = useUiText("readingVertical");
  const horizontalAria = useUiText("readingHorizontalAria");
  const verticalAria = useUiText("readingVerticalAria");

  return (
    <ToggleGroup
      value={[direction]}
      onValueChange={(value) => {
        const nextDirection = value.at(-1);
        if (nextDirection === "horizontal" || nextDirection === "vertical") {
          onDirectionChange(nextDirection);
        }
      }}
      variant="outline"
      size="sm"
      spacing={0}
      aria-label={ariaLabel}
    >
      <ToggleGroupItem value="horizontal" aria-label={horizontalAria}>
        {horizontal}
      </ToggleGroupItem>
      <ToggleGroupItem value="vertical" aria-label={verticalAria}>
        {vertical}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
