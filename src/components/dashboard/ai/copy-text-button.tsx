"use client";

import { CheckCircle2, Copy } from "lucide-react";
import Button from "@/src/components/ui/button";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { useState } from "react";

type CopyTextButtonProps = {
  text: string;
  label?: string;
  className?: string;
};

export default function CopyTextButton({ text, label = "Copier", className }: CopyTextButtonProps) {
  const showToast = useDashboardToast();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast({ message: "Copié dans le presse-papiers.", icon: CheckCircle2 });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({ message: "Impossible de copier.", icon: Copy });
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className={className}
      onClick={() => void handleCopy()}
    >
      {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {label}
    </Button>
  );
}
