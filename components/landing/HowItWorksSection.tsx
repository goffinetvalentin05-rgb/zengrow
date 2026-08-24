"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion, type PanInfo } from "framer-motion";
import { Bell, Gift, Globe, LayoutDashboard } from "lucide-react";
import { Container, ScrollReveal } from "./ui";

const AUTO_MS = 2800;
const RESUME_MS = 5200;
const SWIPE_PX = 56;
const SWIPE_V = 420;
const EASE = [0.22, 1, 0.36, 1] as const;
const SLIDE_MS = 0.62;

const STEPS = [
  {
    num: "01",
    icon: Gift,
    title: "Ajoutez ZifTip à votre établissement.",
    text: "Un bouton sur votre site, un QR code sur place, ou un lien à partager : la vente peut commencer rapidement.",
    visual: "add",
  },
  {
    num: "02",
    icon: Globe,
    title: "Vendez sur tous vos canaux.",
    text: "Site web, établissement, Instagram, lien direct, campagnes : un seul système pour vendre partout.",
    visual: "channels",
  },
  {
    num: "03",
    icon: Bell,
    title: "Récupérez vos acheteurs et relancez-les.",
    text: "Chaque achat vous aide à construire votre base client pour envoyer des notifications, relances et campagnes.",
    visual: "clients",
  },
  {
    num: "04",
    icon: LayoutDashboard,
    title: "Centralisez le suivi et l’utilisation.",
    text: "Consultez les ventes, les soldes restants, les bons utilisés et toute la gestion depuis un seul dashboard.",
    visual: "dash",
  },
] as const;

const slideVariants = {
  enter: (direction: number) => ({
    x: `${direction * 100}%`,
    opacity: 0.38,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: `${direction * -100}%`,
    opacity: 0.38,
  }),
};

function VisualAdd() {
  return (
    <div className="go-how-mock go-how-mock--add">
      <div className="go-how-mock__card">
        <span className="go-how-mock__brand">ZifTip</span>
        <p>Offrir un bon</p>
        <div className="go-how-mock__chips">
          <span>50</span>
          <span className="is-on">100</span>
          <span>150</span>
        </div>
        <em>Payer 100 CHF</em>
      </div>
      <div className="go-how-mock__qr" aria-hidden />
    </div>
  );
}

function VisualChannels() {
  return (
    <div className="go-how-mock go-how-mock--net">
      <span className="go-how-mock__node is-core">ZifTip</span>
      <span className="go-how-mock__node" style={{ top: "8%", left: "6%" }}>
        Site
      </span>
      <span className="go-how-mock__node" style={{ top: "12%", right: "8%" }}>
        Comptoir
      </span>
      <span className="go-how-mock__node" style={{ bottom: "10%", left: "10%" }}>
        Insta
      </span>
      <span className="go-how-mock__node" style={{ bottom: "8%", right: "6%" }}>
        Lien
      </span>
    </div>
  );
}

function VisualClients() {
  return (
    <div className="go-how-mock go-how-mock--people">
      <div className="go-how-mock__person">
        <b>AL</b>
        <div>
          <strong>Anna L.</strong>
          <small>Bon 100 CHF · Wallet</small>
        </div>
      </div>
      <ul>
        <li>
          <i /> Push envoyé
        </li>
        <li>
          <i /> Relance e-mail
        </li>
      </ul>
    </div>
  );
}

function VisualDash() {
  return (
    <div className="go-how-mock go-how-mock--dash">
      <header>
        <span>Tableau de bord</span>
        <em>Live</em>
      </header>
      <div className="go-how-mock__stat">
        <span>Ventes</span>
        <b>1 250 CHF</b>
        <s />
      </div>
      <div className="go-how-mock__stat">
        <span>Utilisés</span>
        <b>820 CHF</b>
        <s />
      </div>
      <div className="go-how-mock__stat">
        <span>Solde restant</span>
        <b>430 CHF</b>
        <s />
      </div>
    </div>
  );
}

function Visual({ kind }: { kind: (typeof STEPS)[number]["visual"] }) {
  if (kind === "add") return <VisualAdd />;
  if (kind === "channels") return <VisualChannels />;
  if (kind === "clients") return <VisualClients />;
  return <VisualDash />;
}

function StepCard({
  step,
  headingId,
}: {
  step: (typeof STEPS)[number];
  headingId?: string;
}) {
  const Icon = step.icon;

  return (
    <article className="go-how-card" aria-labelledby={headingId}>
      <span className="go-how-card__num" aria-hidden>
        {step.num}
      </span>
      <div className="go-how-card__copy">
        <span className="go-how-card__icon">
          <Icon strokeWidth={1.7} />
        </span>
        <h3 id={headingId}>{step.title}</h3>
        <p>{step.text}</p>
      </div>
      <div className="go-how-card__visual">
        <Visual kind={step.visual} />
      </div>
    </article>
  );
}

function wrapIndex(value: number) {
  return ((value % STEPS.length) + STEPS.length) % STEPS.length;
}

