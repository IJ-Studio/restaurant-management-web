"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  if (pathname?.startsWith("/dashboard/admin")) {
    return null;
  }

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  const authRoutes = ["/login", "/register", "/frm_reset"];
  const isAuthRoute = authRoutes.includes(pathname);

  if (isAuthRoute) {
    return <Navbar minimal overlay={isLargeScreen} />;
  }

  // Landing page (página principal)
  if (pathname === "/") {
    const landingLinks = [
      { label: "Promociones", href: "#promociones" },
      { label: "Menú", href: "/menu" },
      { label: "Nosotros", href: "#nosotros" },
      { label: "Reservas", href: "#reserva" },
      { label: "Entrar", href: "/login", isAction: true }, // ← acción a la derecha
    ];
    return <Navbar customLinks={landingLinks} />;
  }

  // Dashboard u otras rutas
  return <Navbar />;
}
