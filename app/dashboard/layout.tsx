import { getSession } from "@/lib/session";
import AdminSidebar from "@/components/admin/AdminSidebar"; // ← importa tu componente
import { redirect } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || !session.id || !session.roleId) redirect("/login");

  // Mapeo de rol (igual que antes)
  const roleMap: Record<number, string> = {
    1: "admin",
    2: "cajero",
    3: "mesero",
    4: "cocina",
    5: "cliente",
  };
  const roleName = roleMap[session.roleId] || "cliente";

  // Obtener usuario con nombre y apellido
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
      next: { revalidate: 0 },
    });
    if (res.ok) {
      const userData = await res.json();
      fullUser.name = userData.name || "";
      fullUser.lastname = userData.lastname || "";
    }
  } catch (error) {
    console.error("Error cargando perfil:", error);
  }

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar fijo con ancho dinámico */}
      <AdminSidebar user={fullUser} />

      {/* Contenido: margen izquierdo según variable CSS (respaldo 260px) */}
      <div className="flex-1 min-w-0" style={{ marginLeft: 'var(--sidebar-width, 260px)' }}>
        {children}
      </div>
    </div>
  );
}