function HowItWorksCarousel() {
  const reduce = Boolean(useReducedMotion());
  const stageRef = useRef<HTMLDivElement>(null);
  const remainingRef = useRef(AUTO_MS);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const indexRef = useRef(0);
  const seenIndex = useRef(0);
  const inView = useInView(stageRef, { amount: 0.35 });

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hidden, setHidden] = useState(false);

  const step = STEPS[index];
  const playing = inView && !reduce && !hoverPaused && !userPaused && !dragging && !hidden;

  const pauseThenResume = useCallback(() => {
    setUserPaused(true);
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      setUserPaused(false);
    }, RESUME_MS);
  }, []);

  const goTo = useCallback((next: number, dir: number) => {
    const wrapped = wrapIndex(next);
    if (wrapped === indexRef.current) return;
    setDirection(dir);
    remainingRef.current = AUTO_MS;
    setIndex(wrapped);
  }, []);

  const goBy = useCallback(
    (dir: number, fromControl = false) => {
      goTo(indexRef.current + dir, dir);
      if (fromControl) pauseThenResume();
    },
    [goTo, pauseThenResume],
  );

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    const sync = () => setHidden(document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  useEffect(() => {
    if (seenIndex.current !== index) {
      remainingRef.current = AUTO_MS;
      seenIndex.current = index;
    }
    if (!playing) return;

    const startedAt = Date.now();
    const wait = remainingRef.current;
    const id = setTimeout(() => {
      remainingRef.current = AUTO_MS;
      setDirection(1);
      setIndex((current) => wrapIndex(current + 1));
    }, wait);

    return () => {
      clearTimeout(id);
      remainingRef.current = Math.max(80, remainingRef.current - (Date.now() - startedAt));
    };
  }, [playing, index]);

  const onDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setDragging(false);
      const { offset, velocity } = info;
      if (offset.x < -SWIPE_PX || velocity.x < -SWIPE_V) {
        goBy(1, true);
        return;
      }
      if (offset.x > SWIPE_PX || velocity.x > SWIPE_V) {
        goBy(-1, true);
      }
    },
    [goBy],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goBy(1, true);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goBy(-1, true);
      }
    },
    [goBy],
  );

  return (
    <div
      ref={stageRef}
      className="go-how__carousel"
      role="region"
      aria-roledescription="carrousel"
      aria-label="Étapes de fonctionnement ZifTip"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className="go-how__stage">
        <div className="go-how__sizer" aria-hidden>
          {STEPS.map((item) => (
            <StepCard key={item.num} step={item} />
          ))}
        </div>

        <div
          className="go-how__viewport"
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") setHoverPaused(true);
          }}
          onPointerLeave={() => setHoverPaused(false)}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={step.num}
              className="go-how__slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`Étape ${step.num} sur 4 : ${step.title}`}
              custom={direction}
              variants={slideVariants}
              initial={reduce ? false : "enter"}
              animate="center"
              exit={reduce ? undefined : "exit"}
              transition={reduce ? { duration: 0 } : { duration: SLIDE_MS, ease: EASE }}
              drag={reduce ? false : "x"}
              dragDirectionLock
              dragElastic={0.14}
              dragMomentum={false}
              dragConstraints={{ left: 0, right: 0 }}
              style={{ touchAction: "pan-y" }}
              onDragStart={() => setDragging(true)}
              onDragEnd={onDragEnd}
            >
              <StepCard step={step} headingId={`go-how-step-${step.num}`} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="go-how__controls">
        <button type="button" className="go-sr" aria-label="Étape précédente" onClick={() => goBy(-1, true)}>
          Précédent
        </button>

        <div className="go-how__dots" role="group" aria-label="Choisir une étape">
          {STEPS.map((item, itemIndex) => {
            const active = itemIndex === index;
            return (
              <button
                key={item.num}
                type="button"
                className={`go-how-dot${active ? " is-on" : ""}`}
                aria-label={`Étape ${item.num} : ${item.title}`}
                aria-current={active ? "true" : undefined}
                onClick={() => {
                  if (itemIndex === index) {
                    pauseThenResume();
                    return;
                  }
                  const forward = wrapIndex(itemIndex - index);
                  const backward = wrapIndex(index - itemIndex);
                  goTo(itemIndex, forward <= backward ? 1 : -1);
                  pauseThenResume();
                }}
              >
                <span className="go-how-dot__label">{item.num}</span>
                <span className="go-how-dot__track" aria-hidden>
                  {active && !reduce ? (
                    <i className={`go-how-dot__fill${playing ? "" : " is-paused"}`} />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>

        <button type="button" className="go-sr" aria-label="Étape suivante" onClick={() => goBy(1, true)}>
          Suivant
        </button>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section id="fonctionnement" className="go-how" aria-labelledby="go-how-title">
      <Container>
        <ScrollReveal>
          <header className="go-how__head">
            <p className="go-how__label">Comment ça fonctionne</p>
            <h2 id="go-how-title">Un système simple pour vendre, récupérer et suivre.</h2>
            <p className="go-how__lead">
              ZifTip vous permet d’ajouter la vente de bons cadeaux à votre activité, de capter vos clients et de
              suivre toute la gestion depuis un seul endroit.
            </p>
          </header>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <HowItWorksCarousel />
        </ScrollReveal>
      </Container>
    </section>
  );
}
