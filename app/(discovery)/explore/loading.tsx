import { DiscoveryFeedSkeleton, DiscoveryPageSkeleton } from "@/src/components/discovery/sz-ui";

export default function ExploreLoading() {
  return (
    <>
      <div className="hidden md:block">
        <DiscoveryPageSkeleton titleWidth="w-80" />
      </div>
      <div className="h-[calc(100dvh-var(--sz-bottom-nav-height))] md:hidden">
        <DiscoveryFeedSkeleton person />
      </div>
    </>
  );
}
