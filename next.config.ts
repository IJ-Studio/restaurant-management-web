import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";
import { HOSTS_IMAGEN } from "./config/seguridad/hosts-permitidos";

// Las páginas *.dev.tsx (catálogo de componentes, PLAN 3.0) solo existen en next dev:
// en next build no son rutas y su código no se compila.
const EXTENSIONES = ["tsx", "ts", "jsx", "js"];

const nextConfig: NextConfig = {
  pageExtensions: EXTENSIONES,

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

  // Tus cabeceras de seguridad existentes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      {
        // El service worker siempre debe revalidarse para que las actualizaciones lleguen.
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },
};

export default function configuracion(fase: string): NextConfig {
  if (fase !== PHASE_DEVELOPMENT_SERVER) return nextConfig;
  return { ...nextConfig, pageExtensions: ["dev.tsx", ...EXTENSIONES] };
}
