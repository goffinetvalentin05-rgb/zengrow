/**
 * Génère public/themes/<id>/preview.webp (1200×750) à partir des preview.svg.
 * Usage: npx --yes -p sharp node scripts/generate-theme-previews.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const themeIds = ["default", "premium-dark", "premium-elegant"];

for (const id of themeIds) {
  const svgPath = join(root, "public", "themes", id, "preview.svg");
  const outPath = join(root, "public", "themes", id, "preview.webp");
  const svg = readFileSync(svgPath);
  await sharp(svg, { density: 144 })
    .resize(1200, 750, { fit: "cover" })
    .webp({ quality: 88 })
    .toFile(outPath);
  console.log(`✓ ${outPath}`);
}
