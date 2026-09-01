import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "app.maschandigital.id", pathname: "/**" },
      { protocol: "https", hostname: "maschandigital.id", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "*.gravatar.com", pathname: "/**" },
      { protocol: "https", hostname: "secure.gravatar.com", pathname: "/**" },
    ],
  },
  // Header Keamanan Tambahan
  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' blob: data: https: http:;
      font-src 'self' data: https://fonts.gstatic.com;
      connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://app.maschandigital.id;
      frame-src 'self' https://www.youtube.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
    `.replace(/\n/g, '').replace(/\s+/g, ' ').trim();

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
          { key: "Content-Security-Policy", value: cspHeader },
        ],
      },
    ];
  },
};

export default nextConfig;
