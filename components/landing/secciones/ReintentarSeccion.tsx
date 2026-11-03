"use client";

import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { EstadoError } from "@/components/ui/EstadoError";

/**
 * Error de una sección de la landing (D-20): redacción cálida, «Reintentar» que vuelve a pedir los
 * datos al servidor (`router.refresh()`) y, si se da, una segunda salida humana.
 */
export function ReintentarSeccion({ titulo, descripcion, accion }: { titulo: string; descripcion: string; accion?: ReactNode }) {
	const router = useRouter();
	const [, iniciar] = useTransition();
	return (
		<EstadoError
			nivelTitulo={3}
			titulo={titulo}
			descripcion={descripcion}
			accion={accion}
			alReintentar={() => new Promise<void>((listo) => iniciar(() => (router.refresh(), listo())))}
		/>
	);
}
