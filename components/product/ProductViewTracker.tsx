"use client";

import { useEffect, useRef } from "react";
import { trackProductView } from "@/lib/api/wordpress";
import { trackViewProduct, trackEcommerceViewItem } from "@/lib/analytics";
import type { Product } from "@/types";

interface ProductViewTrackerProps {
  product: Product;
}

export function ProductViewTracker({ product }: ProductViewTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (product && product.id && !trackedRef.current) {
      trackedRef.current = true;
      trackProductView(product.id);
      
      const currentPrice = product.on_sale && product.sale_price
        ? parseFloat(product.sale_price)
        : parseFloat(product.regular_price || product.price);

      trackViewProduct({
        productId: product.id,
        productName: product.name,
        price: currentPrice,
        vendorName: product.vendor?.store_name || "Unknown",
        category: product.categories?.[0]?.name || "Uncategorized",
      });

      trackEcommerceViewItem(product);
    }
  }, [product]);

  return null;
}

