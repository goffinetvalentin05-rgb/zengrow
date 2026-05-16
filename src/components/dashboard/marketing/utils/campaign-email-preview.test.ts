import { describe, expect, it } from "vitest";
import { buildCampaignEmailPreviewHtml } from "@/src/components/dashboard/marketing/utils/campaign-email-preview";

describe("buildCampaignEmailPreviewHtml", () => {
  it("échappe le HTML injecté dans le contenu", () => {
    const html = buildCampaignEmailPreviewHtml({
      restaurantName: "Test <script>",
      restaurantLogoUrl: null,
      subject: "Sujet <img>",
      content: "<script>alert(1)</script>\nLigne safe",
      imageUrl: null,
      ctaUrl: "https://example.com",
    });

    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("Ligne safe");
  });
});
