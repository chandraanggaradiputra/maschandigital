// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "app.maschandigital.id",
//       },
//       {
//         protocol: "https",
//         hostname: "maschandigital.id",
//       },
//       {
//         protocol: "https",
//         hostname: "images.unsplash.com",
//       },
//       {
//         protocol: "https",
//         hostname: "*.gravatar.com",
//       },
//       {
//         protocol: "https",
//         hostname: "secure.gravatar.com",
//       },
//     ],
//   },
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "app.maschandigital.id",
      },
      {
        protocol: "https",
        hostname: "maschandigital.id",
      },
      {
        protocol: "https",
        hostname: "app.maschandigital.com",
      },
      {
        protocol: "https",
        hostname: "maschandigital.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "secure.gravatar.com",
      },
      {
        protocol: "https",
        hostname: "*.gravatar.com",
      },
    ],
  },
};

export default nextConfig;
