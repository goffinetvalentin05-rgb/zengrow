import { redirect } from "next/navigation";

export default function AnalyseRedirect() {
  redirect("/dashboard/analytics?tab=saas");
}
