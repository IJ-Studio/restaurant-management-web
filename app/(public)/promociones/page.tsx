"use client";

import { useCallback, useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { EncabezadoPublico } from "@/components/marca/EncabezadoPublico";
import { EsqueletoTarjetas } from "@/components/landing/secciones/EsqueletoTarjetas";
import { TarjetaPromocion } from "@/components/landing/secciones/PromocionesLanding";
import OnlineOnly from "@/components/pwa/OnlineOnly";
import { type Promotion, type PromotionRow, mapPromotionRow } from "@/features/shared/data/promotions";
import { promocionesVigentes } from "@/lib/publico/promociones-vigentes";
import { registrarError } from "@/lib/registro/registrar-error";

/**
 * Promociones (`/promociones`, PLAN 4.21, D-08): la página se conserva con su URL y sus migas.
 * Pide `${API}/promociones` como siempre y muestra las **vigentes** (activas y dentro de sus
 * fechas), igual que la landing (D-19), con la misma tarjeta. Si el API falla, lo dice con
 * «Reintentar» (antes se quedaba en «no hay promociones», un vacío falso: PRODUCT.md, principio 3).
 */
const API = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

function Lista() {
	const [promos, setPromos] = useState<Promotion[]>([]);
	const [estado, setEstado] = useState<"cargando" | "error" | "lista">("cargando");

	const cargar = useCallback(async () => {
		setEstado("cargando");
		try {
			const res = await fetch(`${API}/promociones`, { cache: "no-store" });
			if (!res.ok) throw new Error(`promociones ${res.status}`);
			const data: PromotionRow[] = await res.json();
			setPromos(promocionesVigentes((Array.isArray(data) ? data : []).map(mapPromotionRow)));
			setEstado("lista");
		} catch (e) {
			registrarError(e, "promociones");
			setEstado("error");
		}
	}, []);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
		void cargar();
	}, [cargar]);

	if (estado === "cargando") return <EsqueletoTarjetas columnas="md:grid-cols-2 lg:grid-cols-3" cuantas={3} />;
	if (estado === "error") return <EstadoError titulo="No pudimos traer las promociones" descripcion="Vuelve a intentarlo en un momento." alReintentar={cargar} />;
	if (promos.length === 0)
		return (
			<EstadoVacio
				icono={<Tag />}
				titulo="Ahora mismo no hay promociones vigentes"
				descripcion="Mientras tanto, la carta completa te espera."
				accion={
					<BotonEnlace href="/menu" variante="secundario">
						Ver la carta
					</BotonEnlace>
				}
			/>
		);
	return (
		<ul className="m-0 grid list-none grid-cols-1 gap-(--espacio-xl) p-0 md:grid-cols-2 lg:grid-cols-3" aria-label="Promociones vigentes">
			{promos.map((p) => (
				<li key={p.id}>
					<TarjetaPromocion promocion={p} nivelTitulo={2} />
				</li>
			))}
		</ul>
	);
}

export default function PaginaPromociones() {
	return (
		<div className="contenedor-pagina pb-(--espacio-entre-secciones)">
			<EncabezadoPublico ruta="/promociones" titulo="Promociones" entradilla="Las propuestas vigentes de la casa, con su precio y hasta cuándo." />
			<OnlineOnly what="las promociones vigentes">
				<Lista />
			</OnlineOnly>
		</div>
	);
}
