import React from "react";

export function MarketplaceJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "OnlineMarketplace",
    name: "Mas Chan Digital",
    url: "https://maschandigital.id",
    logo: "https://maschandigital.id/mas-chan-digital.webp",
    description:
      "Platform Marketplace Lokal Kota Serang yang menghubungkan pelaku UMKM, kuliner khas Banten, madu akasia asli, batik Banten, dan jasa kreatif langsung ke WhatsApp vendor.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kota Serang",
      addressRegion: "Banten",
      postalCode: "42111",
      addressCountry: "ID",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "-6.1200",
      longitude: "106.1500",
    },
    areaServed: [
      { "@type": "AdministrativeArea", name: "Kecamatan Serang" },
      { "@type": "AdministrativeArea", name: "Kecamatan Cipocok Jaya" },
      { "@type": "AdministrativeArea", name: "Kecamatan Kasemen" },
      { "@type": "AdministrativeArea", name: "Kecamatan Curug" },
      { "@type": "AdministrativeArea", name: "Kecamatan Taktakan" },
      { "@type": "AdministrativeArea", name: "Kecamatan Walantaka" },
    ],
    sameAs: ["https://wa.me/6282298148474"],
    potentialAction: {
      "@type": "SearchAction",
      target: "https://maschandigital.id/products?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
