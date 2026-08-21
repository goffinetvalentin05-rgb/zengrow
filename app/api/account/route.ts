import { handleDeleteAccount } from "@/src/lib/fitme/handlers";

export async function DELETE() {
  return handleDeleteAccount();
}
