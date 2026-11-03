import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CopaVolcada, LlaveBodega, MesaReloj, MolinoQuieto, OllaHumeante, PlatoCloche, PuertaCandado } from "./ilustraciones";

/**
 * Página de estado (PLAN 4.0.2 y 4.23, D-21): un solo diseño para 401, 403, 404, 500, el error de
 * un segmento o global, mantenimiento, sin conexión y plato o categoría no encontrados.
 *
 * De arriba abajo: la ilustración propia del tipo, el código en Fraunces itálica de acento (como
 * el número de lote), el filete doble, el título, el texto y las acciones. Sin códigos técnicos más
 * allá del número de estado, sin trazas y sin la ruta pedida.
 */
export type TipoEstado =
	| "no-encontrado"
	| "sin-sesion"
	| "prohibido"
	| "error-servidor"
	| "error"
	| "mantenimiento"
	| "sin-conexion";

const ILUSTRACION: Record<TipoEstado, (p: { className?: string }) => ReactNode> = {
	"no-encontrado": PlatoCloche,
	"sin-sesion": LlaveBodega,
	prohibido: PuertaCandado,
	"error-servidor": OllaHumeante,
	error: CopaVolcada,
	mantenimiento: MesaReloj,
	"sin-conexion": MolinoQuieto,
};

export interface PaginaEstadoProps {
	tipo: TipoEstado;
	/** Número de estado visible («404»). Se omite en mantenimiento y sin conexión. */
	codigo?: string;
	titulo: ReactNode;
	texto: ReactNode;
	/** Botones o enlaces; el primero es la salida principal. */
	acciones?: ReactNode;
	/** `h1` en una página; `h2` dentro de un límite de error que vive bajo el `h1` del layout. */
	nivelTitulo?: 1 | 2;
	/** Ocupa el alto de la pantalla menos la cabecera (por defecto) o solo su contenido. */
	pantallaCompleta?: boolean;
	/** Contenido extra bajo las acciones (p. ej., el código para soporte de un error). */
	pie?: ReactNode;
	className?: string;
}

export function PaginaEstado({
	tipo,
	codigo,
	titulo,
	texto,
	acciones,
	nivelTitulo = 1,
	pantallaCompleta = true,
	pie,
	className,
}: PaginaEstadoProps) {
	const Ilustracion = ILUSTRACION[tipo];
	const Titulo = `h${nivelTitulo}` as const;
	return (
		<section
			data-pagina-estado={tipo}
			className={cn(
				"mx-auto flex w-full max-w-[44rem] flex-col items-center justify-center gap-8 px-(--margen-pagina) py-(--espacio-3xl) text-center",
				pantallaCompleta && "min-h-[calc(100dvh-var(--alto-cabecera))]",
				className,
			)}
		>
			<Ilustracion className="w-[min(16rem,70vw)] text-texto-principal md:w-72" />
			<div className="flex flex-col items-center gap-4">
				{codigo && (
					<p className="m-0 font-titulos text-(length:--texto-titulo-2) leading-none text-acento italic numeros-tabulares">
						<span className="solo-lectores">Código </span>
						{codigo}
					</p>
				)}
				<span aria-hidden="true" className="filete-doble" />
				<Titulo className="m-0 max-w-[22ch] font-titulos text-(length:--texto-titulo-1) font-normal leading-[1.08] text-texto-principal [text-wrap:balance]">
					{titulo}
				</Titulo>
				<p className="m-0 max-w-[48ch] text-(length:--texto-entradilla) leading-[1.6] text-texto-secundario [text-wrap:pretty]">{texto}</p>
			</div>
			{acciones && (
				<div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-center [&>*]:whitespace-normal">
					{acciones}
				</div>
			)}
			{pie}
		</section>
	);
}
