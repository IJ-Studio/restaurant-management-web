"use client";

import { useMemo, useState } from "react";
import { ClipboardList, Pencil, Plus, ShoppingCart, Trash2, Truck } from "lucide-react";
import { Contraetiqueta } from "@/components/marca/Contraetiqueta";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { EncabezadoPagina } from "@/components/paneles/EncabezadoPagina";
import { MigasPanel } from "@/components/paneles/MigasPanel";
import { PROTAGONISTA_DE_TRES, REJILLA_TRES_INDICADORES } from "@/components/paneles/rejilla";
import { Boton } from "@/components/ui/Boton";
import { Buscador } from "@/components/ui/Buscador";
import { Selector } from "@/components/ui/Campo";
import { useConfirmacion } from "@/components/ui/DialogoConfirmacion";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Indicador } from "@/components/ui/Indicador";
import { Insignia, type TonoInsignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { Pestanas } from "@/components/ui/Pestanas";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { useInventory, type OrderStatus, type PurchaseOrder, type Supplier } from "@/hooks/useInventory";
import { formatearDia } from "@/lib/formato/fecha";
import { contar } from "@/lib/formato/plural";
import { formatearImporte } from "@/lib/formato/precio";
import { registrarError } from "@/lib/registro/registrar-error";
import { DialogoOrden, DialogoProveedor, ESTADOS_ORDEN } from "./DialogosProveedores";

/**
 * Proveedores y órdenes de compra (PLAN 5.8). Mismo hook y mismas rutas. Las operaciones esperan la
 * respuesta y avisan con notificaciones (antes, un banner con «Error al…»); eliminar pide
 * confirmación del sistema (antes, `confirm()`). Sin emojis en las pestañas ni colores fijos.
 */

const importe = (n: number) => formatearImporte(n) ?? "—";
const entero = new Intl.NumberFormat("es-MX");
const TONO_ORDEN: Record<OrderStatus, TonoInsignia> = {
	borrador: "neutro",
	enviada: "info",
	confirmada: "info",
	en_camino: "aviso",
	recibida: "exito",
	cancelada: "error",
};
const enCurso = (o: PurchaseOrder) => o.status !== "recibida" && o.status !== "cancelada";

/** «Jitomate, cebolla y 3 más»: la lista completa va en la edición. */
function resumenProductos(productos: string[]) {
	if (productos.length === 0) return "—";
	if (productos.length <= 3) return productos.join(", ");
	return `${productos.slice(0, 3).join(", ")} y ${productos.length - 3} más`;
}

export function Proveedores({ vistaInicial }: { vistaInicial?: string }) {
	const { products: productos, suppliers: proveedores, orders: ordenes, loading, error, saveSupplier, deleteSupplier, saveOrder, deleteOrder, recargar } = useInventory();
	const [busqueda, setBusqueda] = useState("");
	const [filtro, setFiltro] = useState("todas");
	const { notificar } = useNotificaciones();
	const { confirmar, dialogo } = useConfirmacion();

	async function operar(accion: () => Promise<unknown>, exito: string, fallo: string, contexto: string) {
		try {
			await accion();
			notificar({ tono: "exito", titulo: exito });
			return true;
		} catch (e) {
			registrarError(e, `proveedores: ${contexto}`);
			notificar({ tono: "error", titulo: fallo, descripcion: "Vuelve a intentarlo en un momento." });
			return false;
		}
	}

	async function eliminarProveedor(s: Supplier) {
		const ok = await confirmar({
			titulo: `¿Eliminar a ${s.name}?`,
			descripcion: "Se borra el proveedor. Sus órdenes de compra se conservan. No se puede deshacer.",
			textoConfirmar: "Eliminar proveedor",
			destructiva: true,
		});
		if (ok) await operar(() => deleteSupplier(s.id), `${s.name} eliminado`, "No se pudo eliminar el proveedor", "eliminar proveedor");
	}
	async function eliminarOrden(o: PurchaseOrder) {
		const ok = await confirmar({
			titulo: `¿Eliminar la orden ${o.folio}?`,
			descripcion: `Es de ${o.supplierName} por ${importe(o.total)}. No se puede deshacer.`,
			textoConfirmar: "Eliminar orden",
			destructiva: true,
		});
		if (ok) await operar(() => deleteOrder(o.id), `Orden ${o.folio} eliminada`, "No se pudo eliminar la orden", "eliminar orden");
	}

	const guardarProveedor = (s: Supplier) => operar(() => saveSupplier(s), s.id ? "Proveedor guardado" : "Proveedor añadido", "No se pudo guardar el proveedor", "guardar proveedor");
	const guardarOrden = (o: PurchaseOrder) => operar(() => saveOrder(o), o.id ? "Orden guardada" : "Orden creada", "No se pudo guardar la orden", "guardar orden");

	const comprado = ordenes.filter((o) => o.status !== "cancelada").reduce((a, o) => a + o.total, 0);
	const pendientes = ordenes.filter(enCurso);
	const activos = proveedores.filter((s) => s.active);

	const filtradas = useMemo(() => {
		const q = busqueda.trim().toLowerCase();
		return ordenes.filter((o) => (filtro === "todas" || o.status === filtro) && (!q || `${o.folio} ${o.supplierName}`.toLowerCase().includes(q)));
	}, [ordenes, busqueda, filtro]);

	const columnasOrdenes: ColumnaTabla<PurchaseOrder>[] = [
		{ clave: "folio", titulo: "Folio", principal: true, celda: (o) => <span className="whitespace-nowrap">{o.folio}</span> },
		{ clave: "proveedor", titulo: "Proveedor", celda: (o) => o.supplierName },
		{ clave: "articulos", titulo: "Artículos", numerica: true, celda: (o) => contar(o.items.length, "artículo") },
		{ clave: "creada", titulo: "Creada", celda: (o) => <span className="whitespace-nowrap">{formatearDia(o.createdAt)}</span> },
		{ clave: "total", titulo: "Total", numerica: true, celda: (o) => importe(o.total) },
		{ clave: "estado", titulo: "Estado", celda: (o) => (
				// Estados cortos: en una línea, también en la tarjeta de móvil.
				<Insignia tono={TONO_ORDEN[o.status]} className="whitespace-nowrap">
					{ESTADOS_ORDEN[o.status]}
				</Insignia>
			),
		},
	];

	const nuevaOrden = (proveedorInicial?: number, compacto = false) => (
		<DialogoOrden
			proveedores={proveedores}
			productos={productos}
			proveedorInicial={proveedorInicial}
			alGuardar={guardarOrden}
			disparador={
				<Boton variante={compacto ? "secundario" : "primario"} tamano={compacto ? "compacto" : "normal"} icono={<ShoppingCart />}>
					{compacto ? "Hacer pedido" : "Orden de compra"}
				</Boton>
			}
		/>
	);

	const errorCarga = error ? <EstadoError titulo="No pudimos traer los proveedores" descripcion="Vuelve a intentarlo en un momento." alReintentar={recargar} /> : null;

	const vistaProveedores = (
		<BloquePanel titulo="Proveedores">
			{errorCarga ??
				(loading ? (
					<div aria-busy="true" className="grid grid-cols-1 gap-(--espacio-md) md:grid-cols-2 2xl:grid-cols-3">
						<span role="status" className="solo-lectores">
							Cargando los proveedores
						</span>
						{[0, 1].map((i) => (
							<Esqueleto key={i} sobre="fondo" className="h-80" />
						))}
					</div>
				) : proveedores.length === 0 ? (
					<EstadoVacio icono={<Truck />} titulo="Todavía no hay proveedores" descripcion="Añade a quienes surten la cocina para poder hacerles pedidos." />
				) : (
					<ul className="m-0 grid list-none grid-cols-1 gap-(--espacio-md) p-0 md:grid-cols-2 2xl:grid-cols-3">
						{proveedores.map((s) => (
							<Tarjeta
								key={s.id}
								como="li"
								titulo={s.name}
								nivelTitulo={3}
								descripcion={s.category || undefined}
								insignia={s.active ? <Insignia tono="exito">Activo</Insignia> : <Insignia tono="neutro">Inactivo</Insignia>}
								pie={
									<div className="flex flex-wrap gap-2">
										{s.active && nuevaOrden(s.id, true)}
										<DialogoProveedor
											proveedor={s}
											alGuardar={guardarProveedor}
											disparador={
												<Boton variante="secundario" tamano="compacto" soloIcono icono={<Pencil />}>
													{`Editar ${s.name}`}
												</Boton>
											}
										/>
										<Boton variante="secundario" tamano="compacto" soloIcono icono={<Trash2 />} onClick={() => eliminarProveedor(s)}>
											{`Eliminar ${s.name}`}
										</Boton>
									</div>
								}
							>
								<Contraetiqueta
									pares={[
										{ rotulo: "Contacto", valor: s.contact || "—", tipo: "texto" },
										{
											rotulo: "Teléfono",
											valor: s.phone ? (
												<a href={`tel:${s.phone.replace(/\s+/g, "")}`} className="text-texto-principal underline decoration-borde-control underline-offset-4">
													{s.phone}
												</a>
											) : (
												"—"
											),
										},
										{
											rotulo: "Correo",
											valor: s.email ? (
												<a href={`mailto:${s.email}`} className="text-texto-principal underline decoration-borde-control underline-offset-4 [overflow-wrap:anywhere]">
													{s.email}
												</a>
											) : (
												"—"
											),
											tipo: "texto",
										},
										{ rotulo: "Entrega", valor: contar(s.deliveryDays, "día") },
										{ rotulo: "Pago", valor: s.paymentTerms, tipo: "texto" },
										{ rotulo: "Órdenes", valor: entero.format(ordenes.filter((o) => o.supplierId === s.id).length) },
										{ rotulo: "Surte", valor: resumenProductos(s.products), tipo: "texto" },
									]}
								/>
							</Tarjeta>
						))}
					</ul>
				))}
		</BloquePanel>
	);

	const vistaOrdenes = (
		<BloquePanel
			titulo="Órdenes de compra"
			acciones={
				<div className="flex w-full flex-wrap items-end gap-3 sm:w-auto">
					<Buscador etiqueta="Buscar por folio o proveedor" valor={busqueda} alCambiar={setBusqueda} marcador="Folio o proveedor" />
					<Selector
						etiqueta="Estado"
						opciones={[{ valor: "todas", texto: "Todas" }, ...Object.entries(ESTADOS_ORDEN).map(([valor, texto]) => ({ valor, texto }))]}
						value={filtro}
						onChange={(e) => setFiltro(e.target.value)}
					/>
				</div>
			}
		>
			<Tabla
				leyenda="Órdenes de compra"
				columnas={columnasOrdenes}
				filas={filtradas}
				claveFila={(o) => o.id}
				estado={loading ? "cargando" : "listo"}
				error={errorCarga ?? undefined}
				tituloAcciones="Acciones"
				acciones={(o) => (
					<>
						<DialogoOrden
							orden={o}
							proveedores={proveedores}
							productos={productos}
							alGuardar={guardarOrden}
							disparador={
								<Boton variante="secundario" tamano="compacto" soloIcono icono={<Pencil />}>
									{`Editar la orden ${o.folio}`}
								</Boton>
							}
						/>
						<Boton variante="secundario" tamano="compacto" soloIcono icono={<Trash2 />} onClick={() => eliminarOrden(o)}>
							{`Eliminar la orden ${o.folio}`}
						</Boton>
					</>
				)}
				vacio={<EstadoVacio icono={<ClipboardList />} titulo="No hay órdenes con esos datos" descripcion="Prueba con otra búsqueda o con otro estado." />}
			/>
		</BloquePanel>
	);

	const indicador = { estado: loading ? ("cargando" as const) : error ? ("error" as const) : ("listo" as const), alReintentar: recargar };

	return (
		<div className="mx-auto flex w-full max-w-(--ancho-amplio) flex-col gap-(--espacio-xl) px-(--margen-pagina) py-(--espacio-xl) lg:py-(--espacio-2xl)">
			<EncabezadoPagina
				antetitulo={<MigasPanel migas={[{ nombre: "Productos y existencias", href: "/dashboard/admin/inventory" }]} actual="Proveedores" />}
				titulo="Proveedores"
				descripcion="Quién surte la cocina y lo que se les ha pedido."
				acciones={
					<>
						<DialogoProveedor
							alGuardar={guardarProveedor}
							disparador={
								<Boton variante="secundario" icono={<Plus />}>
									Proveedor nuevo
								</Boton>
							}
						/>
						{nuevaOrden()}
					</>
				}
			/>

			<div className={REJILLA_TRES_INDICADORES}>
				<Indicador {...indicador} rotulo="Comprado" valor={importe(comprado)} detalle="Sin contar las canceladas" className={PROTAGONISTA_DE_TRES} />
				<Indicador {...indicador} rotulo="Órdenes en curso" valor={entero.format(pendientes.length)} detalle={contar(ordenes.filter((o) => o.status === "en_camino").length, "en camino", "en camino")} />
				<Indicador {...indicador} rotulo="Proveedores activos" valor={entero.format(activos.length)} detalle={`De ${entero.format(proveedores.length)}`} />
			</div>

			<Pestanas
				etiqueta="Secciones de proveedores"
				parametroUrl="vista"
				valorInicial={vistaInicial === "ordenes" ? "ordenes" : "proveedores"}
				pestanas={[
					{ valor: "proveedores", titulo: "Proveedores", contador: { valor: proveedores.length, descripcion: "proveedores" }, contenido: vistaProveedores },
					{ valor: "ordenes", titulo: "Órdenes", contador: { valor: ordenes.length, descripcion: "órdenes" }, contenido: vistaOrdenes },
				]}
			/>
			{dialogo}
		</div>
	);
}
