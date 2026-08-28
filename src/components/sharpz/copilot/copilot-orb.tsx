"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/src/lib/utils";

const RING_PATHS = [
  "M100 56C123.5 56 144 76.5 144 100C144 123.5 123.5 144 100 144C76.5 144 56 123.5 56 100C56 76.5 76.5 56 100 56Z",
  "M101 50C128 49 149 70 147 98C145 126 124 149 96 147C68 145 49 123 52 95C55 67 76 51 101 50Z",
  "M98 54C119 46 148 64 146 94C144 126 122 150 92 146C64 142 48 116 54 88C60 62 76 60 98 54Z",
  "M102 52C130 56 148 80 142 108C136 134 110 150 84 144C58 138 48 108 58 84C68 60 80 50 102 52Z",
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
            <stop offset="0%" stopColor="#fff8f2" />
            <stop offset="22%" stopColor="#f6d0c2" />
            <stop offset="52%" stopColor="#e39a88" />
            <stop offset="100%" stopColor="#c47872" />
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
        <path d={RING_PATHS[0]} fill={stroke} opacity="0.14" filter={softGlow}>
          {reduceMotion ? null : (
            <animate
              attributeName="d"
              dur="12s"
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
              dur="9s"
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
          stroke="#fff7f0"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.55"
          filter={glow}
        >
          {reduceMotion ? null : (
            <animate
              attributeName="d"
              dur="11s"
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
