"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/src/lib/utils";

const LINKS = [
  { id: "ambiance", label: "Ambiance" },
  { id: "galerie", label: "Galerie" },
  { id: "signature", label: "Carte" },
  { id: "avis", label: "Avis" },
  { id: "infos", label: "Infos" },
  { id: "reservation", label: "Réserver" },
] as const;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Menu discret en overlay sur le hero — pas de navbar « site web ». */
export function ShowroomNav({
  visible,
  previewMode = false,
}: {
  visible: boolean;
  previewMode?: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!visible) return null;

  return (
    <>
      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-end px-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6",
          previewMode && "absolute",
        )}
      >
        <button
          type="button"
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md transition hover:bg-black/40"
          aria-label="Menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      {open ? (
        <div className={cn(previewMode ? "absolute inset-0 z-[60]" : "fixed inset-0 z-[60]")}>
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[min(100%,300px)] flex-col bg-[var(--page-bg)] p-6 shadow-2xl">
            <div className="flex justify-end">
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer">
                <X className="h-5 w-5" style={{ color: "var(--heading-color)" }} />
              </button>
            </div>
            <nav className="mt-10 flex flex-col gap-5">
              {LINKS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="text-left text-lg font-medium tracking-tight"
                  style={{ color: "var(--heading-color)", fontFamily: "var(--heading-font)" }}
                  onClick={() => {
                    setOpen(false);
                    scrollToId(item.id);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
