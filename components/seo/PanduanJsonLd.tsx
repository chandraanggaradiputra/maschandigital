import React from "react";
import { TutorialChapter } from "@/types/tutorial";

interface PanduanJsonLdProps {
  chapter: TutorialChapter;
  pageUrl?: string; // Dibuat opsional
}

export function PanduanJsonLd({ chapter, pageUrl }: PanduanJsonLdProps) {
  // Otomatis membentuk URL panduan jika tidak dioper manual
  const currentUrl =
    pageUrl || `https://maschandigital.id/panduan/${chapter.slug}`;

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: chapter.title,
    description: chapter.shortDescription,
    totalTime: `PT${chapter.estimatedMinutes}M`,
    step: chapter.content.steps.map((step, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: step.title,
      text: step.description,
    })),
    author: {
      "@type": "Organization",
      name: "Mas Chan Digital",
      url: "https://maschandigital.id",
    },
    publisher: {
      "@type": "Organization",
      name: "Mas Chan Digital",
      logo: {
        "@type": "ImageObject",
        url: "https://app.maschandigital.id/wp-content/uploads/logo-maschandigital.png",
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
        name: "Pusat Panduan",
        item: "https://maschandigital.id/panduan",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: chapter.title,
        item: currentUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
