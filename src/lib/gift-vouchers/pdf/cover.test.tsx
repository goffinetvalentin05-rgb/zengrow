import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { renderToBuffer } from "@react-pdf/renderer";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { DEFAULT_GIFT_VOUCHER_TERMS } from "@/src/lib/gift-vouchers/branding";
import type { GiftVoucherPresentation } from "@/src/lib/gift-vouchers/branding";
import {
  cropPdfCoverImage,
  PDF_COVER_PX_HEIGHT,
  PDF_COVER_PX_WIDTH,
  PDF_COVER_RATIO,
  pdfCoverDimensions,
} from "@/src/lib/gift-vouchers/pdf/cover";
import { GiftVoucherPdfDocument } from "@/src/lib/gift-vouchers/pdf/document";
import { generateGiftVoucherPdf } from "@/src/lib/gift-vouchers/pdf/generate";

const OUT_DIR = join(process.cwd(), ".tmp-pdf-inspect");

const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";

async function solid(width: number, height: number, color: { r: number; g: number; b: number }): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background: color } })
    .jpeg({ quality: 90 })
    .toBuffer();
}

async function stripedVertical(): Promise<Buffer> {
  const top = await sharp({ create: { width: 800, height: 500, channels: 3, background: { r: 220, g: 40, b: 40 } } })
    .png()
    .toBuffer();
  const mid = await sharp({ create: { width: 800, height: 500, channels: 3, background: { r: 40, g: 180, b: 80 } } })
    .png()
    .toBuffer();
  const bot = await sharp({ create: { width: 800, height: 500, channels: 3, background: { r: 40, g: 80, b: 220 } } })
    .png()
    .toBuffer();
  return sharp({ create: { width: 800, height: 1500, channels: 3, background: { r: 0, g: 0, b: 0 } } })
    .composite([
      { input: top, top: 0, left: 0 },
      { input: mid, top: 500, left: 0 },
      { input: bot, top: 1000, left: 0 },
    ])
    .jpeg({ quality: 92 })
    .toBuffer();
}

function basePresentation(overrides: Partial<GiftVoucherPresentation> = {}): GiftVoucherPresentation {
  return {
    voucherId: "33333333-3333-4333-8333-333333333333",
    restaurantId: "44444444-4444-4444-8444-444444444444",
    code: "ZG-TEST-COV1",
    status: "active",
    initialAmountCents: 8000,
    remainingAmountCents: 8000,
    currency: "CHF",
    expiresAt: "2027-12-31T23:59:59.000Z",
    recipientName: "Lea",
    buyerName: "Marc",
    message: "Bon test",
    publicToken: "cd".repeat(32),
    offerTitle: "Bon cadeau",
    offerKind: "monetary",
    offerDescription: null,
    experienceLabel: null,
    partySize: null,
    restaurantName: "Auberge du Lac",
    restaurantLogoUrl: null,
    coverImageUrl: null,
    accentColor: "#1E4ED8",
    foregroundColor: "#ffffff",
    phone: null,
    email: null,
    address: null,
    terms: DEFAULT_GIFT_VOUCHER_TERMS,
    footer: "Lausanne",
    includeBuyerOnPdf: true,
    ...overrides,
  };
}

describe("recadrage couverture PDF", () => {
  it("produit toujours le ratio bannière, sans étirement, pour tous les formats", async () => {
    mkdirSync(OUT_DIR, { recursive: true });
    const cases = [
      { name: "horizontal", buffer: await solid(1600, 900, { r: 20, g: 80, b: 180 }) },
      { name: "carre", buffer: await solid(900, 900, { r: 40, g: 140, b: 90 }) },
      { name: "vertical", buffer: await stripedVertical() },
      { name: "tres-grande", buffer: await solid(4000, 1800, { r: 90, g: 40, b: 160 }) },
    ];

    for (const sample of cases) {
      const cropped = await cropPdfCoverImage(sample.buffer);
      expect(cropped).not.toBeNull();
      const dims = await pdfCoverDimensions(cropped!);
      expect(dims).toEqual({ width: PDF_COVER_PX_WIDTH, height: PDF_COVER_PX_HEIGHT });
      expect(PDF_COVER_PX_WIDTH / PDF_COVER_PX_HEIGHT).toBeCloseTo(PDF_COVER_RATIO, 5);
      const preview = await sharp(cropped!).png().toBuffer();
      writeFileSync(join(OUT_DIR, `${sample.name}.png`), preview);

      const pdf = await renderToBuffer(
        <GiftVoucherPdfDocument
          presentation={basePresentation({ offerTitle: `Offre ${sample.name}` })}
          publicUrl="https://zengrow.ch/v/test"
          logoDataUrl={null}
          coverDataUrl={`data:image/jpeg;base64,${cropped!.toString("base64")}`}
          qrDataUrl={TINY_PNG}
          fontFamily="Helvetica"
        />,
      );
      const pdfBuffer = Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf);
      expect(pdfBuffer.subarray(0, 4).toString("utf8")).toBe("%PDF");
      writeFileSync(join(OUT_DIR, `${sample.name}.pdf`), pdfBuffer);
    }
  }, 40_000);

  it("génère un PDF sans image avec fallback couleur, sans gros montant pour une expérience", async () => {
    mkdirSync(OUT_DIR, { recursive: true });
    const none = await generateGiftVoucherPdf({
      presentation: basePresentation({ coverImageUrl: null, offerTitle: "Sans image" }),
      origin: "https://zengrow.ch",
    });
    expect(none.subarray(0, 4).toString("utf8")).toBe("%PDF");
    writeFileSync(join(OUT_DIR, "none.pdf"), none);

    const experience = await generateGiftVoucherPdf({
      presentation: basePresentation({
        offerKind: "experience",
        offerTitle: "Visite de la cave et aperitif",
        experienceLabel: "Visite de la cave et aperitif",
        offerDescription: "Degustation pour deux personnes",
        partySize: 2,
        coverImageUrl: null,
      }),
      origin: "https://zengrow.ch",
    });
    const asText = experience.toString("latin1");
    expect(asText).toContain("Visite de la cave");
    expect(asText).not.toMatch(/80\.00 CHF/);
    writeFileSync(join(OUT_DIR, "experience.pdf"), experience);
  }, 30_000);
});
