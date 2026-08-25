const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export async function fetchImageBuffer(url: string | null | undefined): Promise<Buffer | null> {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    const response = await fetch(parsed, {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "image/*,*/*;q=0.8" },
    });
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_IMAGE_BYTES) return null;
    return buffer;
  } catch {
    return null;
  }
}

export function bufferToPngDataUrl(buffer: Buffer): string {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}
