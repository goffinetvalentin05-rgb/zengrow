"use client";

import Link from "next/link";
import FeedbacksEmptyPanel from "@/src/components/dashboard/feedbacks/empty/feedbacks-empty-panel";
import { buttonClassName } from "@/src/components/ui/button";

const SETTINGS_GOOGLE_REVIEWS_HREF = "/dashboard/settings?section=google-reviews";

export default function FeedbacksEmptyState() {
  return (
    <FeedbacksEmptyPanel>
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zg-accent-soft-bg text-3xl"
          aria-hidden
        >
          <span aria-hidden>💬</span>
        </div>
        <h2 className="mt-5 text-lg font-semibold text-zg-fg sm:text-xl">
          Aucun feedback pour le moment
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-zg-text-muted">
          Activez les demandes d&apos;avis automatiques pour collecter des retours après chaque
          visite.
        </p>
        <Link
          href={SETTINGS_GOOGLE_REVIEWS_HREF}
          className={buttonClassName({
            variant: "primary",
            size: "md",
            className: "mt-6 w-full sm:w-auto",
          })}
        >
          Configurer maintenant
        </Link>
      </div>
    </FeedbacksEmptyPanel>
  );
}
