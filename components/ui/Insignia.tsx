import type { HTMLAttributes, ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export type TonoInsignia = "neutro" | "acento" | "exito" | "aviso" | "error" | "info";

export interface InsigniaProps extends HTMLAttributes<HTMLSpanElement> {
	tono?: TonoInsignia;
	/** Sustituye el icono del tono; `null` lo quita (solo en neutro y acento no hay uno por defecto). */
	icono?: ReactNode | null;
	/** Cifra de un contador; se pinta con números tabulares. */
	contador?: number;
	/** Lo que lee un lector de pantalla en un contador («3 pedidos nuevos»). */
	descripcion?: string;
}

// Los estados siempre llevan icono y texto, nunca solo color (DESIGN.md § Estados).
const ICONOS: Partial<Record<TonoInsignia, ReactNode>> = {
	exito: <CircleCheck />,
	aviso: <TriangleAlert />,
	error: <CircleAlert />,
	info: <Info />,
};

// Fondo = 12 % del color del estado sobre la superficie, como los avisos.
const TONOS: Record<TonoInsignia, string> = {
	neutro: "border-borde-control bg-superficie-elevada text-texto-principal",
	acento: "border-acento bg-transparent text-acento",
	exito: "border-exito bg-[color-mix(in_oklab,var(--color-exito)_12%,var(--color-superficie))] text-exito",
	aviso: "border-aviso bg-[color-mix(in_oklab,var(--color-aviso)_12%,var(--color-superficie))] text-aviso",
	error: "border-error bg-[color-mix(in_oklab,var(--color-error)_12%,var(--color-superficie))] text-error",
	info: "border-info bg-[color-mix(in_oklab,var(--color-info)_12%,var(--color-superficie))] text-info",
};

/** Insignia de estado o contador. No es interactiva: no tiene hover ni foco. */
export function Insignia({ tono = "neutro", icono, contador, descripcion, className, children, ...resto }: InsigniaProps) {
	const iconoFinal = icono === null ? null : (icono ?? ICONOS[tono]);
	const esContador = contador !== undefined;
	return (
		<span
			className={cn(
				"inline-flex max-w-full items-center gap-1.5 rounded-pastilla border font-texto font-semibold uppercase",
				"text-(length:--texto-etiqueta) leading-[1.2] tracking-[0.16em]",
				"[&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:stroke-[1.5]",
				esContador ? "min-w-6 justify-center px-2 py-0.5 tracking-normal numeros-tabulares" : "px-2.5 py-1",
				TONOS[tono],
				className,
			)}
			{...resto}
		>
			{iconoFinal && <span aria-hidden="true">{iconoFinal}</span>}
			{esContador ? (
				<>
					<span aria-hidden={descripcion ? true : undefined}>{contador}</span>
					{descripcion && <span className="solo-lectores">{descripcion}</span>}
				</>
			) : (
				<span>{children}</span>
			)}
		</span>
	);
}
