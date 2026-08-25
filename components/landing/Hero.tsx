"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CTA, ROUTES } from "./config";
import { Container, CtaButton } from "./ui";

const ease = [0.22, 1, 0.36, 1] as const;

const SPIN_PHRASES = [
  "une vente perdue.",
  "un client perdu.",
  "une vente chez votre concurrent.",
] as const;

function HeroSpin({ reduce }: { reduce: boolean }) {
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState<number | null>(null);
  const [compact, setCompact] = useState(false);
  const measureRef = useRef<HTMLSpanElement>(null);
  const phrase = SPIN_PHRASES[index];

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((value) => (value + 1) % SPIN_PHRASES.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 899px)");
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const update = () => {
      if (window.matchMedia("(max-width: 899px)").matches) {
        setWidth(null);
        return;
      }
      setWidth(Math.ceil(el.scrollWidth) + 4);
    };
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [phrase]);

  return (
    <span
      className="go-hero__spin"
      style={{
        width: compact || width === null ? undefined : width,
        maxWidth: compact ? undefined : "100%",
        transition: reduce || compact || width === null ? "none" : "width 0.42s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <span ref={measureRef} className="go-hero__spin-sizer" aria-hidden>
        {phrase}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={phrase}
          className="go-hero__spin-text"
          initial={reduce ? false : { opacity: 0, y: "36%" }}
          animate={{ opacity: 1, y: "0%" }}
          exit={reduce ? undefined : { opacity: 0, y: "-36%" }}
          transition={{ duration: reduce ? 0 : 0.36, ease }}
        >
          {phrase}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Hero() {
  const reduce = Boolean(useReducedMotion());

  return (
    <section id="produit" className="go-hero">
      <div className="go-hero__atmosphere" aria-hidden>
        <span className="go-hero__glow go-hero__glow--tr" />
        <span className="go-hero__glow go-hero__glow--tl" />
        <span className="go-hero__glow go-hero__glow--bl" />
        <span className="go-hero__glow go-hero__glow--mid" />
        <span className="go-hero__glow go-hero__glow--core" />
        <span className="go-hero__stroke go-hero__stroke--a" />
        <span className="go-hero__stroke go-hero__stroke--b" />
        <span className="go-hero__stroke go-hero__stroke--c" />
        <svg className="go-hero__waves" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="none">
          <path d="M-120 180C200 40 420 310 780 190C1080 90 1280 270 1560 150" />
          <path d="M-60 390C240 250 500 530 840 380C1140 260 1340 490 1620 360" />
          <path d="M-100 600C200 470 480 730 820 590C1160 460 1360 700 1640 560" />
          <path d="M40 120C360 260 640 40 980 180C1220 280 1400 80 1680 200" />
        </svg>
      </div>

      <Container className="go-hero__container">
        <div className="go-hero__copy">
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease }}
          >
            <span className="go-hero__static">
              <span className="go-hero__seg">Ne laissez plus une</span>
              <span className="go-hero__br go-hero__br--m" aria-hidden />
              <span className="go-hero__seg">intention</span>
              <span className="go-hero__br go-hero__br--d" aria-hidden />
              <span className="go-hero__seg">d’offrir</span>
              <span className="go-hero__br go-hero__br--m" aria-hidden />
              <span className="go-hero__seg">se transformer en</span>
            </span>
            <HeroSpin reduce={reduce} />
          </motion.h1>
          <motion.p
            className="go-hero__sub"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease }}
          >
            Vendez vos bons cadeaux sur votre site, dans votre établissement ou depuis vos réseaux. ZifTip gère le
            paiement, l’envoi et l’utilisation au même endroit.
          </motion.p>
          <motion.div
            className="go-hero__ctas"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease }}
          >
            <CtaButton className="go-hero__cta">
              {CTA.primary}
              <ArrowUpRight strokeWidth={1.75} />
            </CtaButton>
            <CtaButton href={ROUTES.how} variant="secondary" className="go-hero__cta go-hero__cta--ghost">
              {CTA.secondary}
              <ArrowRight strokeWidth={1.75} />
            </CtaButton>
          </motion.div>
          <motion.p
            className="go-hero__proof"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.28, ease }}
          >
            <span className="go-hero__dot" aria-hidden />
            {CTA.finePrint}
          </motion.p>
        </div>
      </Container>

      <div className="go-hero__visual">
        <div className="go-hero__halo" aria-hidden />
        <div className="go-hero__orb" aria-hidden />
        <div className="go-hero__visual-inner">
          <motion.div
            className="go-hero__photo-motion"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease }}
          >
            <div className="go-hero__photo-wrap">
              <Image
                src="/landing/hero-hand-phone.png"
                alt="Main tenant un smartphone qui affiche un bon cadeau digital dans Wallet"
                width={682}
                height={1024}
                priority
                quality={95}
                sizes="(max-width: 639px) 100vw, 560px"
                className="go-hero__photo"
              />
            </div>
          </motion.div>
        </div>
        <div className="go-hero__fade" aria-hidden />
      </div>
    </section>
  );
}
