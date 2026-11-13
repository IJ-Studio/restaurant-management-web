"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FileDown } from "lucide-react";
import { Boton } from "@/components/ui/Boton";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { MigasDePan } from "@/components/ui/MigasDePan";
import { CargadorMarca } from "@/components/marca/CargadorMarca";
import { SelloCasa } from "@/components/marca/SelloCasa";
import { downloadAsFile } from "@/features/dashboard/admin/utils/menuUtils";
import { api, APIError } from "@/lib/api";
import { registrarError } from "@/lib/registro/registrar-error";

/**
 * Confirmación del pago (`/menu/pedido/checkout/exito`, PLAN 4.15). La lógica no cambia: busca
 * la factura del pedido (`/facturas/{ordenId}`) y la descarga en PDF o XML en otra pestaña.
 * Lo nuevo: el sello de la casa como firma, un mensaje sin promesas que nadie ha comprobado
 * (antes: «Te avisaremos cuando salga a reparto»), los botones del sistema y el cargador de
 * marca mientras busca la factura, sin «Cargando…» (D-20).
 */
export const dynamic = "force-dynamic";

function Confirmacion() {
	const searchParams = useSearchParams();
	const ordenId = searchParams?.get("ordenId");
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- la factura del API no tiene contrato tipado (NP-17)
	const [factura, setFactura] = useState<any>(null);
	const [buscando, setBuscando] = useState(Boolean(ordenId));

	useEffect(() => {
		if (!ordenId) return;
		(async () => {
			try {
				// Con la sesión: la factura es del cliente que pagó. 404 = aún no hay factura.
				setFactura(await api.get(`/facturas/${encodeURIComponent(ordenId)}`));
			} catch (e) {
				if (!(e instanceof APIError && e.statusCode === 404)) registrarError(e, "confirmación: factura");
			} finally {
				setBuscando(false);
			}
		})();
	}, [ordenId]);

	// Descarga con la sesión (una pestaña nueva no lleva el token).
	const descargarFactura = (tipo: "pdf" | "xml") =>
		void downloadAsFile(
			`${process.env.NEXT_PUBLIC_API_URL}/facturas/${encodeURIComponent(ordenId ?? "")}/descargar?tipo=${encodeURIComponent(tipo)}`,
			`factura-${ordenId}.${tipo}`,
		).catch((e) => registrarError(e, "confirmación: descargar factura"));

	return (
		<section aria-labelledby="exito-titulo" className="mx-auto flex max-w-[40rem] flex-col items-center gap-(--espacio-lg) py-(--espacio-3xl) text-center">
			<SelloCasa className="text-texto-principal" />
			<span aria-hidden="true" className="filete-doble" />
			<h1 id="exito-titulo" className="m-0 font-titulos text-(length:--texto-titulo-1) font-normal leading-[1.08] [text-wrap:balance]">
				Gracias, tu pedido está pagado
			</h1>
			<p className="m-0 max-w-[44ch] text-(length:--texto-entradilla) leading-[1.6] text-texto-secundario [text-wrap:pretty]">
				Ya lo estamos preparando. Puedes seguir su estado desde tu pedido.
			</p>
			{buscando ? (
				<CargadorMarca tamano="compacto" texto="Buscando tu factura…" />
			) : factura ? (
				<div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row" data-prueba="factura">
					<Boton variante="secundario" icono={<FileDown />} onClick={() => descargarFactura("pdf")}>
						Factura en PDF
					</Boton>
					<Boton variante="secundario" icono={<FileDown />} onClick={() => descargarFactura("xml")}>
						Factura en XML
					</Boton>
				</div>
			) : null}
			<BotonEnlace href="/menu/pedido?tab=domicilio" variante="primario">
				Ver tu pedido
			</BotonEnlace>
		</section>
	);
}

export default function PaginaPagoConfirmado() {
	return (
		<div className="contenedor-pagina pt-(--espacio-xl) pb-(--espacio-entre-secciones)">
			<MigasDePan ruta="/menu/pedido/checkout/exito" />
			<Suspense fallback={<CargadorMarca pagina tamano="amplio" texto="Un momento, por favor…" />}>
				<Confirmacion />
			</Suspense>
		</div>
	);
}
