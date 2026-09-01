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
        "flex flex-col items-center justify-center rounded-[1.75rem] border border-white/[0.07] bg-[#0c0c0e] px-6 py-16 text-center",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <Icon className="h-5 w-5 text-white/45" strokeWidth={1.5} />
      </div>
      <h2 className="sz-title mt-5">{title}</h2>
      <p className="sz-body mt-2 max-w-md">{description}</p>
      {href && cta ? (
        <Link href={href} className="mt-6">
          <Button type="button" className="sz-press">
            {cta}
          </Button>
        </Link>
      ) : null}
    </div>
  );
}
