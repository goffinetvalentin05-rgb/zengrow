"use client";

import { CredibilitySection } from "@/src/components/reservation/public-page-premium";
import type { CredibilityContent } from "@/src/lib/public-page/premium-content";
import type { ReviewsSectionCopy } from "@/src/lib/public-page/page-sections";
import { hasCredibilityContent } from "@/src/lib/public-page/premium-content";

export function ShowroomSocialProof({
  data,
  copy,
}: {
  data: CredibilityContent;
  copy: ReviewsSectionCopy;
}) {
  if (!hasCredibilityContent(data)) return null;

  return (
    <section id="avis" className="scroll-mt-20 py-20 sm:py-28">
      <CredibilitySection data={data} copy={copy} />
    </section>
  );
}
