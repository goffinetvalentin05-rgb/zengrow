import { handleWalletRegister, handleWalletUnregister } from "@/src/lib/gift-vouchers/wallet/web-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    deviceLibraryIdentifier: string;
    passTypeIdentifier: string;
    serialNumber: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const params = await context.params;
  const body = await request.json().catch(() => null);
  return handleWalletRegister({
    deviceLibraryIdentifier: params.deviceLibraryIdentifier,
    passTypeIdentifier: params.passTypeIdentifier,
    serialNumber: params.serialNumber,
    authorization: request.headers.get("authorization"),
    body,
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const params = await context.params;
  return handleWalletUnregister({
    deviceLibraryIdentifier: params.deviceLibraryIdentifier,
    passTypeIdentifier: params.passTypeIdentifier,
    serialNumber: params.serialNumber,
    authorization: request.headers.get("authorization"),
  });
}
