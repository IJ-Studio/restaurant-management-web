"use client";

import { useMemo, useState } from "react";
import { FileText, Plus } from "lucide-react";
import { Contraetiqueta } from "@/components/marca/Contraetiqueta";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { EncabezadoPagina } from "@/components/paneles/EncabezadoPagina";
import { MigasPanel } from "@/components/paneles/MigasPanel";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { Buscador } from "@/components/ui/Buscador";
import { Selector } from "@/components/ui/Campo";
import { PanelLateral } from "@/components/ui/Dialogo";
import { useConfirmacion } from "@/components/ui/DialogoConfirmacion";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Indicador } from "@/components/ui/Indicador";
import { Insignia, type TonoInsignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import { CFDI_USES, MOCK_INVOICES, PAY_CFG, type Invoice, type InvoiceItem, type InvStatus } from "@/features/dashboard/admin/data/invoicesMock";
import { formatearDia } from "@/lib/formato/fecha";
import { formatearImporte } from "@/lib/formato/precio";
import { DialogoFactura } from "./DialogoFactura";

/**
 * Facturas (PLAN 5.5). Sin endpoint, como antes: datos de ejemplo de `invoicesMock` en memoria,
 * avisados (D-13). El detalle se abre en un panel lateral; cancelar pide confirmación del sistema
 * (antes, `confirm()`). Los botones «PDF», «Enviar» e «Imprimir» del detalle no hacían nada y se
 * retiran hasta que exista el servicio (NP-45).
 */

const importe = (n: number) => formatearImporte(n) ?? "—";
const folio = (f: Invoice) => `${f.series}-${f.folio}`;

const ESTADOS: Record<InvStatus, { texto: string; tono: TonoInsignia }> = {
	emitida: { texto: "Emitida", tono: "info" },
	pagada: { texto: "Pagada", tono: "exito" },
	pendiente: { texto: "Pendiente", tono: "aviso" },
	cancelada: { texto: "Cancelada", tono: "error" },
};
const FILTROS = [
	{ valor: "todas", texto: "Todas" },
	{ valor: "emitida", texto: "Emitidas" },
	{ valor: "pendiente", texto: "Pendientes" },
	{ valor: "pagada", texto: "Pagadas" },
	{ valor: "cancelada", texto: "Canceladas" },
];

const columnasConceptos: ColumnaTabla<InvoiceItem & { i: number }>[] = [
	{ clave: "descripcion", titulo: "Descripción", principal: true, celda: (c) => c.description },
	{ clave: "cantidad", titulo: "Cantidad", numerica: true, celda: (c) => String(c.qty) },
	{ clave: "precio", titulo: "Precio", numerica: true, celda: (c) => importe(c.unitPrice) },
	{ clave: "importe", titulo: "Importe", numerica: true, celda: (c) => importe(c.qty * c.unitPrice) },
];

export function Facturas() {
	const [facturas, setFacturas] = useState<Invoice[]>(MOCK_INVOICES);
	const [busqueda, setBusqueda] = useState("");
	const [filtro, setFiltro] = useState("todas");
	const [abiertaId, setAbiertaId] = useState<number | null>(null);
	const { notificar } = useNotificaciones();
	const { confirmar, dialogo } = useConfirmacion();
	const abierta = facturas.find((f) => f.id === abiertaId) ?? null;

	const filtradas = useMemo(() => {
		const q = busqueda.trim().toLowerCase();
		return facturas.filter(
			(f) => (filtro === "todas" || f.status === filtro) && (!q || [folio(f), f.clientName, f.clientRFC].join(" ").toLowerCase().includes(q)),
		);
	}, [facturas, busqueda, filtro]);

	const facturado = facturas.filter((f) => f.status !== "cancelada").reduce((a, f) => a + f.total, 0);
	const cobrado = facturas.filter((f) => f.status === "pagada").reduce((a, f) => a + f.total, 0);
	const porCobrar = facturas.filter((f) => f.status === "emitida" || f.status === "pendiente").reduce((a, f) => a + f.total, 0);

	function cambiarEstado(id: number, status: InvStatus) {
		setFacturas((fs) => fs.map((f) => (f.id !== id ? f : { ...f, status, paidAt: status === "pagada" ? new Date().toISOString().split("T")[0] : f.paidAt })));
	}

	async function cancelar(f: Invoice) {
		const ok = await confirmar({
			titulo: `¿Cancelar la factura ${folio(f)}?`,
			descripcion: `Es de ${f.clientName} por ${importe(f.total)}. Una factura cancelada no se puede volver a activar.`,
			textoConfirmar: "Cancelar factura",
			textoCancelar: "Conservarla",
			destructiva: true,
		});
		if (!ok) return;
		cambiarEstado(f.id, "cancelada");
		notificar({ tono: "exito", titulo: `Factura ${folio(f)} cancelada` });
	}

	const columnas: ColumnaTabla<Invoice>[] = [
		{
			clave: "folio",
			titulo: "Folio",
			principal: true,
			// El folio abre el detalle: sin una columna de acciones que, en tableta, quedaría fuera de la vista.
			celda: (f) => (
				<button
					type="button"
					onClick={() => setAbiertaId(f.id)}
					className="cursor-pointer rounded-control border-0 bg-transparent p-0 font-semibold whitespace-nowrap text-texto-principal underline decoration-borde-control underline-offset-4 al-pasar:decoration-acento focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
				>
					<span className="solo-lectores">Ver la factura </span>
					{folio(f)}
				</button>
			),
		},
		{ clave: "cliente", titulo: "Cliente", celda: (f) => f.clientName },
		{ clave: "rfc", titulo: "RFC", celda: (f) => <span className="numeros-tabulares">{f.clientRFC}</span> },
		{ clave: "fecha", titulo: "Emitida", celda: (f) => <span className="whitespace-nowrap">{formatearDia(f.issuedAt)}</span> },
		{ clave: "total", titulo: "Total", numerica: true, celda: (f) => importe(f.total) },
		{ clave: "estado", titulo: "Estado", celda: (f) => <Insignia tono={ESTADOS[f.status].tono}>{ESTADOS[f.status].texto}</Insignia> },
	];

	return (
		<div className="mx-auto flex w-full max-w-(--ancho-amplio) flex-col gap-(--espacio-xl) px-(--margen-pagina) py-(--espacio-xl) lg:py-(--espacio-2xl)">
			<EncabezadoPagina
				antetitulo={<MigasPanel migas={[{ nombre: "Caja y propinas", href: "/dashboard/admin/finance" }]} actual="Facturas" />}
				titulo="Facturas"
				descripcion="Facturas electrónicas emitidas a clientes."
				acciones={
					<DialogoFactura
						disparador={<Boton icono={<Plus />}>Factura nueva</Boton>}
						alEmitir={(f) => {
							setFacturas((fs) => [f, ...fs]);
							notificar({ tono: "exito", titulo: `Factura ${folio(f)} emitida`, descripcion: `${f.clientName}: ${importe(f.total)}.` });
						}}
					/>
				}
			/>
			<Aviso tono="info" rol={null} titulo="Pantalla con datos de ejemplo.">
				Aún no está conectada al sistema de facturación: lo que hagas aquí se ve en esta visita, pero no se guarda ni se timbra.
			</Aviso>

			<BloquePanel titulo="Resumen" datosDeEjemplo>
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))]">
					<Indicador rotulo="Facturado" valor={importe(facturado)} detalle="Sin contar las canceladas" className="sm:col-span-2 xl:col-span-1" />
					<Indicador rotulo="Cobrado" valor={importe(cobrado)} />
					<Indicador rotulo="Por cobrar" valor={importe(porCobrar)} detalle="Emitidas y pendientes" />
				</div>
			</BloquePanel>

			<BloquePanel
				titulo="Facturas"
				datosDeEjemplo
				acciones={
					<div className="flex w-full flex-wrap items-end gap-3 sm:w-auto">
						<Buscador etiqueta="Buscar por folio, cliente o RFC" valor={busqueda} alCambiar={setBusqueda} marcador="Folio, cliente o RFC" />
						<Selector etiqueta="Estado" opciones={FILTROS} value={filtro} onChange={(e) => setFiltro(e.target.value)} />
					</div>
				}
			>
				<Tabla
					leyenda="Facturas"
					columnas={columnas}
					filas={filtradas}
					claveFila={(f) => f.id}
					vacio={<EstadoVacio icono={<FileText />} titulo="No hay facturas con esos datos" descripcion="Prueba con otra búsqueda o con otro estado." />}
				/>
			</BloquePanel>

			<PanelLateral
				abierto={abierta !== null}
				alCambiarAbierto={(a) => !a && setAbiertaId(null)}
				titulo={abierta ? `Factura ${folio(abierta)}` : "Factura"}
				descripcion={abierta ? `Emitida el ${formatearDia(abierta.issuedAt)}.` : undefined}
				ancho="amplio"
				pie={
					abierta && abierta.status !== "cancelada" ? (
						<>
							<Boton variante="peligro" onClick={() => cancelar(abierta)}>
								Cancelar factura
							</Boton>
							{abierta.status === "emitida" && (
								<Boton
									onClick={() => {
										cambiarEstado(abierta.id, "pagada");
										notificar({ tono: "exito", titulo: `Factura ${folio(abierta)} pagada` });
									}}
								>
									Marcar como pagada
								</Boton>
							)}
						</>
					) : undefined
				}
			>
				{abierta && (
					<div className="flex flex-col gap-(--espacio-lg)">
						<Insignia tono={ESTADOS[abierta.status].tono} className="self-start">
							{ESTADOS[abierta.status].texto}
						</Insignia>
						<Contraetiqueta
							pares={[
								{ rotulo: "Cliente", valor: abierta.clientName, tipo: "texto" },
								{ rotulo: "RFC", valor: abierta.clientRFC },
								{ rotulo: "Correo", valor: abierta.clientEmail ? <span className="[overflow-wrap:anywhere]">{abierta.clientEmail}</span> : "—", tipo: "texto" },
								{ rotulo: "Uso de CFDI", valor: CFDI_USES[abierta.cfdiUse], tipo: "texto" },
								{ rotulo: "Forma de pago", valor: abierta.payForm, tipo: "texto" },
								{ rotulo: "Método", valor: PAY_CFG[abierta.payMethod].label, tipo: "texto" },
								{ rotulo: "Referencia", valor: abierta.orderRef || "—", tipo: "texto" },
								...(abierta.paidAt ? [{ rotulo: "Pagada el", valor: formatearDia(abierta.paidAt), tipo: "texto" as const }] : []),
							]}
						/>
						<Tabla leyenda="Conceptos" leyendaVisible columnas={columnasConceptos} filas={abierta.items.map((c, i) => ({ ...c, i }))} claveFila={(c) => c.i} />
						<Contraetiqueta
							pares={[
								{ rotulo: "Subtotal", valor: importe(abierta.subtotal) },
								{ rotulo: "IVA (16 %)", valor: importe(abierta.iva) },
								{ rotulo: "Total", valor: <strong>{importe(abierta.total)}</strong> },
							]}
						/>
						{abierta.notes && (
							<Aviso tono="aviso" rol={null} titulo="Nota interna.">
								{abierta.notes}
							</Aviso>
						)}
					</div>
				)}
			</PanelLateral>
			{dialogo}
		</div>
	);
}
