"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const HOLD_MS = 2000;
const SLIDE_S = 0.68;
const EASE = [0.16, 1, 0.3, 1] as const;
const COPIES = 3;
const CENTER_SLOT = 2;

function RouletteArrow() {
  return (
    <svg viewBox="0 0 40 16" fill="none" aria-hidden>
      <path d="M0 8h28" stroke="currentColor" strokeWidth="2.25" />
      <path d="M21 2.2 37 8 21 13.8" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="miter" />
    </svg>
  );
}

export function QuestionRoulette({ questions }: { questions: string[] }) {
  const reduce = Boolean(useReducedMotion());
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.35 });
  const count = questions.length;
  const origin = count;
  const [index, setIndex] = useState(origin);
  const [instant, setInstant] = useState(false);
  const [paused, setPaused] = useState(false);

  const items = Array.from({ length: count * COPIES }, (_, i) => questions[i % count]);

  useEffect(() => {
    if (reduce || paused || !inView) return;
    const timer = window.setTimeout(() => {
      setInstant(false);
      setIndex((current) => current + 1);
    }, HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [index, reduce, paused, inView]);

  if (reduce) {
    return (
      <ul className="go-problem__questions">
        {questions.map((question) => (
          <li key={question}>{question}</li>
        ))}
      </ul>
    );
  }

  return (
    <div
      ref={rootRef}
      className="go-roulette"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <ul className="sr-only">
        {questions.map((question) => (
          <li key={question}>{question}</li>
        ))}
      </ul>

      <div className="go-roulette__frame">
        <span className="go-roulette__arrow" aria-hidden>
          <RouletteArrow />
        </span>

        <div className="go-roulette__viewport">
          <motion.div
            className="go-roulette__track"
            initial={false}
            animate={{ y: `calc(var(--roulette-row) * ${CENTER_SLOT - index})` }}
            transition={instant ? { duration: 0 } : { duration: SLIDE_S, ease: EASE }}
            onAnimationComplete={() => {
              if (index >= origin + count) {
                setInstant(true);
                setIndex(origin);
              }
            }}
          >
            {items.map((question, itemIndex) => (
              <div
                key={`${itemIndex}-${question}`}
                className="go-roulette__item"
                data-dist={Math.min(Math.abs(itemIndex - index), 3)}
                aria-hidden
              >
                <span>{question}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
