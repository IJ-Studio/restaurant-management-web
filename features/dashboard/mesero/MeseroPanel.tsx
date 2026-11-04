"use client";

import { useEffect, useMemo, useState } from "react";
import { BellRing, Minus, Plus, Send } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { PlantillaPanel } from "@/components/paneles/PlantillaPanel";
import { PROTAGONISTA_DE_TRES, REJILLA_TRES_INDICADORES } from "@/components/paneles/rejilla";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { Campo, Selector } from "@/components/ui/Campo";
import { PanelLateral } from "@/components/ui/Dialogo";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Indicador } from "@/components/ui/Indicador";
import { Insignia, type TonoInsignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import type { DiningTable, MenuCategory, MenuItem, OrderItem, TableStatus } from "@/features/shared/data/restaurantData";
import { MenuService, OrderService, TableService } from "@/features/shared/services/dataService";
import { contar } from "@/lib/formato/plural";
import { formatearImporte } from "@/lib/formato/precio";

/**
 * Panel del mesero (PLAN 5.18), pensado para el móvil. La misma lógica que antes, sobre los servicios
 * locales (`TableService`, `MenuService`, `OrderService`): tomar un pedido crea la orden y ocupa la
 * mesa; «Pedir la cuenta» pasa la mesa a «lista» (antes «Llamar al cajero»). Cambia la forma:
 * tarjetas de mesa con su estado en texto, el pedido en un panel lateral con categorías, contador
 * de 48 px y el total con el descuento a la vista.
 *
 * Se mantiene lo que hacía el pedido: el descuento se calcula y se muestra, pero la orden se guarda
 * con el total sin descuento, como antes (anotado en la bitácora). La pestaña «Pedidos» de la barra
 * antigua no mostraba nada y se retira.
 */

const ESTADOS: Record<TableStatus, { texto: string; tono: TonoInsignia }> = {
	libre: { texto: "Libre", tono: "exito" },
	ocupada: { texto: "Ocupada", tono: "info" },
	lista: { texto: "Cuenta pedida", tono: "aviso" },
};
const importe = (n: number) => formatearImporte(n) ?? "—";
const entero = new Intl.NumberFormat("es-MX");
const numeroDeOrden = () => `#${Math.floor(Math.random() * 9000) + 1000}`;

function PanelPedido({ mesa, carta, abierto, alCerrar, alEnviar }: { mesa: DiningTable; carta: MenuCategory[]; abierto: boolean; alCerrar: () => void; alEnviar: (items: OrderItem[]) => void }) {
	const [categoria, setCategoria] = useState(carta[0]?.id ?? "");
	const [carrito, setCarrito] = useState<{ item: MenuItem; cantidad: number }[]>([]);
	const [descuento, setDescuento] = useState({ tipo: "ninguno", valor: "" });

	const subtotal = carrito.reduce((a, c) => a + c.item.price * c.cantidad, 0);
	const valor = Number(descuento.valor) || 0;
	const rebaja = descuento.tipo === "porcentaje" ? subtotal * (Math.min(100, Math.max(0, valor)) / 100) : descuento.tipo === "fijo" ? Math.min(subtotal, Math.max(0, valor)) : 0;
	const platos = carta.find((c) => c.id === categoria)?.items ?? [];

	const cambiar = (item: MenuItem, delta: number) =>
		setCarrito((cs) => {
			const actual = cs.find((c) => c.item.id === item.id);
			if (!actual) return delta > 0 ? [...cs, { item, cantidad: 1 }] : cs;
			const cantidad = actual.cantidad + delta;
			return cantidad <= 0 ? cs.filter((c) => c.item.id !== item.id) : cs.map((c) => (c.item.id === item.id ? { ...c, cantidad } : c));
		});
	const cantidadDe = (id: MenuItem["id"]) => carrito.find((c) => c.item.id === id)?.cantidad ?? 0;

	return (
		<PanelLateral
			ancho="amplio"
			abierto={abierto}
			alCambiarAbierto={(a) => !a && alCerrar()}
			titulo={`Pedido de ${mesa.name}`}
			descripcion={`Para ${contar(mesa.capacity, "persona")}.`}
			pie={
				<>
					<Boton variante="secundario" className="min-h-12" onClick={alCerrar}>
						Cancelar
					</Boton>
					<Boton
						className="min-h-12"
						icono={<Send />}
						deshabilitado={carrito.length === 0}
						onClick={() => alEnviar(carrito.map((c) => ({ name: c.item.name, qty: c.cantidad, notes: "" })))}
					>
						{carrito.length === 0 ? "Añade algún plato" : `Enviar a cocina · ${importe(subtotal - rebaja)}`}
					</Boton>
				</>
			}
		>
			<div className="flex flex-col gap-(--espacio-lg)">
				<Selector etiqueta="Categoría" opciones={carta.map((c) => ({ valor: c.id, texto: c.name }))} value={categoria} onChange={(e) => setCategoria(e.target.value)} />
				<ul className="m-0 flex list-none flex-col p-0" aria-label={`Platos de ${carta.find((c) => c.id === categoria)?.name ?? "la categoría"}`}>
					{platos.map((p) => {
						const n = cantidadDe(p.id);
						return (
							<li key={p.id} className="flex items-center justify-between gap-3 border-b border-borde-sutil py-(--espacio-sm) last:border-b-0">
								<span className="flex min-w-0 flex-col">
									<span className="font-semibold text-texto-principal">{p.name}</span>
									<span className="text-(length:--texto-pequeno) text-texto-secundario">{p.available ? importe(p.price) : "Agotado"}</span>
								</span>
								<span className="flex shrink-0 items-center gap-2">
									{n > 0 && (
										<>
											<Boton variante="secundario" soloIcono icono={<Minus />} className="size-12" onClick={() => cambiar(p, -1)}>
												{`Quitar un ${p.name}`}
											</Boton>
											<span className="w-6 text-center font-semibold numeros-tabulares" aria-live="polite">
												{n}
												<span className="solo-lectores"> en el pedido</span>
											</span>
										</>
									)}
									<Boton variante="secundario" soloIcono icono={<Plus />} className="size-12" deshabilitado={!p.available} onClick={() => cambiar(p, 1)}>
										{`Añadir un ${p.name}`}
									</Boton>
								</span>
							</li>
						);
					})}
				</ul>

				{carrito.length > 0 && (
					<section aria-labelledby={`resumen-${mesa.id}`} className="flex flex-col gap-(--espacio-sm) rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-md)">
						<h3 id={`resumen-${mesa.id}`} className="m-0 font-semibold text-texto-principal">
							{`En el pedido: ${contar(carrito.reduce((a, c) => a + c.cantidad, 0), "plato")}`}
						</h3>
						<ul className="m-0 flex list-none flex-col gap-1 p-0 text-(length:--texto-pequeno)">
							{carrito.map((c) => (
								<li key={c.item.id} className="flex justify-between gap-3">
									<span>{`${c.cantidad} × ${c.item.name}`}</span>
									<span className="numeros-tabulares">{importe(c.item.price * c.cantidad)}</span>
								</li>
							))}
						</ul>
						<div className="grid grid-cols-1 gap-(--espacio-sm) sm:grid-cols-2">
							<Selector
								etiqueta="Descuento"
								opciones={[
									{ valor: "ninguno", texto: "Sin descuento" },
									{ valor: "porcentaje", texto: "Porcentaje" },
									{ valor: "fijo", texto: "Cantidad fija" },
								]}
								value={descuento.tipo}
								onChange={(e) => setDescuento({ tipo: e.target.value, valor: "" })}
							/>
							{descuento.tipo !== "ninguno" && (
								<Campo
									etiqueta={descuento.tipo === "porcentaje" ? "Porcentaje" : "Cantidad"}
									type="number"
									inputMode="decimal"
									min={0}
									max={descuento.tipo === "porcentaje" ? 100 : undefined}
									value={descuento.valor}
									onChange={(e) => setDescuento({ ...descuento, valor: e.target.value })}
									ayuda={descuento.tipo === "porcentaje" ? "De 0 a 100." : "En pesos."}
								/>
							)}
						</div>
						<p className="m-0 flex items-baseline justify-between gap-3 border-t border-borde-sutil pt-(--espacio-sm)" aria-live="polite">
							<span className="text-texto-secundario">{rebaja > 0 ? `Total (−${importe(rebaja)})` : "Total"}</span>
							<span className="font-titulos text-(length:--texto-titulo-3) numeros-tabulares">{importe(subtotal - rebaja)}</span>
						</p>
					</section>
				)}
			</div>
		</PanelLateral>
	);
}

export function MeseroPanel() {
	const [mesas, setMesas] = useState<DiningTable[]>([]);
	const [carta, setCarta] = useState<MenuCategory[]>([]);
	const [cargado, setCargado] = useState(false);
	const [filtro, setFiltro] = useState("todas");
	const [abierta, setAbierta] = useState<DiningTable | null>(null);
	const { notificar } = useNotificaciones();

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- lectura inicial de los servicios locales
		setMesas(TableService.getTables());
		setCarta(MenuService.getMenu());
		setCargado(true);
	}, []);

	function pedirCuenta(m: DiningTable) {
		TableService.updateTableStatus(m.id, "lista");
		setMesas(TableService.getTables());
		notificar({ tono: "exito", titulo: `Cuenta pedida para ${m.name}`, descripcion: "La caja ya la ve como lista para cobrar." });
	}

	function enviar(m: DiningTable, items: OrderItem[]) {
		const id = numeroDeOrden();
		const precios = new Map(carta.flatMap((c) => c.items).map((i) => [i.name, i.price]));
		const total = items.reduce((a, i) => a + (precios.get(i.name) ?? 0) * i.qty, 0);
		OrderService.addOrder({ id, table: String(m.id), timestamp: "Ahora", status: "nuevo", items, total });
		TableService.updateTableStatus(m.id, "ocupada", id);
		setMesas(TableService.getTables());
		setAbierta(null);
		notificar({ tono: "exito", titulo: `Pedido de ${m.name} enviado a cocina`, descripcion: contar(items.reduce((a, i) => a + i.qty, 0), "plato") });
	}

	const visibles = useMemo(() => (filtro === "todas" ? mesas : mesas.filter((m) => m.status === filtro)), [mesas, filtro]);
	const cuenta = (s: TableStatus) => mesas.filter((m) => m.status === s).length;
	const estado = cargado ? ("listo" as const) : ("cargando" as const);

	return (
		<PlantillaPanel titulo="Mesas" descripcion="Toma pedidos y pide la cuenta desde aquí.">
			<Aviso tono="info" rol={null} titulo="Pantalla con datos de ejemplo.">
				Las mesas y los pedidos se guardan solo en este dispositivo.
			</Aviso>

			<div className={REJILLA_TRES_INDICADORES}>
				<Indicador estado={estado} rotulo="Libres" valor={entero.format(cuenta("libre"))} detalle={`De ${entero.format(mesas.length)} mesas`} className={PROTAGONISTA_DE_TRES} />
				<Indicador estado={estado} rotulo="Ocupadas" valor={entero.format(cuenta("ocupada"))} />
				<Indicador estado={estado} rotulo="Cuenta pedida" valor={entero.format(cuenta("lista"))} />
			</div>

			<BloquePanel
				titulo="Mapa de mesas"
				acciones={
					<Selector
						etiqueta="Mostrar"
						opciones={[
							{ valor: "todas", texto: "Todas" },
							{ valor: "libre", texto: "Libres" },
							{ valor: "ocupada", texto: "Ocupadas" },
							{ valor: "lista", texto: "Cuenta pedida" },
						]}
						value={filtro}
						onChange={(e) => setFiltro(e.target.value)}
					/>
				}
			>
				{cargado && visibles.length === 0 ? (
					<EstadoVacio titulo="No hay mesas así ahora" descripcion="Elige otro filtro." />
				) : (
					<ul className="m-0 grid list-none grid-cols-1 gap-(--espacio-md) p-0 sm:grid-cols-2 xl:grid-cols-3" aria-label="Mesas">
						{visibles.map((m) => (
							<li key={m.id} className="flex flex-col gap-(--espacio-md) rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-md)">
								<div className="flex items-start justify-between gap-3">
									<div className="flex min-w-0 flex-col gap-1">
										<h3 className="m-0 font-titulos text-(length:--texto-titulo-3) font-normal leading-[1.15] text-texto-principal">{m.name}</h3>
										<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">{`Para ${contar(m.capacity, "persona")}${m.currentOrderId ? ` · pedido ${m.currentOrderId}` : ""}`}</p>
									</div>
									<Insignia tono={ESTADOS[m.status].tono} className="whitespace-nowrap">
										{ESTADOS[m.status].texto}
									</Insignia>
								</div>
								<div className="flex flex-col gap-2">
									{m.status !== "lista" && (
										<Boton className="min-h-12 w-full" variante={m.status === "libre" ? "primario" : "secundario"} aria-label={`${m.status === "libre" ? "Tomar pedido" : "Añadir al pedido"} de ${m.name}`} onClick={() => setAbierta(m)}>
											{m.status === "libre" ? "Tomar pedido" : "Añadir al pedido"}
										</Boton>
									)}
									{m.status === "ocupada" && (
										<Boton variante="secundario" className="min-h-12 w-full" icono={<BellRing />} aria-label={`Pedir la cuenta de ${m.name}`} onClick={() => pedirCuenta(m)}>
											Pedir la cuenta
										</Boton>
									)}
									{m.status === "lista" && <p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">La caja la tiene para cobrar.</p>}
								</div>
							</li>
						))}
					</ul>
				)}
			</BloquePanel>

			{abierta && <PanelPedido key={abierta.id} mesa={abierta} carta={carta} abierto alCerrar={() => setAbierta(null)} alEnviar={(items) => enviar(abierta, items)} />}
		</PlantillaPanel>
	);
}
