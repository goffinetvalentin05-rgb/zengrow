"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./platform-demo.css";

const TABS = [
  {
    id: "reservations",
    title: "Réservations en ligne",
    description: "Recevez des demandes depuis une page claire et adaptée au mobile.",
  },
  {
    id: "relances",
    title: "Relances IA",
    description: "Sachez qui relancer et avec quel message.",
  },
  {
    id: "campagnes",
    title: "Campagnes marketing",
    description: "Annoncez un menu, un événement ou une soirée à remplir.",
  },
  {
    id: "avis",
    title: "Avis Google",
    description: "Demandez automatiquement un avis après une visite.",
  },
] as const;

const FILL_ORDER = [
  2, 5, 8, 9, 12, 15, 16, 18, 19, 22, 23, 25, 1, 4, 6, 11, 14, 17, 20, 7, 10, 13, 3, 21, 24,
  26, 28, 29, 30,
];

const AUTOPLAY_MS = 4500;
const MANUAL_PAUSE_MS = 9000;

type TabId = (typeof TABS)[number]["id"];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

function schedule(
  timeouts: ReturnType<typeof setTimeout>[],
  fn: () => void,
  ms: number,
  running: () => boolean,
) {
  const id = setTimeout(() => {
    if (running()) fn();
  }, ms);
  timeouts.push(id);
  return id;
}

/* —— 1. Réservations —— */
function DemoReservations({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!active) return;

    const grid = gridRef.current;
    const counter = counterRef.current;
    if (!grid || !counter) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let running = true;
    let dayCells: HTMLDivElement[] = [];
    let fillIdx = 0;
    let count = 0;

    const build = () => {
      grid.innerHTML = "";
      dayCells = [];
      ["L", "M", "M", "J", "V", "S", "D"].forEach((d) => {
        const el = document.createElement("div");
        el.className = "dow";
        el.textContent = d;
        grid.appendChild(el);
      });
      for (let i = 0; i < 2; i++) {
        const el = document.createElement("div");
        el.className = "cell empty";
        grid.appendChild(el);
      }
      for (let day = 1; day <= 31; day++) {
        const el = document.createElement("div");
        el.className = "cell";
        el.textContent = String(day);
        grid.appendChild(el);
        dayCells.push(el);
      }
      fillIdx = 0;
      count = 0;
      counter.textContent = "0";
    };

    const fillOne = () => {
      if (!running) return;
      if (fillIdx >= FILL_ORDER.length) {
        fillIdx = 0;
        dayCells.forEach((c) => c.classList.remove("filled", "justfilled"));
        count = 0;
        counter.textContent = "0";
      }
      const cell = dayCells[FILL_ORDER[fillIdx]];
      if (cell && !cell.classList.contains("filled")) {
        cell.classList.add("filled", "justfilled");
        schedule(timeouts, () => cell.classList.remove("justfilled"), 550, () => running);
        count++;
        counter.textContent = String(count);
      }
      fillIdx++;
      schedule(timeouts, fillOne, reducedMotion ? 0 : 420, () => running);
    };

    build();

    if (reducedMotion) {
      FILL_ORDER.slice(0, 12).forEach((idx) => {
        const cell = dayCells[idx];
        if (cell) cell.classList.add("filled");
      });
      counter.textContent = "12";
    } else {
      schedule(timeouts, fillOne, 400, () => running);
    }

    return () => {
      running = false;
      timeouts.forEach(clearTimeout);
      grid.innerHTML = "";
    };
  }, [active, reducedMotion]);

  return (
    <div className="zgpd-mini">
      <div className="zgpd-cal-head">
        <strong>Mai 2026</strong>
        <span>En direct</span>
      </div>
      <div ref={gridRef} className="zgpd-cal-grid" />
      <div className="zgpd-cal-foot">
        <span ref={counterRef} className="zgpd-cal-count">
          0
        </span>
        <span>réservations ce mois</span>
      </div>
    </div>
  );
}

/* —— 2. Relances —— */
const RELANCE_MSG =
  "Bonjour Marie, nous serions ravis de vous revoir au restaurant cette semaine…";

const CLIENTS = [
  { name: "Marie L.", initial: "M", badge: "À relancer", hot: true },
  { name: "Thomas B.", initial: "T", badge: "Fidèle", hot: false },
  { name: "Équipe Dupont", initial: "É", badge: "30 jours", hot: true },
];

