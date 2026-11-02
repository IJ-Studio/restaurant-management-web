import type { HTMLAttributes, ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Estado vacío (DESIGN.md § Otros componentes base): ilustración lineal mínima, una frase que
 * explica por qué no hay nada y, si se puede, la acción que lo resuelve.
 *
 * La ilustración es un icono de Lucide a 2,5rem con trazo fino, sin círculo: la única forma
 * circular grande es el sello de la casa. Su color, el tenue, pasa de 3:1 en los dos temas.
 */
export interface EstadoVacioProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
	icono?: ReactNode;
	/** Qué falta, en una frase: «Aún no hay reservas para hoy». */
	titulo: ReactNode;
	/** Por qué, o qué pasará: «Las reservas confirmadas aparecerán aquí». */
	descripcion?: ReactNode;
	/** Un `Boton` o `BotonEnlace` que lo resuelve. */
	accion?: ReactNode;
	nivelTitulo?: 2 | 3 | 4;
	/** Sin filete: dentro de una tarjeta o de un panel que ya lo tiene. */
	sinMarco?: boolean;
}

export function EstadoVacio({
	icono = <Inbox />,
	titulo,
	descripcion,
	accion,
	nivelTitulo = 3,
	sinMarco = false,
	className,
	...resto
}: EstadoVacioProps) {
	const Titulo = `h${nivelTitulo}` as const;
	return (
		<div
			className={cn(
				"flex min-w-0 flex-col items-center gap-4 px-4 py-10 text-center sm:px-6",
				!sinMarco && "rounded-tarjeta border border-borde-sutil",
				className,
			)}
			{...resto}
		>
			<span aria-hidden="true" className="text-texto-tenue [&_svg]:size-10 [&_svg]:stroke-1">
				{icono}
			</span>
			<div className="flex max-w-[45ch] flex-col gap-1.5">
				<Titulo className="m-0 font-texto text-(length:--texto-titulo-interfaz) font-semibold leading-[1.35] [text-wrap:balance]">
					{titulo}
				</Titulo>
				{descripcion && (
					<p className="m-0 text-(length:--texto-pequeno) leading-[1.5] text-texto-secundario [text-wrap:pretty]">{descripcion}</p>
				)}
			</div>
			{/* Una acción larga pasa a dos líneas antes que desbordar a 360 px con texto al 125 % (WCAG 1.4.10). */}
			{accion && (
				<div className="flex max-w-full flex-wrap justify-center gap-3 [&>*]:max-w-full [&>*]:whitespace-normal [&>*]:text-center">{accion}</div>
			)}
		</div>
	);
}
