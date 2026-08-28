import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["passkit-generator", "@react-pdf/renderer", "sharp"],
  outputFileTracingIncludes: {
    "/api/gift-vouchers/[id]/pdf": [
      "./public/fonts/gift-voucher/**/*",
      "./src/lib/gift-vouchers/pdf/fonts/**/*",
    ],
    "/api/gift-voucher-offers/[id]/preview-pdf": [
      "./public/fonts/gift-voucher/**/*",
      "./src/lib/gift-vouchers/pdf/fonts/**/*",
    ],
  },
  async redirects() {
    return [
      { source: "/dashboard/gift-vouchers/offers", destination: "/dashboard", permanent: false },
      { source: "/dashboard/gift-vouchers/offers/:path*", destination: "/dashboard", permanent: false },
      { source: "/dashboard/gift-vouchers", destination: "/dashboard", permanent: false },
      { source: "/dashboard/gift-vouchers/:path*", destination: "/dashboard", permanent: false },
      { source: "/dashboard/loyalty", destination: "/dashboard", permanent: false },
      { source: "/dashboard/loyalty/:path*", destination: "/dashboard", permanent: false },
      { source: "/dashboard/customers", destination: "/dashboard/prospects", permanent: false },
      { source: "/dashboard/actions", destination: "/dashboard", permanent: false },
      { source: "/dashboard/analyse", destination: "/dashboard/intelligence?tab=analyse", permanent: false },
      { source: "/dashboard/growth", destination: "/dashboard/intelligence", permanent: false },
      { source: "/dashboard/content", destination: "/dashboard/intelligence?tab=content", permanent: false },
      { source: "/dashboard/market", destination: "/dashboard/intelligence?tab=market", permanent: false },
      { source: "/dashboard/marketing", destination: "/dashboard/intelligence?tab=content", permanent: false },
      { source: "/dashboard/marketing/:path*", destination: "/dashboard/intelligence?tab=content", permanent: false },
      { source: "/dashboard/reputation", destination: "/dashboard/intelligence?tab=analyse", permanent: false },
      { source: "/dashboard/public-page", destination: "/dashboard/intelligence?tab=analyse", permanent: false },
      { source: "/dashboard/reservations", destination: "/dashboard", permanent: false },
      { source: "/dashboard/feedbacks", destination: "/dashboard", permanent: false },
      { source: "/dashboard/feedback", destination: "/dashboard", permanent: false },
      { source: "/dashboard/reviews", destination: "/dashboard/intelligence?tab=analyse", permanent: false },
      { source: "/dashboard/ai", destination: "/dashboard", permanent: false },
      { source: "/dashboard/availability", destination: "/dashboard/settings", permanent: false },
      { source: "/dashboard/billing", destination: "/dashboard/settings", permanent: false },
      { source: "/dashboard/notifications", destination: "/dashboard", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
