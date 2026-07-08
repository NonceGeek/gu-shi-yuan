"use client";

import Link from "next/link";
import { useReadingDirection } from "@/components/ReadingDirectionProvider";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const direction = useReadingDirection();

  if (items.length === 0) {
    return null;
  }

  // 竖排：用全角空格留白分隔，避免 › 旋转后方向语义误导。
  // 横排：保留 › 作分隔符。
  const separator = direction === "vertical" ? "\u3000" : "›";

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
