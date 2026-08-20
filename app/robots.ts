import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/vendor/login", "/vendor/register"],
    },
    sitemap: "https://maschandigital.id/sitemap.xml",
  };
}
