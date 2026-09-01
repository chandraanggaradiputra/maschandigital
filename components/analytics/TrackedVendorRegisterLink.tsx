"use client";

import React from "react";
import Link from "next/link";
import { trackVendorRegisterClick } from "@/lib/analytics";

interface TrackedVendorRegisterLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  sourceLocation: string;
}

export function TrackedVendorRegisterLink({
  href,
  className,
  children,
  sourceLocation,
}: TrackedVendorRegisterLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackVendorRegisterClick(sourceLocation)}
    >
      {children}
    </Link>
  );
}

