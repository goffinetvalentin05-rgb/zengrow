"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type ParticleSpec = {
  id: number;
  left: number;
  duration: number;
  delay: number;
};

export function Particles() {
  const [specs, setSpecs] = useState<ParticleSpec[] | null>(null);

  useEffect(() => {
    setSpecs(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 6 + Math.random() * 4,
        delay: Math.random() * 5,
      })),
    );
  }, []);

  if (!specs) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {specs.map((p) => (
        <motion.div
          key={p.id}
          className="absolute h-1 w-1 rounded-full bg-[#FF6B2C]"
          style={{
            left: `${p.left}%`,
            bottom: "-10px",
            boxShadow: "0 0 10px rgba(255, 107, 44, 0.8)",
          }}
          animate={{
            y: [0, -1200],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
