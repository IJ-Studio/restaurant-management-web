import { verificarSesion } from "@/lib/sesion/dal";
import AdminSidebar from "@/components/admin/AdminSidebar"; // ← importa tu componente
import { redirect } from "next/navigation";

// Datos privados: siempre se renderiza por petición, nunca se guarda (PLAN 2.6).
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // DTO mínimo de la DAL (PLAN 2.11): la barra lateral solo recibe lo que pinta.
  const sesion = await verificarSesion();
  if (!sesion) redirect("/login");

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar fijo con ancho dinámico */}
      <AdminSidebar user={{ name: sesion.nombre, lastname: sesion.apellidos }} />

      {/* Contenido: margen izquierdo según variable CSS (respaldo 260px) */}
      <div className="flex-1 min-w-0" style={{ marginLeft: 'var(--sidebar-width, 260px)' }}>
        {children}
      </div>
    </div>
  );
}
