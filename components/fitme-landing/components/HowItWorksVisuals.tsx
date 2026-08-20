"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { BEST_COLORS, IMAGES } from "../config";
import { cn } from "@/src/lib/utils";

const ANALYZE_LABELS = ["Clean Minimal", "Old Money", "Streetwear", "Smart Casual"] as const;

const UPLOAD_SHOTS = [IMAGES.original, IMAGES.smartCasual, IMAGES.oldMoney] as const;
const PROFILE_SHOTS = [IMAGES.cleanMinimal, IMAGES.smartCasual, IMAGES.oldMoney] as const;

function HiwStage({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPlaying(entry.isIntersecting),
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduce]);

  return (
    <div
      ref={ref}
      className={cn("fitme-hiw-stage", className, playing && "is-playing")}
      aria-hidden
    >
      {children}
    </div>
  );
}

function HiwUploadVisual() {
  return (
    <HiwStage className="fitme-hiw-upload">
      <div className="fitme-hiw-drop">
        <span className="fitme-hiw-drop__plus" />
      </div>
      <div className="fitme-hiw-thumbs">
        {UPLOAD_SHOTS.map((src, index) => (
          <figure key={src} className={`fitme-hiw-thumb is-${index + 1}`}>
            <Image src={src} alt="" width={120} height={150} />
            <i />
          </figure>
        ))}
      </div>
    </HiwStage>
  );
}

function HiwAnalyzeVisual() {
  return (
    <HiwStage className="fitme-hiw-analyze">
      <div className="fitme-hiw-analyze__shot">
        <Image src={IMAGES.original} alt="" width={200} height={250} />
        <span className="fitme-hiw-analyze__beam" />
        <span className="fitme-hiw-analyze__frame" />
      </div>
      <div className="fitme-hiw-analyze__meta">
        <p className="fitme-hiw-analyze__labels">
          {ANALYZE_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </p>
        <div className="fitme-hiw-dots">
          {BEST_COLORS.slice(0, 4).map((color) => (
            <i key={color.name} style={{ background: color.hex }} />
          ))}
        </div>
      </div>
    </HiwStage>
  );
}

function HiwProfileVisual() {
  return (
    <HiwStage className="fitme-hiw-profile">
      <div className="fitme-hiw-profile__top">
        <p>Top style</p>
        <strong>Clean Minimal</strong>
        <span>94% match</span>
      </div>
      <div className="fitme-hiw-profile__colors">
        <p>Best colors</p>
        <div className="fitme-hiw-dots">
          {BEST_COLORS.map((color) => (
            <i key={color.name} style={{ background: color.hex }} />
          ))}
        </div>
      </div>
      <div className="fitme-hiw-profile__looks">
        {PROFILE_SHOTS.map((src) => (
          <Image key={src} src={src} alt="" width={80} height={100} />
        ))}
      </div>
    </HiwStage>
  );
}

export function HiwVisual({ step }: { step: "upload" | "analyze" | "profile" }) {
  if (step === "upload") return <HiwUploadVisual />;
  if (step === "analyze") return <HiwAnalyzeVisual />;
  return <HiwProfileVisual />;
}
