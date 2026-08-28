"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/src/lib/utils";

const RING_PATHS = [
  "M100 56C123.5 56 144 76.5 144 100C144 123.5 123.5 144 100 144C76.5 144 56 123.5 56 100C56 76.5 76.5 56 100 56Z",
  "M100 48C134 46 160 74 154 108C148 140 118 158 86 152C52 146 40 112 50 80C60 50 72 50 100 48Z",
  "M100 42C122 40 146 64 148 98C150 136 122 164 92 158C58 152 40 118 48 84C56 50 76 44 100 42Z",
  "M98 54C136 44 166 80 152 116C138 152 96 160 66 144C36 128 38 88 56 66C74 44 70 62 98 54Z",
];

type Props = {
  className?: string;
};

export function CopilotOrb({ className }: Props) {
  const uid = useId().replace(/:/g, "");
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(media.matches);
    const onChange = () => setReduceMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const loop = [...RING_PATHS, RING_PATHS[0]].join(";");
  const stroke = `url(#${uid}-stroke)`;
  const glow = `url(#${uid}-glow)`;
  const softGlow = `url(#${uid}-soft)`;

  return (
    <div className={cn("agent-orb", className)} aria-hidden>
      <div className="agent-orb__bloom" />
      <svg viewBox="0 0 200 200" className="agent-orb__svg">
        <defs>
          <linearGradient id={`${uid}-stroke`} x1="0.12" y1="1" x2="0.88" y2="0.08">
            <stop offset="0%" stopColor="#f4eaf8" />
            <stop offset="28%" stopColor="#cbb4dc" />
            <stop offset="68%" stopColor="#9b7aad" />
            <stop offset="100%" stopColor="#7d628c" />
          </linearGradient>
          <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`${uid}-soft`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" />
          </filter>
        </defs>
        <path d={RING_PATHS[0]} fill={stroke} opacity="0.16" filter={softGlow}>
          {reduceMotion ? null : (
            <animate
              attributeName="d"
              dur="2.8s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0;0.25;0.5;0.75;1"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
              values={loop}
            />
          )}
        </path>
        <path
          d={RING_PATHS[0]}
          fill="none"
          stroke={stroke}
          strokeWidth="7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={glow}
        >
          {reduceMotion ? null : (
            <animate
              attributeName="d"
              dur="2.2s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0;0.25;0.5;0.75;1"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
              values={loop}
            />
          )}
        </path>
        <path
          d={RING_PATHS[0]}
          fill="none"
          stroke="#f4eaf8"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.55"
          filter={glow}
        >
          {reduceMotion ? null : (
            <animate
              attributeName="d"
              dur="2.5s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0;0.25;0.5;0.75;1"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
              values={loop}
            />
          )}
        </path>
      </svg>
      <div className="agent-orb__core" />
    </div>
  );
}
