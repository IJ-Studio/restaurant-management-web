import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const roleId = session.roleId as number;

  switch (roleId) {
    case 1:      redirect("/dashboard/admin");
    case 2:      redirect("/dashboard/cajero");
    case 3:      redirect("/dashboard/mesero");
    case 4:      redirect("/dashboard/cocina");
    default:     redirect("/dashboard/cliente");
  }
}