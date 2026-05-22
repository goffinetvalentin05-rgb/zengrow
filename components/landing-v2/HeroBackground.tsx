import styles from "./hero-background.module.css";

/**
 * Fond abstrait plein écran — bleu électrique profond sur noir pur.
 * Style AI startup (Linear / Vercel). Décoratif uniquement.
 */
export function HeroBackground() {
  return (
    <div className={styles.root} aria-hidden>
      <svg
        className={styles.svg}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hb-blade-left" x1="8%" y1="92%" x2="72%" y2="18%">
            <stop offset="0%" stopColor="#1b4fff" stopOpacity="0.95" />
            <stop offset="42%" stopColor="#1d3aff" stopOpacity="0.55" />
            <stop offset="78%" stopColor="#0a1430" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#000005" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="hb-blade-right" x1="88%" y1="12%" x2="38%" y2="88%">
            <stop offset="0%" stopColor="#2f5cff" stopOpacity="0.88" />
            <stop offset="38%" stopColor="#1b4fff" stopOpacity="0.62" />
            <stop offset="72%" stopColor="#101830" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#000005" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="hb-edge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a6eff" stopOpacity="0" />
            <stop offset="35%" stopColor="#6b8cff" stopOpacity="1" />
            <stop offset="65%" stopColor="#3d5eff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#1b4fff" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="hb-halo-left" cx="28%" cy="62%" r="42%">
            <stop offset="0%" stopColor="#1b4fff" stopOpacity="0.35" />
            <stop offset="55%" stopColor="#1d3aff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000005" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="hb-halo-right" cx="82%" cy="48%" r="48%">
            <stop offset="0%" stopColor="#2f5cff" stopOpacity="0.32" />
            <stop offset="50%" stopColor="#1b4fff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#000005" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="hb-vignette" cx="50%" cy="48%" r="72%">
            <stop offset="42%" stopColor="#000005" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.82" />
          </radialGradient>

          <filter id="hb-blur-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="28" result="blur" />
          </filter>

          <filter id="hb-blur-edge" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1.2 0 0  0 0 0 1.1 0"
              result="glow"
            />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="hb-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="4"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.045 0"
            />
          </filter>
        </defs>

        {/* Halos — respiration lente */}
        <g className={styles.breathe} filter="url(#hb-blur-soft)">
          <ellipse cx="380" cy="580" rx="520" ry="380" fill="url(#hb-halo-left)" />
          <ellipse cx="1120" cy="420" rx="560" ry="420" fill="url(#hb-halo-right)" />
        </g>

        {/* Lame bas-gauche → centre-haut (ruban en S) */}
        <path
          fill="url(#hb-blade-left)"
          d="M -120 980
             C 80 920, 220 780, 300 620
             C 380 460, 520 280, 720 160
             C 580 340, 420 520, 260 680
             C 120 820, 20 920, -120 980 Z"
        />

        {/* Lame droite — masse courbe */}
        <path
          fill="url(#hb-blade-right)"
          d="M 1480 80
             C 1280 120, 1120 220, 1040 380
             C 960 540, 900 720, 820 880
             C 980 720, 1100 520, 1180 340
             C 1280 180, 1380 100, 1480 80 Z"
        />

        {/* Corps secondaire gauche — épaisseur du ruban */}
        <path
          fill="#1d3aff"
          fillOpacity="0.22"
          d="M -80 1020
             C 140 880, 280 700, 340 520
             C 400 360, 500 220, 640 140
             C 500 300, 360 480, 220 640
             C 80 800, -40 920, -80 1020 Z"
        />

        {/* Arêtes lumineuses (néon sur les plis) */}
        <g filter="url(#hb-blur-edge)" fill="none" stroke="url(#hb-edge)" strokeLinecap="round">
          <path
            strokeWidth="2.2"
            d="M -40 940
               C 160 800, 300 640, 380 480
               C 460 330, 580 200, 700 150"
          />
          <path
            strokeWidth="1.8"
            d="M 260 700
               C 400 540, 520 400, 640 280"
          />
          <path
            strokeWidth="2.4"
            d="M 1420 120
               C 1240 180, 1100 300, 1020 460
               C 940 620, 880 760, 800 900"
          />
          <path
            strokeWidth="1.6"
            d="M 1180 360
               C 1080 500, 980 640, 860 780"
          />
        </g>

        {/* Reflets fins supplémentaires */}
        <g fill="none" stroke="#5b7fff" strokeOpacity="0.55" strokeWidth="1">
          <path
            d="M 120 860 C 280 720, 400 560, 480 400"
            className={styles.breatheSlow}
          />
          <path
            d="M 1320 200 C 1160 320, 1060 480, 980 640"
            className={styles.breatheSlow}
          />
        </g>

        {/* Vignette */}
        <rect width="1440" height="900" fill="url(#hb-vignette)" />

        {/* Grain */}
        <rect width="1440" height="900" filter="url(#hb-grain)" opacity="0.9" />
      </svg>

      <div className={styles.vignette} />
      <div className={styles.grain} />
    </div>
  );
}
