"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Copy, ExternalLink } from "lucide-react";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import {
  classifyPublicSlug,
  getBrandedProfilePreview,
  getWorkingProfileUrl,
  publicSlugStatusMessage,
  type PublicSlugStatus,
} from "@/src/lib/discovery/public-link";
import {
  getWorkingTrackedProfileUrl,
  TRACKED_BIO_PLATFORMS,
  TRAFFIC_SOURCE_LABELS,
  type TrackedBioPlatform,
} from "@/src/lib/discovery/attribution";
import { profileHref } from "@/src/lib/discovery/routes";
import { normalizePublicSlug } from "@/src/lib/discovery/slug";
import { cn } from "@/src/lib/utils";

export function SharpzLinkEditor({
  username,
  compact = false,
}: {
  username: string | null;
  compact?: boolean;
}) {
  const router = useRouter();
  const initial = username ?? "";
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState<PublicSlugStatus>(initial ? "current" : "invalid");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedFor, setCopiedFor] = useState<TrackedBioPlatform | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setValue(username ?? "");
    setStatus(username ? "current" : "invalid");
  }, [username]);

  const slug = normalizePublicSlug(value);
  const preview = slug ? getBrandedProfilePreview(slug) : getBrandedProfilePreview("yourname");
  const dirty = slug !== (username ?? "");

  const statusTone = useMemo(() => {
    if (status === "available" || status === "current") return "ok";
    if (status === "taken" || status === "reserved" || status === "invalid") return "err";
    return "idle";
  }, [status]);

  useEffect(() => {
    const format = classifyPublicSlug(value);
    if (format !== "ok") {
      setStatus(format);
      return;
    }
    if (slug === (username ?? "")) {
      setStatus("current");
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const response = await fetch(`/api/discovery/username?value=${encodeURIComponent(slug)}`, {
        signal: controller.signal,
      }).catch(() => null);
      if (!response) return;
      const payload = (await response.json().catch(() => ({}))) as { status?: PublicSlugStatus };
      if (payload.status) setStatus(payload.status);
    }, 280);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [slug, username, value]);

  async function copyLink() {
    if (!username) return;
    await navigator.clipboard.writeText(getWorkingProfileUrl(username));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function copyTracked(platform: TrackedBioPlatform) {
    if (!username) return;
    await navigator.clipboard.writeText(getWorkingTrackedProfileUrl(username, platform));
    setCopiedFor(platform);
    window.setTimeout(() => setCopiedFor((current) => (current === platform ? null : current)), 1600);
  }

  async function save() {
    if (!dirty || (status !== "available" && status !== "current")) return;
    setSaving(true);
    setSaveMessage(null);
    const response = await fetch("/api/discovery/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: slug }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!response.ok) {
      setSaveMessage(payload.error ?? "Could not save.");
      if (payload.error?.toLowerCase().includes("taken")) setStatus("taken");
      if (payload.error?.toLowerCase().includes("reserved")) setStatus("reserved");
      return;
    }
    setStatus("current");
    setSaveMessage("Saved.");
    router.refresh();
  }

  return (
    <section id="link" className={cn(compact ? "" : "rounded-[1.6rem] border border-white/[0.07] bg-white/[0.02] p-5")}>
      {!compact ? (
        <p className="sz-label">Your Sharpz link</p>
      ) : (
        <p className="sz-label">Your Sharpz link</p>
      )}

      <p className="sz-title mt-3">{preview}</p>

      <div className="mt-5 flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Input
            value={value}
            onChange={(event) => {
              setValue(event.target.value.toLowerCase().replace(/^\/+/, ""));
              setSaveMessage(null);
            }}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="valentin"
            className="pr-10"
            aria-label="Sharpz link"
          />
          {statusTone === "ok" ? (
            <Check className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
          ) : null}
        </div>
        <Button type="button" className="sz-press" onClick={() => void save()} disabled={!dirty || status !== "available" || saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>

      <p
        className={cn(
          "mt-2 text-sm",
          statusTone === "ok" && "text-emerald-400/90",
          statusTone === "err" && "text-white/45",
        )}
      >
        {publicSlugStatusMessage(status)}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => void copyLink()} disabled={!username}>
          {copied ? "Copied" : "Copy link"}
          <Copy className="h-3.5 w-3.5" />
        </Button>
        {username ? (
          <Link href={profileHref(username)} target="_blank" className="inline-flex">
            <Button type="button" variant="ghost" size="sm">
              Open profile
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        ) : null}
      </div>

      <p className="mt-4 text-sm text-white/40">
        Use this link in your Instagram, TikTok, YouTube or X bio.
      </p>

      {username ? (
        <div className="mt-6 border-t border-white/[0.06] pt-5">
          <p className="sz-label">Track your traffic</p>
          <p className="mt-2 text-sm text-white/40">
            Copy a tracked link for each platform. Analytics will credit the visit to that source.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {TRACKED_BIO_PLATFORMS.map((platform) => (
              <Button
                key={platform}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => void copyTracked(platform)}
              >
                {copiedFor === platform ? "Copied" : `Copy for ${TRAFFIC_SOURCE_LABELS[platform]}`}
                <Copy className="h-3.5 w-3.5" />
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      {saveMessage ? <p className="mt-2 text-sm text-white/50">{saveMessage}</p> : null}
    </section>
  );
}
