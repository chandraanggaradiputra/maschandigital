import { MetadataRoute } from "next";
import { getProducts, getVendors } from "@/lib/api/wordpress";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://maschandigital.id";

  const products = await getProducts();
  const vendors = await getVendors();

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(p.created_at || new Date()),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const vendorUrls: MetadataRoute.Sitemap = vendors.map((v) => ({
    url: `${baseUrl}/vendors/${v.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/vendors`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tentang-kami`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...productUrls,
    ...vendorUrls,
  ];
}
