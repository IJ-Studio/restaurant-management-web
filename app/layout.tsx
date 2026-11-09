import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { AppProviders } from "@/components/providers/AppProviders";
import { AuthProvider } from "@/providers/AuthProvider";
import { restaurantConfig } from "@/config/restaurant.config";
import { RetirarServiceWorker } from "@/components/pwa/RetirarServiceWorker";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import ConnectionStatus from "@/components/pwa/ConnectionStatus";
import { fuenteTexto, fuenteTitulos } from "./fuentes";
import { ScriptPreferencias } from "@/components/marca/ScriptPreferencias";
import { COLOR_FONDO_POR_TEMA } from "@/lib/preferencias/preferencias";
import "@/styles/globals.css";

export const metadata: Metadata = {
  applicationName: restaurantConfig.name,
  title: {
    default: restaurantConfig.name,
    template: `%s | ${restaurantConfig.name}`,
  },
  // Metadatos con D-22: comida mexicana y solo datos de la configuración.
  description:
    "Restaurante El Quijote: comida mexicana en el centro de Huejutla de Reyes, Hidalgo.",
  keywords: [
    "restaurante",
    "comida mexicana",
    "restaurante en Huejutla",
    "El Quijote",
    "Huejutla de Reyes",
  ],
  // Iconos locales por convención de archivos: app/icon.svg y app/apple-icon.png.
  appleWebApp: {
    capable: true,
    title: restaurantConfig.name,
    // "default" pintaba una barra blanca sobre el tema oscuro en la app instalada de iOS.
    statusBarStyle: "black",
  },
  formatDetection: { telephone: false },
};

// Sin maximum-scale ni user-scalable: el usuario siempre puede ampliar.
// El tema no sigue al sistema (oscuro por defecto, claro a elección), así que el HTML sale
// con el color del oscuro y public/preferencias.js antepone el del claro antes de pintar si toca.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: COLOR_FONDO_POR_TEMA.oscuro,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Nonce de la CSP (PLAN 2.3), que pone proxy.ts. Leer las cabeceras hace dinámicas todas las
  // páginas: un nonce por petición no cabe en una página prerenderizada.
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html
      lang="es"
      className={`${fuenteTitulos.variable} ${fuenteTexto.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ScriptPreferencias nonce={nonce} />
      </head>
      <body>
        <AppProviders>
          <AuthProvider>
            {children}
          </AuthProvider>
        </AppProviders>
        <RetirarServiceWorker />
        <InstallPrompt />
        <ConnectionStatus />
      </body>
    </html>
  );
}
