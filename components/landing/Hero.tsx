"use client";

import { useEffect, useState } from "react";
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

const LONGEST_PHRASE = "une vente chez votre concurrent.";

function HeroSpin({ reduce }: { reduce: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((value) => (value + 1) % SPIN_PHRASES.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  const phrase = SPIN_PHRASES[index];

  return (
    <span className="go-hero__spin">
      <span className="go-hero__spin-sizer" aria-hidden>
        {LONGEST_PHRASE}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={phrase}
          className="go-hero__spin-text"
          initial={reduce ? false : { opacity: 0, y: "40%" }}
          animate={{ opacity: 1, y: "0%" }}
          exit={reduce ? undefined : { opacity: 0, y: "-40%" }}
          transition={{ duration: reduce ? 0 : 0.42, ease }}
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
      <Container className="go-hero__container">
        <div className="go-hero__copy">
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease }}
          >
            <span className="go-hero__line">Ne laissez plus une intention d’offrir</span>
            <span className="go-hero__line go-hero__line--spin">
              se transformer en
              <HeroSpin reduce={reduce} />
            </span>
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
