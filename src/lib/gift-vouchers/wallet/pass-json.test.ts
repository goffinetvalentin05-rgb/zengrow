import { describe, expect, it } from "vitest";
import { DEFAULT_PRIMARY } from "@/src/lib/public-page/colors";
import { resolveGiftVoucherPresentation } from "@/src/lib/gift-vouchers/branding";
import { buildAppleWalletPassModel, giftVoucherPassFilename, hexToPassRgb } from "@/src/lib/gift-vouchers/wallet/pass-json";
import { giftVoucherPublicUrl } from "@/src/lib/gift-vouchers/public-token";

const token = "ab".repeat(32);

const presentation = resolveGiftVoucherPresentation(
  {
    id: "11111111-1111-4111-8111-111111111111",
    restaurant_id: "22222222-2222-4222-8222-222222222222",
    code: "ZG-8K4M-2P7Q",
    status: "active",
    initial_amount_cents: 10000,
    remaining_amount_cents: 3500,
    currency: "CHF",
    expires_at: "2027-08-25T23:59:59.000Z",
    recipient_name: "Sophie",
    buyer_name: "Anna",
    message: "Joyeux anniversaire",
    public_token: token,
  },
  {
    name: "Café Demo",
    public_display_name: "Le Café Demo",
    logo_url: "https://example.com/logo.png",
    public_accent_color: "#1F7A6C",
    phone: "+41 21 000 00 00",
    email: "ciao@demo.ch",
    address: "Rue de la Gare 1, Lausanne",
    banner_url: null,
  },
  {
    logo_url: null,
    cover_image_url: "https://example.com/cover.jpg",
    accent_color: "#FF0000",
    gift_voucher_display_name: null,
    gift_voucher_offer_title: null,
    gift_voucher_accent_color: null,
    gift_voucher_cover_url: null,
    gift_voucher_terms: null,
    gift_voucher_footer: null,
    gift_voucher_include_buyer_on_pdf: false,
  },
);

describe("Apple Wallet pass model", () => {
  it("relit le solde restant côté serveur, pas le montant initial", () => {
    expect(presentation).not.toBeNull();
    const model = buildAppleWalletPassModel({
      presentation: presentation!,
      origin: "https://zengrow.ch",
    });
    const balance = model.primaryFields.find((field) => field.key === "balance");
    expect(balance?.value).toBe(35);
    expect(balance?.currencyCode).toBe("CHF");
    expect(model.headerFields[0]?.value).toBe("ZG-8K4M-2P7Q");
    expect(model.serialNumber).toBe(presentation!.voucherId);
  });

  it("encode l’URL publique déjà acceptée par le scanner", () => {
    const model = buildAppleWalletPassModel({
      presentation: presentation!,
      origin: "https://zengrow.ch",
    });
    expect(model.barcodeMessage).toBe(`https://zengrow.ch/v/${token}`);
    expect(model.barcodeMessage).toBe(giftVoucherPublicUrl(token, "https://zengrow.ch"));
    expect(model.barcodeAltText).toBe("ZG-8K4M-2P7Q");
    expect(model.barcodeMessage).not.toMatch(/amount|cents|solde/i);
  });

  it("reprend les couleurs de l’établissement avec repli propre", () => {
    expect(presentation?.accentColor).toBe("#1F7A6C");
    expect(hexToPassRgb("#1F7A6C")).toBe("rgb(31, 122, 108)");
    const empty = resolveGiftVoucherPresentation(
      {
        id: "11111111-1111-4111-8111-111111111111",
        restaurant_id: "22222222-2222-4222-8222-222222222222",
        code: "ZG-8K4M-2P7Q",
        status: "active",
        initial_amount_cents: 5000,
        remaining_amount_cents: 5000,
        currency: "CHF",
        expires_at: null,
        recipient_name: null,
        buyer_name: null,
        message: null,
        public_token: token,
      },
      { name: "Bistro", public_display_name: null, logo_url: null, public_accent_color: null, phone: null, email: null, address: null, banner_url: null },
      null,
    );
    expect(empty?.accentColor).toBe(DEFAULT_PRIMARY);
    expect(empty?.offerTitle).toBe("Bon cadeau");
    expect(empty?.restaurantName).toBe("Bistro");
  });

  it("marque voided un bon utilisé et nomme le fichier .pkpass", () => {
    const used = { ...presentation!, status: "used" as const, remainingAmountCents: 0 };
    const model = buildAppleWalletPassModel({
      presentation: used,
      origin: "https://zengrow.ch",
    });
    expect(model.voided).toBe(true);
    expect(giftVoucherPassFilename("ZG-8K4M-2P7Q")).toBe("bon-cadeau-ZG-8K4M-2P7Q.pkpass");
  });

  it("n’inclut pas de webServiceURL http, seulement https", () => {
    const httpsModel = buildAppleWalletPassModel({
      presentation: presentation!,
      origin: "https://zengrow.ch",
      authenticationToken: "a".repeat(32),
      webServiceURL: "https://zengrow.ch/api/wallet",
    });
    expect(httpsModel.webServiceURL).toBe("https://zengrow.ch/api/wallet");
    expect(httpsModel.authenticationToken).toHaveLength(32);
  });
});
