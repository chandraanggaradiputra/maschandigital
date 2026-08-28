import React from "react";

export function AboutPageJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": "https://maschandigital.id/tentang-kami#webpage",
        url: "https://maschandigital.id/tentang-kami",
        name: "Tentang Kami - Mas Chan Digital | Marketplace Lokal Kota Serang",
        description:
          "Mengenal Mas Chan Digital, platform marketplace direktori lokal untuk memajukan UMKM di Kota Serang melalui transaksi langsung ke WhatsApp vendor tanpa potongan biaya gateway.",
        isPartOf: {
          "@type": "WebSite",
          "@id": "https://maschandigital.id/#website",
          name: "Mas Chan Digital",
          url: "https://maschandigital.id",
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
              name: "Tentang Kami",
              item: "https://maschandigital.id/tentang-kami",
            },
          ],
        },
      },
      {
        "@type": "Organization",
        "@id": "https://maschandigital.id/#organization",
        name: "Mas Chan Digital",
        url: "https://maschandigital.id",
        logo: "https://app.maschandigital.id/wp-content/uploads/logo-maschandigital.png",
        description:
          "Platform marketplace lokal Kota Serang yang menghubungkan pelaku UMKM dan pembeli secara langsung via WhatsApp.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Kota Serang",
          addressRegion: "Banten",
          postalCode: "42111",
          addressCountry: "ID",
        },
        founder: {
          "@type": "Person",
          name: "Chandra Anggara Diputra",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+6282298148474",
          contactType: "customer support",
          email: "admin@maschandigital.id",
          areaServed: "ID",
          availableLanguage: ["Indonesian"],
        },
      },
      {
        "@type": "FAQPage",
        "@id": "https://maschandigital.id/tentang-kami#faq",
        mainEntity: [
          {
            "@type": "Question",
            name: "Bagaimana cara berbelanja di Mas Chan Digital?",
            acceptedAnswer: {
              "@type": "Answer",
              text: 'Cukup cari produk yang Anda inginkan, klik tombol "Pesan Cepat via WhatsApp", isi rincian kuantitas dan kecamatan tujuan Anda di Kota Serang, lalu kirim. Anda akan langsung terhubung ke WhatsApp resmi pemilik toko untuk kesepakatan pengiriman.',
            },
          },
          {
            "@type": "Question",
            name: "Apakah ada biaya tambahan atau biaya admin untuk pembeli?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Tidak ada. Harga yang tertera adalah harga resmi langsung dari penjual tanpa tambahan biaya perantara atau biaya aplikasi.",
            },
          },
          {
            "@type": "Question",
            name: "Bagaimana cara mendaftarkan usaha saya sebagai vendor?",
            acceptedAnswer: {
              "@type": "Answer",
              text: 'Klik tombol "Daftar Toko Gratis" di menu navigasi, isi nama toko, nomor WhatsApp, dan kecamatan Anda di Kota Serang. Toko Anda langsung aktif seketika dengan Paket Starter UMKM.',
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
