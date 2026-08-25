import { NextResponse } from "next/server";
import { giftVoucherErrorResponse, getGiftVoucherRequestContext } from "@/src/lib/gift-vouchers/http";
import { lookupGiftVoucherFromScan } from "@/src/lib/gift-vouchers/service";

async function lookupFromRaw(raw: string) {
  const ctx = await getGiftVoucherRequestContext();
  if (!ctx.ok) return ctx.response;

  try {
    const result = await lookupGiftVoucherFromScan(ctx.supabase, ctx.restaurantId, raw);
    return NextResponse.json(result);
  } catch (error) {
    return giftVoucherErrorResponse(error);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("raw") ?? url.searchParams.get("token") ?? "";
  return lookupFromRaw(raw);
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const raw =
    payload && typeof payload === "object"
      ? String((payload as { raw?: unknown; token?: unknown }).raw ?? (payload as { token?: unknown }).token ?? "")
      : "";
  return lookupFromRaw(raw);
}
