"use client";

import { useState, type ReactNode } from "react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ScriptVariantProvider } from "@/components/ScriptVariantProvider";
import { SiteLogo } from "@/components/SiteLogo";
import { SiteSearch } from "@/components/SiteSearch";
import { SiteChromeActionsContext } from "@/components/SiteChromeActions";
import { SkipLink } from "@/components/SkipLink";
import type { SearchIndex } from "@/lib/search-index-types";
import type { SiteUiText } from "@/lib/site-ui-text";

type SiteChromeProviderProps = {
  searchIndex: SearchIndex;
  uiText: SiteUiText;
  children: ReactNode;
};

export function SiteChromeProvider({
  searchIndex,
  uiText,
  children,
}: SiteChromeProviderProps) {
  const [actions, setActions] = useState<ReactNode>(null);

  return (
    <ScriptVariantProvider uiText={uiText}>
      <SiteChromeActionsContext.Provider value={{ setActions }}>
        <SkipLink />
        <div className="site-chrome">
          <div className="site-chrome__brand">
            <SiteLogo />
            <span className="site-chrome__divider" aria-hidden="true" />
            <SiteSearch index={searchIndex} />
          </div>
          <div className="site-chrome__actions">
            {actions}
            <LanguageToggle />
          </div>
        </div>
        {children}
      </SiteChromeActionsContext.Provider>
    </ScriptVariantProvider>
  );
}
