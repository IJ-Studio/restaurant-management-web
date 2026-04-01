/**
 * restaurant.config.ts
 *
 * Single source of truth for all restaurant-specific configuration.
 * To adapt this system to a different restaurant, only this file needs
 * to be updated — no components, styles, or routes should be hardcoded.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NOTE: Keep this file in sync with styles/globals.css @theme variables
 * when changing brand colors.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const restaurantConfig = {
  // ── Identity ──────────────────────────────────────────────────────────────
  name: "El Quijote",
  shortName: "Q",
  tagline: "Cocina nacional e internacional",
  description:
    "Restaurante El Quijote es un espacio gastronómico ubicado en el corazón de Huejutla de Reyes, Hidalgo.",

  // ── Contact & Location ────────────────────────────────────────────────────
  contact: {
    address: "Pzla. Hidalgo 5-1, Centro, Huejutla de Reyes, Hgo., C.P. 43000",
    phone: "+52 771 702 8172",
    phoneHref: "tel:+527717028172",
    facebook: "https://www.facebook.com/ElQuijote.Huejutla",
    instagram: "https://www.instagram.com/elquijotehuejutla/",
    googleMaps: "https://maps.google.com/?cid=9162171458926916171",
  },

  // ── Hours ─────────────────────────────────────────────────────────────────
  hours: {
    display: "Lunes a Domingo · 1:00 PM – 11:00 PM",
    days: "Lun–Dom",
    open: "13:00",
    close: "23:00",
  },

  // ── Theme ─────────────────────────────────────────────────────────────────
  // These values MUST match the CSS custom properties in styles/globals.css
  theme: {
    brandColor: "#e85d04",
    brandColorLight: "#ff7c2a",
    brandColorDark: "#c44d03",
    fontDisplay: '"Fraunces", Georgia, serif',
    fontBody: '"DM Sans", system-ui, sans-serif',
  },

  // ── Roles & Role-based routing ────────────────────────────────────────────
  roles: {
    admin:   { label: "Administrador", dashboard: "/dashboard/admin" },
    cajero:  { label: "Cajero",        dashboard: "/dashboard/cajero" },
    mesero:  { label: "Mesero",        dashboard: "/dashboard/mesero" },
    cocina:  { label: "Cocina",        dashboard: "/dashboard/cocina" },
    cliente: { label: "Cliente",       dashboard: "/dashboard/cliente" },
  },

  // ── Stats shown in landing page ───────────────────────────────────────────
  stats: [
    { value: "16+", label: "Años" },
    { value: "80+", label: "Platillos" },
    { value: "4.9★", label: "Calificación" },
  ],
} as const;

// ── Derived types for type-safe usage ─────────────────────────────────────
export type RestaurantRole = keyof typeof restaurantConfig.roles;
export type RestaurantConfig = typeof restaurantConfig;
