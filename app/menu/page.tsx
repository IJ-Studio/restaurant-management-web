"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Phone, SearchX } from "lucide-react";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { Buscador } from "@/components/ui/Buscador";
import { Esqueleto, EsqueletoLineas, ZonaCargando } from "@/components/ui/Esqueleto";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Imagen } from "@/components/ui/Imagen";
import { EncabezadoPublico } from "@/components/marca/EncabezadoPublico";
import { BotonDictado } from "@/components/pwa/BotonDictado";
import OnlineOnly from "@/components/pwa/OnlineOnly";
import { restaurantConfig } from "@/config/restaurant.config";
import { useFiltroLocal } from "@/hooks/useBusqueda";
import { formatearPrecio } from "@/lib/formato/precio";
import { registrarError } from "@/lib/registro/registrar-error";
import { cn } from "@/lib/utils";

/**
 * La carta (`/menu`, PLAN 4.10). Cliente: pide las categorías a la ruta interna de siempre
 * (`GET /menu/categories/with-products` del API, directo desde D-32: ya no pasa por una ruta interna),
 * sin cambiar los enlaces de categoría y plato.
 *
 * - Carga con esqueletos del tamaño de lo que viene, sin «Cargando menú…» (D-20).
 * - Error cálido con «Reintentar» y «Llamar al restaurante»; nunca el texto de la excepción.
 * - Búsqueda en memoria con `Buscador` (sin tildes ni mayúsculas) y dictado por voz si el
 *   navegador lo admite. Los resultados enlazan al plato.
 * - Sin la foto de portada repetida de la landing ni la máscara en línea del diseño anterior.
 */
interface Plato {
	id: number;
	nombre: string;
	descripcion?: string;
	precio: string | number;
	imagenUrl?: string;
}
interface Categoria {
	id: number;
	nombre: string;
	imagenUrl?: string;
	platillos: Plato[];
}

const POR_SECCION = 4;
const precio = (p: Plato) => formatearPrecio(typeof p.precio === "number" ? p.precio : Number(p.precio));

export default function PaginaCarta() {
	return (
		<div className="contenedor-pagina pb-(--espacio-entre-secciones)">
			<EncabezadoPublico
				ruta="/menu"
				titulo="La carta"
				entradilla="Recorre la carta por secciones o busca un plato por su nombre."
			/>
			<OnlineOnly what="la carta" extra={<Llamar />}>
				<Carta />
			</OnlineOnly>
		</div>
	);
}

function Llamar() {
	return (
		<BotonEnlace href={restaurantConfig.contact.phoneHref} variante="fantasma" icono={<Phone />}>
			Llamar al restaurante
		</BotonEnlace>
	);
}

