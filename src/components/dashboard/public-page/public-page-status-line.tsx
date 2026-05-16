"use client";

import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Pencil } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { PublicPagePublishState } from "@/src/components/dashboard/public-page/public-page-types";

type PublicPageStatusLineProps = {
  publicPath: string;
  publishState: PublicPagePublishState;
  className?: string;
};

function displayPath(url: string): string {
  try {
    const u = new URL(url);
    return `${u.host}${u.pathname}`;
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}

export default function PublicPageStatusLine({ publicPath, publishState, className }: PublicPageStatusLineProps) {
  const { pageStatus, publishedAt, hasUnpublishedChanges } = publishState;

  const statusText =
    pageStatus === "draft"
      ? "Brouillon"
      : hasUnpublishedChanges
        ? "Modifications non publiées"
        : "Publié";

  const publishedAgo =
    pageStatus === "published" && publishedAt
      ? formatDistanceToNow(new Date(publishedAt), { addSuffix: true, locale: fr })
      : null;

  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zg-text-muted",
        className,
      )}
      role="status"
    >
      <span className="font-medium text-zg-fg">{statusText}</span>
      <span aria-hidden>·</span>
      <span className="truncate">{displayPath(publicPath)}</span>
      {publishedAgo ? (
        <>
          <span aria-hidden>·</span>
          <span>Dernière publication {publishedAgo}</span>
        </>
      ) : null}
      {hasUnpublishedChanges ? (
        <span className="inline-flex items-center gap-1 text-zg-accent">
          <Pencil className="h-3 w-3" aria-hidden />
          <span className="sr-only">,</span>
          édition en cours
        </span>
      ) : null}
    </p>
  );
}
