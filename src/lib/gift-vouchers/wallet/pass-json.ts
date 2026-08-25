import { centsToChf } from "@/src/lib/gift-vouchers/money";
import { normalizeHexColor } from "@/src/lib/public-page/colors";
import type { GiftVoucherPresentation } from "@/src/lib/gift-vouchers/branding";
import { giftVoucherPublicUrl } from "@/src/lib/gift-vouchers/public-token";
import { shouldVoidAppleWalletPass } from "@/src/lib/gift-vouchers/wallet/eligibility";

export type AppleWalletPassField = {
  key: string;
  label: string;
  value: string | number;
  currencyCode?: string;
  changeMessage?: string;
  dateStyle?: "PKDateStyleShort" | "PKDateStyleMedium" | "PKDateStyleLong" | "PKDateStyleFull";
  timeStyle?: "PKDateStyleNone";
};

export type AppleWalletPassModel = {
  serialNumber: string;
  description: string;
  organizationName: string;
  logoText: string;
  backgroundColor: string;
  foregroundColor: string;
  labelColor: string;
  voided: boolean;
  expirationDate: string | null;
  webServiceURL: string | null;
  authenticationToken: string | null;
  barcodeMessage: string;
  barcodeAltText: string;
  headerFields: AppleWalletPassField[];
  primaryFields: AppleWalletPassField[];
  secondaryFields: AppleWalletPassField[];
  auxiliaryFields: AppleWalletPassField[];
  backFields: AppleWalletPassField[];
};

export function hexToPassRgb(hex: string): string {
  const normalized = normalizeHexColor(hex);
  const value = normalized.slice(1);
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function truncate(value: string, max: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function amountNumber(cents: number): number {
  return Math.round(cents) / 100;
}

export function giftVoucherPassFilename(code: string): string {
  const safe = code.replace(/[^A-Za-z0-9-]/g, "") || "bon";
  return `bon-cadeau-${safe}.pkpass`;
}

export function giftVoucherPdfFilename(code: string): string {
  const safe = code.replace(/[^A-Za-z0-9-]/g, "") || "bon";
  return `bon-cadeau-${safe}.pdf`;
}

export function buildAppleWalletPassModel(params: {
  presentation: GiftVoucherPresentation;
  origin: string;
  authenticationToken?: string | null;
  webServiceURL?: string | null;
  now?: Date;
}): AppleWalletPassModel {
  const { presentation, origin } = params;
  const now = params.now ?? new Date();
  const voided = shouldVoidAppleWalletPass(presentation, now);
  const publicUrl = giftVoucherPublicUrl(presentation.publicToken, origin);
  const remaining = amountNumber(presentation.remainingAmountCents);
  const initial = amountNumber(presentation.initialAmountCents);

  const secondaryFields: AppleWalletPassField[] = [
    {
      key: "initial",
      label: "Valeur",
      value: initial,
      currencyCode: presentation.currency || "CHF",
    },
  ];
  if (presentation.recipientName) {
    secondaryFields.push({
      key: "recipient",
      label: "Pour",
      value: truncate(presentation.recipientName, 80),
    });
  }

  const auxiliaryFields: AppleWalletPassField[] = [];
  if (presentation.expiresAt) {
    auxiliaryFields.push({
      key: "expires",
      label: "Expire le",
      value: presentation.expiresAt,
      dateStyle: "PKDateStyleMedium",
      timeStyle: "PKDateStyleNone",
    });
  }

  const backFields: AppleWalletPassField[] = [
    { key: "offer", label: "Offre", value: truncate(presentation.offerTitle, 120) },
    { key: "code", label: "Code du bon", value: presentation.code },
    { key: "balanceInfo", label: "Solde", value: `${centsToChf(presentation.remainingAmountCents).toLocaleString("fr-CH")} ${presentation.currency}` },
  ];
  if (presentation.terms) {
    backFields.push({ key: "terms", label: "Conditions", value: truncate(presentation.terms, 2000) });
  }
  if (presentation.footer) {
    backFields.push({ key: "contact", label: "Contact", value: truncate(presentation.footer, 400) });
  }
  backFields.push({
    key: "page",
    label: "Page du bon",
    value: publicUrl,
  });

  return {
    serialNumber: presentation.voucherId,
    description: truncate(presentation.offerTitle, 80) || "Bon cadeau",
    organizationName: truncate(presentation.restaurantName, 80),
    logoText: truncate(presentation.restaurantName, 30),
    backgroundColor: hexToPassRgb(presentation.accentColor),
    foregroundColor: hexToPassRgb(presentation.foregroundColor),
    labelColor: hexToPassRgb(presentation.foregroundColor),
    voided,
    expirationDate: presentation.expiresAt,
    webServiceURL: params.webServiceURL?.trim() || null,
    authenticationToken: params.authenticationToken?.trim() || null,
    barcodeMessage: publicUrl,
    barcodeAltText: presentation.code,
    headerFields: [
      {
        key: "codeHeader",
        label: "Code",
        value: presentation.code,
      },
    ],
    primaryFields: [
      {
        key: "balance",
        label: "Solde",
        value: remaining,
        currencyCode: presentation.currency || "CHF",
        changeMessage: "Nouveau solde : %@",
      },
    ],
    secondaryFields,
    auxiliaryFields,
    backFields,
  };
}
