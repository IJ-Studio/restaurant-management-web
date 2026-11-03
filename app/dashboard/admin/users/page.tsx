import type { Metadata } from "next";
import { UsuariosAdmin } from "@/features/dashboard/admin/usuarios/UsuariosAdmin";

export const metadata: Metadata = { title: "Usuarios · Administración" };

/** Usuarios (PLAN 5.13). */
export default function PaginaUsuarios() {
	return <UsuariosAdmin />;
}
