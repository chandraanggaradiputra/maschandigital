import React from "react";
import { Product, ProductReviewsData } from "@/types";

interface ProductJsonLdProps {
  product: Product;
  productUrl?: string;
  reviewsData?: ProductReviewsData;
}

export function ProductJsonLd({
  product,
  productUrl,
  reviewsData,
}: ProductJsonLdProps) {
  const currentUrl =
    productUrl || `https://maschandigital.id/products/${product.slug}`;
  const currentPrice =
    product.on_sale && product.sale_price
      ? product.sale_price
      : product.regular_price || product.price;
  const numericPrice = parseFloat(currentPrice) || 0;
  const mainImage =
    product.images[0]?.src || "https://maschandigital.id/mas-chan-digital.webp";
  const allImages =
    product.images.length > 0
      ? product.images.map((img) => img.src)
      : [mainImage];

  const primaryCategory = product.categories?.[0]?.name || "Produk Lokal";

  const effectiveReviews = reviewsData || product.reviews_data;
  const hasReviews = effectiveReviews && effectiveReviews.total_reviews > 0;

  const productSchema = {
    "@type": "Product",
    name: product.name,
    image: allImages,
    description:
      product.seo?.meta_description ||
      product.short_description ||
      product.description ||
      `Beli ${product.name} langsung di Mas Chan Digital Kota Serang.`,
    sku: `MCD-PROD-${product.id}`,
    category: primaryCategory,
    brand: {
      "@type": "Brand",
      name: product.vendor?.store_name || "Mas Chan Digital",
    },
    offers: {
      "@type": "Offer",
      url: currentUrl,
      price: numericPrice,
      priceCurrency: "IDR",
      availability: "https://schema.org/InStock",
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Store",
        name: product.vendor?.store_name || "Mas Chan Digital",
        url: product.vendor?.slug
          ? `https://maschandigital.id/vendors/${product.vendor.slug}`
          : "https://maschandigital.id",
        telephone: product.vendor?.whatsapp_number
          ? `+${product.vendor.whatsapp_number}`
          : "+6282298148474",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Banten Indah Permai Blok E1 No.12A, Kelurahan Unyur",
          addressLocality: product.vendor?.location_district
            ? `Kecamatan ${product.vendor.location_district}, Kota Serang`
            : product.vendor?.city || "Kota Serang",
          addressRegion: "Banten",
          postalCode: "42111",
          addressCountry: "ID",
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "ID",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 2,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: 0,
          currency: "IDR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "ID",
          addressRegion: "Banten",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "d",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "d",
          },
        },
      },
    },
    ...(hasReviews && effectiveReviews
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: effectiveReviews.average_rating.toFixed(1),
            reviewCount: effectiveReviews.total_reviews.toString(),
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  };

  const breadcrumbSchema = {
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

  const graphSchema = {
    "@context": "https://schema.org",
    "@graph": [productSchema, breadcrumbSchema],
  };

  return (
    <script
      id="product-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graphSchema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
