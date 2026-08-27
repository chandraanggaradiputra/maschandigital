import React from "react";
import { Vendor } from "@/types";

interface VendorJsonLdProps {
  vendor: Vendor;
  vendorUrl?: string;
}

export function VendorJsonLd({ vendor, vendorUrl }: VendorJsonLdProps) {
  const currentUrl =
    vendorUrl || `https://maschandigital.id/vendors/${vendor.slug}`;

  const dayMap: Record<string, string> = {
    senin: "Monday",
    selasa: "Tuesday",
    rabu: "Wednesday",
    kamis: "Thursday",
    jumat: "Friday",
    sabtu: "Saturday",
    minggu: "Sunday",
  };

  const openingHoursSpec = vendor.store_hours
    ? Object.entries(vendor.store_hours)
        .filter(([_, schedule]) => schedule?.isOpen)
        .map(([dayKey, schedule]) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: dayMap[dayKey] || "Monday",
          opens: schedule?.openTime || "08:00",
          closes: schedule?.closeTime || "17:00",
        }))
    : [];

  const vendorPhone = vendor.whatsapp_number
    ? vendor.whatsapp_number.startsWith("+")
      ? vendor.whatsapp_number
      : `+${vendor.whatsapp_number}`
    : "+6282298148474";

  const socialLinks = vendor.socials
    ? [
        vendor.socials.instagram,
        vendor.socials.tiktok,
        vendor.socials.facebook,
        vendor.socials.youtube,
        vendor.socials.website,
      ].filter((url): url is string => Boolean(url && url.trim()))
    : [];

  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: vendor.store_name,
    image:
      vendor.banner ||
      vendor.avatar ||
      "https://maschandigital.id/mas-chan-digital.webp",
    description:
      vendor.description ||
      `Profil toko resmi ${vendor.store_name} di Marketplace Mas Chan Digital Kota Serang.`,
    url: currentUrl,
    telephone: vendorPhone,
    priceRange: "Rp",
    paymentAccepted: "Cash, Bank Transfer, QRIS",
    ...(socialLinks.length > 0 ? { sameAs: socialLinks } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: vendor.address?.street_1 || "Kota Serang",
      addressLocality: vendor.location_district || "Kota Serang",
      addressRegion: "Banten",
      postalCode: "42111",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "-6.1200",
      longitude: "106.1500",
    },
    ...(openingHoursSpec.length > 0
      ? { openingHoursSpecification: openingHoursSpec }
      : {}),
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
        name: "Direktori Vendor",
        item: "https://maschandigital.id/vendors",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: vendor.store_name,
        item: currentUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
