import React from "react";
import { Vendor } from "@/types";

interface VendorCollectionJsonLdProps {
  vendors: Vendor[];
}

export function VendorCollectionJsonLd({
  vendors,
}: VendorCollectionJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Direktori Toko & Vendor UMKM Kota Serang - Mas Chan Digital",
    description:
      "Daftar profil toko, produsen kuliner, madu herbal, fashion batik, dan penyedia jasa resmi di 6 kecamatan Kota Serang, Banten.",
    url: "https://maschandigital.id/vendors",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: vendors.length,
      itemListElement: vendors.slice(0, 20).map((vendor, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `https://maschandigital.id/vendors/${vendor.slug}`,
        name: vendor.store_name,
        image:
          vendor.avatar ||
          vendor.banner ||
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
          name: "Direktori Vendor",
          item: "https://maschandigital.id/vendors",
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
