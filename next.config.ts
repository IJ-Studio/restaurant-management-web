import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";
import { HOSTS_IMAGEN } from "./config/seguridad/hosts-permitidos";
import { CABECERA_SIN_CACHE, CABECERAS_SEGURIDAD, RUTAS_SIN_CACHE } from "./config/seguridad/cabeceras";

// Las páginas *.dev.tsx (catálogo de componentes, PLAN 3.0) solo existen en next dev:
// en next build no son rutas y su código no se compila.
const EXTENSIONES = ["tsx", "ts", "jsx", "js"];

const nextConfig: NextConfig = {
  pageExtensions: EXTENSIONES,

  // Sin X-Powered-By ni mapas de código del cliente en producción (PLAN 2.2).
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  // Solo los orígenes de config/seguridad/hosts-permitidos.ts (PLAN 1.9). Cloudinary va
  // por su propio cargador; esta lista cubre el resto de next/image.
  images: {
    remotePatterns: HOSTS_IMAGEN.map(({ host, ruta }) => ({
      protocol: "https" as const,
      hostname: host,
      port: "",
      pathname: `${ruta}**`,
    })),
    dangerouslyAllowSVG: false,
    formats: ["image/avif", "image/webp"],
  },

  // Cabeceras de seguridad para todas las rutas (PLAN 2.2). La CSP la pone proxy.ts (2.3).
  // Sin Cross-Origin-Embedder-Policy: rompería las imágenes de Cloudinary y Stripe.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: CABECERAS_SEGURIDAD,
      },
      // Datos privados sin caché (PLAN 2.6).
      ...RUTAS_SIN_CACHE.map((source) => ({ source, headers: [CABECERA_SIN_CACHE] })),
    ];
  },
};

export default function configuracion(fase: string): NextConfig {
  if (fase !== PHASE_DEVELOPMENT_SERVER) return nextConfig;
  return { ...nextConfig, pageExtensions: ["dev.tsx", ...EXTENSIONES] };
}
