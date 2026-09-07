"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// React 19 / Next.js 16: Guard against dev-mode false positives and Turbopack measurement crashes
if (typeof console !== "undefined" && typeof console.error === "function") {
  // 1. Suppress known script-tag warning from next-themes inline detection (SSR + Client)
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

if (typeof window !== "undefined") {
  // Workaround for Turbopack Next.js 16.3.1 bug:
  // react-server-dom crashes with `TypeError: frame.join is not a function` when console.createTask is defined
  if (typeof console !== "undefined" && "createTask" in console) {
    try {
      delete (console as unknown as { createTask?: unknown }).createTask;
    } catch {
      (console as unknown as { createTask?: unknown }).createTask = undefined;
    }
  }

  // 2. Guard window.performance.measure against Next.js 16 / Turbopack negative timestamp bug
  if (window.performance && typeof window.performance.measure === "function") {
    const originalMeasure = window.performance.measure.bind(window.performance);
    window.performance.measure = function (
      ...args: Parameters<Performance["measure"]>
    ): PerformanceMeasure {
      try {
        return originalMeasure(...args);
      } catch {
        // Next.js 16 Turbopack bug: Flight Server Component profiling
        // can emit negative duration/timestamps, which throws uncaught TypeError in browser
        return undefined as unknown as PerformanceMeasure;
      }
    };
  }

  // 3. Prevent Turbopack error overlay crash (frame.join is not a function) and RSC stream abort (enqueueModel)
  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const msg =
      reason instanceof Error
        ? reason.message
        : typeof reason === "string"
        ? reason
        : "";

    if (
      msg.includes("frame.join is not a function") ||
      msg.includes("cannot have a negative time stamp") ||
      msg.includes("negative time stamp") ||
      msg.includes("enqueueModel")
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  // 4. Prevent uncaught error bubbling for Turbopack internal overlay bug
  window.addEventListener("error", (event: ErrorEvent) => {
    const msg = event.message || "";
    if (
      msg.includes("cannot have a negative time stamp") ||
      msg.includes("negative time stamp") ||
      msg.includes("frame.join is not a function") ||
      msg.includes("enqueueModel")
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
