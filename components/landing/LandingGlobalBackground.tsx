"use client";

import { motion } from "framer-motion";

/** Fond continu — navy profond, halos bleu électrique, grille discrète */
export function LandingGlobalBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #020610 0%, #041220 35%, #020818 68%, #030a14 100%)",
        }}
      />

      <motion.div
        className="absolute -left-[12%] top-[0%] h-[min(680px,90vw)] w-[min(680px,90vw)] rounded-full opacity-90 blur-[2px]"
        style={{
          background:
            "radial-gradient(circle, rgba(43, 140, 255, 0.2) 0%, rgba(56, 212, 255, 0.08) 38%, transparent 68%)",
        }}
        animate={{ opacity: [0.65, 0.88, 0.65], scale: [1, 1.05, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute left-1/2 top-[4%] h-[min(500px,72vw)] w-[min(580px,84vw)] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 50% 40%, rgba(43, 140, 255, 0.14) 0%, rgba(0, 80, 180, 0.06) 45%, transparent 72%)",
        }}
        animate={{ opacity: [0.5, 0.75, 0.5], scale: [1.01, 1, 1.01] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />

      <motion.div
        className="absolute -right-[10%] top-[20%] h-[min(560px,80vw)] w-[min(560px,80vw)] rounded-full blur-[1px]"
        style={{
          background:
            "radial-gradient(circle, rgba(56, 212, 255, 0.12) 0%, rgba(43, 140, 255, 0.05) 42%, transparent 70%)",
        }}
        animate={{ opacity: [0.5, 0.72, 0.5], scale: [1.02, 1, 1.02] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <motion.div
        className="absolute -bottom-[20%] left-1/2 h-[min(820px,105vw)] w-[min(920px,115vw)] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(43, 140, 255, 0.1) 0%, rgba(4, 18, 40, 0.5) 45%, transparent 72%)",
        }}
        animate={{ opacity: [0.5, 0.72, 0.5] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      <div
        className="absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(59, 158, 255, 0.12) 1px, transparent 0)",
          backgroundSize: "32px 32px",
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 100% 55% at 50% -8%, rgba(43, 140, 255, 0.08) 0%, transparent 55%)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% 0%, transparent 38%, rgba(2, 6, 16, 0.6) 100%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.28]"
        style={{
          background:
            "linear-gradient(105deg, transparent 42%, rgba(56, 212, 255, 0.04) 50%, transparent 58%)",
        }}
      />
    </div>
  );
}
