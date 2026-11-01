import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/components/providers/AppProviders";
// 👇 1. Importa tu nuevo AuthProvider (Ajusta la ruta si lo guardaste en otra carpeta)
import { AuthProvider } from "@/providers/AuthProvider";
import { INITIAL_SETTINGS } from "@/features/shared/data/restaurantData";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import ConnectionStatus from "@/components/pwa/ConnectionStatus";
import { fuenteTexto, fuenteTitulos } from "./fuentes";
import "@/styles/globals.css";

export const metadata: Metadata = {
  applicationName: INITIAL_SETTINGS.restaurantName,
  title: {
    default: INITIAL_SETTINGS.restaurantName,
    template: `%s | ${INITIAL_SETTINGS.restaurantName}`,
  },
  description:
    INITIAL_SETTINGS.heroSubtitle ||
    "Sistema de gestión y menú digital de Restaurante El Quijote. Cocina nacional e internacional en Huejutla de Reyes, Hidalgo.",
  keywords: [
    "restaurante",
    "menú",
    "El Quijote",
    "Huejutla",
    "comida mexicana",
  ],
  icons: {
    icon: INITIAL_SETTINGS.restaurantIco,
    shortcut: INITIAL_SETTINGS.restaurantLogo,
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: INITIAL_SETTINGS.restaurantName,
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#181a1b" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${fuenteTitulos.variable} ${fuenteTexto.variable}`}
      suppressHydrationWarning
    >
      <body>
        <AppProviders>
          {/* 👇 2. Colocamos el AuthProvider envolviendo al Layout Wrapper */}
          <AuthProvider>
            <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
          </AuthProvider>
        </AppProviders>
        <ServiceWorkerRegister />
        <InstallPrompt />
        <ConnectionStatus />
      </body>
    </html>
  );
}
