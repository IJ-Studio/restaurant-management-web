"use client";

import { useCallback, useEffect, useState } from "react";
import { ReceiptText } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { PlantillaPanel } from "@/components/paneles/PlantillaPanel";
import { Boton } from "@/components/ui/Boton";
import { Buscador } from "@/components/ui/Buscador";
import { Selector } from "@/components/ui/Campo";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Insignia } from "@/components/ui/Insignia";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import { api } from "@/lib/api";
import { primeraMayuscula } from "@/lib/formato/caja";
import { formatearDia } from "@/lib/formato/fecha";
import { formatearImporte } from "@/lib/formato/precio";
import { registrarError } from "@/lib/registro/registrar-error";
import { SolicitudesFactura } from "./SolicitudesFactura";

/**
 * Facturas (PLAN 5.5; PLAN-AMPLIACION D-24): el listado del administrador con `GET /facturas`,
 * paginado en el servidor (50 por página), con búsqueda por RFC, razón social o folio y filtro por
 * estatus. Sin datos de ejemplo: si no hay facturas, lo dice. Las facturas de cada pedido se siguen
 * pidiendo y descargando desde la confirmación del pago.
 */
interface Factura {
	id: string;
	ordenId: string;
	serie: string | null;
	folio: string | null;
	rfcReceptor: string;
	razonSocial: string;
	total: string | number | null;
	estatus: string | null;
	fechaEmision: string | null;
}
interface Pagina {
	facturas: Factura[];
	pagina: number;
	haySiguiente: boolean;
}

const importe = (v: Factura["total"]) => (v === null || v === "" ? "—" : (formatearImporte(Number(v)) ?? "—"));

export function Facturas() {
	const [pagina, setPagina] = useState(1);
	const [busqueda, setBusqueda] = useState("");
	const [estatus, setEstatus] = useState("todas");
	const [datos, setDatos] = useState<Pagina | null>(null);
	const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");

	const cargar = useCallback(async () => {
		setEstado("cargando");
		const params = new URLSearchParams({ pagina: String(pagina) });
		if (estatus !== "todas") params.set("estatus", estatus);
		if (busqueda.trim()) params.set("q", busqueda.trim());
		try {
			setDatos(await api.get<Pagina>(`/facturas?${params}`));
			setEstado("listo");
		} catch (e) {
			registrarError(e, "facturas: cargar");
			setEstado("error");
		}
	}, [pagina, estatus, busqueda]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial y al cambiar filtros
		void cargar();
	}, [cargar]);

	const filtrar = (f: () => void) => {
		f();
		setPagina(1);
	};

	const columnas: ColumnaTabla<Factura>[] = [
		{ clave: "folio", titulo: "Folio", principal: true, celda: (f) => [f.serie, f.folio].filter(Boolean).join("-") || "Sin folio" },
		{
			clave: "receptor",
			titulo: "Receptor",
			celda: (f) => (
				<span className="flex flex-col gap-0.5">
					<span>{primeraMayuscula(f.razonSocial)}</span>
					<span className="text-(length:--texto-pequeno) font-normal text-texto-secundario">{f.rfcReceptor}</span>
				</span>
			),
		},
		{ clave: "fecha", titulo: "Emitida", celda: (f) => formatearDia(f.fechaEmision) ?? "—" },
		{ clave: "total", titulo: "Total", numerica: true, celda: (f) => importe(f.total) },
		{
			clave: "estatus",
			titulo: "Estatus",
			celda: (f) =>
				f.estatus === "cancelada" ? (
					<Insignia tono="neutro" className="whitespace-nowrap">Cancelada</Insignia>
				) : (
					<Insignia tono="exito" className="whitespace-nowrap">Vigente</Insignia>
				),
		},
	];

	const filas = datos?.facturas ?? [];
	const filtrando = busqueda.trim() !== "" || estatus !== "todas";
	return (
		<PlantillaPanel titulo="Facturas" descripcion="Las facturas que piden los clientes al pagar su pedido.">
			<SolicitudesFactura alEmitir={() => void cargar()} />
			<BloquePanel
				titulo="Todas las facturas"
				acciones={
					<div className="flex w-full flex-wrap items-end gap-3 sm:w-auto">
						<Buscador etiqueta="Buscar por RFC, razón social o folio" valor={busqueda} alCambiar={(v) => filtrar(() => setBusqueda(v))} marcador="RFC, razón social o folio" />
						<Selector
							etiqueta="Estatus"
							opciones={[
								{ valor: "todas", texto: "Todas" },
								{ valor: "vigente", texto: "Vigentes" },
								{ valor: "cancelada", texto: "Canceladas" },
							]}
							value={estatus}
							onChange={(e) => filtrar(() => setEstatus(e.target.value))}
						/>
					</div>
				}
			>
				<Tabla
					leyenda="Facturas"
					columnas={columnas}
					filas={filas}
					claveFila={(f) => f.id}
					estado={estado === "cargando" ? "cargando" : "listo"}
					error={estado === "error" ? <EstadoError titulo="No pudimos traer las facturas" descripcion="Vuelve a intentarlo en un momento." alReintentar={cargar} /> : undefined}
					vacio={
						<EstadoVacio
							icono={<ReceiptText />}
							nivelTitulo={3}
							titulo={filtrando ? "Ninguna factura coincide" : "Todavía no hay facturas"}
							descripcion={filtrando ? "Prueba con otra búsqueda o quita el filtro." : "Aparecerán aquí cuando un cliente pida la suya al pagar."}
						/>
					}
				/>
				{(pagina > 1 || datos?.haySiguiente) && (
					<nav aria-label="Páginas de facturas" className="mt-(--espacio-md) flex items-center justify-between gap-3">
						<Boton variante="secundario" tamano="compacto" deshabilitado={pagina === 1 || estado === "cargando"} onClick={() => setPagina((p) => p - 1)}>
							Anterior
						</Boton>
						<span className="text-(length:--texto-pequeno) text-texto-secundario">Página {pagina}</span>
						<Boton variante="secundario" tamano="compacto" deshabilitado={!datos?.haySiguiente || estado === "cargando"} onClick={() => setPagina((p) => p + 1)}>
							Siguiente
						</Boton>
					</nav>
				)}
			</BloquePanel>
		</PlantillaPanel>
	);
}
