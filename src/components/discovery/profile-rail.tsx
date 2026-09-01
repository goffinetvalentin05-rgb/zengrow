import type { ProfileCardModel } from "@/src/lib/discovery/types";
import { ProfileCard } from "@/src/components/discovery/profile-card";
import { cn } from "@/src/lib/utils";

export function ProfileRail({
  title,
  subtitle,
  profiles,
  source = "explore",
  variant = "default",
}: {
  title: string;
  subtitle?: string;
  profiles: ProfileCardModel[];
  source?: string;
  variant?: "default" | "featured" | "compact";
}) {
  if (!profiles.length) return null;

  return (
    <section className="min-w-0">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-zg-display)] text-[1.65rem] tracking-tight text-white md:text-[1.85rem]">
            {title}
          </h2>
          {subtitle ? <p className="mt-1 text-sm text-white/40">{subtitle}</p> : null}
        </div>
      </div>
      <div
        className={cn(
          "flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]",
          variant === "featured" && "gap-5",
        )}
      >
        {profiles.map((profile) => (
          <div key={profile.id} className="w-[min(78vw,320px)] shrink-0 md:w-[300px]">
            <ProfileCard profile={profile} source={source} variant={variant} />
          </div>
        ))}
      </div>
    </section>
  );
}
