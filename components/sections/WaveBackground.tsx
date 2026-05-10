"use client";

import { motion } from "framer-motion";

export function WaveBackground() {
  const lines = Array.from({ length: 80 }, (_, i) => i);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute bottom-0 left-1/2 h-[70%] w-[120%] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at center bottom, rgba(255, 107, 44, 0.35) 0%, rgba(255, 107, 44, 0.1) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
        aria-hidden
      />

      <svg
        className="absolute bottom-0 left-0 right-0 h-[60%] w-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 107, 44, 0)" />
            <stop offset="20%" stopColor="rgba(255, 107, 44, 0.4)" />
            <stop offset="50%" stopColor="rgba(255, 168, 107, 0.9)" />
            <stop offset="80%" stopColor="rgba(255, 107, 44, 0.4)" />
            <stop offset="100%" stopColor="rgba(255, 107, 44, 0)" />
          </linearGradient>
        </defs>

        {lines.map((i) => {
          const yOffset = 300 + i * 3;
          const amplitude = 180 - i * 1.5;
          const phase = i * 0.05;

          return (
            <motion.path
              key={i}
              d={`M 0 ${yOffset} Q 300 ${yOffset - amplitude} 600 ${yOffset - amplitude * 0.6} T 1200 ${yOffset}`}
              stroke="url(#waveGradient)"
              strokeWidth="0.8"
              fill="none"
              opacity={0.6 - i * 0.005}
              animate={{
                d: [
                  `M 0 ${yOffset} Q 300 ${yOffset - amplitude} 600 ${yOffset - amplitude * 0.6} T 1200 ${yOffset}`,
                  `M 0 ${yOffset} Q 300 ${yOffset - amplitude * 0.7} 600 ${yOffset - amplitude * 0.9} T 1200 ${yOffset}`,
                  `M 0 ${yOffset} Q 300 ${yOffset - amplitude} 600 ${yOffset - amplitude * 0.6} T 1200 ${yOffset}`,
                ],
              }}
              transition={{
                duration: 8 + i * 0.1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: phase,
              }}
            />
          );
        })}
      </svg>

      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(10, 8, 6, 0.6) 100%)",
        }}
        aria-hidden
      />
    </div>
  );
}
