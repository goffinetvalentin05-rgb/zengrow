"use client";

/**
 * Fond global : lames bleu électrique, halos SVG, vignette et grain.
 * position fixed, z-index bas — ne bloque pas le scroll ni la lisibilité.
 */
export function AnimatedBackground() {
  return (
    <div
      className="zg-lp-anim-bg pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <svg
        className="absolute h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="zg-wave-a" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1b4fff" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#2f5cff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#1d3aff" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="zg-wave-b" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1d3aff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1b4fff" stopOpacity="0.2" />
          </linearGradient>
          <filter id="zg-blur-heavy" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="48" />
          </filter>
          <filter id="zg-blur-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="28" />
          </filter>
          <filter id="zg-glow-edge">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Halos pulsants */}
        <g className="zg-bg-orb zg-bg-orb--1" filter="url(#zg-blur-heavy)">
          <ellipse cx="280" cy="320" rx="220" ry="180" fill="#1b4fff" fillOpacity="0.35" />
        </g>
        <g className="zg-bg-orb zg-bg-orb--2" filter="url(#zg-blur-heavy)">
          <ellipse cx="1180" cy="520" rx="260" ry="200" fill="#2f5cff" fillOpacity="0.28" />
        </g>
        <g className="zg-bg-orb zg-bg-orb--3" filter="url(#zg-blur-soft)">
          <ellipse cx="720" cy="120" rx="180" ry="120" fill="#3b7bff" fillOpacity="0.18" />
        </g>

        {/* Lames / vagues — animation lente */}
        <path
          className="zg-bg-wave zg-bg-wave--1"
          d="M-80 520 C 200 380, 420 680, 720 560 S 1180 420, 1520 500 L 1520 920 L -80 920 Z"
          fill="url(#zg-wave-a)"
          filter="url(#zg-glow-edge)"
          opacity="0.85"
        />
        <path
          className="zg-bg-wave zg-bg-wave--2"
          d="M-60 620 C 280 480, 500 760, 800 640 S 1240 500, 1540 580 L 1540 920 L -60 920 Z"
          fill="url(#zg-wave-b)"
          opacity="0.55"
        />
        <path
          className="zg-bg-wave zg-bg-wave--3"
          d="M0 700 Q 360 580 720 660 T 1440 720 L 1440 920 L 0 920 Z"
          fill="#1b4fff"
          fillOpacity="0.12"
        />

        {/* Arêtes lumineuses sur les plis */}
        <path
          className="zg-bg-rim"
          d="M120 548 C 340 430, 520 620, 720 548 S 1080 460, 1320 512"
          fill="none"
          stroke="#3b7bff"
          strokeWidth="1.2"
          strokeOpacity="0.55"
        />
        <path
          className="zg-bg-rim zg-bg-rim--delay"
          d="M200 598 C 420 500, 600 700, 820 618 S 1140 540, 1280 568"
          fill="none"
          stroke="#2f5cff"
          strokeWidth="0.8"
          strokeOpacity="0.4"
        />
      </svg>

      {/* Vignette + grain */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 70% at 50% 45%, transparent 0%, rgba(0,0,5,0.55) 55%, #000005 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

    </div>
  );
}
