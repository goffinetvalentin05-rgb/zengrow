"use client";

import { useEffect, useRef, useState } from "react";
import { Link2 } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { useLocale } from "../locale-provider";
import { Container, Eyebrow, ScrollReveal, Section } from "../ui";

const EASE = [0.22, 1, 0.36, 1] as const;
const HOLD_MS = 4200;

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, y: 22 * dir, filter: "blur(6px)" }),
  center: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: (dir: number) => ({ opacity: 0, y: -18 * dir, filter: "blur(6px)" }),
};

function TypedUrl({ text }: { text: string }) {
  const reduce = Boolean(useReducedMotion());
  const [shown, setShown] = useState(reduce ? text : "");

  useEffect(() => {
    if (reduce) {
      setShown(text);
      return;
    }
    setShown("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, 32);
    return () => window.clearInterval(id);
  }, [text, reduce]);

  return (
    <div className="go-how-visual go-how-visual--url" aria-hidden>
      <span className="go-how-visual__aura" />
      <div className="go-how-field">
        <Link2 className="go-how-field__icon" strokeWidth={1.75} />
        <span className="go-how-field__text">{shown}</span>
        <span className="go-how-field__caret" />
      </div>
    </div>
  );
}

function StepVisual({
  visual,
  urlPlaceholder,
  bubbles,
  orbs,
  actions,
}: {
  visual: "url" | "questions" | "context" | "today";
  urlPlaceholder?: string;
  bubbles?: string[];
  orbs?: string[];
  actions?: string[];
}) {
  if (visual === "url") {
    return <TypedUrl text={urlPlaceholder ?? ""} />;
  }

  if (visual === "questions") {
    return (
      <div className="go-how-visual go-how-visual--q" aria-hidden>
        <span className="go-how-visual__aura" />
        {(bubbles ?? []).map((bubble, index) => (
          <motion.span
            key={bubble}
            className={`go-how-bubble go-how-bubble--${index + 1}`}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.12 + index * 0.14, ease: EASE }}
          >
            {bubble}
          </motion.span>
        ))}
      </div>
    );
  }

  if (visual === "context") {
    return (
      <div className="go-how-visual go-how-visual--ctx" aria-hidden>
        <motion.span
          className="go-how-orbit__core"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        />
        {(orbs ?? []).map((orb, index) => (
          <motion.span
            key={orb}
            className="go-how-orbit__pill"
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.16 + index * 0.07, ease: EASE }}
          >
            {orb}
          </motion.span>
        ))}
      </div>
    );
  }

  return (
    <div className="go-how-visual go-how-visual--today" aria-hidden>
      <span className="go-how-visual__aura" />
      <p className="go-how-today__label">Today</p>
      <div className="go-how-today__list">
        {(actions ?? []).map((action, index) => (
          <motion.div
            key={action}
            className="go-how-today__row"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.12 + index * 0.12, ease: EASE }}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{action}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  const { t } = useLocale();
  const reduce = Boolean(useReducedMotion());
  const steps = t.how.steps;
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.4 });
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const [armed, setArmed] = useState(false);
  const [settled, setSettled] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (inView) setArmed(true);
  }, [inView]);

  const last = steps.length - 1;

  const goTo = (target: number) => {
    const next = (target + steps.length) % steps.length;
    if (next === index) return;
    if (index === last && next === 0) setDir(1);
    else if (index === 0 && next === last) setDir(-1);
    else setDir(next > index ? 1 : -1);
    setIndex(next);
  };

  useEffect(() => {
    if (reduce) {
      setSettled(true);
      setClosing(true);
      return;
    }
    if (paused || !inView || closing) return;

    if (index === last) {
      const calm = window.setTimeout(() => setSettled(true), HOLD_MS);
      const reveal = window.setTimeout(() => setClosing(true), HOLD_MS + 420);
      return () => {
        window.clearTimeout(calm);
        window.clearTimeout(reveal);
      };
    }

    const timer = window.setTimeout(() => {
      setDir(1);
      setIndex((current) => current + 1);
    }, HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [index, paused, inView, reduce, closing, last]);

  const step = steps[index];

  return (
    <Section id="how" className="go-how">
      <Container wide>
        <ScrollReveal className="go-section-head go-section-head--center go-how__head">
          <Eyebrow>{t.how.label}</Eyebrow>
        </ScrollReveal>

        <div
          ref={rootRef}
          className={[
            "go-how-play",
            paused || !inView ? "is-paused" : "",
            settled ? "is-settled" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="go-how-stage">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.article
                key={step.index}
                className="go-how-panel"
                custom={dir}
                variants={stepVariants}
                initial={reduce ? false : "enter"}
                animate="center"
                exit={reduce ? undefined : "exit"}
                transition={{ duration: 0.5, ease: EASE }}
                aria-live="polite"
              >
                <p className="go-how-panel__index">{step.index}</p>
                <div className="go-how-panel__copy">
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
                <StepVisual
                  visual={step.visual}
                  urlPlaceholder={step.urlPlaceholder}
                  bubbles={step.bubbles}
                  orbs={step.orbs}
                  actions={step.actions}
                />
              </motion.article>
            </AnimatePresence>
          </div>

          <div
            className="go-how-nav"
            role="tablist"
            aria-label={t.how.label}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                goTo(index + 1);
              }
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                goTo(index - 1);
              }
            }}
          >
            {steps.map((item, i) => (
              <button
                key={item.index}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`${item.index}. ${item.title}`}
                className={i === index ? "is-on" : i < index ? "is-done" : undefined}
                onClick={() => goTo(i)}
              >
                <span>{item.index}</span>
                <span className="go-how-nav__bar" aria-hidden>
                  {i < index || (i === index && reduce) ? (
                    <span className="go-how-nav__fill is-static" />
                  ) : null}
                  {i === index && !reduce && armed ? <span className="go-how-nav__fill" /> : null}
                </span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {closing ? (
            <motion.div
              className="go-how__closing"
              initial={
                reduce
                  ? false
                  : { opacity: 0, y: 30, filter: "blur(8px)", scale: 0.985 }
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
              transition={{ duration: 0.85, ease: EASE }}
            >
              <p>
                <span>{t.how.closingLine1}</span>
                <span>{t.how.closingLine2}</span>
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Container>
    </Section>
  );
}
