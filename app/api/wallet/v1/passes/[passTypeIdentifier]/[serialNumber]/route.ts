import { handleWalletGetLatestPass } from "@/src/lib/gift-vouchers/wallet/web-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type RouteContext = {
  params: Promise<{
    passTypeIdentifier: string;
    serialNumber: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const params = await context.params;
  return handleWalletGetLatestPass({
    passTypeIdentifier: params.passTypeIdentifier,
    serialNumber: params.serialNumber,
    authorization: request.headers.get("authorization"),
    ifModifiedSince: request.headers.get("if-modified-since"),
  });
}
