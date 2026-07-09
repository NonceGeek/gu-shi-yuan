"use client";

import Link from "next/link";
import { useReadingDirection } from "@/components/ReadingDirectionProvider";
import {
  useUiText,
  useVariantText,
} from "@/components/ScriptVariantProvider";
import type { VariantableText } from "@/lib/script-variant";

export type BreadcrumbItem = {
  label: VariantableText;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  /** 竖排阅读时顶栏面包屑仍横排展示 */
  layout?: "auto" | "horizontal";
};

function BreadcrumbListItem({
  item,
  index,
  separator,
}: {
  item: BreadcrumbItem;
  index: number;
  separator: string;
}) {
  const label = useVariantText(item.label);

  return (
    <li className="breadcrumbs__item">
      {index > 0 ? (
        <span className="breadcrumbs__sep" aria-hidden="true">
          {separator}
        </span>
      ) : null}
      {item.href ? (
        <Link href={item.href} className="breadcrumbs__link">
          {label}
        </Link>
      ) : (
        <span className="breadcrumbs__current" aria-current="page">
          {label}
        </span>
      )}
    </li>
  );
}

export function Breadcrumbs({ items, layout = "auto" }: BreadcrumbsProps) {
  const direction = useReadingDirection();
  const ariaLabel = useUiText("breadcrumbsAria");

  if (items.length === 0) {
    return null;
  }

  const useVerticalSeparator =
    layout === "auto" && direction === "vertical";
  const separator = useVerticalSeparator ? "\u3000" : "›";

  return (
    <nav aria-label={ariaLabel} className="breadcrumbs">
      <ol className="breadcrumbs__list">
        {items.map((item, index) => (
          <BreadcrumbListItem
            key={`${index}-${item.href ?? ""}`}
            item={item}
            index={index}
            separator={separator}
          />
        ))}
      </ol>
    </nav>
  );
}
