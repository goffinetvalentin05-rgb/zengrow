import { PKPass } from "passkit-generator";
import type { GiftVoucherPresentation } from "@/src/lib/gift-vouchers/branding";
import {
  appleWalletWebServiceUrl,
  getAppleWalletSigningConfig,
  isAppleWalletSigningConfigured,
} from "@/src/lib/gift-vouchers/wallet/config";
import { buildAppleWalletPassImages } from "@/src/lib/gift-vouchers/wallet/images";
import { buildAppleWalletPassModel } from "@/src/lib/gift-vouchers/wallet/pass-json";

export class AppleWalletNotConfiguredError extends Error {
  constructor() {
    super("Apple Wallet n’est pas encore configuré.");
    this.name = "AppleWalletNotConfiguredError";
  }
}

export async function generateGiftVoucherPkpass(params: {
  presentation: GiftVoucherPresentation;
  origin: string;
  authenticationToken?: string | null;
}): Promise<Buffer> {
  const signing = getAppleWalletSigningConfig();
  if (!signing) throw new AppleWalletNotConfiguredError();

  const webServiceURL =
    params.authenticationToken && appleWalletWebServiceUrl(params.origin)
      ? appleWalletWebServiceUrl(params.origin)
      : null;

  const model = buildAppleWalletPassModel({
    presentation: params.presentation,
    origin: params.origin,
    authenticationToken: params.authenticationToken,
    webServiceURL,
  });

  const images = await buildAppleWalletPassImages({
    logoUrl: params.presentation.restaurantLogoUrl,
    coverUrl: params.presentation.coverImageUrl,
    accentColor: params.presentation.accentColor,
    restaurantName: params.presentation.restaurantName,
  });

  const pass = new PKPass(
    images,
    {
      wwdr: signing.wwdr,
      signerCert: signing.signerCert,
      signerKey: signing.signerKey,
      signerKeyPassphrase: signing.signerKeyPassphrase || undefined,
    },
    {
      serialNumber: model.serialNumber,
      description: model.description,
      organizationName: model.organizationName,
      logoText: model.logoText,
      backgroundColor: model.backgroundColor,
      foregroundColor: model.foregroundColor,
      labelColor: model.labelColor,
      passTypeIdentifier: signing.passTypeIdentifier,
      teamIdentifier: signing.teamIdentifier,
      voided: model.voided || undefined,
      ...(webServiceURL && params.authenticationToken
        ? {
            webServiceURL,
            authenticationToken: params.authenticationToken,
          }
        : {}),
    },
  );

  pass.type = "storeCard";
  for (const field of model.headerFields) pass.headerFields.push(field as never);
  for (const field of model.primaryFields) pass.primaryFields.push(field as never);
  for (const field of model.secondaryFields) pass.secondaryFields.push(field as never);
  for (const field of model.auxiliaryFields) pass.auxiliaryFields.push(field as never);
  for (const field of model.backFields) pass.backFields.push(field as never);
  pass.setBarcodes({
    format: "PKBarcodeFormatQR",
    message: model.barcodeMessage,
    messageEncoding: "iso-8859-1",
    altText: model.barcodeAltText,
  });
  if (model.expirationDate) {
    const expires = new Date(model.expirationDate);
    if (!Number.isNaN(expires.getTime())) pass.setExpirationDate(expires);
  }

  return pass.getAsBuffer();
}

export { isAppleWalletSigningConfigured };
