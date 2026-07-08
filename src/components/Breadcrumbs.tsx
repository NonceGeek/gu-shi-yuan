import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="面包屑" className="breadcrumbs">
      <ol className="breadcrumbs__list">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="breadcrumbs__item">
            {index > 0 ? (
              <span className="breadcrumbs__sep" aria-hidden="true">
                ›
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
