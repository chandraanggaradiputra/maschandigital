import type { MetadataRoute } from 'next';
import { getProducts, getVendors, getCategories } from '@/lib/api/wordpress';

export const revalidate = 3600; // Perbarui sitemap secara otomatis di latar belakang setiap 1 jam (ISR)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maschandigital.id';

  // 1. Rute Statis Publik
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vendors`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/panduan`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/tentang-kami`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/syarat-ketentuan`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/kebijakan-privasi`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // 2. Rute Dinamis Produk (/products/[slug])
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts();
    if (Array.isArray(products)) {
      productRoutes = products
        .filter((p) => Boolean(p && p.slug))
        .map((product) => ({
          url: `${baseUrl}/products/${product.slug}`,
          lastModified: product.created_at ? new Date(product.created_at) : new Date(),
          changeFrequency: 'daily',
          priority: 0.8,
        }));
    }
  } catch (error) {
    console.error('Sitemap: Gagal mengambil data produk:', error);
  }

  // 3. Rute Dinamis Toko Vendor (/vendors/[slug])
  let vendorRoutes: MetadataRoute.Sitemap = [];
  try {
    const vendors = await getVendors();
    if (Array.isArray(vendors)) {
      vendorRoutes = vendors
        .filter((v) => Boolean(v && v.slug))
        .map((vendor) => ({
          url: `${baseUrl}/vendors/${vendor.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        }));
    }
  } catch (error) {
    console.error('Sitemap: Gagal mengambil data vendor:', error);
  }

  // 4. Rute Dinamis Kategori (/categories/[slug])
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await getCategories();
    if (Array.isArray(categories)) {
      categoryRoutes = categories
        .filter((c) => Boolean(c && c.slug))
        .map((cat) => ({
          url: `${baseUrl}/categories/${cat.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        }));
    }
  } catch (error) {
    console.error('Sitemap: Gagal mengambil data kategori:', error);
  }

  return [...staticRoutes, ...productRoutes, ...vendorRoutes, ...categoryRoutes];
}
