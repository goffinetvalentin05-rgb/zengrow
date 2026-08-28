import { redirect } from "next/navigation";
import { analyticsHref, parseAnalyticsTab } from "@/src/lib/sharpz/routes";

export default async function IntelligenceRedirect({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const tab = parseAnalyticsTab((await searchParams).tab);
  redirect(analyticsHref(tab));
}
