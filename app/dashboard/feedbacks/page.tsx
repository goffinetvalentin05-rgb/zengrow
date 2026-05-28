import { redirect } from "next/navigation";

type DashboardFeedbacksRedirectProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardFeedbacksRedirectPage({
  searchParams,
}: DashboardFeedbacksRedirectProps) {
  const params = searchParams ? await searchParams : {};
  const query = new URLSearchParams({ tab: "private-feedback" });
  const feedback = params.feedback;
  if (typeof feedback === "string" && feedback.trim()) {
    query.set("feedback", feedback.trim());
  }
  redirect(`/dashboard/reputation?${query.toString()}`);
}
