import { redirect } from "next/navigation";

export default function ContentRedirect() {
  redirect("/dashboard/intelligence?tab=content");
}
