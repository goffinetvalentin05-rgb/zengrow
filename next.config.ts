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
      { source: "/dashboard", destination: "/explore", permanent: false },
      { source: "/dashboard/:path*", destination: "/explore", permanent: false },
      { source: "/billing", destination: "/settings", permanent: false },
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
