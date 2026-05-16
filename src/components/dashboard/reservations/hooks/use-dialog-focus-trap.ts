"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useDialogFocusTrap(
  open: boolean,
  containerRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return;
    const root = containerRef.current;
    if (!root) return;

    const focusables = () => [...root.querySelectorAll<HTMLElement>(FOCUSABLE)];

    const id = requestAnimationFrame(() => {
      focusables()[0]?.focus();
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const nodes = focusables();
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    root.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(id);
      root.removeEventListener("keydown", onKeyDown);
    };
  }, [open, containerRef]);
}
