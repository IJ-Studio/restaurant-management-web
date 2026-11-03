"use client";

import { useEffect, useState } from "react";
import { ChefHat, CircleAlert, Package } from "lucide-react";
import { EncabezadoPagina } from "@/components/paneles/EncabezadoPagina";
import { INDICADOR_PROTAGONISTA, REJILLA_INDICADORES } from "@/components/paneles/rejilla";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { PanelLateral } from "@/components/ui/Dialogo";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Indicador } from "@/components/ui/Indicador";
import { Insignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import type { InventoryProduct, Order } from "@/features/shared/data/restaurantData";
import { InventoryService, OrderService } from "@/features/shared/services/dataService";
import { contar } from "@/lib/formato/plural";

/**
 * Panel de cocina (PLAN 5.19), para una tableta o un monitor que se lee a distancia: mesas en
 * Fraunces grande, platos en letra de título y botones de 56 px. La misma lógica sobre los
 * servicios locales: las comandas se leen cada 5 s y «Empezar» y «Marcar lista» avanzan el estado.
 *
 * Retirado lo que no era verdad: el «12m Avg» fijo, el botón «Entregado» de las listas (no hacía
 * nada) y el «aviso enviado» del inventario, que no avisaba a nadie. Las existencias se consultan en
 * un panel lateral, con su nivel en texto.
 */

const COLUMNAS: { estado: Order["status"]; titulo: string; accion?: string; vacio: string }[] = [
	{ estado: "nuevo", titulo: "Nuevas", accion: "Empezar", vacio: "No hay comandas nuevas." },
	{ estado: "preparando", titulo: "En preparación", accion: "Marcar lista", vacio: "Nada en el fuego." },
	{ estado: "listo", titulo: "Listas para la mesa", vacio: "Nada esperando al mesero." },
];
const SIGUIENTE: Partial<Record<Order["status"], Order["status"]>> = { nuevo: "preparando", preparando: "listo" };
const entero = new Intl.NumberFormat("es-MX");

function Comanda({ pedido, accion, alAvanzar }: { pedido: Order; accion?: string; alAvanzar: () => void }) {
	return (
		<li className="flex flex-col gap-(--espacio-md) rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-lg)">
			<div className="flex items-baseline justify-between gap-3">
				<h3 className="m-0 font-titulos text-(length:--texto-titulo-2) font-normal leading-[1.1] text-texto-principal">{pedido.table.startsWith("Mesa") || pedido.table.startsWith("Barra") || pedido.table.startsWith("Terraza") ? pedido.table : `Mesa ${pedido.table}`}</h3>
				<span className="shrink-0 text-texto-secundario numeros-tabulares">{`${pedido.id} · ${pedido.timestamp}`}</span>
			</div>
			<ul className="m-0 flex list-none flex-col gap-2 p-0" aria-label={`Platos de la comanda ${pedido.id}`}>
				{pedido.items.map((it, i) => (
					<li key={`${it.name}-${i}`} className="flex flex-col gap-1 text-(length:--texto-titulo-interfaz) text-texto-principal">
						<span>
							<span className="me-2 font-semibold numeros-tabulares">{`${it.qty} ×`}</span>
							{it.name}
						</span>
						{it.notes && (
							<span className="flex items-center gap-2 text-(length:--texto-cuerpo) text-aviso">
								<CircleAlert aria-hidden="true" className="size-5 shrink-0 stroke-[1.5]" />
								{it.notes}
							</span>
						)}
					</li>
				))}
			</ul>
			{accion ? (
				<Boton className="min-h-14 w-full" aria-label={`${accion} la comanda ${pedido.id}`} onClick={alAvanzar}>
					{accion}
				</Boton>
			) : (
				<p className="m-0 text-texto-secundario">Esperando al mesero.</p>
			)}
		</li>
	);
}

export function CocinaPanel() {
	const [pedidos, setPedidos] = useState<Order[]>([]);
	const [inventario, setInventario] = useState<InventoryProduct[]>([]);
	const [cargado, setCargado] = useState(false);
	const [existencias, setExistencias] = useState(false);
	const { notificar } = useNotificaciones();

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- lectura inicial de los servicios locales
		setPedidos(OrderService.getOrders());
		setInventario(InventoryService.getInventory());
		setCargado(true);
		const t = setInterval(() => setPedidos(OrderService.getOrders()), 5000);
		return () => clearInterval(t);
	}, []);

	function avanzar(p: Order) {
		const siguiente = SIGUIENTE[p.status];
		if (!siguiente) return;
		OrderService.updateOrderStatus(p.id, siguiente);
		setPedidos(OrderService.getOrders());
		notificar({ tono: "exito", titulo: siguiente === "listo" ? `Comanda ${p.id} lista` : `Comanda ${p.id} en preparación` });
	}

	const de = (s: Order["status"]) => pedidos.filter((p) => p.status === s);
	const criticos = inventario.filter((i) => i.stock <= i.minStock);
	const estado = cargado ? ("listo" as const) : ("cargando" as const);

	return (
		<div className="mx-auto flex w-full max-w-(--ancho-amplio) flex-col gap-(--espacio-xl) px-(--margen-pagina) py-(--espacio-xl) lg:py-(--espacio-2xl)">
			<EncabezadoPagina
				antetitulo="Cocina"
				titulo="Comandas"
				descripcion="Se actualiza sola cada 5 segundos."
				acciones={
					<Boton variante="secundario" icono={<Package />} className="min-h-12" onClick={() => setExistencias(true)}>
						Existencias
					</Boton>
				}
			/>
			<Aviso tono="info" rol={null} titulo="Pantalla con datos de ejemplo.">
				Las comandas salen de los pedidos de la sala guardados en este dispositivo.
			</Aviso>

			<div className={REJILLA_INDICADORES}>
				<Indicador estado={estado} rotulo="En cocina" valor={entero.format(de("nuevo").length + de("preparando").length)} detalle="Nuevas y en preparación" className={INDICADOR_PROTAGONISTA} />
				<Indicador estado={estado} rotulo="Nuevas" valor={entero.format(de("nuevo").length)} />
				<Indicador estado={estado} rotulo="Listas para la mesa" valor={entero.format(de("listo").length)} />
				<Indicador estado={estado} rotulo="Existencias bajas" valor={entero.format(criticos.length)} />
			</div>

			{criticos.length > 0 && (
				<Aviso
					tono="aviso"
					rol={null}
					titulo={`${contar(criticos.length, "producto")} en el mínimo o por debajo.`}
					accion={
						<Boton variante="secundario" tamano="compacto" onClick={() => setExistencias(true)}>
							Ver existencias
						</Boton>
					}
				>
					{criticos.slice(0, 3).map((c) => c.name).join(", ")}
					{criticos.length > 3 ? ` y ${criticos.length - 3} más.` : "."}
				</Aviso>
			)}

			<div className="grid grid-cols-1 items-start gap-(--espacio-xl) lg:grid-cols-3">
				{COLUMNAS.map((c) => {
					const lista = de(c.estado);
					return (
						<section key={c.estado} aria-labelledby={`col-${c.estado}`} className="flex min-w-0 flex-col gap-(--espacio-md)">
							<h2 id={`col-${c.estado}`} className="m-0 flex items-baseline justify-between gap-3 border-b border-borde-sutil pb-(--espacio-sm) font-titulos text-(length:--texto-titulo-3) font-normal text-texto-principal">
								{c.titulo}
								<span className="font-texto text-(length:--texto-titulo-interfaz) text-texto-secundario numeros-tabulares">
									{lista.length}
									<span className="solo-lectores"> comandas</span>
								</span>
							</h2>
							{lista.length === 0 ? (
								<p className="m-0 py-(--espacio-lg) text-center text-texto-secundario">{c.vacio}</p>
							) : (
								<ul className="m-0 flex list-none flex-col gap-(--espacio-md) p-0" aria-label={`Comandas: ${c.titulo.toLowerCase()}`}>
									{lista.map((p) => (
										<Comanda key={p.id} pedido={p} accion={c.accion} alAvanzar={() => avanzar(p)} />
									))}
								</ul>
							)}
						</section>
					);
				})}
			</div>

			<PanelLateral abierto={existencias} alCambiarAbierto={setExistencias} titulo="Existencias" descripcion="Primero lo que está en el mínimo o por debajo.">
				{inventario.length === 0 ? (
					<EstadoVacio icono={<ChefHat />} titulo="Sin datos de existencias" />
				) : (
					<ul className="m-0 flex list-none flex-col p-0">
						{[...inventario]
							.sort((a, b) => Number(b.stock <= b.minStock) - Number(a.stock <= a.minStock))
							.map((i) => (
								<li key={i.id} className="flex items-center justify-between gap-3 border-b border-borde-sutil py-(--espacio-sm) last:border-b-0">
									<span className="flex min-w-0 flex-col">
										<span className="font-semibold text-texto-principal">{i.name}</span>
										<span className="text-(length:--texto-pequeno) text-texto-secundario">{`${i.stock} ${i.unit} · mínimo ${i.minStock}`}</span>
									</span>
									{i.stock <= i.minStock ? <Insignia tono="error" className="whitespace-nowrap">Bajo</Insignia> : <Insignia tono="exito" className="whitespace-nowrap">Bien</Insignia>}
								</li>
							))}
					</ul>
				)}
			</PanelLateral>
		</div>
	);
}
