"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  BEST_COLORS,
  DEMO_PROFILE,
  IMAGES,
  LESS_FLATTERING_COLORS,
} from "../config";
import { DemoCaption } from "../ui";
import { cn } from "@/src/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

function Rise({
  active,
  delay,
  className,
  children,
}: {
  active: boolean;
  delay: number;
  className?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={active ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.55, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export function StyleProfileReport() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const active = Boolean(reduce || inView);

  return (
    <div className="fitme-report-stack">
      <motion.article
        ref={ref}
        className={cn("fitme-report", active && "is-in")}
        aria-label="Exemple de Style Profile"
        initial={reduce ? false : { opacity: 0, y: 22, scale: 0.985 }}
        animate={active ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={{ duration: 0.7, delay: 0.06, ease }}
      >
        <div className="fitme-report__glow" aria-hidden />

        <header className="fitme-report__head">
          <p>Style Profile</p>
        </header>

        <div className="fitme-report__hero">
          <Rise active={active} delay={0.22} className="fitme-report__cover">
            <Image
              src={IMAGES.profileClean}
              alt={`${DEMO_PROFILE.topStyle} — look principal`}
              width={720}
              height={960}
              sizes="(max-width: 768px) 92vw, 380px"
            />
          </Rise>

          <Rise active={active} delay={0.38} className="fitme-report__lead">
            <p>Top style</p>
            <strong>{DEMO_PROFILE.topStyle}</strong>
            <span className="fitme-report__badge">{DEMO_PROFILE.topMatch}% match</span>
            <em>{DEMO_PROFILE.topNote}</em>
            <small>
              Secondary · {DEMO_PROFILE.secondaryStyle} · {DEMO_PROFILE.secondaryMatch}%
            </small>
          </Rise>
        </div>

        <Rise active={active} delay={0.52} className="fitme-report__palette">
          <div>
            <p>Best colors</p>
            <ul className="fitme-report__swatches">
              {BEST_COLORS.map((color, index) => (
                <motion.li
                  key={color.name}
                  initial={reduce ? false : { opacity: 0, y: 10, scale: 0.92 }}
                  animate={active ? { opacity: 1, y: 0, scale: 1 } : undefined}
                  transition={{ duration: 0.4, delay: 0.64 + index * 0.07, ease }}
                >
                  <i style={{ background: color.hex }} />
                  {color.name}
                </motion.li>
              ))}
            </ul>
          </div>
          <div>
            <p>Avoid</p>
            <ul className="fitme-report__swatches is-avoid">
              {LESS_FLATTERING_COLORS.map((color, index) => (
                <motion.li
                  key={color.name}
                  initial={reduce ? false : { opacity: 0, y: 10, scale: 0.92 }}
                  animate={active ? { opacity: 1, y: 0, scale: 1 } : undefined}
                  transition={{ duration: 0.4, delay: 1.02 + index * 0.07, ease }}
                >
                  <i style={{ background: color.hex }} />
                  {color.name}
                </motion.li>
              ))}
            </ul>
          </div>
        </Rise>

        <div className="fitme-report__looks-wrap">
          <p>Votre style, sous plusieurs angles</p>
          <div className="fitme-report__looks">
            {DEMO_PROFILE.looks.map((look, index) => (
              <motion.figure
                key={look.src}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={active ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.5, delay: 1.18 + index * 0.09, ease }}
              >
                <Image src={look.src} alt={look.label} width={480} height={640} />
                <figcaption>{look.label}</figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </motion.article>

      <Rise active={active} delay={1.55} className="fitme-fitcheck">
        <div className="fitme-fitcheck__copy">
          <p>FitCheck — bientôt / inclus selon l’offre</p>
          <h3>Avant d’acheter, vérifiez si ça vous va vraiment.</h3>
        </div>
        <div className="fitme-fitcheck__pair">
          <article>
            <Image src={IMAGES.fitcheckBuy} alt="" width={160} height={200} />
            <span>92% match</span>
            <strong className="is-buy">Buy</strong>
          </article>
          <article>
            <Image src={IMAGES.fitcheckSkip} alt="" width={160} height={200} />
            <span>38% match</span>
            <strong className="is-skip">Skip</strong>
          </article>
        </div>
      </Rise>

      <DemoCaption>Exemple de démonstration — pas une analyse utilisateur réelle.</DemoCaption>
    </div>
  );
}
