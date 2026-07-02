"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";
import { usePathname } from "next/navigation"; // 👈 Importamos el hook de rutas

const ConditionalNavbar = dynamic(
  () => import("@/components/ConditionalNavbar"),
  { ssr: false },
);

const Footer = dynamic(() => import("@/components/landing/Footer"), {
  ssr: false,
});

export default function ClientLayoutWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname(); // 👈 Obtenemos la ruta actual

  // Verificamos si estamos dentro del panel de administración
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <>
      {/* 🔐 Si es dashboard, no renderizamos la Navbar pública */}
      {!isDashboard && <ConditionalNavbar />}

      {children}

      {/* 🔐 Si es dashboard, no renderizamos el Footer público */}
      {!isDashboard && <Footer />}
    </>
  );
}
