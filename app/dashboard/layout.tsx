import { getSessionUser } from "@/lib/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { ADMIN_NAV_SECTIONS } from "@/config/navigation/admin.nav";
import { redirect } from "next/navigation";

import { CAJERO_NAV_SECTIONS } from "@/config/navigation/cajero.nav";
import { COCINA_NAV_SECTIONS } from "@/config/navigation/cocina.nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getSessionUser();

  // Si no hay sesión válida, lo regresamos al login preventivamente
  // aunque el middleware ya debería haberse encargado de esto.
  if (!sessionUser || !sessionUser.roleName) {
    redirect("/login");
  }

  // Mapa básico de navegación por rol
  const navMap: Record<string, typeof ADMIN_NAV_SECTIONS> = {
    admin: ADMIN_NAV_SECTIONS,
    cajero: CAJERO_NAV_SECTIONS,
    cocina: COCINA_NAV_SECTIONS,
    // mesero: MESERO_NAV_SECTIONS,
  };

  const sections = navMap[sessionUser.roleName] || [];

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar persistente dictaminado por rol */}
      <Sidebar sections={sections} user={sessionUser} />

      {/* Contenedor principal que se ajusta dejando espacio al Sidebar fijo */}
      <div className="flex-1 ml-[var(--sidebar-width)] min-w-0">
        {children}
      </div>
    </div>
  );
}
