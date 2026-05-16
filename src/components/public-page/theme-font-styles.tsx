"use client";

import { useEffect } from "react";

const LINK_ID = "zengrow-theme-google-fonts";

type ThemeFontStylesProps = {
  googleFontsUrl: string | null;
  cssVarDefinitions: Record<string, string>;
};

/**
 * Charge les polices Google non présentes dans le layout racine
 * et injecte les variables `--font-*` sur `:root`.
 */
export default function ThemeFontStyles({ googleFontsUrl, cssVarDefinitions }: ThemeFontStylesProps) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (googleFontsUrl) {
      let link = document.getElementById(LINK_ID) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.id = LINK_ID;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      link.href = googleFontsUrl;
    } else {
      document.getElementById(LINK_ID)?.remove();
    }
  }, [googleFontsUrl]);

  const cssText = Object.entries(cssVarDefinitions)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");

  if (!cssText) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `:root {\n${cssText}\n}`,
      }}
    />
  );
}
