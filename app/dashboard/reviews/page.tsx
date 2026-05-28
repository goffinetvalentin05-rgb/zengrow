import { redirect } from "next/navigation";

export default function DashboardReviewsRedirectPage() {
  redirect("/dashboard/reputation?tab=review-requests");
}
