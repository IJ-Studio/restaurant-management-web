"use client";

import { useEffect, useState } from "react";
import { ChefHat, Package, TrendingDown } from "lucide-react";
import { AppOperaciones } from "@/components/paneles/AppOperaciones";
import { PlantillaPanel } from "@/components/paneles/PlantillaPanel";
import { INDICADOR_PROTAGONISTA, REJILLA_INDICADORES } from "@/components/paneles/rejilla";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { PanelLateral } from "@/components/ui/Dialogo";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Indicador } from "@/components/ui/Indicador";
import { Insignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { useCarga } from "@/hooks/useCarga";
import { api } from "@/lib/api";
import { contar } from "@/lib/formato/plural";
import { registrarError } from "@/lib/registro/registrar-error";
import { pedirPanel } from "@/lib/paneles/api-panel";
import { presentarCarta } from "@/lib/formato/caja";
import { DialogoMerma } from "@/features/dashboard/admin/inventario/DialogosInventario";
import type { Merma } from "@/hooks/useInventory";
import { conteo } from "@/lib/paneles/calculo";

/**
 * Panel de cocina (PLAN 5.19; PLAN-AMPLIACION D-24), para una tableta o un monitor que se lee a
 * distancia: mesas en Fraunces grande, platos en letra de título y botones de 56 px.
 *
 * Datos del API, los mismos que usa la app móvil del personal:
 * - comandas de hoy: `GET /pedidos/admin/recent` (abiertas, en preparación y listas), cada 15 s;
 * - «Empezar» y «Marcar lista»: `PATCH /pedidos/:id/estatus` (`en_preparacion`, `lista`);
 * - existencias: `GET /inventario/productos`. El nivel «bajo» solo se marca si el API da el mínimo
 *   de cada producto (`minStock`); si no, se listan sin juzgar el nivel.
 * - «Registrar merma»: `POST /inventario/mermas` (solo personal operativo; el admin solo consulta).
 */

interface Comanda {
	id: string;
	table: string;
	time: string;
	status: string | null;
	items: { nombre: string; cantidad: number }[];
}
interface Producto {
	id: number;
	name: string;
	unit: string | null;
	stock: string | number | null;
	minStock?: string | number | null;
	costPerUnit?: string | number | null;
}

const COLUMNAS = [
	{ estado: "abierta", titulo: "Nuevas", accion: "Empezar", siguiente: "en_preparacion", vacio: "No hay comandas nuevas." },
	{ estado: "en_preparacion", titulo: "En preparación", accion: "Marcar lista", siguiente: "lista", vacio: "Nada en el fuego." },
	{ estado: "lista", titulo: "Listas para la mesa", vacio: "Nada esperando al mesero." },
] as const;
const entero = new Intl.NumberFormat("es-MX");
const numero = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));
const esBajo = (p: Producto) => {
	const minimo = numero(p.minStock);
	const stock = numero(p.stock);
	return minimo !== null && stock !== null && stock <= minimo;
};
/** Folio corto para leer a distancia y para el lector de pantalla: los UUID completos no se leen. */
const folio = (id: string) => id.slice(0, 6).toUpperCase();

function TarjetaComanda({ pedido, accion, ocupado, alAvanzar }: { pedido: Comanda; accion?: string; ocupado: boolean; alAvanzar: () => void }) {
	return (
		<li className="flex flex-col gap-(--espacio-md) rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-lg)">
			<div className="flex items-baseline justify-between gap-3">
				<h3 className="m-0 font-titulos text-(length:--texto-titulo-2) font-normal leading-[1.1] text-texto-principal">{pedido.table}</h3>
				<span className="shrink-0 text-texto-secundario cifras-consola">{`${folio(pedido.id)} · ${pedido.time}`}</span>
			</div>
			<ul className="m-0 flex list-none flex-col gap-2 p-0" aria-label={`Platos de la comanda ${folio(pedido.id)}`}>
				{pedido.items.map((it, i) => (
					<li key={`${it.nombre}-${i}`} className="text-(length:--texto-titulo-interfaz) text-texto-principal">
						<span className="me-2 font-semibold cifras-consola">{`${it.cantidad} ×`}</span>
						{it.nombre}
					</li>
				))}
			</ul>
			{accion ? (
				<Boton className="min-h-14 w-full" cargando={ocupado} aria-label={`${accion} la comanda ${folio(pedido.id)}`} onClick={alAvanzar}>
					{accion}
				</Boton>
			) : (
				<p className="m-0 text-texto-secundario">Esperando al mesero.</p>
			)}
		</li>
	);
}

