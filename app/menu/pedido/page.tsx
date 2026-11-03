"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RotateCw, Send, UtensilsCrossed, X } from "lucide-react";
import { Boton } from "@/components/ui/Boton";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { useConfirmacion } from "@/components/ui/DialogoConfirmacion";
import { Esqueleto, ZonaCargando } from "@/components/ui/Esqueleto";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Imagen } from "@/components/ui/Imagen";
import { Insignia } from "@/components/ui/Insignia";
import type { TonoInsignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { Pestanas } from "@/components/ui/Pestanas";
import { EncabezadoPublico } from "@/components/marca/EncabezadoPublico";
import OnlineOnly from "@/components/pwa/OnlineOnly";
import { formatearPrecio } from "@/lib/formato/precio";
import { registrarError } from "@/lib/registro/registrar-error";
import { pedirSesion } from "@/lib/sesion/sesion-cliente";

/**
 * Tu pedido (`/menu/pedido`, PLAN 4.13). La lógica no cambia: los mismos endpoints
 * (`/pedidos/usuario`, `PATCH /pedidos/cancelar/{id}`, `DELETE /pedidos/item/{id}`,
 * `POST /pedidos/confirmar/{id}`), la mesa en `?mesaQuery` y en `num_mesa`, la ventana de dos
 * minutos para cancelar y el paso al checkout para el domicilio.
 *
 * Lo nuevo: pestañas del sistema (`?tab=`), el diálogo de confirmación en lugar de `confirm()`,
 * notificaciones en lugar de `alert()` con redacción cálida (nunca el mensaje del servidor),
 * estados del pedido con palabras e insignia, y esqueletos y vacíos del sistema (D-20).
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- los pedidos del API no tienen contrato tipado (NP-17) */
const API = process.env.NEXT_PUBLIC_API_URL;

const ESTADOS: Record<string, { texto: string; tono: TonoInsignia }> = {
	pendiente: { texto: "Por confirmar", tono: "aviso" },
	abierta: { texto: "En cocina", tono: "info" },
	preparando: { texto: "En preparación", tono: "info" },
	en_camino: { texto: "En camino", tono: "info" },
	entregado: { texto: "Entregado", tono: "exito" },
	cancelada: { texto: "Cancelado", tono: "neutro" },
};
function EstadoPedido({ estatus }: { estatus: string }) {
	const e = ESTADOS[estatus] ?? { texto: estatus ? estatus.charAt(0).toUpperCase() + estatus.slice(1).replace(/_/g, " ") : "Sin estado", tono: "neutro" as const };
	return <Insignia tono={e.tono}>{e.texto}</Insignia>;
}

const precio = (v: unknown) => formatearPrecio(typeof v === "number" ? v : Number(v));

function Pedido() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { notificar } = useNotificaciones();
	const { confirmar, dialogo } = useConfirmacion();
	const [activeTab, setActiveTab] = useState<"mesa" | "domicilio">(searchParams?.get("tab") === "domicilio" ? "domicilio" : "mesa");

	const [dbOrders, setDbOrders] = useState<any[]>([]);
	const [loadingDb, setLoadingDb] = useState(false);
	const [mesaId, setMesaId] = useState<string | null>(null);
	const [deliveryOrders, setDeliveryOrders] = useState<any[]>([]);
	const [loadingDelivery, setLoadingDelivery] = useState(false);
	const [usuarioId, setUsuarioId] = useState<string | null>(null);
	const [comprobando, setComprobando] = useState(true);
	const [currentTime, setCurrentTime] = useState<Date>(new Date());

	// Reloj para la ventana de cancelación en vivo.
	useEffect(() => {
		const timer = setInterval(() => setCurrentTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	// Comandas de la mesa ('pendiente' = carrito, el resto ya enviadas), ligadas a la cuenta.
	const fetchOrdersFromDB = async (targetMesa: string, userId: string) => {
		setLoadingDb(true);
		try {
			const res = await fetch(`${API}/pedidos/usuario?mesaId=${targetMesa}&usuarioId=${userId}`, { cache: "no-store" });
			if (!res.ok) throw new Error(`comandas ${res.status}`);
			setDbOrders(await res.json());
		} catch (error) {
			registrarError(error, "pedido: comandas de mesa");
			notificar({ tono: "error", titulo: "No pudimos traer tu pedido en mesa", descripcion: "Vuelve a intentarlo con «Actualizar»." });
		} finally {
			setLoadingDb(false);
		}
	};

	const fetchDeliveryOrders = async (userId: string) => {
		setLoadingDelivery(true);
		try {
			const token = localStorage.getItem("authToken");
			const res = await fetch(`${API}/pedidos/usuario?usuarioId=${userId}&tipo=domicilio`, {
				cache: "no-store",
				headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
			});
			if (!res.ok) throw new Error(`domicilio ${res.status}`);
			setDeliveryOrders(await res.json());
		} catch (error) {
			registrarError(error, "pedido: domicilio");
			notificar({ tono: "error", titulo: "No pudimos traer tu pedido a domicilio", descripcion: "Vuelve a intentarlo con «Actualizar»." });
		} finally {
			setLoadingDelivery(false);
		}
	};

	// Mesa e identidad: la URL manda sobre la mesa guardada; con la sesión resuelta se piden ambos.
	useEffect(() => {
		const urlMesa = searchParams?.get("mesaQuery");
		if (urlMesa) localStorage.setItem("num_mesa", urlMesa);
		const savedMesa = urlMesa || localStorage.getItem("num_mesa");
		// eslint-disable-next-line react-hooks/set-state-in-effect -- la mesa sale de la URL o del almacenamiento al montar
		if (savedMesa) setMesaId(savedMesa);
		(async () => {
			try {
				const res = await pedirSesion();
				if (res.ok) {
					const sessionData = await res.json();
					const activeUser = sessionData?.user || sessionData;
					if (activeUser?.id) {
						setUsuarioId(activeUser.id);
						fetchDeliveryOrders(activeUser.id);
						if (savedMesa) fetchOrdersFromDB(savedMesa, activeUser.id);
					}
				}
			} catch (e) {
				registrarError(e, "pedido: sesión");
			} finally {
				setComprobando(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- mismas dependencias que antes del rediseño
	}, [searchParams]);

	// Cancelar una comanda ya enviada (ventana de dos minutos).
	const handleCancelarOrden = async (ordenId: string) => {
		const ok = await confirmar({
			titulo: "¿Cancelar este pedido?",
			descripcion: "Avisaremos a la cocina para que no lo prepare.",
			textoConfirmar: "Cancelar pedido",
			textoCancelar: "Mantenerlo",
			destructiva: true,
		});
		if (!ok) return;
		try {
			const res = await fetch(`${API}/pedidos/cancelar/${ordenId}`, { cache: "no-store", method: "PATCH", headers: { "Content-Type": "application/json" } });
			if (!res.ok) throw new Error(`cancelar ${res.status}`);
			notificar({ tono: "exito", titulo: "Pedido cancelado", descripcion: "La cocina ya lo sabe." });
			if (mesaId && usuarioId) fetchOrdersFromDB(mesaId, usuarioId);
		} catch (error) {
			registrarError(error, "pedido: cancelar");
			notificar({ tono: "error", titulo: "No pudimos cancelarlo", descripcion: "Puede que ya esté en preparación. Pregunta en sala." });
		}
	};

	// Quitar un producto mientras su pedido siga 'pendiente' (mesa o domicilio).
	const handleDescartarItem = async (itemId: number, nombre: string, tipo: "mesa" | "domicilio") => {
		const ok = await confirmar({
			titulo: `¿Quitar ${nombre} de tu pedido?`,
			descripcion: "Podrás volver a añadirlo desde la carta.",
			textoConfirmar: "Quitar",
			textoCancelar: "Dejarlo",
			destructiva: true,
		});
		if (!ok) return;
		try {
			const res = await fetch(`${API}/pedidos/item/${itemId}`, { cache: "no-store", method: "DELETE" });
			if (!res.ok) throw new Error(`quitar ${res.status}`);
			if (tipo === "mesa" && mesaId && usuarioId) fetchOrdersFromDB(mesaId, usuarioId);
			else if (tipo === "domicilio" && usuarioId) fetchDeliveryOrders(usuarioId);
		} catch (error) {
			registrarError(error, "pedido: quitar producto");
			notificar({ tono: "error", titulo: "No pudimos quitarlo", descripcion: "Inténtalo de nuevo en un momento." });
		}
	};

	// Enviar a cocina el carrito de mesa 'pendiente'.
	const handleConfirmarMesa = async (ordenId: string) => {
		const ok = await confirmar({
			titulo: "¿Enviar tu pedido a cocina?",
			descripcion: "Después ya no podrás quitar platos.",
			textoConfirmar: "Enviar a cocina",
			textoCancelar: "Seguir eligiendo",
		});
		if (!ok) return;
		try {
			const res = await fetch(`${API}/pedidos/confirmar/${ordenId}`, { cache: "no-store", method: "POST" });
			if (!res.ok) throw new Error(`confirmar ${res.status}`);
			notificar({ tono: "exito", titulo: "Tu pedido va a cocina", descripcion: "Te lo llevamos a la mesa en cuanto esté." });
			if (mesaId && usuarioId) fetchOrdersFromDB(mesaId, usuarioId);
		} catch (error) {
			registrarError(error, "pedido: enviar a cocina");
			notificar({ tono: "error", titulo: "No pudimos enviarlo a cocina", descripcion: "Inténtalo de nuevo o avisa en sala." });
		}
	};

	// El domicilio se confirma en el checkout, que pide la dirección y el total real.
	const handleConfirmarDomicilio = () => {
		if (!deliveryOrders.length) return;
		const ordenPendiente = deliveryOrders.find((o: any) => o.estatus === "pendiente") || deliveryOrders[0];
		router.push(`/menu/pedido/checkout?orderId=${ordenPendiente.id}`);
	};

	const handleClearMesaCache = () => {
		localStorage.removeItem("num_mesa");
		setMesaId(null);
		setDbOrders([]);
		router.push("/menu");
	};

	const esCancelable = (tiempoAperturaStr: string) => {
		if (!tiempoAperturaStr) return false;
		return currentTime.getTime() - new Date(tiempoAperturaStr).getTime() < 2 * 60 * 1000;
	};

	const carritoMesa = dbOrders.find((o: any) => o.estatus === "pendiente");
	const comandasEnviadas = dbOrders.filter((o: any) => o.estatus !== "pendiente");

	const actualizar = (alPulsar: () => void, cargando: boolean) => (
		<Boton variante="fantasma" tamano="compacto" icono={<RotateCw />} onClick={alPulsar} cargando={cargando} textoCargando="Actualizando…">
			Actualizar
		</Boton>
	);

	const vistaMesa = (
		<div className="flex flex-col gap-(--espacio-lg)">
			{(carritoMesa || comandasEnviadas.length > 0) && (
				<div className="flex items-center justify-between gap-3">
					<p className="m-0 text-(length:--texto-etiqueta) font-semibold uppercase tracking-[0.16em] text-texto-secundario">{mesaId ? `Mesa ${mesaId}` : "Tu mesa"}</p>
					{actualizar(() => mesaId && usuarioId && fetchOrdersFromDB(mesaId, usuarioId), loadingDb)}
				</div>
			)}
			{comprobando || (loadingDb && !dbOrders.length) ? (
				<EsqueletoPedido />
			) : carritoMesa || comandasEnviadas.length > 0 ? (
				<>
					{carritoMesa && (
						<TarjetaPedido titulo="Lo que llevas" estatus="pendiente" items={carritoMesa.ordenItems} alQuitar={(item) => handleDescartarItem(item.id, item.platillo?.nombre ?? "este plato", "mesa")}>
							<Boton variante="primario" icono={<Send />} onClick={() => handleConfirmarMesa(carritoMesa.id)}>
								Enviar a cocina
							</Boton>
						</TarjetaPedido>
					)}
					{comandasEnviadas.map((orden: any) => {
						const cancelable = esCancelable(orden.tiempoApertura) && orden.estatus === "abierta";
						return (
							<TarjetaPedido key={orden.id} referencia={String(orden.id)} estatus={orden.estatus} items={orden.ordenItems} total={orden.total}>
								{orden.estatus !== "cancelada" &&
									(cancelable ? (
										<Boton variante="peligro" icono={<X />} onClick={() => handleCancelarOrden(orden.id)}>
											Cancelar pedido
										</Boton>
									) : (
										<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">Ya está en cocina: para cambiarlo, avisa en sala.</p>
									))}
							</TarjetaPedido>
						);
					})}
				</>
			) : (
				<EstadoVacio
					icono={<UtensilsCrossed />}
					titulo="Todavía no hay nada en tu mesa"
					descripcion={usuarioId ? "Elige en la carta y tu pedido aparecerá aquí." : "Inicia sesión y elige en la carta: tu pedido aparecerá aquí."}
					accion={
						<BotonEnlace href="/menu" variante="secundario">
							Ver la carta
						</BotonEnlace>
					}
				/>
			)}
		</div>
	);

	const vistaDomicilio = (
		<div className="flex flex-col gap-(--espacio-lg)">
			{deliveryOrders.length > 0 && (
				<div className="flex items-center justify-between gap-3">
					<p className="m-0 text-(length:--texto-etiqueta) font-semibold uppercase tracking-[0.16em] text-texto-secundario">Para llevar a casa</p>
					{actualizar(() => usuarioId && fetchDeliveryOrders(usuarioId), loadingDelivery)}
				</div>
			)}
			{comprobando || (loadingDelivery && !deliveryOrders.length) ? (
				<EsqueletoPedido />
			) : deliveryOrders.length > 0 ? (
				<>
					{deliveryOrders.map((pedido: any) => (
						<TarjetaPedido
							key={pedido.id}
							referencia={String(pedido.id)}
							fecha={pedido.creadoEn}
							estatus={pedido.estatus}
							items={(pedido.items ?? []).map((i: any) => ({ id: i.id, cantidad: i.cantidad || 1, precioUnitario: i.precio ?? i.precioUnitario, platillo: { nombre: i.nombre || "Plato" } }))}
							alQuitar={pedido.estatus === "pendiente" ? (item) => handleDescartarItem(item.id, item.platillo?.nombre ?? "este plato", "domicilio") : undefined}
						/>
					))}
					<Boton variante="primario" icono={<Send />} onClick={handleConfirmarDomicilio}>
						Continuar al pago
					</Boton>
				</>
			) : (
				<EstadoVacio
					icono={<UtensilsCrossed />}
					titulo="Aún no has elegido nada para llevar"
					descripcion="Añade platos desde la carta con «Para domicilio»."
					accion={
						<BotonEnlace href="/menu" variante="secundario">
							Ver la carta
						</BotonEnlace>
					}
				/>
			)}
		</div>
	);

	return (
		<div className="contenedor-pagina max-w-[48rem] pb-(--espacio-entre-secciones)">
			{dialogo}
			<EncabezadoPublico
				ruta="/menu/pedido"
				titulo="Tu pedido"
				entradilla={activeTab === "mesa" ? "Revisa lo que has elegido y envíalo a cocina cuando quieras." : "Revisa lo que llevas y continúa al pago para confirmarlo."}
				acciones={
					activeTab === "mesa" && mesaId ? (
						<Boton variante="secundario" tamano="compacto" onClick={handleClearMesaCache}>
							Liberar la mesa
						</Boton>
					) : undefined
				}
			/>
			<Pestanas
				etiqueta="Tipo de pedido"
				parametroUrl="tab"
				valorInicial={activeTab}
				alCambiar={(v) => setActiveTab(v === "domicilio" ? "domicilio" : "mesa")}
				pestanas={[
					{ valor: "mesa", titulo: "En mesa", contenido: vistaMesa },
					{ valor: "domicilio", titulo: "A domicilio", contenido: vistaDomicilio },
				]}
			/>
		</div>
	);
}

function EsqueletoPedido() {
	return (
		<ZonaCargando cargando texto="Preparando tu pedido…">
			<div className="flex flex-col gap-3 rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-lg)">
				<Esqueleto sobre="superficie" className="h-5 w-1/3" />
				{[0, 1].map((i) => (
					<div key={i} className="flex items-center gap-3">
						<Esqueleto sobre="superficie" className="size-12" />
						<Esqueleto sobre="superficie" className="h-4 flex-1" />
					</div>
				))}
			</div>
		</ZonaCargando>
	);
}

function TarjetaPedido({
	titulo,
	referencia,
	fecha,
	estatus,
	items = [],
	total,
	alQuitar,
	children,
}: {
	titulo?: string;
	referencia?: string;
	fecha?: string;
	estatus: string;
	items?: any[];
	total?: unknown;
	alQuitar?: (item: any) => void;
	children?: React.ReactNode;
}) {
	const nombre = titulo ?? (referencia ? `Pedido ${referencia.slice(0, 8).toUpperCase()}` : "Pedido");
	const totalTexto = total !== undefined ? precio(total) : null;
	return (
		<article aria-label={nombre} className="flex flex-col gap-(--espacio-md) rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-lg)">
			<header className="flex flex-wrap items-center justify-between gap-2 border-b border-borde-sutil pb-(--espacio-sm)">
				<div className="flex flex-col">
					<h2 className="m-0 font-texto text-(length:--texto-titulo-interfaz) font-semibold numeros-tabulares">{nombre}</h2>
					{fecha && <span className="text-(length:--texto-pequeno) text-texto-tenue">{new Date(fecha).toLocaleDateString("es-MX", { day: "numeric", month: "long" })}</span>}
				</div>
				<EstadoPedido estatus={estatus} />
			</header>
			<ul className="m-0 flex list-none flex-col p-0">
				{items.map((item: any) => {
					const unitario = precio(item.precioUnitario);
					const subtotal = precio((item.cantidad ?? 1) * Number(item.precioUnitario));
					const nombrePlato: string = item.platillo?.nombre ?? "Plato";
					return (
						<li key={item.id} className="flex items-center gap-3 border-b border-borde-sutil py-2 last:border-b-0">
							{item.platillo?.imagenUrl !== undefined && (
								<div className="relative size-12 shrink-0 overflow-hidden rounded-control bg-superficie-cafe">
									<Imagen src={item.platillo.imagenUrl} decorativa fill sizes="3rem" className="object-cover" />
								</div>
							)}
							<div className="min-w-0 flex-1">
								<p className="m-0 truncate font-medium">{nombrePlato}</p>
								<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario numeros-tabulares">
									{item.cantidad ?? 1} × {unitario ?? "precio por confirmar"}
								</p>
							</div>
							{subtotal && <span className="text-(length:--texto-cifra-tabla) font-medium numeros-tabulares">{subtotal}</span>}
							{alQuitar && (
								<Boton variante="fantasma" soloIcono icono={<X />} onClick={() => alQuitar(item)}>
									{`Quitar ${nombrePlato}`}
								</Boton>
							)}
						</li>
					);
				})}
			</ul>
			{totalTexto && (
				<p className="m-0 flex items-baseline justify-between border-t border-borde-sutil pt-(--espacio-sm)">
					<span className="text-(length:--texto-etiqueta) font-semibold uppercase tracking-[0.16em] text-texto-secundario">Total</span>
					<span className="font-titulos text-(length:--texto-titulo-3) numeros-tabulares">{totalTexto}</span>
				</p>
			)}
			{children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
		</article>
	);
}

// Depende del servidor: sin conexión se muestra un aviso y se carga al reconectar.
export default function PaginaPedido() {
	return (
		<OnlineOnly what="tu pedido">
			<Pedido />
		</OnlineOnly>
	);
}
