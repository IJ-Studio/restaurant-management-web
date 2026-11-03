"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Phone } from "lucide-react";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { Esqueleto, EsqueletoLineas, ZonaCargando } from "@/components/ui/Esqueleto";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Imagen } from "@/components/ui/Imagen";
import { EncabezadoPublico } from "@/components/marca/EncabezadoPublico";
import { PaginaEstado } from "@/components/marca/PaginaEstado";
import { TEXTOS_ESTADO } from "@/components/marca/textos-estado";
import { TarjetaPlato } from "@/components/carta/TarjetaPlato";
import OnlineOnly from "@/components/pwa/OnlineOnly";
import { restaurantConfig } from "@/config/restaurant.config";
import { registrarError } from "@/lib/registro/registrar-error";

/**
 * Una sección de la carta (`/menu/categoria/[slug]`, PLAN 4.11). Cliente: la misma petición de
 * siempre (`/menu/categories/with-products` del API) y los mismos enlaces a cada plato.
 *
 * - Cargando: esqueletos, sin «Cargando categoría…» (D-20).
 * - Error: cálido, con «Reintentar» y «Llamar al restaurante».
 * - Sin la categoría pedida: `PaginaEstado` con su ilustración (D-21), en lugar del 404 genérico.
 * - Tolera los nombres en español o en inglés que ya aceptaba (`nombre`/`name`, `platillos`/`products`…).
 */
interface Producto {
	id: string | number;
	nombre?: string;
	name?: string;
	descripcion?: string;
	description?: string;
	precio?: number | string;
	price?: number | string;
	imagenUrl?: string;
	imageUrl?: string;
	disponible?: boolean;
	available?: boolean;
}
interface Categoria {
	id: string | number;
	nombre?: string;
	name?: string;
	descripcion?: string;
	description?: string;
	imageUrl?: string;
	products?: Producto[];
	platillos?: Producto[];
	productos?: Producto[];
}

type Estado = { tipo: "cargando" } | { tipo: "error" } | { tipo: "no-existe" } | { tipo: "lista"; categoria: Categoria };

const cifra = (v: unknown) => {
	const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
	return Number.isFinite(n) ? n : null;
};

export default function PaginaCategoria() {
	return (
		<OnlineOnly what="esta sección de la carta" extra={<Llamar />}>
			<Contenido />
		</OnlineOnly>
	);
}

function Llamar() {
	return (
		<BotonEnlace href={restaurantConfig.contact.phoneHref} variante="fantasma" icono={<Phone />}>
			Llamar al restaurante
		</BotonEnlace>
	);
}

function Contenido() {
	const { slug } = useParams() as { slug: string };
	const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

	const cargar = useCallback(async () => {
		setEstado({ tipo: "cargando" });
		try {
			// Sin respaldo a localhost: el build exige la variable (PLAN 2.16).
			const api = process.env.NEXT_PUBLIC_API_URL ?? "";
			const res = await fetch(`${api}/menu/categories/with-products`, { cache: "no-store" });
			if (!res.ok) throw new Error(`categoría ${res.status}`);
			const datos: unknown = await res.json();
			const encontrada = Array.isArray(datos) ? (datos as Categoria[]).find((c) => String(c.id) === String(slug)) : undefined;
			setEstado(encontrada ? { tipo: "lista", categoria: encontrada } : { tipo: "no-existe" });
		} catch (error) {
			registrarError(error, "categoría de la carta");
			setEstado({ tipo: "error" });
		}
	}, [slug]);

	useEffect(() => {
		// Carga inicial y al cambiar de categoría.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		void cargar();
	}, [cargar]);

	const ruta = `/menu/categoria/${slug}`;

	if (estado.tipo === "no-existe")
		return (
			<PaginaEstado
				{...TEXTOS_ESTADO.categoriaNoEncontrada}
				pantallaCompleta={false}
				acciones={
					<BotonEnlace href="/menu" variante="primario" icono={<ArrowLeft />}>
						Ver la carta
					</BotonEnlace>
				}
			/>
		);

	if (estado.tipo !== "lista")
		return (
			<div className="contenedor-pagina pb-(--espacio-entre-secciones)">
				<EncabezadoPublico ruta={ruta} actual="Sección" titulo="La carta" />
				{estado.tipo === "error" ? (
					<EstadoError
						titulo="No pudimos traer esta sección"
						descripcion="A veces tarda un poco más de la cuenta. Vuelve a intentarlo o llámanos."
						alReintentar={cargar}
						accion={<Llamar />}
					/>
				) : (
					<ZonaCargando cargando texto="Preparando la sección…">
						<div className="grid grid-cols-1 gap-(--espacio-xl) sm:grid-cols-2 lg:grid-cols-3">
							{[0, 1, 2].map((i) => (
								<div key={i} className="flex flex-col gap-(--espacio-md)">
									<Esqueleto className="aspect-[4/5] w-full" />
									<Esqueleto className="h-6 w-2/3" />
									<EsqueletoLineas lineas={2} />
								</div>
							))}
						</div>
					</ZonaCargando>
				)}
			</div>
		);

	const { categoria } = estado;
	const nombre = categoria.nombre || categoria.name || "Sección de la carta";
	const descripcion = categoria.descripcion || categoria.description;
	const productos = categoria.platillos || categoria.productos || categoria.products || [];

	return (
		<div className="contenedor-pagina pb-(--espacio-entre-secciones)">
			<EncabezadoPublico ruta={ruta} actual={nombre} titulo={nombre} entradilla={descripcion} />
			{categoria.imageUrl && (
				<div className="relative mb-(--espacio-2xl) aspect-[21/9] overflow-hidden rounded-tarjeta border border-borde-sutil bg-superficie">
					<Imagen src={categoria.imageUrl} decorativa fill preload sizes="(min-width: 72rem) 72rem, 100vw" className="object-cover" />
				</div>
			)}
			{productos.length === 0 ? (
				<EstadoVacio
					titulo="Esta sección todavía no tiene platos publicados"
					descripcion="Mientras tanto, el resto de la carta te espera."
					accion={
						<BotonEnlace href="/menu" variante="secundario">
							Ver la carta
						</BotonEnlace>
					}
				/>
			) : (
				<ul className="m-0 grid list-none grid-cols-1 gap-(--espacio-xl) p-0 sm:grid-cols-2 lg:grid-cols-3" aria-label={`Platos de ${nombre}`}>
					{productos.map((p) => (
						<li key={p.id}>
							<TarjetaPlato
								id={p.id}
								nombre={p.nombre || p.name || "Plato de la casa"}
								descripcion={p.descripcion || p.description}
								precio={cifra(p.precio ?? p.price)}
								imagen={p.imagenUrl || p.imageUrl}
								disponible={p.disponible ?? p.available ?? true}
							/>
						</li>
					))}
				</ul>
			)}
			<div className="mt-(--espacio-2xl)">
				<BotonEnlace href="/menu" variante="secundario" icono={<ArrowLeft />}>
					Ver todas las secciones
				</BotonEnlace>
			</div>
		</div>
	);
}
