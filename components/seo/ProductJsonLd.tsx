import React from "react";
import { Product } from "@/types";

interface ProductJsonLdProps {
  product: Product;
  productUrl?: string; // Dibuat opsional
}

export function ProductJsonLd({ product, productUrl }: ProductJsonLdProps) {
  // Otomatis membentuk URL produk jika tidak dioper manual
  const currentUrl =
    productUrl || `https://maschandigital.id/products/${product.slug}`;
  const currentPrice =
    product.on_sale && product.sale_price ? product.sale_price : product.price;
  const numericPrice = parseFloat(currentPrice) || 0;
  const mainImage =
    product.images[0]?.src || "https://maschandigital.id/mas-chan-digital.webp";
  const allImages =
    product.images.length > 0
      ? product.images.map((img) => img.src)
      : [mainImage];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: allImages,
    description:
      product.seo?.meta_description ||
      product.short_description ||
      product.description,
    sku: `MCD-PROD-${product.id}`,
    brand: {
      "@type": "Brand",
      name: product.vendor?.store_name || "Mas Chan Digital",
    },
    offers: {
      "@type": "Offer",
      url: currentUrl,
      priceCurrency: "IDR",
      price: numericPrice,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Store",
        name: product.vendor?.store_name || "Vendor Mas Chan Digital",
        telephone: product.vendor?.whatsapp_number || "+6282298148474",
        address: {
          "@type": "PostalAddress",
          addressLocality: product.vendor?.city || "Kota Serang",
          addressRegion: "Banten",
          postalCode: "42111",
          addressCountry: "ID",
        },
      },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: "https://maschandigital.id",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Katalog Produk",
        item: "https://maschandigital.id/products",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: currentUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
