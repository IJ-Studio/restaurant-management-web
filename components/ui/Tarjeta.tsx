import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import { CircleAlert, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Boton } from "./Boton";
import { Insignia } from "./Insignia";

export interface TarjetaProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
	como?: "article" | "section" | "div" | "li";
	titulo?: ReactNode;
	nivelTitulo?: 2 | 3 | 4;
	/** Título en Fraunces (platos, tarjetas destacadas de la parte pública). */
	destacada?: boolean;
	descripcion?: ReactNode;
	/** Insignia junto al título. */
	insignia?: ReactNode;
	/** Acciones al pie. En una tarjeta con enlace quedan por encima de él y se pueden pulsar. */
	pie?: ReactNode;
	/** La tarjeta entera lleva a esta ruta; el enlace es el título. */
	href?: string;
	/** Sin enlace y con el motivo escrito, nunca solo atenuada. */
	deshabilitada?: boolean;
	motivoDeshabilitada?: string;
	estado?: "listo" | "cargando" | "error";
	mensajeError?: string;
	alReintentar?: () => void | Promise<unknown>;
}

/** Superficie, filete sutil y radio de tarjeta, sin sombra (DESIGN.md § Cards). */
export function Tarjeta({
	como: Elemento = "article",
	titulo,
	nivelTitulo = 3,
	destacada = false,
	descripcion,
	insignia,
	pie,
	href,
	deshabilitada = false,
	motivoDeshabilitada = "No disponible",
	estado = "listo",
	mensajeError = "No se pudo cargar",
	alReintentar,
	className,
	children,
	...resto
}: TarjetaProps) {
	const Titulo = `h${nivelTitulo}` as const;
	const navegable = Boolean(href) && !deshabilitada && estado === "listo";

	const textoTitulo = navegable ? (
		<Link
			href={href!}
			className="enlace-tarjeta text-inherit no-underline focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
		>
			{titulo}
		</Link>
	) : (
		titulo
	);

	return (
		<Elemento
			aria-busy={estado === "cargando" || undefined}
			className={cn(
				"relative flex flex-col gap-4 rounded-tarjeta border p-6 text-texto-principal",
				"transition-[background-color,border-color] duration-(--duracion-breve) ease-estandar",
				deshabilitada ? "border-dashed border-borde-control bg-transparent" : "border-borde-sutil bg-superficie",
				navegable &&
					"al-pasar:border-borde-control al-pasar:bg-superficie-elevada " +
						"has-[.enlace-tarjeta:focus-visible]:outline-2 has-[.enlace-tarjeta:focus-visible]:outline-offset-3 " +
						"has-[.enlace-tarjeta:focus-visible]:outline-solid has-[.enlace-tarjeta:focus-visible]:outline-foco",
				className,
			)}
			{...resto}
		>
			{(titulo || insignia || deshabilitada) && (
				<div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
					{titulo && (
						<Titulo
							className={cn(
								"m-0",
								destacada
									? "font-titulos text-(length:--texto-titulo-3) font-medium leading-[1.2]"
									: "font-texto text-(length:--texto-titulo-interfaz) font-semibold leading-[1.35]",
							)}
						>
							{textoTitulo}
						</Titulo>
					)}
					{deshabilitada ? <Insignia tono="neutro">{motivoDeshabilitada}</Insignia> : insignia}
				</div>
			)}

			{estado === "cargando" ? (
				<div className="flex flex-col gap-2.5" aria-hidden="true">
					{["w-full", "w-11/12", "w-2/3"].map((ancho) => (
						<span
							key={ancho}
							className={cn(
								// Café y no elevada: en claro, la elevada es blanca sobre hueso y no se ve.
								"block h-3.5 rounded-control bg-superficie-cafe",
								"animate-pulse motion-reduce:animate-none in-data-[movimiento=reducido]:animate-none",
								ancho,
							)}
						/>
					))}
					<span className="solo-lectores">Cargando…</span>
				</div>
			) : estado === "error" ? (
				<div className="flex flex-col items-start gap-3">
					<p className="m-0 flex items-center gap-2 text-error [&_svg]:size-4 [&_svg]:stroke-[1.5]">
						<CircleAlert aria-hidden="true" />
						<span>{mensajeError}</span>
					</p>
					{alReintentar && (
						<Boton variante="secundario" tamano="compacto" icono={<RotateCcw />} onClick={alReintentar}>
							Reintentar
						</Boton>
					)}
				</div>
			) : (
				<>
					{descripcion && (
						<p className="m-0 max-w-(--ancho-lectura) text-(length:--texto-pequeno) leading-[1.5] text-texto-secundario">
							{descripcion}
						</p>
					)}
					{children}
				</>
			)}

			{pie && estado === "listo" && <div className="relative z-10 mt-auto flex flex-wrap gap-3">{pie}</div>}
		</Elemento>
	);
}
