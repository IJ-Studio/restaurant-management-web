"use client";

import React, { useEffect } from "react";
import { SettingsService } from "@/features/shared/services/dataService";

interface DesignSystemProviderProps {
  children: React.ReactNode;
}

export function DesignSystemProvider({ children }: DesignSystemProviderProps) {
  useEffect(() => {
    const applyDesignSystem = () => {
      const settings = SettingsService.getSettings();
      const { appearance } = settings;
      const root = document.documentElement;

      if (!appearance) return;

      // 1. Colors
      root.style.setProperty("--color-brand", appearance.primaryColor);

      // Calculate variations using color-mix (modern CSS)
      root.style.setProperty("--color-brand-light", `color-mix(in srgb, ${appearance.primaryColor}, white 20%)`);

      root.style.setProperty("--color-brand-sec", appearance.secondaryColor);

      // 2. Typography
      // Helper to handle font names (adding quotes if needed)
      const formatFont = (f: string) => f.includes(" ") ? `"${f}"` : f;

      root.style.setProperty("--font-display", `${formatFont(appearance.fontDisplay)}, Georgia, serif`);
      root.style.setProperty("--font-body", `${formatFont(appearance.fontBody)}, system-ui, sans-serif`);

      // 3. Border Radius
      const radiusMap = {
        none: "0",
        small: "0.5rem",
        medium: "1rem",
        large: "1.5rem",
        full: "9999px",
      };
      root.style.setProperty("--radius-standard", radiusMap[appearance.borderRadius] || radiusMap.medium);
    };

    // Initial apply
    applyDesignSystem();

    // Listen for storage changes (for same-tab updates if we use custom events or just re-check)
    // We'll use a simple interval for now or a custom event if we want to be fancy.
    // For now, let's just use the fact that the Admin page re-renders or the user refreshes.
    // OPTIONAL: Add a custom event listener if we want "Preview" mode without saving.
    window.addEventListener("design-system-update", applyDesignSystem);

    return () => window.removeEventListener("design-system-update", applyDesignSystem);
  }, []);

  return <>{children}</>;
}
