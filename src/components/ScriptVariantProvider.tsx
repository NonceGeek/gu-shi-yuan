"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SiteUiText, SiteUiTextKey } from "@/lib/site-ui-text";
import {
  DEFAULT_SCRIPT_VARIANT,
  type ScriptVariant,
  type VariantableText,
  langForScriptVariant,
  persistScriptVariant,
  readStoredScriptVariant,
  textForScriptVariant,
} from "@/lib/script-variant";

type ScriptVariantContextValue = {
  variant: ScriptVariant;
  setVariant: (variant: ScriptVariant) => void;
  uiText: SiteUiText;
};

const ScriptVariantContext = createContext<ScriptVariantContextValue | null>(null);

type ScriptVariantProviderProps = {
  uiText: SiteUiText;
  children: ReactNode;
};

export function ScriptVariantProvider({
  uiText,
  children,
}: ScriptVariantProviderProps) {
  const [variant, setVariantState] = useState<ScriptVariant>(
    DEFAULT_SCRIPT_VARIANT,
  );

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setVariantState(readStoredScriptVariant(localStorage));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.lang = langForScriptVariant(variant);
  }, [variant]);

  const value = useMemo<ScriptVariantContextValue>(
    () => ({
      variant,
      setVariant(nextVariant) {
        setVariantState(nextVariant);
        persistScriptVariant(localStorage, nextVariant);
      },
      uiText,
    }),
    [variant, uiText],
  );

  return (
    <ScriptVariantContext.Provider value={value}>
      {children}
    </ScriptVariantContext.Provider>
  );
}

export function useScriptVariant(): ScriptVariantContextValue {
  const ctx = useContext(ScriptVariantContext);
  if (!ctx) {
    throw new Error("useScriptVariant must be used within ScriptVariantProvider");
  }
  return ctx;
}

export function useVariantText(text: VariantableText): string {
  const { variant } = useScriptVariant();
  return textForScriptVariant(text, variant);
}

export function useUiText(key: SiteUiTextKey): string {
  const { uiText, variant } = useScriptVariant();
  return textForScriptVariant(uiText[key], variant);
}
