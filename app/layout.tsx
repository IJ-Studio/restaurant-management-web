import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/components/providers/AppProviders";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Restaurante El Quijote",
    template: "%s | El Quijote",
  },
  description:
    "Sistema de gestión y menú digital de Restaurante El Quijote. Cocina nacional e internacional en Huejutla de Reyes, Hidalgo.",
  keywords: ["restaurante", "menú", "El Quijote", "Huejutla", "comida mexicana"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Google Fonts — Fraunces (display) + DM Sans (body) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..900;1,9..40,300..900&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@100..900&family=Roboto:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
