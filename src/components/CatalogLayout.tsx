import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { Breadcrumbs } from "@/components/Breadcrumbs";

type CatalogLayoutProps = {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
};

export function CatalogLayout({ title, breadcrumbs, children }: CatalogLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col px-8 py-16 md:px-12 md:py-24">
      <header className="catalog__header mb-16 text-center md:mb-20">
        <h1 className="catalog__title">{title}</h1>
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
      </header>
      <main id="main-content" className="mx-auto w-full max-w-md">
        {children}
      </main>
    </div>
  );
}
