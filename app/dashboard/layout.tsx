import { getSession } from "@/lib/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { ADMIN_NAV_SECTIONS } from "@/config/navigation/admin.nav";
import { redirect } from "next/navigation";

import { CAJERO_NAV_SECTIONS } from "@/config/navigation/cajero.nav";
import { COCINA_NAV_SECTIONS } from "@/config/navigation/cocina.nav";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Validamos la sesión criptográfica desde la cookie
  const session = await getSession();

  if (!session || !session.id || !session.roleId) {
    redirect("/login");
  }

  // Mapeo rápido de id a rol
  const roleMap: Record<number, string> = {
    1: "admin",
    2: "cajero",
    3: "mesero",
    4: "cocina",
    5: "cliente",
  };
  const roleName = roleMap[session.roleId] || "cliente";

  // 2. Traer el perfil fresco de NestJS para forzar el Nombre y Apellido reales en la Sidebar
const fullUser = {
  id: session.id,
  email: session.email,
  name: "",
  lastname: "",
  roleName: roleName as "admin" | "cajero" | "mesero" | "cocina" | "cliente",
};

  try {
    const res = await fetch(`${BACKEND_URL}/users/${session.id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 0 } // No cachear para cambios inmediatos en el perfil
    });

    if (res.ok) {
      const userData = await res.json();
      fullUser.name = userData.name || "";
      fullUser.lastname = userData.lastname || "";
    }
  } catch (error) {
    console.error("Error cargando perfil en el layout del dashboard:", error);
  }

  // Mapa básico de navegación por rol
  const navMap: Record<string, typeof ADMIN_NAV_SECTIONS> = {
    admin: ADMIN_NAV_SECTIONS,
    cajero: CAJERO_NAV_SECTIONS,
    cocina: COCINA_NAV_SECTIONS,
  };

  const sections = navMap[roleName] || [];

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar persistente dictaminado por rol pasándole el usuario con su nombre real */}
      <Sidebar sections={sections} user={fullUser} />

      {/* Contenedor principal */}
      <div className="flex-1 ml-[var(--sidebar-width)] min-w-0">
        {children}
      </div>
    </div>
  );
}
