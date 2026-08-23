import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "app.maschandigital.id" },
      { protocol: "https", hostname: "maschandigital.id" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.gravatar.com" },
      { protocol: "https", hostname: "secure.gravatar.com" },
    ],
  },
  // Header Keamanan Tambahan
  // async headers() {
  //   return [
  //     {
  //       source: "/(.*)",
  //       headers: [
  //         { key: "X-Content-Type-Options", value: "nosniff" },
  //         { key: "X-Frame-Options", value: "DENY" },
  //         { key: "X-XSS-Protection", value: "1; mode=block" },
  //         { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  //       ],
  //     },
  //   ];
  // },
};

export default nextConfig;
