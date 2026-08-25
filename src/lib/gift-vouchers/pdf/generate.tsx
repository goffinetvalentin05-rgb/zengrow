import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Font, renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { fetchImageBuffer } from "@/src/lib/gift-vouchers/assets";
import type { GiftVoucherPresentation } from "@/src/lib/gift-vouchers/branding";
import { cropPdfCoverImage } from "@/src/lib/gift-vouchers/pdf/cover";
import { GiftVoucherPdfDocument } from "@/src/lib/gift-vouchers/pdf/document";
import { giftVoucherPublicUrl } from "@/src/lib/gift-vouchers/public-token";
import { GiftVoucherServiceError } from "@/src/lib/gift-vouchers/service";

let registeredFamily: string | null = null;

function fontCandidates(fileName: string): string[] {
  return [
    join(process.cwd(), "public", "fonts", "gift-voucher", fileName),
    join(process.cwd(), "src", "lib", "gift-vouchers", "pdf", "fonts", fileName),
  ];
}

function readFont(fileName: string): Buffer | null {
  for (const path of fontCandidates(fileName)) {
    if (!existsSync(path)) continue;
    try {
      return readFileSync(path);
    } catch {
      /* try next */
    }
  }
  return null;
}

function fontSrc(buffer: Buffer): string {
  return `data:font/ttf;base64,${buffer.toString("base64")}`;
}

function registerPdfFonts(): string {
  if (registeredFamily) return registeredFamily;
  try {
    const regular = readFont("Inter-latin-400.ttf");
    const semibold = readFont("Inter-latin-600.ttf");
    const bold = readFont("Inter-latin-700.ttf");
    if (regular && semibold && bold) {
      Font.register({
        family: "GiftVoucherSans",
        fonts: [
          { src: fontSrc(regular), fontWeight: 400 },
          { src: fontSrc(semibold), fontWeight: 600 },
          { src: fontSrc(bold), fontWeight: 700 },
        ],
      });
      registeredFamily = "GiftVoucherSans";
      return registeredFamily;
    }
  } catch (error) {
    console.error("[gift-vouchers/pdf] polices Inter", error);
  }
  registeredFamily = "Helvetica";
  return registeredFamily;
}

function imageDataUrl(buffer: Buffer): string | null {
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return `data:image/png;base64,${buffer.toString("base64")}`;
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  }
  return null;
}

async function fetchPdfImageDataUrl(url: string | null): Promise<string | null> {
  const buffer = await fetchImageBuffer(url);
  if (!buffer) return null;
  return imageDataUrl(buffer);
}

async function fetchPdfCoverDataUrl(url: string | null): Promise<string | null> {
  const buffer = await fetchImageBuffer(url);
  if (!buffer) return null;
  const cropped = await cropPdfCoverImage(buffer);
  if (cropped) return imageDataUrl(cropped);
  return imageDataUrl(buffer);
}

export async function generateGiftVoucherPdf(params: {
  presentation: GiftVoucherPresentation;
  origin: string;
}): Promise<Buffer> {
  try {
    const fontFamily = registerPdfFonts();
    const publicUrl = giftVoucherPublicUrl(params.presentation.publicToken, params.origin);
    const [logoDataUrl, coverDataUrl, qrDataUrl] = await Promise.all([
      fetchPdfImageDataUrl(params.presentation.restaurantLogoUrl),
      fetchPdfCoverDataUrl(params.presentation.coverImageUrl),
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
        logoDataUrl={logoDataUrl}
        coverDataUrl={coverDataUrl}
        qrDataUrl={qrDataUrl}
        fontFamily={fontFamily}
      />,
    );
    return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  } catch (error) {
    console.error("[gift-vouchers/pdf] generate", error);
    throw new GiftVoucherServiceError("Impossible de générer le PDF de ce bon.", 500);
  }
}
