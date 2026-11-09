import { redirect } from "next/navigation";

/** «Reportes» es un panel del Inicio desde D-27: la ruta antigua lleva a él. */
export default function Pagina() {
	redirect("/dashboard/admin?panel=reportes");
}
