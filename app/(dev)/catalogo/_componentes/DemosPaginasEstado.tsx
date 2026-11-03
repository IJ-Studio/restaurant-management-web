"use client";

import { Phone, RotateCcw } from "lucide-react";
import { Boton, BotonEnlace } from "@/components/ui";
import { PaginaEstado } from "@/components/marca/PaginaEstado";
import { TEXTOS_ESTADO, type TextoEstado } from "@/components/marca/textos-estado";
import { restaurantConfig } from "@/config/restaurant.config";
import { Muestra } from "./Muestra";

const Inicio = () => (
	<BotonEnlace href="#paginas-estado" variante="primario">
		Volver al inicio
	</BotonEnlace>
);
const Carta = ({ variante = "secundario" as const }: { variante?: "primario" | "secundario" }) => (
	<BotonEnlace href="#paginas-estado" variante={variante}>
		Ver la carta
	</BotonEnlace>
);
const Reintentar = () => (
	<Boton variante="primario" icono={<RotateCcw />} onClick={() => undefined}>
		Reintentar
	</Boton>
);
const Llamar = () => (
	<BotonEnlace href={restaurantConfig.contact.phoneHref} variante="secundario" icono={<Phone />}>
		Llamar al restaurante
	</BotonEnlace>
);

const EJEMPLOS: { clave: keyof typeof TEXTOS_ESTADO; uso: string; acciones: React.ReactNode }[] = [
	{ clave: "noEncontrado", uso: "not-found de la raíz y de cada segmento", acciones: (<><Inicio /><Carta /></>) },
	{ clave: "platoNoEncontrado", uso: "/menu/producto/[id] sin plato", acciones: <Carta variante="primario" /> },
	{ clave: "categoriaNoEncontrada", uso: "/menu/categoria/[slug] sin categoría", acciones: <Carta variante="primario" /> },
	{ clave: "sinSesion", uso: "/unauthorized", acciones: (<><BotonEnlace href="#paginas-estado" variante="primario">Iniciar sesión</BotonEnlace><BotonEnlace href="#paginas-estado" variante="secundario">Volver al inicio</BotonEnlace></>) },
	{ clave: "prohibido", uso: "/forbidden", acciones: <Inicio /> },
	{ clave: "errorServidor", uso: "error.tsx de cada segmento", acciones: (<><Reintentar /><BotonEnlace href="#paginas-estado" variante="secundario">Volver al inicio</BotonEnlace></>) },
	{ clave: "error", uso: "global-error", acciones: (<><Reintentar /><Llamar /></>) },
	{ clave: "mantenimiento", uso: "/maintenance", acciones: <Llamar /> },
	{ clave: "sinConexion", uso: "/offline", acciones: <Reintentar /> },
];

/** Contenido de la sección «Páginas de estado» del catálogo (PLAN 4.0.2, D-21). */
export function DemosPaginasEstado() {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			{EJEMPLOS.map(({ clave, uso, acciones }) => {
				const t: TextoEstado = TEXTOS_ESTADO[clave];
				return (
					<div key={clave} className="flex min-w-0 flex-col gap-2" data-prueba={`pagina-${clave}`}>
						<code className="text-(length:--texto-pequeno) text-texto-tenue">
							{t.tipo}
							{t.codigo ? ` · ${t.codigo}` : ""} · {uso}
						</code>
						<Muestra ancho>
							<div className="rounded-tarjeta border border-borde-sutil">
								<PaginaEstado {...t} nivelTitulo={2} pantallaCompleta={false} acciones={acciones} />
							</div>
						</Muestra>
					</div>
				);
			})}
		</div>
	);
}
