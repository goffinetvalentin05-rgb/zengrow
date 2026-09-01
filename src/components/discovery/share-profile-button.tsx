"use client";

import { useState } from "react";
import { Share } from "lucide-react";
import Button from "@/src/components/ui/button";
import { getProfileShareText, getWorkingProfileUrl } from "@/src/lib/discovery/public-link";
import { cn } from "@/src/lib/utils";

function isLikelyMobile() {
  if (typeof navigator === "undefined") return false;
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
}

export function ShareProfileButton({
  username,
  className,
  variant = "secondary",
  size = "md",
}: {
  username: string;
  className?: string;
  variant?: "secondary" | "ghost";
  size?: "sm" | "md";
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = getWorkingProfileUrl(username);
    const text = getProfileShareText(username);
    if (typeof navigator.share === "function" && isLikelyMobile()) {
      try {
        await navigator.share({ title: "Sharpz", text, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Button type="button" variant={variant} size={size} className={cn("rounded-full", className)} onClick={() => void share()}>
      {copied ? "Copied" : "Share profile"}
      <Share className="h-3.5 w-3.5" />
    </Button>
  );
}
