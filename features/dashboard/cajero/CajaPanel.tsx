"use client";

import { useMemo, useState } from "react";
import { Banknote, CreditCard, Receipt, Smartphone } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { PlantillaPanel } from "@/components/paneles/PlantillaPanel";
import { INDICADOR_PROTAGONISTA, REJILLA_INDICADORES } from "@/components/paneles/rejilla";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { Buscador } from "@/components/ui/Buscador";
import { Campo } from "@/components/ui/Campo";
import { Dialogo } from "@/components/ui/Dialogo";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { GraficaDonut } from "@/components/ui/graficas/GraficaDonut";
import { Indicador } from "@/components/ui/Indicador";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import { MOCK_TICKETS, type Ticket } from "@/features/dashboard/cajero/data/cajeroMock";
import { contar } from "@/lib/formato/plural";
import { formatearImporte } from "@/lib/formato/precio";
import { cn } from "@/lib/utils";

/**
 * Panel de caja (PLAN 5.17). Pensado primero para tableta: cifras grandes y objetivos de 48 px. Sin
 * endpoint, como antes (`cajeroMock` en memoria), y ahora avisado (D-13). Cambia la forma:
 * indicadores, tickets por cobrar en tarjetas grandes con «Cobrar», cobro en un diálogo con el
 * cambio en vivo, los cobrados en una tabla y el reparto por forma de pago calculado de esos cobros
 * (antes, porcentajes fijos del mock).
 */

const METODOS = [
	{ id: "efectivo", texto: "Efectivo", icono: Banknote },
	{ id: "tarjeta", texto: "Tarjeta", icono: CreditCard },
	{ id: "transferencia", texto: "Transferencia", icono: Smartphone },
] as const;
const importe = (n: number) => formatearImporte(n) ?? "—";
const entero = new Intl.NumberFormat("es-MX");
const metodoTexto = (id?: string) => METODOS.find((m) => m.id === id)?.texto ?? "—";
const horaAhora = () => new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

function DialogoCobro({ ticket, alCobrar }: { ticket: Ticket; alCobrar: (metodo: string) => void }) {
	const [abierto, setAbierto] = useState(false);
	const [metodo, setMetodo] = useState<string>("efectivo");
	const [recibido, setRecibido] = useState("");
	const [error, setError] = useState<string | null>(null);
	const cantidad = recibido.trim() === "" ? Number.NaN : Number(recibido);
	const diferencia = Number.isFinite(cantidad) ? cantidad - ticket.total : null;

	return (
		<Dialogo
			abierto={abierto}
			alCambiarAbierto={(a) => {
				setAbierto(a);
				if (a) {
					setMetodo("efectivo");
					setRecibido("");
					setError(null);
				}
			}}
			disparador={
				<Boton className="min-h-12 w-full" aria-label={`Cobrar ${importe(ticket.total)} de ${ticket.mesa}`}>
					{`Cobrar ${importe(ticket.total)}`}
				</Boton>
			}
			titulo={`Cobrar ${ticket.mesa}`}
			descripcion={`Ticket ${ticket.id} · ${ticket.cliente} · ${contar(ticket.items, "artículo")}.`}
			pie={
				<>
					<Boton variante="secundario" className="min-h-12" onClick={() => setAbierto(false)}>
						Cancelar
					</Boton>
					<Boton
						className="min-h-12"
						onClick={() => {
							if (metodo === "efectivo" && !(cantidad >= ticket.total)) {
								setError(Number.isFinite(cantidad) ? `Faltan ${importe(ticket.total - cantidad)}.` : "Escribe cuánto te dan.");
								return;
							}
							alCobrar(metodo);
							setAbierto(false);
						}}
					>
						{`Cobrar ${importe(ticket.total)}`}
					</Boton>
				</>
			}
		>
			<div className="flex flex-col gap-(--espacio-lg)">
				<p className="m-0 flex items-baseline justify-between gap-3">
					<span className="text-texto-secundario">Total</span>
					<span className="texto-cifra-destacada">{importe(ticket.total)}</span>
				</p>
				<fieldset className="m-0 flex min-w-0 flex-col gap-(--espacio-sm) border-0 p-0">
					<legend className="mb-(--espacio-xs) p-0 font-semibold text-texto-principal">Forma de pago</legend>
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
						{METODOS.map(({ id, texto, icono: Icono }) => (
							<label
								key={id}
								className={cn(
									"flex min-h-12 cursor-pointer items-center gap-3 rounded-control border px-4 text-texto-principal has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foco",
									metodo === id ? "border-acento bg-superficie-cafe font-semibold" : "border-borde-control bg-superficie",
								)}
							>
								<input type="radio" name={`metodo-${ticket.id}`} value={id} checked={metodo === id} onChange={() => setMetodo(id)} className="solo-lectores" />
								<Icono aria-hidden="true" className="size-5 shrink-0 stroke-[1.5]" />
								{texto}
							</label>
						))}
					</div>
				</fieldset>
				{metodo === "efectivo" && (
					<div className="flex flex-col gap-(--espacio-sm)">
						<Campo etiqueta="Recibido" type="number" inputMode="decimal" min={0} step="0.01" value={recibido} onChange={(e) => setRecibido(e.target.value)} error={error} ayuda="En pesos." />
						<p aria-live="polite" className="m-0 flex items-baseline justify-between gap-3">
							<span className="text-texto-secundario">{diferencia !== null && diferencia < 0 ? "Faltan" : "Cambio"}</span>
							<span className="font-titulos text-(length:--texto-titulo-2) numeros-tabulares">{diferencia === null ? "—" : importe(Math.abs(diferencia))}</span>
						</p>
					</div>
				)}
			</div>
		</Dialogo>
	);
}

