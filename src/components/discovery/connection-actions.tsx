"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@/src/components/discovery/connect-button";
import { ContactButton } from "@/src/components/discovery/contact-button";
import type { ConnectionUiStatus, SocialLink } from "@/src/lib/discovery/types";
import { cn } from "@/src/lib/utils";

export function ConnectionActions({
  profileId,
  initialStatus = "none",
  socialLinks,
  email,
  isLoggedIn = true,
  silent = false,
  size = "sm",
  className,
  connectClassName,
  contactClassName,
}: {
  profileId: string;
  initialStatus?: ConnectionUiStatus;
  socialLinks: SocialLink[];
  email?: string | null;
  isLoggedIn?: boolean;
  silent?: boolean;
  size?: "sm" | "md";
  className?: string;
  connectClassName?: string;
  contactClassName?: string;
}) {
  const [status, setStatus] = useState<ConnectionUiStatus>(initialStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <ConnectButton
        profileId={profileId}
        initialStatus={initialStatus}
        isLoggedIn={isLoggedIn}
        silent={silent}
        size={size}
        className={connectClassName}
        onStatusChange={setStatus}
      />
      {status === "accepted" ? (
        <ContactButton
          profileId={profileId}
          socialLinks={socialLinks}
          email={email}
          size={size}
          className={contactClassName}
        />
      ) : null}
    </div>
  );
}
