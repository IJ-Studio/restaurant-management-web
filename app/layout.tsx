import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/components/providers/AppProviders";
import { INITIAL_SETTINGS } from "@/features/shared/data/restaurantData";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import "@/styles/globals.css";

export const metadata: Metadata = {
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
    apple: INITIAL_SETTINGS.restaurantLogo,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#ffffff" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..900;1,9..40,300..900&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Ibarra+Real+Nova:ital,wght@0,400..700;1,400..700&family=Inter:wght@100..900&family=Roboto:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProviders>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </AppProviders>
      </body>
    </html>
  );
}
