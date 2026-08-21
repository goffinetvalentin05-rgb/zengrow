import { handleAdminList } from "@/src/lib/fitme/handlers";

export async function GET() {
  return handleAdminList();
}
