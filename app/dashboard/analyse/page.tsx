import { redirect } from "next/navigation";

export default function AnalyseRedirect() {
  redirect("/dashboard/intelligence?tab=analyse");
}
