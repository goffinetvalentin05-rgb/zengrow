"use client";

import { useContext } from "react";
import { MarketingContext } from "@/src/components/dashboard/marketing/context/marketing-context";

export function useMarketing() {
  const ctx = useContext(MarketingContext);
  if (!ctx) {
    throw new Error("useMarketing must be used within MarketingProvider");
  }
  return ctx;
}
