import type { Metadata } from "next";
import { RotateCcw } from "lucide-react";
import { Boton } from "@/components/ui/Boton";
import { PaginaEstado } from "@/components/marca/PaginaEstado";
import { TEXTOS_ESTADO } from "@/components/marca/textos-estado";
import { RecargarAlConectar } from "./RecargarAlConectar";

export const metadata: Metadata = { title: "Sin conexión", robots: { index: false, follow: false } };

/**
 * Sin conexión (PLAN 4.23, D-21): el molino con las aspas quietas. La página se recarga sola al
 * volver la conexión (`RecargarAlConectar`) y «Reintentar» es un `<form>` nativo, que funciona sin
 * JavaScript. Sin estilos en línea ni el naranja antiguo; ya no hay service worker (2.7).
 */
export default function PaginaSinConexion() {
	return (
		<PaginaEstado
			{...TEXTOS_ESTADO.sinConexion}
			texto="Cuando vuelvas a tener conexión, la página se recargará sola. También puedes reintentarlo."
			acciones={
				<form>
					<Boton type="submit" variante="primario" icono={<RotateCcw />}>
						Reintentar
					</Boton>
				</form>
			}
			pie={<RecargarAlConectar />}
		/>
	);
}
