/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para permitir imágenes de dominios externos
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },

  // Tus cabeceras de seguridad existentes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' }, // Previene clickjacking
          { key: 'X-Content-Type-Options', value: 'nosniff' }, // Previene inyección MIME
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          // HSTS forzado (solo funciona si tienes HTTPS)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;