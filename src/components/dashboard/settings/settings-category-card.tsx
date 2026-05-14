"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

type SettingsCategoryCardProps = {
  icon: LucideIcon;
  iconWrapClassName: string;
  iconClassName: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
};

export function SettingsCategoryCard({
  icon: Icon,
  iconWrapClassName,
  iconClassName,
  title,
  subtitle,
  children,
  className,
}: SettingsCategoryCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-zg-border bg-zg-surface p-6 shadow-sm md:p-8",
        className,
      )}
    >
      <header className="mb-6 flex items-start gap-4">
        <span
          className={cn(
            "flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl border border-white/5",
            iconWrapClassName,
          )}
        >
          <Icon className={cn("h-6 w-6", iconClassName)} strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-zg-fg">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-zg-text-muted">{subtitle}</p>
        </div>
      </header>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}
