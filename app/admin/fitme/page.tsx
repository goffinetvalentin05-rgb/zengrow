import { redirect } from "next/navigation";
import { AdminStyleClient } from "@/components/fitme-app/AdminStyleClient";
import { isOwnerEmail } from "@/src/lib/access";
import { requireFitmeUser } from "@/src/lib/fitme/auth";

export default async function AdminFitmePage() {
  const user = await requireFitmeUser();
  if (!isOwnerEmail(user.email)) redirect("/account");
  return <AdminStyleClient />;
}
