"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { IMAGES } from "../config";

export function HeroBackdrop() {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const stage = stageRef.current;
    const hero = stage?.closest(".fitme-hero");
    if (!stage || !hero || reduce) return;

    const finePointer = window.matchMedia("(pointer: fine)");
    if (!finePointer.matches) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;

    const apply = () => {
      frame = 0;
      stage.style.setProperty("--hx", targetX.toFixed(3));
      stage.style.setProperty("--hy", targetY.toFixed(3));
    };

    const onMove = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      targetX = (event.clientX - rect.left) / rect.width - 0.5;
      targetY = (event.clientY - rect.top) / rect.height - 0.5;
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reduce]);

  return (
    <div className="fitme-hero__stage" aria-hidden ref={stageRef}>
      <div className="fitme-hero__photo-wrap">
        <Image
          className="fitme-hero__photo"
          src={IMAGES.heroScan}
          alt=""
          fill
          priority
          quality={80}
          sizes="100vw"
        />
      </div>
      <div className="fitme-hero__bloom" />
      <div className="fitme-hero__wash" />
      <div className="fitme-hero__shade" />
      <div className="fitme-hero__grain" />
      <div className="fitme-hero__hud">
        <div className="fitme-hero__glass">
          <p className="fitme-hero__glass-kicker">
            <i />
            Analyse en cours
          </p>
          <div className="fitme-hero__glass-row">
            <p className="fitme-hero__glass-score">
              <strong>87%</strong>
              <span>Précision du profil</span>
            </p>
            <span className="fitme-hero__wave">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
          </div>
        </div>
        <p className="fitme-hero__chip">Scan style FM-01</p>
        <p className="fitme-hero__chip fitme-hero__chip--mode">Mode : profiling</p>
        <div className="fitme-hero__corners">
          <i className="is-tl" />
          <i className="is-tr" />
          <i className="is-bl" />
          <i className="is-br" />
        </div>
        <div className="fitme-hero__ruler" />
        <div className="fitme-hero__scan" />
        <span className="fitme-hero__mark">FM-01</span>
      </div>
      <div className="fitme-hero__veil" />
    </div>
  );
}
