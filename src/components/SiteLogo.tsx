"use client";

import Link from "next/link";
import { useUiText } from "@/components/ScriptVariantProvider";

export function SiteLogo() {
  const siteName = useUiText("siteName");

  return (
    <Link href="/" className="site-logo" translate="no">
      {siteName}
    </Link>
  );
}
