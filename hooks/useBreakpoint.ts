"use client";

import { useEffect, useState } from "react";

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const breakpoints: Record<Breakpoint, string> = {
  xs: "(min-width: 0px)",
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
};

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("xs");

  useEffect(() => {
    const mediaQueries = Object.entries(breakpoints).map(([key, query]) => ({
      key: key as Breakpoint,
      mql: window.matchMedia(query),
    }));

    const updateBreakpoint = () => {
      for (let i = mediaQueries.length - 1; i >= 0; i--) {
        if (mediaQueries[i].mql.matches) {
          setBreakpoint(mediaQueries[i].key);
          break;
        }
      }
    };

    updateBreakpoint();
    const listeners = mediaQueries.map(({ mql }) => {
      const handler = () => updateBreakpoint();
      mql.addEventListener("change", handler);
      return { mql, handler };
    });

    return () => {
      listeners.forEach(({ mql, handler }) => {
        mql.removeEventListener("change", handler);
      });
    };
  }, []);

  return breakpoint;
}