function Carta() {
	const [categorias, setCategorias] = useState<Categoria[]>([]);
	const [estado, setEstado] = useState<"cargando" | "error" | "lista">("cargando");
	const [consulta, setConsulta] = useState("");

	const cargar = useCallback(async () => {
		setEstado("cargando");
		try {
			const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "")}/menu/categories/with-products`, { cache: "no-store" });
			if (!res.ok) throw new Error(`carta ${res.status}`);
			const datos: unknown = await res.json();
			setCategorias(Array.isArray(datos) ? (datos as Categoria[]) : []);
			setEstado("lista");
		} catch (error) {
			registrarError(error, "carta");
			setEstado("error");
		}
	}, []);

	useEffect(() => {
		// Carga inicial: el estado se actualiza cuando llega la respuesta.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		void cargar();
	}, [cargar]);

	const platos = useMemo(
		() => categorias.flatMap((c) => (c.platillos ?? []).map((p) => ({ plato: p, categoria: c }))),
		[categorias],
	);
	const texto = useCallback(({ plato, categoria }: (typeof platos)[number]) => `${plato.nombre} ${plato.descripcion ?? ""} ${categoria.nombre}`, []);
	const { filtrados, pendiente } = useFiltroLocal(platos, consulta, texto);
	const buscando = consulta.trim().length > 0;

	if (estado === "error")
		return (
			<EstadoError
				titulo="No pudimos traer la carta"
				descripcion="A veces tarda un poco más de la cuenta. Vuelve a intentarlo o llámanos y te la contamos."
				alReintentar={cargar}
				accion={<Llamar />}
			/>
		);

	return (
		<div className="flex flex-col gap-(--espacio-2xl)">
			<div className="flex items-end gap-2">
				<Buscador
					className="min-w-0 flex-1 md:max-w-[32rem]"
					etiqueta="Buscar en la carta"
					valor={consulta}
					alCambiar={setConsulta}
					marcador="Nombre del plato…"
					ocupado={pendiente}
					anuncio={
						buscando
							? filtrados.length === 0
								? `Sin resultados para «${consulta.trim()}»`
								: `${filtrados.length} ${filtrados.length === 1 ? "plato" : "platos"}`
							: undefined
					}
				/>
				<BotonDictado alDictar={setConsulta} />
			</div>

			<ZonaCargando cargando={estado === "cargando"} texto="Preparando la carta…">
				{estado === "cargando" ? (
					<EsqueletoCarta />
				) : categorias.length === 0 ? (
					<EstadoVacio titulo="Todavía no hay platos publicados" descripcion="Vuelve pronto o llámanos para conocer la carta del día." accion={<Llamar />} />
				) : buscando ? (
					<Resultados consulta={consulta.trim()} resultados={filtrados} alLimpiar={() => setConsulta("")} />
				) : (
					<Secciones categorias={categorias} />
				)}
			</ZonaCargando>
		</div>
	);
}

function EsqueletoCarta() {
	return (
		<div className="flex flex-col gap-(--espacio-2xl)">
			{[0, 1].map((i) => (
				<div key={i} className="grid gap-(--espacio-xl) md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
					<Esqueleto className="aspect-[4/3] w-full" />
					<div className="flex flex-col gap-4">
						<Esqueleto className="h-8 w-1/2" />
						<EsqueletoLineas lineas={6} />
					</div>
				</div>
			))}
		</div>
	);
}

function FilaPlato({ plato, enlace }: { plato: Plato; enlace?: boolean }) {
	const cifra = precio(plato);
	const nombre = <span className="font-titulos text-(length:--texto-titulo-3) font-medium leading-[1.25]">{plato.nombre}</span>;
	return (
		<div className="flex flex-col gap-1 border-b border-borde-sutil py-(--espacio-md)">
			<div className="flex items-baseline justify-between gap-(--espacio-md)">
				{enlace ? (
					<Link
						href={`/menu/producto/${plato.id}`}
						className="rounded-control text-texto-principal no-underline decoration-acento decoration-1 underline-offset-4 al-pasar:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
					>
						{nombre}
					</Link>
				) : (
					nombre
				)}
				{cifra && <span className="shrink-0 text-(length:--texto-cifra-tabla) font-medium numeros-tabulares">{cifra}</span>}
			</div>
			{plato.descripcion && <p className="m-0 max-w-[60ch] text-(length:--texto-pequeno) leading-[1.5] text-texto-secundario [text-wrap:pretty]">{plato.descripcion}</p>}
		</div>
	);
}

function Secciones({ categorias }: { categorias: Categoria[] }) {
	return (
		<div className="flex flex-col gap-(--espacio-2xl)">
			<nav aria-label="Secciones de la carta">
				<ul className="m-0 flex list-none flex-wrap gap-x-(--espacio-lg) gap-y-1 p-0">
					{categorias.map((c) => (
						<li key={c.id}>
							<a href={`#seccion-${c.id}`} className="enlace-subrayado inline-flex min-h-11 items-center text-texto-secundario al-pasar:text-texto-principal">
								{c.nombre}
							</a>
						</li>
					))}
				</ul>
			</nav>
			{categorias.map((c, i) => {
				// Sin foto propia, la del primer plato que la tenga; si ninguna, el respaldo de Imagen.
				const foto = c.imagenUrl || c.platillos?.find((p) => p.imagenUrl)?.imagenUrl;
				const platos = (c.platillos ?? []).slice(0, POR_SECCION);
				return (
					<section
						key={c.id}
						id={`seccion-${c.id}`}
						aria-labelledby={`seccion-${c.id}-titulo`}
						className={cn(
							"grid scroll-mt-[calc(var(--alto-cabecera)+var(--espacio-md))] items-start gap-(--espacio-xl) border-t border-borde-sutil pt-(--espacio-2xl)",
							// La foto va siempre en la columna estrecha, a la izquierda o a la derecha.
							i % 2 === 1 ? "md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]" : "md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]",
						)}
					>
						<div className={i % 2 === 1 ? "md:order-2" : undefined}>
							<div className="relative aspect-[4/3] overflow-hidden rounded-tarjeta border border-borde-sutil bg-superficie">
								<Imagen src={foto} alt={c.nombre} fill sizes="(min-width: 48rem) 40vw, 100vw" className="object-cover" />
							</div>
						</div>
						<div className="flex flex-col gap-(--espacio-sm)">
							<h2 id={`seccion-${c.id}-titulo`} className="m-0 font-titulos text-(length:--texto-titulo-2) font-normal leading-[1.15]">
								{c.nombre}
							</h2>
							{platos.length > 0 ? (
								<div>
									{platos.map((p) => (
										<FilaPlato key={p.id} plato={p} enlace />
									))}
								</div>
							) : (
								<p className="m-0 text-texto-secundario">Esta sección todavía no tiene platos publicados.</p>
							)}
							<div className="pt-(--espacio-xs)">
								<BotonEnlace
									href={`/menu/categoria/${c.id}?bg=${encodeURIComponent(c.imagenUrl || "")}`}
									variante="fantasma"
									icono={<ArrowRight />}
									posicionIcono="fin"
									className="-ms-3"
								>
									{`Ver toda la sección${(c.platillos?.length ?? 0) > POR_SECCION ? ` (${c.platillos.length})` : ""}`}
								</BotonEnlace>
							</div>
						</div>
					</section>
				);
			})}
		</div>
	);
}

function Resultados({
	consulta,
	resultados,
	alLimpiar,
}: {
	consulta: string;
	resultados: { plato: Plato; categoria: Categoria }[];
	alLimpiar: () => void;
}) {
	if (resultados.length === 0)
		return (
			<EstadoVacio
				icono={<SearchX />}
				titulo={`Ningún plato coincide con «${consulta}»`}
				descripcion="Prueba con otra palabra o recorre la carta por secciones."
				accion={
					<button type="button" onClick={alLimpiar} className="enlace-subrayado min-h-11 text-texto-principal">
						Ver toda la carta
					</button>
				}
			/>
		);
	return (
		<ul className="m-0 flex max-w-3xl list-none flex-col p-0" aria-label={`Resultados para «${consulta}»`}>
			{resultados.map(({ plato, categoria }) => (
				<li key={`${categoria.id}-${plato.id}`}>
					<p className="m-0 mt-(--espacio-sm) text-(length:--texto-etiqueta) font-semibold uppercase tracking-[0.16em] text-texto-tenue">{categoria.nombre}</p>
					<FilaPlato plato={plato} enlace />
				</li>
			))}
		</ul>
	);
}
