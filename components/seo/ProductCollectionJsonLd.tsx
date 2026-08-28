import React from "react";
import { Product } from "@/types";

interface ProductCollectionJsonLdProps {
  products: Product[];
}

export function ProductCollectionJsonLd({
  products,
}: ProductCollectionJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Katalog Produk UMKM Kota Serang - Mas Chan Digital",
    description:
      "Jelajahi seluruh katalog produk kuliner, madu & herbal, fashion batik, dan jasa lokal dari UMKM di 6 kecamatan Kota Serang.",
    url: "https://maschandigital.id/products",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 20).map((product, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `https://maschandigital.id/products/${product.slug}`,
        name: product.name,
        image:
          product.images[0]?.src ||
          "https://maschandigital.id/mas-chan-digital.webp",
      })),
    },
    breadcrumb: {
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
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
