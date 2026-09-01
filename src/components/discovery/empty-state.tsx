import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Compass } from "lucide-react";
import Button from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

export function DiscoveryEmpty({
  title,
  description,
  href,
  cta,
  icon: Icon = Compass,
  className,
}: {
  title: string;
  description: string;
  href?: string;
  cta?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-white/[0.07] bg-white/[0.02] px-6 py-16 text-center",
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <Icon className="h-6 w-6 text-white/55" strokeWidth={1.5} />
      </div>
      <h2 className="mt-5 font-[family-name:var(--font-zg-display)] text-2xl text-white">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-white/50">{description}</p>
      {href && cta ? (
        <Link href={href} className="mt-6">
          <Button type="button">{cta}</Button>
        </Link>
      ) : null}
    </div>
  );
}
