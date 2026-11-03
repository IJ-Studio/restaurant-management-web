import type { Metadata } from "next";
import { LogIn, UserPlus } from "lucide-react";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { PaginaEstado } from "@/components/marca/PaginaEstado";
import { TEXTOS_ESTADO } from "@/components/marca/textos-estado";

export const metadata: Metadata = { title: "Inicia sesión", robots: { index: false, follow: false } };

// 401 (PLAN 4.23, D-21): la llave de la bodega. Las salidas son las de siempre: iniciar sesión o crear una cuenta.
export default function PaginaSinSesion() {
	return (
		<PaginaEstado
			{...TEXTOS_ESTADO.sinSesion}
			acciones={
				<>
					<BotonEnlace href="/login" variante="primario" icono={<LogIn />}>
						Iniciar sesión
					</BotonEnlace>
					<BotonEnlace href="/register" variante="secundario" icono={<UserPlus />}>
						Crear una cuenta
					</BotonEnlace>
				</>
			}
		/>
	);
}
