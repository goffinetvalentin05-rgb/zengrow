import { redirect } from "next/navigation";

export default function LegacyForgotRedirect() {
  redirect("/forgot-password");
}
