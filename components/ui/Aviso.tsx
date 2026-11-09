import type { HTMLAttributes, ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Boton } from "./Boton";

export type TonoEstado = "info" | "exito" | "aviso" | "error";

/** Icono de cada estado: los estados siempre van con icono y texto, nunca solo con color. */
export const ICONOS_ESTADO: Record<TonoEstado, ReactNode> = {
	info: <Info />,
	exito: <CircleCheck />,
	aviso: <TriangleAlert />,
	error: <CircleAlert />,
};

/** Color del icono y del filete por estado. */
export const COLOR_ESTADO: Record<TonoEstado, string> = {
	info: "text-info border-info",
	exito: "text-exito border-exito",
	aviso: "text-aviso border-aviso",
	error: "text-error border-error",
};

// Fondo al 12 % del color del estado sobre la superficie (DESIGN.md § Estados), sin tokens nuevos.
const FONDO: Record<TonoEstado, string> = {
	info: "bg-[color-mix(in_oklab,var(--color-info)_12%,var(--color-superficie))]",
	exito: "bg-[color-mix(in_oklab,var(--color-exito)_12%,var(--color-superficie))]",
	aviso: "bg-[color-mix(in_oklab,var(--color-aviso)_12%,var(--color-superficie))]",
	error: "bg-[color-mix(in_oklab,var(--color-error)_12%,var(--color-superficie))]",
};

export interface AvisoProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "role"> {
	tono?: TonoEstado;
	/** Frase corta en negrita; el resto va en `children`. */
	titulo?: ReactNode;
	/** Acción en línea (un `Boton` compacto o un enlace). */
	accion?: ReactNode;
	/** Si se pasa, aparece el botón «Descartar». */
	alDescartar?: () => void;
	textoDescartar?: string;
	/**
	 * Rol de la región. Por defecto, `alert` en error (se lee al instante) y `status` en el resto.
	 * `null` para un aviso fijo de la página que no debe anunciarse al montarse.
	 */
	rol?: "status" | "alert" | null;
}

/**
 * Aviso en línea (DESIGN.md § Otros componentes base): filete y relleno del color del estado,
 * icono y texto. El texto va en el color principal, que contrasta más que el del estado.
 */
export function Aviso({
	tono = "info",
	titulo,
	accion,
	alDescartar,
	textoDescartar = "Descartar aviso",
	rol,
	className,
	children,
	...resto
}: AvisoProps) {
	const rolFinal = rol === undefined ? (tono === "error" ? "alert" : "status") : rol;
	return (
		<div
			role={rolFinal ?? undefined}
			data-tono={tono}
			className={cn(
				"flex items-start gap-3 rounded-tarjeta border py-3 ps-4",
				alDescartar ? "pe-1.5" : "pe-4",
				COLOR_ESTADO[tono],
				FONDO[tono],
				className,
			)}
			{...resto}
		>
			<span aria-hidden="true" className="mt-0.5 shrink-0 [&_svg]:size-5 [&_svg]:stroke-[1.5]">
				{ICONOS_ESTADO[tono]}
			</span>
			<div className="flex min-w-0 flex-1 flex-col items-start gap-2 py-0.5 text-(length:--texto-pequeno) leading-[1.5] text-texto-principal">
				<div className="flex flex-col gap-0.5 [text-wrap:pretty]">
					{titulo && <p className="m-0 font-semibold">{titulo}</p>}
					{children && <div className="m-0 text-texto-principal [&>p]:m-0">{children}</div>}
				</div>
				{accion}
			</div>
			{alDescartar && (
				<Boton variante="fantasma" soloIcono icono={<X />} onClick={alDescartar} className="-my-1.5 shrink-0">
					{textoDescartar}
				</Boton>
			)}
		</div>
	);
}
