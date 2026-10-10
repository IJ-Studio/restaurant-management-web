import type { MetadataRoute } from "next";
import { INITIAL_SETTINGS } from "@/features/shared/data/restaurantData";

/**
 * Web App Manifest — Next.js lo sirve en /manifest.webmanifest y agrega
 * automáticamente el <link rel="manifest"> en el <head>.
 */
export default function manifest(): MetadataRoute.Manifest {
  const name = `Restaurante ${INITIAL_SETTINGS.restaurantName}`;

  return {
    id: "/",
    name,
    short_name: INITIAL_SETTINGS.restaurantName,
    description:
      "Menú digital, reservaciones y sistema de gestión del Restaurante El Quijote.",
    lang: "es-MX",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#ffffff",
    theme_color: INITIAL_SETTINGS.appearance.primaryColor,
    categories: ["food", "business", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    shortcuts: [
      {
        name: "Ver menú",
        short_name: "Menú",
        url: "/menu",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Reservar mesa",
        short_name: "Reservar",
        url: "/reservations",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Panel de gestión",
        short_name: "Panel",
        url: "/dashboard",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
