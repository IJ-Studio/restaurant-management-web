import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const role = session.roleName as string;

  switch (role) {
    case "admin":   redirect("/dashboard/admin");
    case "cajero":  redirect("/dashboard/cajero");
    case "mesero":  redirect("/dashboard/mesero");
    case "cocina":  redirect("/dashboard/cocina");
    default:        redirect("/dashboard/cliente");
  }
}