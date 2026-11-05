"use client";

import { useEffect, useMemo, useState } from "react";
import { HandPlatter, Minus, Plus, Send } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { AppOperaciones } from "@/components/paneles/AppOperaciones";
import { PlantillaPanel } from "@/components/paneles/PlantillaPanel";
import { PROTAGONISTA_DE_TRES, REJILLA_TRES_INDICADORES } from "@/components/paneles/rejilla";
import { Boton } from "@/components/ui/Boton";
import { Campo, Selector } from "@/components/ui/Campo";
import { PanelLateral } from "@/components/ui/Dialogo";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Indicador } from "@/components/ui/Indicador";
import { Insignia, type TonoInsignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { useCarga } from "@/hooks/useCarga";
import { api } from "@/lib/api";
import { contar } from "@/lib/formato/plural";
import { formatearImporte } from "@/lib/formato/precio";
import { pedirPanel } from "@/lib/paneles/api-panel";
import { normalizarCarta, type CategoriaCarta, type PlatoCarta } from "@/lib/publico/carta";
import { registrarError } from "@/lib/registro/registrar-error";
import { conteo } from "@/lib/paneles/calculo";

/**
 * Panel de sala (PLAN 5.18; PLAN-AMPLIACION D-24), pensado para el móvil. Datos del API, el mismo
 * flujo que la app móvil del personal:
 * - mesas: `GET /mesas`; carta: `GET /menu/categories/with-products`;
 * - estado de cada mesa: sus pedidos de hoy en `GET /pedidos/admin/recent` (cada 20 s);
 * - tomar pedido: `POST /pedidos/mesa` (número de mesa, platos y comensales) y después
 *   `POST /pedidos/confirmar/:id`, que lo manda a cocina;
 * - «Servido»: `PATCH /pedidos/:id/estatus` con `entregada`; desde ahí la caja lo cobra.
 * Sin descuentos: el API no los registra, y mostrarlos sin guardarlos no era verdad.
 */

interface Mesa {
	id: number;
	numero: string;
	nombre: string | null;
	capacidad: number;
	activa: boolean | null;
}
interface PedidoActivo {
	id: string;
	table: string;
	status: string | null;
	total: number;
}
type EstadoMesa = "libre" | "ocupada" | "lista";

const ESTADOS: Record<EstadoMesa, { texto: string; tono: TonoInsignia }> = {
	libre: { texto: "Libre", tono: "exito" },
	ocupada: { texto: "Ocupada", tono: "info" },
	lista: { texto: "Plato listo", tono: "aviso" },
};
const importe = (n: unknown) => formatearImporte(Number(n) || 0) ?? "—";
const entero = new Intl.NumberFormat("es-MX");
const nombreMesa = (m: Mesa) => m.nombre?.trim() || `Mesa ${m.numero}`;
const ACTIVOS = new Set(["abierta", "en_preparacion", "lista", "entregada"]);

function PanelPedido({ mesa, carta, abierto, alCerrar, alEnviado }: { mesa: Mesa; carta: CategoriaCarta[]; abierto: boolean; alCerrar: () => void; alEnviado: () => void }) {
	const [categoria, setCategoria] = useState(String(carta[0]?.id ?? ""));
	const [carrito, setCarrito] = useState<{ plato: PlatoCarta; cantidad: number }[]>([]);
	const [comensales, setComensales] = useState(String(Math.min(mesa.capacidad || 2, 2)));
	const [enviando, setEnviando] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { notificar } = useNotificaciones();

	const total = carrito.reduce((a, c) => a + (c.plato.precio ?? 0) * c.cantidad, 0);
	const platos = carta.find((c) => String(c.id) === categoria)?.platillos ?? [];
	const cambiar = (plato: PlatoCarta, delta: number) =>
		setCarrito((cs) => {
			const actual = cs.find((c) => c.plato.id === plato.id);
			if (!actual) return delta > 0 ? [...cs, { plato, cantidad: 1 }] : cs;
			const cantidad = actual.cantidad + delta;
			return cantidad <= 0 ? cs.filter((c) => c.plato.id !== plato.id) : cs.map((c) => (c.plato.id === plato.id ? { ...c, cantidad } : c));
		});
	const cantidadDe = (id: number) => carrito.find((c) => c.plato.id === id)?.cantidad ?? 0;

	async function enviar() {
		const personas = Number(comensales);
		if (!Number.isInteger(personas) || personas < 1 || personas > 50) return setError("Escribe cuántas personas hay en la mesa (de 1 a 50).");
		setEnviando(true);
		setError(null);
		try {
			const creado = await api.post<{ ordenId: string }>("/pedidos/mesa", {
				mesa: mesa.numero,
				items: carrito.map((c) => ({ platilloId: c.plato.id, cantidad: c.cantidad })),
				numComensales: personas,
			});
			await api.post(`/pedidos/confirmar/${encodeURIComponent(creado.ordenId)}`, {});
			notificar({ tono: "exito", titulo: `Pedido de ${nombreMesa(mesa)} enviado a cocina`, descripcion: contar(carrito.reduce((a, c) => a + c.cantidad, 0), "plato") });
			alEnviado();
		} catch (err) {
			registrarError(err, "sala: enviar pedido");
			setError("No se pudo enviar el pedido. Revisa la conexión y vuelve a intentarlo.");
		} finally {
			setEnviando(false);
		}
	}

	return (
		<PanelLateral
			ancho="amplio"
			abierto={abierto}
			alCambiarAbierto={(a) => !a && alCerrar()}
			titulo={`Pedido de ${nombreMesa(mesa)}`}
			descripcion={`Para ${contar(mesa.capacidad, "persona")}.`}
			pie={
				<>
					<Boton variante="secundario" className="min-h-12" onClick={alCerrar}>
						Cancelar
					</Boton>
					<Boton className="min-h-12" icono={<Send />} cargando={enviando} deshabilitado={carrito.length === 0} onClick={() => void enviar()}>
						{carrito.length === 0 ? "Añade algún plato" : `Enviar a cocina · ${importe(total)}`}
					</Boton>
				</>
			}
		>
			<div className="flex flex-col gap-(--espacio-lg)">
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2">
					<Selector etiqueta="Categoría" opciones={carta.map((c) => ({ valor: String(c.id), texto: c.nombre }))} value={categoria} onChange={(e) => setCategoria(e.target.value)} />
					<Campo etiqueta="Comensales" type="number" inputMode="numeric" min={1} max={50} value={comensales} onChange={(e) => setComensales(e.target.value)} />
				</div>
				{platos.length === 0 ? (
					<EstadoVacio titulo="Esta categoría no tiene platos" descripcion="Elige otra categoría." />
				) : (
					<ul className="m-0 flex list-none flex-col p-0" aria-label={`Platos de ${carta.find((c) => String(c.id) === categoria)?.nombre ?? "la categoría"}`}>
						{platos.map((p) => {
							const n = cantidadDe(p.id);
							return (
								<li key={p.id} className="flex items-center justify-between gap-3 border-b border-borde-sutil py-(--espacio-sm) last:border-b-0">
									<span className="flex min-w-0 flex-col">
										<span className="font-semibold text-texto-principal">{p.nombre}</span>
										<span className="text-(length:--texto-pequeno) text-texto-secundario">{p.precio === null ? "Sin precio" : importe(p.precio)}</span>
									</span>
									<span className="flex shrink-0 items-center gap-2">
										{n > 0 && (
											<>
												<Boton variante="secundario" soloIcono icono={<Minus />} className="size-12" onClick={() => cambiar(p, -1)}>
													{`Quitar un ${p.nombre}`}
												</Boton>
												<span className="w-6 text-center font-semibold cifras-consola" aria-live="polite">
													{n}
													<span className="solo-lectores"> en el pedido</span>
												</span>
											</>
										)}
										<Boton variante="secundario" soloIcono icono={<Plus />} className="size-12" deshabilitado={p.precio === null} onClick={() => cambiar(p, 1)}>
											{`Añadir un ${p.nombre}`}
										</Boton>
									</span>
								</li>
							);
						})}
					</ul>
				)}

				{carrito.length > 0 && (
					<section aria-labelledby={`resumen-${mesa.id}`} className="flex flex-col gap-(--espacio-sm) rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-md)">
						<h3 id={`resumen-${mesa.id}`} className="m-0 font-semibold text-texto-principal">
							{`En el pedido: ${contar(carrito.reduce((a, c) => a + c.cantidad, 0), "plato")}`}
						</h3>
						<ul className="m-0 flex list-none flex-col gap-1 p-0 text-(length:--texto-pequeno)">
							{carrito.map((c) => (
								<li key={c.plato.id} className="flex justify-between gap-3">
									<span>{`${c.cantidad} × ${c.plato.nombre}`}</span>
									<span className="cifras-consola">{importe((c.plato.precio ?? 0) * c.cantidad)}</span>
								</li>
							))}
						</ul>
						<p className="m-0 flex items-baseline justify-between gap-3 border-t border-borde-sutil pt-(--espacio-sm)" aria-live="polite">
							<span className="text-texto-secundario">Total</span>
							<span className="font-titulos text-(length:--texto-titulo-3) numeros-tabulares">{importe(total)}</span>
						</p>
					</section>
				)}
				{error && (
					<p role="alert" className="m-0 text-error">
						{error}
					</p>
				)}
			</div>
		</PanelLateral>
	);
}

export function MeseroPanel() {
	const [mesas, recargarMesas] = useCarga(() => pedirPanel<Mesa[]>("/mesas"), "sala: mesas");
	const [pedidos, recargarPedidos] = useCarga(() => pedirPanel<PedidoActivo[]>("/pedidos/admin/recent"), "sala: pedidos");
	const [carta] = useCarga(async () => normalizarCarta(await api.get<unknown>("/menu/categories/with-products")), "sala: carta");
	const [filtro, setFiltro] = useState("todas");
	const [abierta, setAbierta] = useState<Mesa | null>(null);
	const [sirviendo, setSirviendo] = useState<string | null>(null);
	const { notificar } = useNotificaciones();

	useEffect(() => {
		const t = setInterval(() => void recargarPedidos({ silenciosa: true }), 20000);
		return () => clearInterval(t);
	}, [recargarPedidos]);

	const listaMesas = useMemo(() => (mesas.estado === "listo" && Array.isArray(mesas.datos) ? mesas.datos.filter((m) => m.activa !== false) : []), [mesas]);
	const activos = useMemo(() => (pedidos.estado === "listo" && Array.isArray(pedidos.datos) ? pedidos.datos.filter((p) => p.status && ACTIVOS.has(p.status)) : []), [pedidos]);
	const pedidosDe = (m: Mesa) => activos.filter((p) => p.table === `Mesa ${m.numero}`);
	const estadoDe = (m: Mesa): EstadoMesa => {
		const suyos = pedidosDe(m);
		if (suyos.length === 0) return "libre";
		return suyos.some((p) => p.status === "lista") ? "lista" : "ocupada";
	};
	const visibles = filtro === "todas" ? listaMesas : listaMesas.filter((m) => estadoDe(m) === filtro);
	const cuantas = (e: EstadoMesa) => listaMesas.filter((m) => estadoDe(m) === e).length;
	// «Ver cálculo» (P1.4): cada mesa activa que cuenta, con el estado que le dan sus pedidos.
	const desglose = (formula: string, estados: EstadoMesa[]) => {
		const filas = listaMesas.filter((m) => estados.includes(estadoDe(m)));
		return { calculo: conteo(formula, filas, (m) => nombreMesa(m), (m) => estadoDe(m), { filtros: { mesas: "activas" } }), valorCalculo: filas.length };
	};
	const estadoIndicadores = mesas.estado === "listo" ? pedidos.estado : mesas.estado;

	async function servir(pedido: PedidoActivo, mesa: Mesa) {
		setSirviendo(pedido.id);
		try {
			await api.patch(`/pedidos/${encodeURIComponent(pedido.id)}/estatus`, { estatus: "entregada" });
			notificar({ tono: "exito", titulo: `${nombreMesa(mesa)}: servido`, descripcion: "La caja ya puede cobrarlo." });
			await recargarPedidos({ silenciosa: true });
		} catch (err) {
			registrarError(err, "sala: servir");
			notificar({ tono: "error", titulo: "No se pudo marcar como servido", descripcion: "Vuelve a intentarlo en un momento." });
		} finally {
			setSirviendo(null);
		}
	}

	return (
		<PlantillaPanel titulo="Mesas" descripcion="Toma pedidos y marca lo servido.">
			<div className={REJILLA_TRES_INDICADORES}>
				<Indicador estado={estadoIndicadores} alReintentar={() => Promise.all([recargarMesas(), recargarPedidos()])} rotulo="Libres" {...desglose("libres = mesas activas sin pedidos abiertos", ["libre"])} valor={entero.format(cuantas("libre"))} detalle={`De ${entero.format(listaMesas.length)} mesas`} className={PROTAGONISTA_DE_TRES} />
				<Indicador estado={estadoIndicadores} rotulo="Ocupadas" {...desglose("ocupadas = mesas activas con algún pedido abierto", ["ocupada", "lista"])} valor={entero.format(cuantas("ocupada") + cuantas("lista"))} />
				<Indicador estado={estadoIndicadores} rotulo="Con plato listo" {...desglose("con plato listo = mesas con un pedido en estado «lista»", ["lista"])} valor={entero.format(cuantas("lista"))} />
			</div>

			<BloquePanel
				titulo="Mesas"
				acciones={
					<Selector
						etiqueta="Mostrar"
						opciones={[
							{ valor: "todas", texto: "Todas" },
							{ valor: "libre", texto: "Libres" },
							{ valor: "ocupada", texto: "Ocupadas" },
							{ valor: "lista", texto: "Con plato listo" },
						]}
						value={filtro}
						onChange={(e) => setFiltro(e.target.value)}
					/>
				}
			>
				{mesas.estado === "error" ? (
					<EstadoError titulo="No pudimos traer las mesas" descripcion="Vuelve a intentarlo en un momento." alReintentar={recargarMesas} />
				) : mesas.estado === "cargando" ? null : visibles.length === 0 ? (
					<EstadoVacio titulo={listaMesas.length === 0 ? "No hay mesas dadas de alta" : "No hay mesas así ahora"} descripcion={listaMesas.length === 0 ? "Administración las da de alta en el sistema." : "Elige otro filtro."} />
				) : (
					<ul className="m-0 grid list-none grid-cols-1 gap-(--espacio-md) p-0 sm:grid-cols-2 xl:grid-cols-3" aria-label="Mesas">
						{visibles.map((m) => {
							const estado = estadoDe(m);
							const listo = pedidosDe(m).find((p) => p.status === "lista");
							return (
								<li key={m.id} className="flex flex-col gap-(--espacio-md) rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-md)">
									<div className="flex items-start justify-between gap-3">
										<div className="flex min-w-0 flex-col gap-1">
											<h3 className="m-0 font-titulos text-(length:--texto-titulo-3) font-normal leading-[1.15] text-texto-principal">{nombreMesa(m)}</h3>
											<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">{`Para ${contar(m.capacidad, "persona")}`}</p>
										</div>
										<Insignia tono={ESTADOS[estado].tono} className="whitespace-nowrap">
											{ESTADOS[estado].texto}
										</Insignia>
									</div>
									<div className="flex flex-col gap-2">
										{listo && (
											<Boton className="min-h-12 w-full" icono={<HandPlatter />} cargando={sirviendo === listo.id} aria-label={`Marcar servido el pedido de ${nombreMesa(m)}`} onClick={() => void servir(listo, m)}>
												Marcar servido
											</Boton>
										)}
										<Boton
											className="min-h-12 w-full"
											variante={estado === "libre" ? "primario" : "secundario"}
											deshabilitado={carta.estado !== "listo"}
											aria-label={`${estado === "libre" ? "Tomar pedido" : "Añadir un pedido"} de ${nombreMesa(m)}`}
											onClick={() => setAbierta(m)}
										>
											{estado === "libre" ? "Tomar pedido" : "Añadir un pedido"}
										</Boton>
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</BloquePanel>

			{abierta && carta.estado === "listo" && (
				<PanelPedido
					key={abierta.id}
					mesa={abierta}
					carta={carta.datos}
					abierto
					alCerrar={() => setAbierta(null)}
					alEnviado={() => {
						setAbierta(null);
						void recargarPedidos({ silenciosa: true });
					}}
				/>
			)}
			<AppOperaciones />
		</PlantillaPanel>
	);
}
