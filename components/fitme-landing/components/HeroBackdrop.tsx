"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { IMAGES } from "../config";

const PHOTO = {
  alt: "",
  sizes: "100vw",
  quality: 88,
} as const;

function omitStyle<T extends { style?: unknown }>(props: T) {
  const { style: _style, ...rest } = props;
  void _style;
  return rest;
}

export function HeroBackdrop() {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { props: desktopProps } = getImageProps({
    ...PHOTO,
    width: 1920,
    height: 1080,
    src: IMAGES.heroFitmeDesktop,
  });
  const { props: mobileProps } = getImageProps({
    ...PHOTO,
    width: 1080,
    height: 1920,
    src: IMAGES.heroFitmeMobile,
  });
  const { props: depthProps } = getImageProps({
    ...PHOTO,
    width: 1920,
    height: 1080,
    quality: 50,
    src: IMAGES.heroFitmeDesktop,
  });
  const { srcSet: mobileSrcSet, sizes: mobileSizes } = mobileProps;
  const desktop = omitStyle(desktopProps);
  const depth = omitStyle(depthProps);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduce) return;

    const hero = stage.closest(".fitme-hero");
    if (!(hero instanceof HTMLElement)) return;

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

    const onMove = (event: Event) => {
      if (!("clientX" in event) || !("clientY" in event)) return;
      const { clientX, clientY } = event as MouseEvent;
      const rect = hero.getBoundingClientRect();
      targetX = (clientX - rect.left) / rect.width - 0.5;
      targetY = (clientY - rect.top) / rect.height - 0.5;
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
        <picture>
          <source media="(max-width: 767px)" srcSet={mobileSrcSet} sizes={mobileSizes} />
          <img {...desktop} alt="" className="fitme-hero__photo" fetchPriority="high" />
        </picture>
      </div>
      <div className="fitme-hero__depth">
        <img {...depth} alt="" className="fitme-hero__photo fitme-hero__photo--depth" />
      </div>
      <div className="fitme-hero__glow" />
      <div className="fitme-hero__rails" />
      <div className="fitme-hero__bloom" />
      <div className="fitme-hero__shimmer" />
      <div className="fitme-hero__shade" />
      <div className="fitme-hero__read" />
      <div className="fitme-hero__grain" />
      <div className="fitme-hero__veil" />
    </div>
  );
}
