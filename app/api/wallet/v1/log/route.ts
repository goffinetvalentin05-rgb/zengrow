import { handleWalletLog } from "@/src/lib/gift-vouchers/wallet/web-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  return handleWalletLog(body);
}
