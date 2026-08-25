import sharp from "sharp";
import { fetchImageBuffer } from "@/src/lib/gift-vouchers/assets";
import { normalizeHexColor } from "@/src/lib/public-page/colors";

export type AppleWalletPassImages = Record<string, Buffer>;

function parseRgb(hex: string): { r: number; g: number; b: number } {
  const value = normalizeHexColor(hex).slice(1);
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

async function solidPng(width: number, height: number, hex: string): Promise<Buffer> {
  const { r, g, b } = parseRgb(hex);
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r, g, b },
    },
  })
    .png()
    .toBuffer();
}

async function lettermark(size: number, hex: string, letter: string): Promise<Buffer> {
  const { r, g, b } = parseRgb(hex);
  const initial = (letter.trim().slice(0, 1) || "B").toUpperCase();
  const fontSize = Math.round(size * 0.52);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="100%" height="100%" fill="rgb(${r},${g},${b})"/>
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff">${initial}</text>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function containOnCanvas(params: {
  source: Buffer;
  width: number;
  height: number;
  background: string;
  paddingRatio?: number;
}): Promise<Buffer> {
  const pad = Math.round(Math.min(params.width, params.height) * (params.paddingRatio ?? 0.08));
  const innerW = Math.max(1, params.width - pad * 2);
  const innerH = Math.max(1, params.height - pad * 2);
  const { r, g, b } = parseRgb(params.background);
  const fitted = await sharp(params.source)
    .resize(innerW, innerH, { fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();
  return sharp({
    create: {
      width: params.width,
      height: params.height,
      channels: 4,
      background: { r, g, b, alpha: 1 },
    },
  })
    .composite([{ input: fitted, gravity: "centre" }])
    .png()
    .toBuffer();
}

async function coverOnCanvas(params: {
  source: Buffer;
  width: number;
  height: number;
  background: string;
}): Promise<Buffer> {
  try {
    return await sharp(params.source)
      .resize(params.width, params.height, { fit: "cover", position: "centre" })
      .png()
      .toBuffer();
  } catch {
    return solidPng(params.width, params.height, params.background);
  }
}

async function safeContain(source: Buffer | null, width: number, height: number, background: string, fallback: Buffer) {
  if (!source) return fallback;
  try {
    return await containOnCanvas({ source, width, height, background });
  } catch {
    return fallback;
  }
}

export async function buildAppleWalletPassImages(params: {
  logoUrl: string | null;
  coverUrl: string | null;
  accentColor: string;
  restaurantName: string;
}): Promise<AppleWalletPassImages> {
  const accent = normalizeHexColor(params.accentColor);
  const [logoSource, coverSource] = await Promise.all([
    fetchImageBuffer(params.logoUrl),
    fetchImageBuffer(params.coverUrl),
  ]);

  const iconFallback = await lettermark(87, accent, params.restaurantName);
  const logoFallback = await solidPng(480, 150, accent);
  const stripFallback = await solidPng(1125, 369, accent);

  const icon = await safeContain(logoSource, 87, 87, accent, iconFallback);
  const logo = await safeContain(logoSource, 480, 150, accent, logoFallback);
  const strip = coverSource
    ? await coverOnCanvas({ source: coverSource, width: 1125, height: 369, background: accent })
    : stripFallback;

  const [icon1x, icon2x, logo1x, logo2x, strip1x, strip2x] = await Promise.all([
    sharp(icon).resize(29, 29).png().toBuffer(),
    sharp(icon).resize(58, 58).png().toBuffer(),
    sharp(logo).resize(160, 50).png().toBuffer(),
    sharp(logo).resize(320, 100).png().toBuffer(),
    sharp(strip).resize(375, 123).png().toBuffer(),
    sharp(strip).resize(750, 246).png().toBuffer(),
  ]);

  return {
    "icon.png": icon1x,
    "icon@2x.png": icon2x,
    "icon@3x.png": icon,
    "logo.png": logo1x,
    "logo@2x.png": logo2x,
    "logo@3x.png": logo,
    "strip.png": strip1x,
    "strip@2x.png": strip2x,
    "strip@3x.png": strip,
  };
}

export async function preparePdfImage(url: string | null, maxWidth: number, maxHeight: number): Promise<Buffer | null> {
  const source = await fetchImageBuffer(url);
  if (!source) return null;
  try {
    return await sharp(source)
      .rotate()
      .resize(maxWidth, maxHeight, { fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();
  } catch {
    return null;
  }
}
