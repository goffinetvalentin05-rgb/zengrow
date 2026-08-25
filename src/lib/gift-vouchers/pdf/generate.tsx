import { existsSync } from "node:fs";
import { join } from "node:path";
import { Font, renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { bufferToPngDataUrl } from "@/src/lib/gift-vouchers/assets";
import type { GiftVoucherPresentation } from "@/src/lib/gift-vouchers/branding";
import { giftVoucherPublicUrl } from "@/src/lib/gift-vouchers/public-token";
import { preparePdfImage } from "@/src/lib/gift-vouchers/wallet/images";
import { GiftVoucherPdfDocument } from "@/src/lib/gift-vouchers/pdf/document";

let fontsRegistered = false;

function registerPdfFonts() {
  if (fontsRegistered) return;
  const dir = join(process.cwd(), "public", "fonts", "gift-voucher");
  const regular = join(dir, "Inter-latin-400.ttf");
  const semibold = join(dir, "Inter-latin-600.ttf");
  const bold = join(dir, "Inter-latin-700.ttf");
  if (!existsSync(regular) || !existsSync(semibold) || !existsSync(bold)) {
    throw new Error("Polices PDF introuvables.");
  }
  Font.register({
    family: "GiftVoucherSans",
    fonts: [
      { src: regular, fontWeight: 400 },
      { src: semibold, fontWeight: 600 },
      { src: bold, fontWeight: 700 },
    ],
  });
  fontsRegistered = true;
}

export async function generateGiftVoucherPdf(params: {
  presentation: GiftVoucherPresentation;
  origin: string;
}): Promise<Buffer> {
  registerPdfFonts();
  const publicUrl = giftVoucherPublicUrl(params.presentation.publicToken, params.origin);
  const [logo, cover, qrDataUrl] = await Promise.all([
    preparePdfImage(params.presentation.restaurantLogoUrl, 720, 720),
    preparePdfImage(params.presentation.coverImageUrl, 1600, 900),
    QRCode.toDataURL(publicUrl, {
      margin: 1,
      width: 512,
      errorCorrectionLevel: "H",
      color: { dark: "#0f172a", light: "#ffffff" },
    }),
  ]);

  const buffer = await renderToBuffer(
    <GiftVoucherPdfDocument
      presentation={params.presentation}
      publicUrl={publicUrl}
      logoDataUrl={logo ? bufferToPngDataUrl(logo) : null}
      coverDataUrl={cover ? bufferToPngDataUrl(cover) : null}
      qrDataUrl={qrDataUrl}
    />,
  );
  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
}
