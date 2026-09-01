"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined" && window.dataLayer) {
      setTimeout(() => {
        const query = searchParams.toString();
        const url = query ? `${pathname}?${query}` : pathname;
        window.dataLayer?.push({
          event: "page_view",
          page_location: window.location.href,
          page_path: url,
          page_title: document.title,
        });
      }, 0);
    }
  }, [pathname, searchParams]);

  return null;
}