export function CajaPanel() {
	const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
	const [busqueda, setBusqueda] = useState("");
	const { notificar } = useNotificaciones();

	const filtrados = useMemo(() => {
		const q = busqueda.trim().toLowerCase();
		return q ? tickets.filter((t) => `${t.id} ${t.mesa} ${t.cliente}`.toLowerCase().includes(q)) : tickets;
	}, [tickets, busqueda]);
	const pendientes = filtrados.filter((t) => t.estado === "pendiente");
	const cobrados = tickets.filter((t) => t.estado === "cobrado");
	const cobradoHoy = cobrados.reduce((a, t) => a + t.total, 0);
	const porCobrar = tickets.filter((t) => t.estado === "pendiente");
	const porMetodo = METODOS.map((m) => ({ nombre: m.texto, valor: cobrados.filter((t) => t.metodoPago === m.id).reduce((a, t) => a + t.total, 0) })).filter((p) => p.valor > 0);

	function cobrar(t: Ticket, metodo: string) {
		setTickets((ts) => ts.map((x) => (x.id === t.id ? { ...x, estado: "cobrado", metodoPago: metodo, cobradoAt: horaAhora() } : x)));
		notificar({ tono: "exito", titulo: `${t.mesa} cobrada`, descripcion: `${importe(t.total)} en ${metodoTexto(metodo).toLowerCase()}.` });
	}

	const columnasCobrados: ColumnaTabla<Ticket>[] = [
		{ clave: "mesa", titulo: "Mesa", principal: true, celda: (t) => t.mesa },
		{ clave: "ticket", titulo: "Ticket", celda: (t) => t.id },
		{ clave: "hora", titulo: "Hora", celda: (t) => t.cobradoAt ?? "—" },
		{ clave: "metodo", titulo: "Forma de pago", celda: (t) => metodoTexto(t.metodoPago) },
		{ clave: "total", titulo: "Total", numerica: true, celda: (t) => importe(t.total) },
	];

	return (
		<PlantillaPanel titulo="Cobros" descripcion="Lo que falta por cobrar y lo cobrado hoy." acciones={<Buscador etiqueta="Buscar por ticket, mesa o cliente" valor={busqueda} alCambiar={setBusqueda} marcador="Ticket, mesa o cliente" />}>
			<Aviso tono="info" rol={null} titulo="Pantalla con datos de ejemplo.">
				Aún no está conectada al sistema: los cobros se ven en esta visita, pero no se guardan.
			</Aviso>

			<div className={REJILLA_INDICADORES}>
				<Indicador rotulo="Por cobrar" valor={importe(porCobrar.reduce((a, t) => a + t.total, 0))} detalle={contar(porCobrar.length, "ticket abierto", "tickets abiertos")} className={INDICADOR_PROTAGONISTA} datosDeEjemplo />
				<Indicador rotulo="Cobrado hoy" valor={importe(cobradoHoy)} />
				<Indicador rotulo="Tickets cerrados" valor={entero.format(cobrados.length)} />
				<Indicador rotulo="Ticket medio" valor={cobrados.length ? importe(cobradoHoy / cobrados.length) : "—"} />
			</div>

			<BloquePanel titulo="Por cobrar" descripcion={busqueda ? `${contar(pendientes.length, "resultado")}.` : undefined}>
				{pendientes.length === 0 ? (
					<EstadoVacio icono={<Receipt />} titulo={busqueda ? "Nada coincide" : "Todo cobrado"} descripcion={busqueda ? "Prueba con otro número, mesa o nombre." : "No hay tickets abiertos ahora."} />
				) : (
					<ul className="m-0 grid list-none grid-cols-1 gap-(--espacio-md) p-0 md:grid-cols-2 2xl:grid-cols-3" aria-label="Tickets por cobrar">
						{pendientes.map((t) => (
							<li key={t.id} className="flex flex-col gap-(--espacio-md) rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-lg)">
								<div className="flex items-start justify-between gap-3">
									<div className="flex min-w-0 flex-col gap-1">
										<h3 className="m-0 font-titulos text-(length:--texto-titulo-3) font-normal leading-[1.15] text-texto-principal">{t.mesa}</h3>
										<p className="m-0 text-texto-secundario">{`${t.cliente} · ticket ${t.id}`}</p>
									</div>
									<p className="m-0 texto-cifra-destacada whitespace-nowrap">{importe(t.total)}</p>
								</div>
								<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">{`${contar(t.items, "artículo")} · esperando ${t.tiempo}`}</p>
								<DialogoCobro ticket={t} alCobrar={(m) => cobrar(t, m)} />
							</li>
						))}
					</ul>
				)}
			</BloquePanel>

			<div className="grid grid-cols-1 items-start gap-(--espacio-xl) xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
				<BloquePanel titulo="Cobrados hoy" datosDeEjemplo>
					<Tabla leyenda="Cobrados hoy" columnas={columnasCobrados} filas={[...cobrados].reverse()} claveFila={(t) => t.id} vacio={<EstadoVacio icono={<Receipt />} titulo="Aún no hay cobros hoy" />} />
				</BloquePanel>
				<GraficaDonut
					titulo="Formas de pago"
					descripcion="De lo cobrado hoy"
					datosDeEjemplo
					porciones={porMetodo}
					formatoValor={importe}
					formatoTotal={(n) => `$ ${new Intl.NumberFormat("es-MX", { notation: "compact", maximumFractionDigits: 1 }).format(n)}`}
					rotuloTotal="Total"
					tituloCategoria="Forma de pago"
					textoVacio="Aún no hay cobros hoy."
				/>
			</div>
		</PlantillaPanel>
	);
}
