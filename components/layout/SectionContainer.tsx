import React from "react";
import { cn } from "@/lib/utils";

interface SectionContainerProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  containerClassName?: string;
  as?: "section" | "div" | "article" | "aside";
}

export function SectionContainer({
  children,
  className,
  containerClassName,
  as: Component = "section",
  ...props
}: SectionContainerProps) {
  return (
    <Component className={cn("py-8 sm:py-12 lg:py-16", className)} {...props}>
      <div
        className={cn(
          "@container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl",
          containerClassName,
        )}
      >
        {children}
      </div>
    </Component>
  );
}
