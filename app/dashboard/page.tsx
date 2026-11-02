import { verificarSesion } from "@/lib/sesion/dal";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Rol desde el DTO de la DAL (PLAN 2.11).
  const sesion = await verificarSesion();
  if (!sesion) redirect("/login");

  switch (sesion.rol) {
    case "admin":
      redirect("/dashboard/admin");
    case "cajero":
      redirect("/dashboard/cajero");
    case "mesero":
      redirect("/dashboard/mesero");
    case "cocina":
      redirect("/dashboard/cocina");
    default:
      redirect("/dashboard/cliente");
  }
}
