"use client";

import { motion } from "framer-motion";

/**
 * Fond continu sur toute la landing — halos orange/brun, grille discrète, pas de coupure entre sections.
 */
export function LandingGlobalBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #050403 0%, #0B0705 38%, #050403 72%, #0A0705 100%)",
        }}
      />

      <motion.div
        className="absolute -left-[15%] top-[2%] h-[min(640px,85vw)] w-[min(640px,85vw)] rounded-full opacity-80"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 90, 42, 0.14) 0%, rgba(255, 122, 61, 0.06) 38%, transparent 68%)",
        }}
        animate={{ opacity: [0.65, 0.85, 0.65], scale: [1, 1.03, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute -right-[12%] top-[22%] h-[min(560px,78vw)] w-[min(560px,78vw)] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(246, 168, 90, 0.1) 0%, rgba(255, 90, 42, 0.04) 42%, transparent 70%)",
        }}
        animate={{ opacity: [0.5, 0.72, 0.5], scale: [1.02, 1, 1.02] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <motion.div
        className="absolute left-[20%] top-[48%] h-[min(720px,95vw)] w-[min(720px,95vw)] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(26, 16, 10, 0.9) 0%, rgba(255, 90, 42, 0.05) 35%, transparent 62%)",
        }}
        animate={{ opacity: [0.7, 0.9, 0.7] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <motion.div
        className="absolute -bottom-[25%] left-1/2 h-[min(800px,100vw)] w-[min(900px,110vw)] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(255, 90, 42, 0.08) 0%, rgba(26, 16, 10, 0.4) 45%, transparent 72%)",
        }}
        animate={{ opacity: [0.55, 0.75, 0.55] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255, 122, 61, 0.11) 1px, transparent 0)",
          backgroundSize: "32px 32px",
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% 0%, transparent 40%, rgba(5, 4, 3, 0.5) 100%)",
        }}
      />
    </div>
  );
}
