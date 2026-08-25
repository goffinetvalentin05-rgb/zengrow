import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["passkit-generator", "@react-pdf/renderer", "sharp"],
  outputFileTracingIncludes: {
    "/api/gift-vouchers/[id]/pdf": ["./public/fonts/gift-voucher/**/*"],
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
