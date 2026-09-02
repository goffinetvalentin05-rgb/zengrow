"use client";

import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import type { ProjectStatus } from "@/src/lib/discovery/constants";
import { cn } from "@/src/lib/utils";
import { useI18n } from "@/src/i18n/provider";

export function FadeImg({
  className,
  onLoad,
  alt = "",
  loading = "lazy",
  decoding = "async",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, [props.src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      alt={alt}
      loading={loading}
      decoding={decoding}
      {...props}
      onError={() => setLoaded(true)}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
      className={cn("sz-img", loaded && "is-loaded", className)}
    />
  );
}

export function DiscoveryPageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mx-auto w-full max-w-[720px] px-5 md:mx-0 md:max-w-none md:px-0">
      <h1 className="sz-display">{title}</h1>
      {subtitle ? <p className="sz-sub">{subtitle}</p> : null}
      {children}
    </header>
  );
}

export function DiscoveryFeedSkeleton({
  swipe = false,
  person = false,
  count = 6,
}: {
  swipe?: boolean;
  person?: boolean;
  count?: number;
}) {
  if (person || swipe) {
    return (
      <div className="flex h-full min-h-[min(78dvh,52rem)] flex-col overflow-hidden md:mx-auto md:max-w-[32.5rem] md:min-h-[min(78dvh,52rem)] md:rounded-[1.25rem] md:border md:border-white/[0.06]">
        <div className="sz-skeleton min-h-0 flex-1" />
        <div className="space-y-3 px-5 py-4">
          <div className="sz-skeleton h-7 w-2/3 rounded-md" />
          <div className="sz-skeleton h-3 w-1/2 rounded-md" />
          <div className="sz-skeleton h-3 w-full rounded-md" />
          <div className="flex gap-2 pt-2">
            <div className="sz-skeleton h-11 flex-1 rounded-2xl" />
            <div className="sz-skeleton h-11 flex-1 rounded-2xl" />
            <div className="sz-skeleton h-11 w-11 shrink-0 rounded-full" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-[1.75rem] border border-white/[0.06]">
          <div className="sz-skeleton aspect-[16/10]" />
          <div className="space-y-3 p-5">
            <div className="sz-skeleton h-6 w-2/3 rounded-md" />
            <div className="sz-skeleton h-3 w-1/2 rounded-md" />
            <div className="sz-skeleton h-3 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DiscoveryPageSkeleton({
  titleWidth = "w-64",
}: {
  titleWidth?: string;
}) {
  return (
    <div className="pb-8">
      <div className="px-5 md:px-0">
        <div className={cn("sz-skeleton h-10 rounded-lg", titleWidth)} />
        <div className="sz-skeleton mt-3 h-4 w-72 max-w-full rounded-md" />
        <div className="mt-5 flex gap-2">
          <div className="sz-skeleton h-10 w-20 rounded-full" />
          <div className="sz-skeleton h-10 w-16 rounded-full" />
          <div className="sz-skeleton h-10 w-24 rounded-full" />
        </div>
      </div>
      <div className="mt-7 px-5 md:px-0">
        <DiscoveryFeedSkeleton />
      </div>
    </div>
  );
}

export function ProjectStrip({
  name,
  logoUrl,
  status,
  description,
  className,
  showLabel = true,
}: {
  name: string;
  logoUrl?: string | null;
  status?: string | null;
  description?: string | null;
  className?: string;
  showLabel?: boolean;
}) {
  const { t } = useI18n();
  const statusLabel =
    status && status !== "building" && status in t.projectStatus
      ? t.projectStatus[status as ProjectStatus]
      : status && status !== "building"
        ? status
        : null;
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      {logoUrl ? (
        <FadeImg src={logoUrl} alt="" className="mt-0.5 h-7 w-7 rounded-lg object-cover ring-1 ring-white/10" />
      ) : (
        <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-[10px] text-white/50 ring-1 ring-white/10">
          {name.slice(0, 1)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="flex min-w-0 items-center gap-2 text-[15px] text-white">
          {showLabel ? <span className="sz-label shrink-0">{t.profile.currentlyBuilding}</span> : null}
          <span className="truncate">{name}</span>
        </p>
        {statusLabel || description ? (
          <p className="mt-0.5 truncate text-[12px] text-white/35">
            {[statusLabel, description].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
