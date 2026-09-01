// "use client";

// import { useEffect } from "react";
// import { trackProductView } from "@/lib/api/wordpress";

// interface ProductViewTrackerProps {
//   productId: number;
// }

// export function ProductViewTracker({ productId }: ProductViewTrackerProps) {
//   useEffect(() => {
//     if (!productId || productId <= 0) return;

//     // Kirim sinyal view ke server WordPress di latar belakang
//     const wpUrl =
//       process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://app.maschandigital.id";

//     fetch(`${wpUrl}/wp-json/maschan/v1/products/${productId}/view`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       keepalive: true,
//     }).catch(() => {
//       // Abaikan error di client agar tidak mengganggu pengalaman pengguna
//     });
//   }, [productId]);

//   return null; // Komponen berjalan di latar belakang tanpa merender elemen visual
// }
"use client";

import { useEffect, useRef } from "react";
import { trackProductView } from "@/lib/api/wordpress";
import { trackViewProduct } from "@/lib/analytics";

interface ProductViewTrackerProps {
  productId: number;
  productName: string;
  price: number;
  vendorName: string;
  category: string;
}

export function ProductViewTracker({
  productId,
  productName,
  price,
  vendorName,
  category,
}: ProductViewTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (productId && !trackedRef.current) {
      trackedRef.current = true;
      trackProductView(productId);
      trackViewProduct({
        productId,
        productName,
        price,
        vendorName,
        category,
      });
    }
  }, [productId, productName, price, vendorName, category]);

  return null;
}
