"use client";

import { useEffect, useRef, type ReactNode } from "react";

function AutoplayLoopVideo({
  src,
  poster,
  label,
}: {
  src: string;
  poster?: string;
  label: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    const play = () => {
      void el.play().catch(() => {});
    };
    play();
    const onVisible = () => {
      if (document.visibilityState === "visible") play();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      controls={false}
      aria-label={label}
    />
  );
}

export function FeatureVideoCard({
  title,
  description,
  mediaSrc,
  poster,
  scene,
  mediaClassName,
  frame,
}: {
  title: string;
  description: string;
  mediaSrc?: string;
  poster?: string;
  scene?: ReactNode;
  mediaClassName?: string;
  frame?: "phone";
}) {
  const video = mediaSrc ? (
    <AutoplayLoopVideo src={mediaSrc} poster={poster} label={title} />
  ) : null;

  return (
    <article className="go-feature-card">
      <div className={["go-feature-card__media", mediaClassName].filter(Boolean).join(" ")}>
        {scene ? (
          scene
        ) : video && frame === "phone" ? (
          <div className="go-feature-card__phone">{video}</div>
        ) : video ? (
          video
        ) : (
          <div className="go-feature-card__placeholder" />
        )}
      </div>
      <div className="go-feature-card__copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}
