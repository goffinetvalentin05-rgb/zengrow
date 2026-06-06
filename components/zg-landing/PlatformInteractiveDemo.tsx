"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./platform-demo.css";

const TABS = [
  {
    id: "ajout",
    title: "Ajoutez le client",
    description: "Nom, numéro de téléphone et date de visite. C'est tout.",
  },
  {
    id: "avis",
    title: "Avis Google automatique",
    description: "Après la visite, ZenGrow peut envoyer un message pour demander un avis Google.",
  },
  {
    id: "relance",
    title: "Relance automatique",
    description:
      "Si le client ne revient pas après un certain temps, ZenGrow prépare et envoie une relance.",
  },
] as const;

const AUTOPLAY_MS = 5000;
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

/* —— 1. Ajout client —— */
const CLIENT_FIELDS = [
  { label: "Nom", value: "Marie Dupont" },
  { label: "Téléphone", value: "+41 79 123 45 67" },
  { label: "Visite", value: "12 juin 2026" },
] as const;

function DemoAddClient({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  const [visibleFields, setVisibleFields] = useState(reducedMotion ? 3 : 0);
  const [saved, setSaved] = useState(reducedMotion);

  useEffect(() => {
    if (!active) {
      setVisibleFields(0);
      setSaved(false);
      return;
    }

    if (reducedMotion) {
      setVisibleFields(3);
      setSaved(true);
      return;
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let running = true;

    const run = () => {
      if (!running) return;
      setVisibleFields(0);
      setSaved(false);

      CLIENT_FIELDS.forEach((_, i) => {
        schedule(timeouts, () => setVisibleFields(i + 1), 500 + i * 550, () => running);
      });

      schedule(timeouts, () => setSaved(true), 2400, () => running);
      schedule(timeouts, run, 4200, () => running);
    };

    schedule(timeouts, run, 350, () => running);

    return () => {
      running = false;
      timeouts.forEach(clearTimeout);
    };
  }, [active, reducedMotion]);

  return (
    <div className="zgpd-mini">
      <p className="zgpd-mini-label">Nouveau client</p>
      <div className="zgpd-client-form">
        {CLIENT_FIELDS.map((field, i) => (
          <div
            key={field.label}
            className={`zgpd-client-form-field ${i < visibleFields ? "zgpd-client-form-field--on" : ""}`}
          >
            <span>{field.label}</span>
            <strong>{field.value}</strong>
          </div>
        ))}
      </div>

      <div className={`zgpd-client-added ${saved ? "zgpd-client-added--on" : ""}`}>
        <span className="zgpd-client-avatar">M</span>
        <div>
          <p className="zgpd-client-added-name">Marie Dupont</p>
          <p className="zgpd-client-added-meta">Ajoutée à la base · 12 juin</p>
        </div>
        <span className="zgpd-client-added-badge">Enregistré ✓</span>
      </div>
    </div>
  );
}

/* —— 2. Avis Google —— */
const AVIS_SMS =
  "Merci pour votre visite ! Un avis Google nous aiderait beaucoup — merci d'avance.";

function DemoAvisGoogle({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  const [phase, setPhase] = useState<"idle" | "sms" | "link" | "sent">(
    reducedMotion ? "sent" : "idle",
  );

  useEffect(() => {
    if (!active) {
      setPhase("idle");
      return;
    }

    if (reducedMotion) {
      setPhase("sent");
      return;
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let running = true;

    const run = () => {
      if (!running) return;
      setPhase("idle");
      schedule(timeouts, () => setPhase("sms"), 400, () => running);
      schedule(timeouts, () => setPhase("link"), 1200, () => running);
      schedule(timeouts, () => setPhase("sent"), 2200, () => running);
      schedule(timeouts, run, 4200, () => running);
    };

    schedule(timeouts, run, 300, () => running);

    return () => {
      running = false;
      timeouts.forEach(clearTimeout);
    };
  }, [active, reducedMotion]);

  return (
    <div className="zgpd-mini">
      <p className="zgpd-mini-label">Message après visite</p>
      <div className={`zgpd-sms ${phase !== "idle" ? "zgpd-sms--on" : ""}`}>
        <span className="zgpd-sms-tag">SMS · ZenGrow</span>
        <p className="zgpd-sms-text">{AVIS_SMS}</p>
        <span
          className={`zgpd-google-link ${phase === "link" || phase === "sent" ? "zgpd-google-link--on" : ""}`}
        >
          ⭐ Laisser un avis Google
        </span>
      </div>
      <p className={`zgpd-sms-status ${phase === "sent" ? "zgpd-sms-status--on" : ""}`}>
        Message envoyé automatiquement ✓
      </p>
    </div>
  );
}

/* —— 3. Relance —— */
const RELANCE_MSG =
  "Bonjour Marie, cela fait un moment — nous serions ravis de vous revoir prochainement.";

function DemoRelance({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  const [typed, setTyped] = useState(reducedMotion ? RELANCE_MSG : "");
  const [phase, setPhase] = useState<"idle" | "type" | "send" | "return">(
    reducedMotion ? "return" : "idle",
  );

  useEffect(() => {
    if (!active) {
      setTyped("");
      setPhase("idle");
      return;
    }

    if (reducedMotion) {
      setTyped(RELANCE_MSG);
      setPhase("return");
      return;
    }

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let running = true;
    let i = 0;

    const typeNext = () => {
      if (!running) return;
      if (i < RELANCE_MSG.length) {
        setTyped(RELANCE_MSG.slice(0, i + 1));
        i++;
        schedule(timeouts, typeNext, 34, () => running);
      } else {
        schedule(timeouts, () => setPhase("send"), 450, () => running);
        schedule(timeouts, () => setPhase("return"), 1600, () => running);
        schedule(timeouts, restart, 3800, () => running);
      }
    };

    const restart = () => {
      if (!running) return;
      i = 0;
      setTyped("");
      setPhase("type");
      schedule(timeouts, typeNext, 500, () => running);
    };

    setPhase("type");
    schedule(timeouts, typeNext, 400, () => running);

    return () => {
      running = false;
      timeouts.forEach(clearTimeout);
    };
  }, [active, reducedMotion]);

  return (
    <div className="zgpd-mini">
      <p className="zgpd-mini-label">Client inactif · 45 jours</p>
      <div className="zgpd-compose">
        <p className="zgpd-compose-text">
          {typed}
          {phase === "type" && !reducedMotion ? (
            <span className="zgpd-compose-cursor" aria-hidden />
          ) : null}
        </p>
        <span
          className={`zgpd-send-pill ${phase === "send" || phase === "return" ? "visible" : ""} ${phase === "send" ? "flying" : ""}`}
        >
          Relance envoyée →
        </span>
      </div>

      <div
        className={`zgpd-client-row ${phase === "send" ? "target" : ""} ${phase === "return" ? "done" : ""}`}
      >
        <span className="zgpd-client-name">
          <span className="zgpd-client-avatar">M</span>
          Marie Dupont
        </span>
        <span className={`zgpd-badge ${phase === "return" ? "done" : ""}`}>
          {phase === "return" ? "Revenu ✓" : phase === "send" ? "Relancé ✓" : "À relancer"}
        </span>
      </div>

      <p className={`zgpd-return-note ${phase === "return" ? "zgpd-return-note--on" : ""}`}>
        Le client revient au restaurant
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
    case "ajout":
      return <DemoAddClient active={active} reducedMotion={reducedMotion} />;
    case "avis":
      return <DemoAvisGoogle active={active} reducedMotion={reducedMotion} />;
    case "relance":
      return <DemoRelance active={active} reducedMotion={reducedMotion} />;
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
          aria-label="Comment ZenGrow fonctionne"
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
              <DemoPanel tabId={activeId} active reducedMotion={reducedMotion} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
