import { describe, expect, it } from "vitest";
import { formatCentsAsChfPdf, pdfSafeText } from "@/src/lib/gift-vouchers/pdf/text";

describe("pdfSafeText", () => {
  it("remplace les apostrophes typographiques absentes de la police", () => {
    expect(pdfSafeText("jusqu’à")).toBe("jusqu'à");
    expect(formatCentsAsChfPdf(100000)).toBe("1 000.00 CHF");
  });
});