function DemoRelances({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  const [typed, setTyped] = useState(reducedMotion ? RELANCE_MSG : "");
  const [phase, setPhase] = useState<"type" | "send" | "done">(
    reducedMotion ? "done" : "type",
  );
  const [target, setTarget] = useState(reducedMotion);
  const [done, setDone] = useState(reducedMotion);

  useEffect(() => {
    if (!active) {
      setTyped("");
      setPhase("type");
      setTarget(false);
      setDone(false);
      return;
    }

    if (reducedMotion) {
      setTyped(RELANCE_MSG);
      setPhase("done");
      setTarget(true);
      setDone(true);
      return;
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let running = true;
    let i = 0;

    setTyped("");
    setPhase("type");
    setTarget(false);
    setDone(false);

    const typeNext = () => {
      if (!running) return;
      if (i < RELANCE_MSG.length) {
        setTyped(RELANCE_MSG.slice(0, i + 1));
        i++;
        schedule(timeouts, typeNext, 38, () => running);
      } else {
        schedule(timeouts, () => setPhase("send"), 500, () => running);
        schedule(timeouts, () => setTarget(true), 700, () => running);
        schedule(timeouts, () => {
          setPhase("done");
          setDone(true);
        }, 1400, () => running);
        schedule(timeouts, restart, 3200, () => running);
      }
    };

    const restart = () => {
      if (!running) return;
      i = 0;
      setTyped("");
      setPhase("type");
      setTarget(false);
      setDone(false);
      schedule(timeouts, typeNext, 600, () => running);
    };

    schedule(timeouts, typeNext, 500, () => running);

    return () => {
      running = false;
      timeouts.forEach(clearTimeout);
    };
  }, [active, reducedMotion]);

  return (
    <div className="zgpd-mini">
      <div className="zgpd-compose">
        <p className="zgpd-compose-text">
          {typed}
          {phase === "type" && !reducedMotion ? (
            <span className="zgpd-compose-cursor" aria-hidden />
          ) : null}
        </p>
        <span
          className={`zgpd-send-pill ${phase === "send" || phase === "done" ? "visible" : ""} ${phase === "send" ? "flying" : ""}`}
        >
          Envoi IA →
        </span>
      </div>
      <div>
        {CLIENTS.map((c, idx) => (
          <div
            key={c.name}
            className={`zgpd-client-row ${idx === 0 && target ? "target" : ""} ${idx === 0 && done ? "done" : ""}`}
          >
            <span className="zgpd-client-name">
              <span className="zgpd-client-avatar">{c.initial}</span>
              {c.name}
            </span>
            <span
              className={`zgpd-badge ${idx === 0 && done ? "done" : ""}`}
            >
              {idx === 0 && done ? "Relancé ✓" : c.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* —— 3. Campagnes —— */
const CAMP_MSG =
  "« Nouveau menu de saison — réservez votre table avant jeudi… »";

function DemoCampagnes({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  const [typed, setTyped] = useState(reducedMotion ? CAMP_MSG : "");
  const [progress, setProgress] = useState(reducedMotion ? 100 : 0);
  const [sent, setSent] = useState(reducedMotion);

  useEffect(() => {
    if (!active) {
      setTyped("");
      setProgress(0);
      setSent(false);
      return;
    }

    if (reducedMotion) {
      setTyped(CAMP_MSG);
      setProgress(100);
      setSent(true);
      return;
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let running = true;
    let char = 0;
    let prog = 0;

    setTyped("");
    setProgress(0);
    setSent(false);

    const typeNext = () => {
      if (!running) return;
      if (char < CAMP_MSG.length) {
        setTyped(CAMP_MSG.slice(0, char + 1));
        char++;
        schedule(timeouts, typeNext, 32, () => running);
      } else {
        const tickProgress = () => {
          if (!running) return;
          prog += 4;
          setProgress(Math.min(prog, 100));
          if (prog < 100) {
            schedule(timeouts, tickProgress, 60, () => running);
          } else {
            schedule(timeouts, () => setSent(true), 350, () => running);
            schedule(timeouts, restart, 2800, () => running);
          }
        };
        schedule(timeouts, tickProgress, 400, () => running);
      }
    };

    const restart = () => {
      if (!running) return;
      char = 0;
      prog = 0;
      setTyped("");
      setProgress(0);
      setSent(false);
      schedule(timeouts, typeNext, 500, () => running);
    };

    schedule(timeouts, typeNext, 400, () => running);

    return () => {
      running = false;
      timeouts.forEach(clearTimeout);
    };
  }, [active, reducedMotion]);

  return (
    <div className="zgpd-mini">
      <span className="zgpd-camp-chip">IA</span>
      <p className="zgpd-camp-msg">{typed}</p>
      <div className="zgpd-progress">
        <div className="zgpd-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className={`zgpd-camp-status ${sent ? "visible" : ""}`}>
        Envoyé à 142 clients ✓
      </p>
    </div>
  );
}

/* —— 4. Avis Google —— */
const STEPS = ["Visite", "SMS", "Avis"];

function DemoAvis({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  const [stepOn, setStepOn] = useState(reducedMotion ? 3 : 0);
  const [stars, setStars] = useState(reducedMotion ? 5 : 0);
  const [rating, setRating] = useState(reducedMotion ? 4.9 : 0);

  useEffect(() => {
    if (!active) {
      setStepOn(0);
      setStars(0);
      setRating(0);
      return;
    }

    if (reducedMotion) {
      setStepOn(3);
      setStars(5);
      setRating(4.9);
      return;
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let running = true;

    const run = () => {
      if (!running) return;
      setStepOn(0);
      setStars(0);
      setRating(0);

      schedule(timeouts, () => setStepOn(1), 600, () => running);
      schedule(timeouts, () => setStepOn(2), 1200, () => running);
      schedule(timeouts, () => setStepOn(3), 1800, () => running);

      for (let s = 1; s <= 5; s++) {
        schedule(
          timeouts,
          () => setStars(s),
          2200 + s * 280,
          () => running,
        );
      }

      let r = 0;
      const tickRating = () => {
        if (!running) return;
        r += 0.35;
        if (r >= 4.9) {
          setRating(4.9);
          schedule(timeouts, run, 2800, () => running);
        } else {
          setRating(Math.round(r * 10) / 10);
          schedule(timeouts, tickRating, 45, () => running);
        }
      };
      schedule(timeouts, tickRating, 3600, () => running);
    };

    schedule(timeouts, run, 300, () => running);

    return () => {
      running = false;
      timeouts.forEach(clearTimeout);
    };
  }, [active, reducedMotion]);

  return (
    <div className="zgpd-mini">
      <div className="zgpd-stepper">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`zgpd-step ${i < stepOn ? "on" : ""} ${i === 2 && stepOn >= 3 ? "done" : ""}`}
          >
            <span className="zgpd-step-dot">{i + 1}</span>
            <span className="zgpd-step-label">{label}</span>
          </div>
        ))}
      </div>
      <div className="zgpd-stars" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`zgpd-star ${i < stars ? "on" : ""}`}>
            ⭐
          </span>
        ))}
      </div>
      <p className="zgpd-rating">
        {rating > 0 ? rating.toFixed(1) : "—"}
        <small>Note Google</small>
      </p>
    </div>
  );
}

function DemoPanel({
  tabId,
  active,
  reducedMotion,
}: {
  tabId: TabId;
  active: boolean;
  reducedMotion: boolean;
}) {
  switch (tabId) {
    case "reservations":
      return <DemoReservations active={active} reducedMotion={reducedMotion} />;
    case "relances":
      return <DemoRelances active={active} reducedMotion={reducedMotion} />;
    case "campagnes":
      return <DemoCampagnes active={active} reducedMotion={reducedMotion} />;
    case "avis":
      return <DemoAvis active={active} reducedMotion={reducedMotion} />;
    default:
      return null;
  }
}

export function PlatformInteractiveDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const pauseUntilRef = useRef(0);
  const activeId = TABS[activeIndex].id;

  const selectTab = useCallback((index: number) => {
    setActiveIndex(index);
    pauseUntilRef.current = Date.now() + MANUAL_PAUSE_MS;
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return;
      setActiveIndex((i) => (i + 1) % TABS.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [reducedMotion]);

  return (
    <div className="zgpd">
      <div className="zgpd-layout">
        <div
          className="zgpd-tabs"
          role="tablist"
          aria-label="Fonctionnalités de la plateforme"
        >
          {TABS.map((tab, i) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeIndex === i}
              aria-controls={`zgpd-panel-${tab.id}`}
              id={`zgpd-tab-${tab.id}`}
              className={`zgpd-tab ${activeIndex === i ? "zgpd-tab--active" : ""}`}
              onClick={() => selectTab(i)}
            >
              <span className="zgpd-tab-title">{tab.title}</span>
              <span className="zgpd-tab-desc">{tab.description}</span>
            </button>
          ))}
        </div>

        <div
          className="zgpd-panel"
          role="tabpanel"
          id={`zgpd-panel-${activeId}`}
          aria-labelledby={`zgpd-tab-${activeId}`}
        >
          <div className="zgpd-panel-shine" aria-hidden />
          <div className="zgpd-panel-body">
            <div key={activeId} className="zgpd-demo-wrap">
              <DemoPanel
                tabId={activeId}
                active
                reducedMotion={reducedMotion}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
