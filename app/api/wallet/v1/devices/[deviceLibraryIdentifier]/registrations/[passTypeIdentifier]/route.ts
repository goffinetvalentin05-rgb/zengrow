import { handleWalletUpdatedSerials } from "@/src/lib/gift-vouchers/wallet/web-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    deviceLibraryIdentifier: string;
    passTypeIdentifier: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const params = await context.params;
  const url = new URL(request.url);
  return handleWalletUpdatedSerials({
    deviceLibraryIdentifier: params.deviceLibraryIdentifier,
    passTypeIdentifier: params.passTypeIdentifier,
    passesUpdatedSince: url.searchParams.get("passesUpdatedSince"),
  });
}
