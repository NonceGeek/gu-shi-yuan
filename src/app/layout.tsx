import type { Metadata } from "next";
import { SiteChromeProvider } from "@/components/SiteChrome";
import { buildSiteUiText } from "@/lib/script-conversion";
import { buildSearchIndex } from "@/lib/search-index";
import {
  createPageMetadata,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site-metadata";
import { preloadWenkaiSubset } from "@/lib/wenkai-font";
import "./globals.css";

export const metadata: Metadata = createPageMetadata({
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  preloadWenkaiSubset();
  const searchIndex = buildSearchIndex();
  const uiText = buildSiteUiText();

  return (
    <html lang="zh-CN">
      <body>
        <SiteChromeProvider searchIndex={searchIndex} uiText={uiText}>
          {children}
        </SiteChromeProvider>
      </body>
    </html>
  );
}
