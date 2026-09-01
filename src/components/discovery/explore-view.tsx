import Link from "next/link";
import { PeopleFeed } from "@/src/components/discovery/profile-discovery-card";
import { DiscoveryEmpty } from "@/src/components/discovery/empty-state";
import { categoryHref } from "@/src/lib/discovery/routes";
import type { Category, ProfileCardModel } from "@/src/lib/discovery/types";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function ExploreView({
  firstName,
  categories,
  favoriteSlugs,
  feed,
}: {
  firstName: string;
  categories: Category[];
  favoriteSlugs: string[];
  feed: ProfileCardModel[];
}) {
  const worlds = [
    ...categories.filter((cat) => favoriteSlugs.includes(cat.slug)),
    ...categories.filter((cat) => !favoriteSlugs.includes(cat.slug)),
  ].slice(0, 10);

  return (
    <div className="pb-4">
      <header className="mx-auto w-full max-w-[560px] px-5 pt-2 md:px-0">
        <p className="text-sm text-white/40">{greeting()}{firstName ? `, ${firstName}` : ""}</p>
        <h1 className="mt-1 font-[family-name:var(--font-zg-display)] text-[2.4rem] leading-none tracking-tight text-white">
          Discover
        </h1>
        <p className="mt-2 text-sm text-white/40">People worth knowing in your world.</p>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {worlds.map((cat) => (
            <Link
              key={cat.id}
              href={categoryHref(cat.slug)}
              className="shrink-0 rounded-full bg-white/[0.06] px-3.5 py-1.5 text-sm text-white/70"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </header>

      <div className="mt-6">
        {feed.length ? (
          <PeopleFeed profiles={feed} source="explore" />
        ) : (
          <div className="px-5">
            <DiscoveryEmpty
              title="Nobody to discover yet."
              description="As people join your niches, they appear here."
            />
          </div>
        )}
      </div>
    </div>
  );
}