export function CocinaPanel() {
	const [comandas, recargar] = useCarga(() => pedirPanel<Comanda[]>("/pedidos/admin/recent").then(presentarCarta), "cocina: comandas");
	const [inventario, recargarInventario] = useCarga(() => pedirPanel<Producto[]>("/inventario/productos").then(presentarCarta), "cocina: existencias");
	const [existencias, setExistencias] = useState(false);
	const [avanzando, setAvanzando] = useState<string | null>(null);
	const { notificar } = useNotificaciones();

	useEffect(() => {
		const t = setInterval(() => void recargar({ silenciosa: true }), 15000);
		return () => clearInterval(t);
	}, [recargar]);

	async function avanzar(p: Comanda, siguiente: "en_preparacion" | "lista") {
		setAvanzando(p.id);
		try {
			await api.patch(`/pedidos/${encodeURIComponent(p.id)}/estatus`, { estatus: siguiente });
			notificar({ tono: "exito", titulo: siguiente === "lista" ? `Comanda ${folio(p.id)} lista` : `Comanda ${folio(p.id)} en preparación` });
			await recargar({ silenciosa: true });
		} catch (err) {
			registrarError(err, "cocina: avanzar comanda");
			notificar({ tono: "error", titulo: "No se pudo mover la comanda", descripcion: "Vuelve a intentarlo en un momento." });
		} finally {
			setAvanzando(null);
		}
	}

	// Quién la registra y el costo los pone el API (usuario de la sesión y costo del producto).
	async function registrarMerma(m: Merma) {
		try {
			await api.post("/inventario/mermas", { productId: m.productId, quantity: m.quantity, unit: m.unit, reason: m.reason, justification: m.justification });
			notificar({ tono: "exito", titulo: "Merma registrada" });
			await recargarInventario({ silenciosa: true });
			return true;
		} catch (err) {
			registrarError(err, "cocina: registrar merma");
			notificar({ tono: "error", titulo: "No se pudo registrar la merma", descripcion: "Vuelve a intentarlo en un momento." });
			return false;
		}
	}

	const lista = comandas.estado === "listo" && Array.isArray(comandas.datos) ? comandas.datos : [];
	const de = (estado: string) => lista.filter((p) => p.status === estado);
	const productos = inventario.estado === "listo" && Array.isArray(inventario.datos) ? inventario.datos : [];
	const bajos = productos.filter(esBajo);
	const conMinimo = productos.some((p) => numero(p.minStock) !== null);
	const comun = { estado: comandas.estado, alReintentar: recargar } as const;
	// «Ver cálculo» (P1.4): cada comanda que cuenta, con su estado.
	const desglose = (formula: string, estados: string[]) => {
		const filas = lista.filter((p) => p.status && estados.includes(p.status));
		return { calculo: conteo(formula, filas, (p) => `${p.table} · ${folio(p.id)}`, (p) => p.status ?? "", { filtros: { comandas: "de hoy" } }), valorCalculo: filas.length };
	};

	return (
		<PlantillaPanel
			titulo="Comandas"
			descripcion="Se actualiza sola cada 15 segundos."
			acciones={
				<>
					<Boton variante="secundario" icono={<Package />} className="min-h-12" onClick={() => setExistencias(true)}>
						Existencias
					</Boton>
					<DialogoMerma
						productos={productos.map((p) => ({ id: p.id, name: p.name, unit: p.unit ?? "pza", costPerUnit: numero(p.costPerUnit) ?? 0 }))}
						alGuardar={registrarMerma}
						disparador={
							<Boton variante="secundario" icono={<TrendingDown />} className="min-h-12">
								Registrar merma
							</Boton>
						}
					/>
				</>
			}
		>
			<div className={REJILLA_INDICADORES}>
				<Indicador {...comun} rotulo="En cocina" {...desglose("en cocina = comandas nuevas + en preparación", ["abierta", "en_preparacion"])} valor={entero.format(de("abierta").length + de("en_preparacion").length)} detalle="Nuevas y en preparación" className={INDICADOR_PROTAGONISTA} />
				<Indicador {...comun} rotulo="Nuevas" {...desglose("nuevas = comandas en estado «abierta»", ["abierta"])} valor={entero.format(de("abierta").length)} />
				<Indicador {...comun} rotulo="Listas para la mesa" {...desglose("listas = comandas en estado «lista»", ["lista"])} valor={entero.format(de("lista").length)} />
				<Indicador
					estado={inventario.estado}
					alReintentar={recargarInventario}
					rotulo="Existencias bajas"
					valor={conMinimo ? entero.format(bajos.length) : "—"}
					detalle={conMinimo ? undefined : "El sistema aún no da los mínimos"}
					calculo={conMinimo ? conteo("existencias bajas = productos con existencias en el mínimo o por debajo", bajos, (p) => p.name, (p) => `${numero(p.stock)} de mínimo ${numero(p.minStock)}`) : undefined}
					valorCalculo={conMinimo ? bajos.length : undefined}
				/>
			</div>

			{bajos.length > 0 && (
				<Aviso
					tono="aviso"
					rol={null}
					titulo={`${contar(bajos.length, "producto")} en el mínimo o por debajo.`}
					accion={
						<Boton variante="secundario" tamano="compacto" onClick={() => setExistencias(true)}>
							Ver existencias
						</Boton>
					}
				>
					{bajos.slice(0, 3).map((c) => c.name).join(", ")}
					{bajos.length > 3 ? ` y ${bajos.length - 3} más.` : "."}
				</Aviso>
			)}

			{comandas.estado === "error" ? (
				<EstadoError titulo="No pudimos traer las comandas" descripcion="Vuelve a intentarlo en un momento." alReintentar={recargar} />
			) : (
				<div className="grid grid-cols-1 items-start gap-(--espacio-xl) lg:grid-cols-3">
					{COLUMNAS.map((c) => {
						const columna = de(c.estado);
						return (
							<section key={c.estado} aria-labelledby={`col-${c.estado}`} className="flex min-w-0 flex-col gap-(--espacio-md)">
								<h2 id={`col-${c.estado}`} className="m-0 flex items-baseline justify-between gap-3 border-b border-borde-sutil pb-(--espacio-sm) font-titulos text-(length:--texto-titulo-3) font-normal text-texto-principal">
									{c.titulo}
									<span className="font-texto text-(length:--texto-titulo-interfaz) text-texto-secundario numeros-tabulares">
										{comandas.estado === "listo" ? columna.length : "…"}
										<span className="solo-lectores"> comandas</span>
									</span>
								</h2>
								{comandas.estado === "cargando" ? null : columna.length === 0 ? (
									<p className="m-0 py-(--espacio-lg) text-center text-texto-secundario">{c.vacio}</p>
								) : (
									<ul className="m-0 flex list-none flex-col gap-(--espacio-md) p-0" aria-label={`Comandas: ${c.titulo.toLowerCase()}`}>
										{columna.map((p) => (
											<TarjetaComanda
												key={p.id}
												pedido={p}
												accion={"accion" in c ? c.accion : undefined}
												ocupado={avanzando === p.id}
												alAvanzar={() => "siguiente" in c && void avanzar(p, c.siguiente)}
											/>
										))}
									</ul>
								)}
							</section>
						);
					})}
				</div>
			)}

			<PanelLateral abierto={existencias} alCambiarAbierto={setExistencias} titulo="Existencias" descripcion="Primero lo que está en el mínimo o por debajo.">
				{inventario.estado === "error" ? (
					<EstadoError titulo="No pudimos traer las existencias" descripcion="Vuelve a intentarlo en un momento." alReintentar={recargarInventario} />
				) : productos.length === 0 ? (
					<EstadoVacio icono={<ChefHat />} titulo={inventario.estado === "cargando" ? "Cargando existencias" : "Aún no hay productos en el inventario"} />
				) : (
					<ul className="m-0 flex list-none flex-col p-0">
						{[...productos]
							.sort((a, b) => Number(esBajo(b)) - Number(esBajo(a)))
							.map((i) => (
								<li key={i.id} className="flex items-center justify-between gap-3 border-b border-borde-sutil py-(--espacio-sm) last:border-b-0">
									<span className="flex min-w-0 flex-col">
										<span className="font-semibold text-texto-principal">{i.name}</span>
										<span className="text-(length:--texto-pequeno) text-texto-secundario">
											{[`${numero(i.stock) ?? "—"} ${i.unit ?? ""}`.trim(), numero(i.minStock) !== null ? `mínimo ${numero(i.minStock)}` : null].filter(Boolean).join(" · ")}
										</span>
									</span>
									{numero(i.minStock) !== null &&
										(esBajo(i) ? <Insignia tono="error" className="whitespace-nowrap">Bajo</Insignia> : <Insignia tono="exito" className="whitespace-nowrap">Bien</Insignia>)}
								</li>
							))}
					</ul>
				)}
			</PanelLateral>
			<AppOperaciones />
		</PlantillaPanel>
	);
}
