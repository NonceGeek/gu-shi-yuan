"use client";

import Link from "next/link";
import { useReadingDirection } from "@/components/ReadingDirectionProvider";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  /** 竖排阅读时顶栏面包屑仍横排展示 */
  layout?: "auto" | "horizontal";
};

export function Breadcrumbs({ items, layout = "auto" }: BreadcrumbsProps) {
  const direction = useReadingDirection();

  if (items.length === 0) {
    return null;
  }

  const useVerticalSeparator =
    layout === "auto" && direction === "vertical";
  const separator = useVerticalSeparator ? "\u3000" : "›";

  return (
    <nav aria-label="面包屑" className="breadcrumbs">
      <ol className="breadcrumbs__list">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="breadcrumbs__item">
            {index > 0 ? (
              <span className="breadcrumbs__sep" aria-hidden="true">
                {separator}
              </span>
            ) : null}
            {item.href ? (
              <Link href={item.href} className="breadcrumbs__link">
                {item.label}
              </Link>
            ) : (
              <span className="breadcrumbs__current" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
