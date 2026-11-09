import type { MetadataRoute } from "next";
import { restaurantConfig } from "@/config/restaurant.config";
import { COLOR_FONDO_POR_TEMA } from "@/lib/preferencias/preferencias";

/**
 * Web App Manifest — Next.js lo sirve en /manifest.webmanifest y agrega
 * automáticamente el <link rel="manifest"> en el <head>.
 */
export default function manifest(): MetadataRoute.Manifest {
  const name = `Restaurante ${restaurantConfig.name}`;

  return {
    id: "/",
    name,
    short_name: restaurantConfig.name,
    description:
      "Menú digital, reservaciones y sistema de gestión del Restaurante El Quijote.",
    lang: "es-MX",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    // Colores del tema oscuro (por defecto), tomados de los tokens.
    background_color: COLOR_FONDO_POR_TEMA.oscuro,
    theme_color: COLOR_FONDO_POR_TEMA.oscuro,
    categories: ["food", "business", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
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
