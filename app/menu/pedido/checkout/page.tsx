"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe, type StripeCardElementOptions } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ArrowLeft, Check, CreditCard, Lock, MapPin, Plus } from "lucide-react";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { Campo, Selector } from "@/components/ui/Campo";
import { Casilla } from "@/components/ui/Casilla";
import { Esqueleto, EsqueletoLineas, ZonaCargando } from "@/components/ui/Esqueleto";
import { EstadoError } from "@/components/ui/EstadoError";
import { Contraetiqueta } from "@/components/marca/Contraetiqueta";
import { EncabezadoPublico } from "@/components/marca/EncabezadoPublico";
import { usePreferencias } from "@/components/providers/PreferenciasProvider";
import OnlineOnly from "@/components/pwa/OnlineOnly";
import { formatearPrecio } from "@/lib/formato/precio";
import { api } from "@/lib/api";
import { registrarError } from "@/lib/registro/registrar-error";
import { pedirSesion } from "@/lib/sesion/sesion-cliente";
import { esquemaDatosFiscales, esquemaDireccionEnvio } from "@/lib/validacion/formularios";
import { cn } from "@/lib/utils";

/**
 * Pago del pedido a domicilio (`/menu/pedido/checkout`, PLAN 4.14). La lógica no cambia: la
 * misma carga (sesión, pedido, direcciones, métodos guardados), las mismas llamadas
 * (`/direcciones`, `/metodos-pago/setup-intent`, `/metodos-pago`, `/pagos/crear-intento`,
 * `/facturas`), las mismas confirmaciones de Stripe y la misma redirección al éxito.
 *
 * Lo nuevo: campos con etiqueta, `autocomplete` (`address-line1`, `postal-code`…) e `inputmode`;
 * validación con los esquemas del 3.1 (los mismos mensajes, y el correo fiscal comprobado si se
 * escribe: decisión del usuario del 2026-11-01); errores por campo y un resumen; el
 * `CardElement` con los colores de los tokens del tema (Stripe no admite variables CSS dentro de
 * su iframe, así que se leen en el navegador); y redacción cálida sin el mensaje del servidor
 * (los de Stripe sí se muestran: son para la persona, «Tu tarjeta fue rechazada»).
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- los datos del API no tienen contrato tipado (NP-17) */

// Una sola instancia de Stripe, fuera del componente.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

const USOS_CFDI = [
	{ valor: "G01", texto: "G01 · Adquisición de mercancías" },
	{ valor: "G03", texto: "G03 · Gastos en general" },
	{ valor: "P01", texto: "P01 · Por definir" },
];
const REGIMENES_FISCALES = [
	{ valor: "601", texto: "601 · General de Ley Personas Morales" },
	{ valor: "603", texto: "603 · Personas Morales con Fines no Lucrativos" },
	{ valor: "605", texto: "605 · Sueldos y Salarios" },
	{ valor: "606", texto: "606 · Arrendamiento" },
	{ valor: "612", texto: "612 · Personas Físicas con Actividades Empresariales" },
	{ valor: "616", texto: "616 · Sin obligaciones fiscales" },
	{ valor: "621", texto: "621 · Incorporación Fiscal" },
	{ valor: "626", texto: "626 · Régimen Simplificado de Confianza" },
];
const PASOS = ["Resumen", "Entrega", "Factura", "Pago", "Confirmar"] as const;

type Errores = Record<string, string>;
const erroresDe = (resultado: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }): Errores =>
	resultado.success ? {} : Object.fromEntries((resultado.error?.issues ?? []).map((i) => [String(i.path[0]), i.message]));
const precio = (v: unknown) => formatearPrecio(typeof v === "number" ? v : Number(v));

function Checkout() {
	return (
		<Elements stripe={stripePromise} options={{ locale: "es" }}>
			<Asistente />
		</Elements>
	);
}

function Asistente() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const orderId = searchParams?.get("orderId");
	const stripe = useStripe();
	const elements = useElements();

	const [usuarioId, setUsuarioId] = useState<string | null>(null);
	const [pasoActual, setPasoActual] = useState(1);
	const [loading, setLoading] = useState(true);
	const [procesando, setProcesando] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [aceptaTerminos, setAceptaTerminos] = useState(false);
	const [fallaCarga, setFallaCarga] = useState<"sin-pedido" | "no-encontrado" | "error" | null>(null);
	const [errores, setErrores] = useState<Errores>({});
	const [orden, setOrden] = useState<any>(null);

	const [direcciones, setDirecciones] = useState<any[]>([]);
	const [direccionSeleccionadaId, setDireccionSeleccionadaId] = useState<number | "nueva" | null>(null);
	const [nuevaDireccion, setNuevaDireccion] = useState({ alias: "Casa", linea1: "", linea2: "", colonia: "", ciudad: "", estado: "", codigoPostal: "", referencias: "" });
	const [guardarDireccion, setGuardarDireccion] = useState(true);

	const [requiereFactura, setRequiereFactura] = useState(false);
	const [datosFiscales, setDatosFiscales] = useState({ rfc: "", razonSocial: "", usoCfdi: "G03", regimenFiscal: "", codigoPostalFiscal: "", email: "" });

	const [metodosGuardados, setMetodosGuardados] = useState<any[]>([]);
	const [metodoSeleccionadoId, setMetodoSeleccionadoId] = useState<string | "nueva" | null>(null);
	const [guardarTarjeta, setGuardarTarjeta] = useState(false);

	const apiUrl = process.env.NEXT_PUBLIC_API_URL;

	// Carga inicial: usuario, pedido, direcciones y métodos de pago guardados.
	useEffect(() => {
		if (!orderId) {
			// eslint-disable-next-line react-hooks/set-state-in-effect -- sin pedido en la URL no hay nada que cargar
			setFallaCarga("sin-pedido");
			setLoading(false);
			return;
		}
		const cargar = async () => {
			try {
				const resUser = await pedirSesion();
				if (!resUser.ok) {
					router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
					return;
				}
				const sessionData = await resUser.json();
				const activeUser = sessionData?.user || sessionData;
				if (!activeUser?.id) {
					router.push("/login");
					return;
				}
				setUsuarioId(activeUser.id);

				const resOrdenes = await fetch(`${apiUrl}/pedidos/usuario?usuarioId=${activeUser.id}&tipo=domicilio`, { cache: "no-store" });
				if (resOrdenes.ok) {
					const ordenesData = await resOrdenes.json();
					const ordenEncontrada = ordenesData.find((o: any) => o.id === orderId);
					if (!ordenEncontrada) setFallaCarga("no-encontrado");
					else setOrden(ordenEncontrada);
				}

				const resDirecciones = await fetch(`${apiUrl}/direcciones?usuarioId=${activeUser.id}`, { cache: "no-store" });
				if (resDirecciones.ok) {
					const data = await resDirecciones.json();
					setDirecciones(data);
					const principal = data.find((d: any) => d.esPrincipal);
					if (principal) setDireccionSeleccionadaId(principal.id);
					else if (data.length === 0) setDireccionSeleccionadaId("nueva");
				}

				const resMetodos = await fetch(`${apiUrl}/metodos-pago?usuarioId=${activeUser.id}`, { cache: "no-store" });
				if (resMetodos.ok) {
					const data = await resMetodos.json();
					setMetodosGuardados(data);
					const principalMetodo = data.find((m: any) => m.esPrincipal);
					if (principalMetodo) setMetodoSeleccionadoId(principalMetodo.id);
					else if (data.length === 0) setMetodoSeleccionadoId("nueva");
				}
			} catch (e) {
				registrarError(e, "checkout: carga");
				setFallaCarga("error");
			} finally {
				setLoading(false);
			}
		};
		cargar();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- mismas dependencias que antes del rediseño
	}, [orderId]);

	const irAtras = () => {
		setError(null);
		setErrores({});
		setPasoActual((p) => Math.max(p - 1, 1));
	};

	// ── Validación por paso (esquemas del 3.1) ──
	const validarPaso2 = (): Errores | string | null => {
		if (direccionSeleccionadaId === "nueva") {
			const e = erroresDe(esquemaDireccionEnvio.safeParse(nuevaDireccion));
			return Object.keys(e).length ? e : null;
		}
		return direccionSeleccionadaId ? null : "Elige o añade una dirección de entrega.";
	};
	const validarPaso3 = (): Errores | null => {
		if (!requiereFactura) return null;
		const e = erroresDe(esquemaDatosFiscales.safeParse(datosFiscales));
		return Object.keys(e).length ? e : null;
	};
	const validarPaso4 = (): string | null => {
		if (metodoSeleccionadoId === "nueva") return elements?.getElement(CardElement) ? null : "Escribe los datos de tu tarjeta.";
		return metodoSeleccionadoId ? null : "Elige o añade un método de pago.";
	};
	const fallar = (r: Errores | string) => {
		if (typeof r === "string") setError(r);
		else {
			setErrores(r);
			setError("Revisa los campos marcados.");
		}
	};

	const manejarSiguiente = async () => {
		setError(null);
		setErrores({});

		if (pasoActual === 2) {
			const r = validarPaso2();
			if (r) return fallar(r);
			if (direccionSeleccionadaId === "nueva" && guardarDireccion) {
				setProcesando(true);
				try {
					const res = await fetch(`${apiUrl}/direcciones`, {
						cache: "no-store",
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ usuarioId: Number(usuarioId), ...nuevaDireccion }),
					});
					if (!res.ok) throw new Error(`direccion ${res.status}`);
					const guardada = await res.json();
					setDirecciones((prev) => [...prev, guardada]);
					setDireccionSeleccionadaId(guardada.id);
				} catch (e) {
					registrarError(e, "checkout: guardar dirección");
					setError("No pudimos guardar la dirección. Inténtalo de nuevo o desmarca «Guardar esta dirección».");
					setProcesando(false);
					return;
				}
				setProcesando(false);
			}
		}

		if (pasoActual === 3) {
			const r = validarPaso3();
			if (r) return fallar(r);
		}

		if (pasoActual === 4) {
			const r = validarPaso4();
			if (r) return fallar(r);
			if (metodoSeleccionadoId === "nueva" && guardarTarjeta) {
				setProcesando(true);
				try {
					const resSetup = await fetch(`${apiUrl}/metodos-pago/setup-intent`, {
						cache: "no-store",
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ usuarioId: Number(usuarioId) }),
					});
					if (!resSetup.ok) throw new Error("No pudimos preparar el guardado de la tarjeta.");
					const { clientSecret } = await resSetup.json();
					const result = await stripe!.confirmCardSetup(clientSecret, { payment_method: { card: elements!.getElement(CardElement)! } });
					// El mensaje de Stripe es para la persona («Tu tarjeta fue rechazada»).
					if (result.error) throw new Error(result.error.message || "No pudimos validar la tarjeta.");
					const resGuardar = await fetch(`${apiUrl}/metodos-pago`, {
						cache: "no-store",
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ usuarioId: Number(usuarioId), paymentMethodId: result.setupIntent!.payment_method }),
					});
					if (!resGuardar.ok) throw new Error("No pudimos guardar la tarjeta.");
					const nuevoMetodo = await resGuardar.json();
					setMetodosGuardados((prev) => [...prev, nuevoMetodo]);
					setMetodoSeleccionadoId(nuevoMetodo.id);
				} catch (e) {
					registrarError(e, "checkout: guardar tarjeta");
					setError(e instanceof Error && !/^\w+ \d{3}$/.test(e.message) ? e.message : "No pudimos guardar la tarjeta. Inténtalo de nuevo.");
					setProcesando(false);
					return;
				}
				setProcesando(false);
			}
		}

		setPasoActual((p) => Math.min(p + 1, 5));
	};

	const manejarPagar = async () => {
		if (!aceptaTerminos) {
			setError("Para pagar, acepta los términos y condiciones.");
			return;
		}
		setError(null);
		setProcesando(true);
		try {
			const body: any = { usuarioId: Number(usuarioId), ordenId: orden.id };
			if (typeof direccionSeleccionadaId === "number") body.direccionId = direccionSeleccionadaId;
			if (metodoSeleccionadoId !== "nueva") body.metodoPagoGuardadoId = metodoSeleccionadoId;

			const resIntento = await fetch(`${apiUrl}/pagos/crear-intento`, {
				cache: "no-store",
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			if (!resIntento.ok) throw new Error("No pudimos iniciar el pago. Inténtalo de nuevo en un momento.");
			const { clientSecret, status } = await resIntento.json();

			// Con tarjeta guardada (off_session) el backend puede haber confirmado ya el pago.
			if (status !== "succeeded") {
				const confirmOptions = metodoSeleccionadoId === "nueva" ? { payment_method: { card: elements!.getElement(CardElement)! } } : undefined;
				const result = await stripe!.confirmCardPayment(clientSecret, confirmOptions as any);
				if (result.error) throw new Error(result.error.message || "El pago no se completó.");
			}

			if (requiereFactura) {
				// Va a la cola (Fase 4.1): se registra aunque el webhook aún no confirme el pago, con la sesión del cliente.
				await api
					.post("/solicitudes-factura", { ordenId: orden.id, ...datosFiscales })
					.catch((e) => registrarError(e, "checkout: solicitud de factura"));
			}
			router.push(`/menu/pedido/checkout/exito?ordenId=${orden.id}`);
		} catch (e) {
			registrarError(e, "checkout: pago");
			setError(e instanceof Error ? e.message : "No pudimos completar el pago. Inténtalo de nuevo.");
		} finally {
			setProcesando(false);
		}
	};

	if (loading)
		return (
			<ZonaCargando cargando texto="Preparando el pago…">
				<div className="flex flex-col gap-4">
					<Esqueleto className="h-10 w-full" />
					<Esqueleto className="h-48 w-full" />
					<EsqueletoLineas lineas={3} />
				</div>
			</ZonaCargando>
		);

	if (fallaCarga && !orden)
		return fallaCarga === "error" ? (
			<EstadoError titulo="No pudimos preparar el pago" descripcion="Vuelve a intentarlo en un momento." alReintentar={() => window.location.reload()} />
		) : (
			<EstadoError
				titulo="No encontramos este pedido"
				descripcion="Vuelve a tu pedido y continúa al pago desde allí."
				accion={
					<BotonEnlace href="/menu/pedido?tab=domicilio" variante="secundario" icono={<ArrowLeft />}>
						Volver a tu pedido
					</BotonEnlace>
				}
			/>
		);

	const direccionElegida = direccionSeleccionadaId === "nueva" ? nuevaDireccion : direcciones.find((d) => d.id === direccionSeleccionadaId);
	const metodoElegido = metodoSeleccionadoId === "nueva" ? { marca: "Tarjeta nueva", ultimos4: "" } : metodosGuardados.find((m) => m.id === metodoSeleccionadoId);

	return (
		<div className="flex flex-col gap-(--espacio-xl)">
			<ol aria-label="Pasos del pago" className="m-0 grid list-none grid-cols-5 gap-1 p-0">
				{PASOS.map((nombre, i) => {
					const n = i + 1;
					const hecho = pasoActual > n;
					const actual = pasoActual === n;
					return (
						<li key={nombre} aria-current={actual ? "step" : undefined} className="relative flex min-w-0 flex-col gap-2 overflow-hidden">
							<span aria-hidden="true" className={cn("h-0.5 w-full", pasoActual >= n ? "bg-acento" : "bg-borde-sutil")} />
							<span className={cn("flex items-center gap-1 text-(length:--texto-etiqueta) font-semibold uppercase tracking-[0.12em]", actual ? "text-texto-principal" : "text-texto-tenue")}>
								{hecho && <Check aria-hidden="true" className="size-3.5 stroke-[1.5]" />}
								<span className="max-sm:solo-lectores">{nombre}</span>
								<span className="solo-lectores">{hecho ? " (hecho)" : ""}</span>
							</span>
						</li>
					);
				})}
			</ol>
			<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario sm:hidden" aria-hidden="true">
				Paso {pasoActual} de 5 · {PASOS[pasoActual - 1]}
			</p>

			<section aria-labelledby="paso-titulo" className="flex flex-col gap-(--espacio-lg) rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-lg) sm:p-(--espacio-xl)">
				{pasoActual === 1 && <PasoResumen orden={orden} />}
				{pasoActual === 2 && (
					<PasoDireccion
						direcciones={direcciones}
						seleccionadaId={direccionSeleccionadaId}
						onSeleccionar={setDireccionSeleccionadaId}
						nuevaDireccion={nuevaDireccion}
						onCambiarNuevaDireccion={setNuevaDireccion}
						guardar={guardarDireccion}
						onCambiarGuardar={setGuardarDireccion}
						errores={errores}
					/>
				)}
				{pasoActual === 3 && <PasoFacturacion requiereFactura={requiereFactura} onCambiarRequiere={setRequiereFactura} datos={datosFiscales} onCambiarDatos={setDatosFiscales} errores={errores} />}
				{pasoActual === 4 && (
					<PasoPago metodos={metodosGuardados} seleccionadoId={metodoSeleccionadoId} onSeleccionar={setMetodoSeleccionadoId} guardarTarjeta={guardarTarjeta} onCambiarGuardarTarjeta={setGuardarTarjeta} />
				)}
				{pasoActual === 5 && <PasoConfirmar orden={orden} direccion={direccionElegida} requiereFactura={requiereFactura} datosFiscales={datosFiscales} metodo={metodoElegido} />}
				{pasoActual === 5 && (
					/* D-36: aceptación expresa de los términos antes de pagar, con la casilla desmarcada. */
					<Casilla
						etiqueta={
							<>
								He revisado el resumen y acepto los{" "}
								<Link href="/condiciones" className="enlace-subrayado">
									términos y condiciones
								</Link>{" "}
								y la{" "}
								<Link href="/devoluciones" className="enlace-subrayado">
									política de cancelaciones y reembolsos
								</Link>
								.
							</>
						}
						checked={aceptaTerminos}
						onChange={(e) => {
							setAceptaTerminos(e.target.checked);
							if (e.target.checked) setError(null);
						}}
					/>
				)}

				{error && <Aviso tono="error">{error}</Aviso>}

				<div className="flex flex-col-reverse gap-3 border-t border-borde-sutil pt-(--espacio-lg) sm:flex-row sm:justify-between">
					{pasoActual > 1 ? (
						<Boton variante="secundario" icono={<ArrowLeft />} onClick={irAtras} deshabilitado={procesando}>
							Atrás
						</Boton>
					) : (
						<span />
					)}
					{pasoActual < 5 ? (
						<Boton variante="primario" onClick={manejarSiguiente} cargando={procesando} textoCargando="Guardando…">
							Continuar
						</Boton>
					) : (
						<Boton variante="primario" icono={<Lock />} onClick={manejarPagar} cargando={procesando} textoCargando="Procesando el pago…">
							{`Pagar ${orden ? (precio(orden.total) ?? "") : ""}`}
						</Boton>
					)}
				</div>
			</section>
			<p className="m-0 flex items-center gap-2 text-(length:--texto-pequeno) text-texto-tenue [&_svg]:size-4 [&_svg]:stroke-[1.5]">
				<Lock aria-hidden="true" />
				Los datos de tu tarjeta los recibe Stripe directamente; nunca pasan por nuestro sitio.
			</p>
		</div>
	);
}

function TituloPaso({ children }: { children: string }) {
	return (
		<h2 id="paso-titulo" className="m-0 font-titulos text-(length:--texto-titulo-2) font-normal leading-[1.15]">
			{children}
		</h2>
	);
}

function PasoResumen({ orden }: { orden: any }) {
	return (
		<>
			<TituloPaso>Resumen de tu pedido</TituloPaso>
			<ul className="m-0 flex list-none flex-col p-0">
				{orden?.items?.map((item: any) => (
					<li key={item.id} className="flex items-baseline justify-between gap-3 border-b border-borde-sutil py-(--espacio-sm)">
						<span>
							<span className="numeros-tabulares">{item.cantidad} ×</span> {item.nombre}
						</span>
						<span className="text-(length:--texto-cifra-tabla) font-medium numeros-tabulares">{precio(item.cantidad * Number(item.precio || item.precioUnitario))}</span>
					</li>
				))}
			</ul>
			<p className="m-0 flex items-baseline justify-between">
				<span className="text-(length:--texto-etiqueta) font-semibold uppercase tracking-[0.16em] text-texto-secundario">Total</span>
				<span className="font-titulos text-(length:--texto-titulo-3) numeros-tabulares">{orden ? precio(orden.total) : "—"}</span>
			</p>
		</>
	);
}

/** Opción de una lista (dirección o tarjeta): radio nativo en una etiqueta de 44 px o más. */
function Opcion({ nombre, valor, elegida, alElegir, children }: { nombre: string; valor: string; elegida: boolean; alElegir: () => void; children: React.ReactNode }) {
	return (
		<label
			className={cn(
				"flex min-h-14 cursor-pointer items-start gap-3 rounded-control border p-(--espacio-md)",
				"transition-[background-color,border-color] duration-(--duracion-breve) ease-estandar",
				"has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foco",
				elegida ? "border-acento bg-superficie-cafe" : "border-borde-control al-pasar:bg-superficie-cafe",
			)}
		>
			<input type="radio" name={nombre} value={valor} checked={elegida} onChange={alElegir} className="mt-1 size-4 accent-(--color-acento)" />
			<span className="flex min-w-0 flex-col gap-0.5">{children}</span>
		</label>
	);
}

function PasoDireccion({ direcciones, seleccionadaId, onSeleccionar, nuevaDireccion, onCambiarNuevaDireccion, guardar, onCambiarGuardar, errores }: any) {
	const cambiar = (campo: string) => (e: React.ChangeEvent<HTMLInputElement>) => onCambiarNuevaDireccion({ ...nuevaDireccion, [campo]: e.target.value });
	return (
		<>
			<TituloPaso>¿A dónde te lo llevamos?</TituloPaso>
			<fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
				<legend className="solo-lectores">Dirección de entrega</legend>
				{direcciones.map((d: any) => (
					<Opcion key={d.id} nombre="direccion" valor={String(d.id)} elegida={seleccionadaId === d.id} alElegir={() => onSeleccionar(d.id)}>
						<span className="font-semibold">{d.alias}</span>
						<span className="text-(length:--texto-pequeno) text-texto-secundario">
							{d.linea1}, {d.colonia}, {d.ciudad}, {d.estado} · CP {d.codigoPostal}
						</span>
					</Opcion>
				))}
				<Opcion nombre="direccion" valor="nueva" elegida={seleccionadaId === "nueva"} alElegir={() => onSeleccionar("nueva")}>
					<span className="flex items-center gap-2 font-semibold [&_svg]:size-4 [&_svg]:stroke-[1.5]">
						<Plus aria-hidden="true" />
						Añadir una dirección nueva
					</span>
				</Opcion>
			</fieldset>

			{seleccionadaId === "nueva" && (
				<div className="grid gap-(--espacio-md) sm:grid-cols-2">
					<Campo etiqueta="Nombre de la dirección" ayuda="Casa, oficina…" value={nuevaDireccion.alias} onChange={cambiar("alias")} opcional autoComplete="off" className="sm:col-span-2" error={errores.alias} />
					<Campo etiqueta="Calle y número" value={nuevaDireccion.linea1} onChange={cambiar("linea1")} autoComplete="address-line1" className="sm:col-span-2" error={errores.linea1} />
					<Campo etiqueta="Interior, piso o depto." value={nuevaDireccion.linea2} onChange={cambiar("linea2")} opcional autoComplete="address-line2" className="sm:col-span-2" error={errores.linea2} />
					<Campo etiqueta="Colonia" value={nuevaDireccion.colonia} onChange={cambiar("colonia")} autoComplete="address-level3" error={errores.colonia} />
					<Campo etiqueta="Ciudad" value={nuevaDireccion.ciudad} onChange={cambiar("ciudad")} autoComplete="address-level2" error={errores.ciudad} />
					<Campo etiqueta="Estado" value={nuevaDireccion.estado} onChange={cambiar("estado")} autoComplete="address-level1" error={errores.estado} />
					<Campo
						etiqueta="Código postal"
						codigo
						inputMode="numeric"
						maxLength={5}
						autoComplete="postal-code"
						value={nuevaDireccion.codigoPostal}
						onChange={(e) => onCambiarNuevaDireccion({ ...nuevaDireccion, codigoPostal: e.target.value.replace(/\D/g, "") })}
						error={errores.codigoPostal}
					/>
					<Campo etiqueta="Referencias" ayuda="Entre qué calles, color de la fachada…" value={nuevaDireccion.referencias} onChange={cambiar("referencias")} opcional autoComplete="off" className="sm:col-span-2" error={errores.referencias} />
					<Casilla etiqueta="Guardar esta dirección para otras compras" checked={guardar} onChange={(e) => onCambiarGuardar(e.target.checked)} className="sm:col-span-2" />
				</div>
			)}
		</>
	);
}

function PasoFacturacion({ requiereFactura, onCambiarRequiere, datos, onCambiarDatos, errores }: any) {
	const cambiar = (campo: string, transformar = (v: string) => v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onCambiarDatos({ ...datos, [campo]: transformar(e.target.value) });
	return (
		<>
			<TituloPaso>Factura</TituloPaso>
			<Casilla etiqueta="Necesito factura de esta compra" checked={requiereFactura} onChange={(e) => onCambiarRequiere(e.target.checked)} />
			{requiereFactura && (
				<div className="grid gap-(--espacio-md) sm:grid-cols-2">
					<Campo etiqueta="RFC" codigo autoComplete="off" value={datos.rfc} onChange={cambiar("rfc", (v) => v.toUpperCase())} maxLength={13} error={errores.rfc} />
					<Campo etiqueta="Razón social" autoComplete="organization" value={datos.razonSocial} onChange={cambiar("razonSocial")} error={errores.razonSocial} />
					<Selector etiqueta="Uso del CFDI" opciones={USOS_CFDI} value={datos.usoCfdi} onChange={cambiar("usoCfdi")} error={errores.usoCfdi} />
					<Selector etiqueta="Régimen fiscal" marcador="Elige tu régimen fiscal" opciones={REGIMENES_FISCALES} value={datos.regimenFiscal} onChange={cambiar("regimenFiscal")} error={errores.regimenFiscal} />
					<Campo
						etiqueta="Código postal fiscal"
						codigo
						inputMode="numeric"
						maxLength={5}
						autoComplete="postal-code"
						value={datos.codigoPostalFiscal}
						onChange={cambiar("codigoPostalFiscal", (v) => v.replace(/\D/g, ""))}
						error={errores.codigoPostalFiscal}
					/>
					<Campo etiqueta="Correo para enviarte la factura" type="email" inputMode="email" autoComplete="email" opcional value={datos.email} onChange={cambiar("email")} error={errores.email} />
				</div>
			)}
		</>
	);
}

/** Estilo del `CardElement` con los tokens del tema: Stripe pinta dentro de su iframe y no lee variables CSS. */
function useEstiloTarjeta(): StripeCardElementOptions {
	const { preferencias } = usePreferencias();
	return useMemo(() => {
		if (typeof window === "undefined") return {};
		const raiz = getComputedStyle(document.documentElement);
		const token = (nombre: string) => raiz.getPropertyValue(nombre).trim();
		return {
			style: {
				base: {
					color: token("--color-texto-principal"),
					iconColor: token("--color-texto-secundario"),
					fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
					fontSize: "16px",
					"::placeholder": { color: token("--color-texto-tenue") },
				},
				invalid: { color: token("--color-error"), iconColor: token("--color-error") },
			},
		};
		// El tema cambia los tokens: se vuelven a leer.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [preferencias.tema]);
}

function PasoPago({ metodos, seleccionadoId, onSeleccionar, guardarTarjeta, onCambiarGuardarTarjeta }: any) {
	const estilo = useEstiloTarjeta();
	return (
		<>
			<TituloPaso>¿Cómo quieres pagar?</TituloPaso>
			<fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
				<legend className="solo-lectores">Método de pago</legend>
				{metodos.map((m: any) => (
					<Opcion key={m.id} nombre="metodo" valor={String(m.id)} elegida={seleccionadoId === m.id} alElegir={() => onSeleccionar(m.id)}>
						<span className="flex items-center gap-2 font-semibold capitalize [&_svg]:size-4 [&_svg]:stroke-[1.5]">
							<CreditCard aria-hidden="true" />
							{m.marca} <span className="numeros-tabulares">···· {m.ultimos4}</span>
						</span>
						<span className="text-(length:--texto-pequeno) text-texto-secundario numeros-tabulares">
							Caduca {m.mesExpiracion}/{m.anioExpiracion}
						</span>
					</Opcion>
				))}
				<Opcion nombre="metodo" valor="nueva" elegida={seleccionadoId === "nueva"} alElegir={() => onSeleccionar("nueva")}>
					<span className="flex items-center gap-2 font-semibold [&_svg]:size-4 [&_svg]:stroke-[1.5]">
						<Plus aria-hidden="true" />
						Usar una tarjeta nueva
					</span>
				</Opcion>
			</fieldset>
			{seleccionadoId === "nueva" && (
				<div className="flex flex-col gap-(--espacio-md)">
					<div className="flex flex-col gap-1">
						<span className="text-(length:--texto-pequeno) font-semibold" id="tarjeta-rotulo">
							Datos de la tarjeta
						</span>
						{/* El CardElement vive en un iframe de Stripe: el sitio nunca ve el número ni el CVC. */}
						<div className="rounded-control border border-borde-control bg-superficie p-(--espacio-md) focus-within:border-foco" role="group" aria-labelledby="tarjeta-rotulo">
							<CardElement options={estilo} />
						</div>
					</div>
					<Casilla etiqueta="Guardar esta tarjeta para otras compras" checked={guardarTarjeta} onChange={(e) => onCambiarGuardarTarjeta(e.target.checked)} />
				</div>
			)}
		</>
	);
}

function PasoConfirmar({ orden, direccion, requiereFactura, datosFiscales, metodo }: any) {
	return (
		<>
			<TituloPaso>Confirma tu pedido</TituloPaso>
			<Contraetiqueta
				pares={[
					{
						rotulo: "Entrega",
						valor: (
							<span className="flex items-start gap-2 [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.5]">
								<MapPin aria-hidden="true" />
								{direccion?.linea1}, {direccion?.colonia}, {direccion?.ciudad}, {direccion?.estado} · CP {direccion?.codigoPostal}
							</span>
						),
						tipo: "texto",
					},
					{ rotulo: "Factura", valor: requiereFactura ? `Sí, RFC ${datosFiscales.rfc}` : "No", tipo: "texto" },
					{ rotulo: "Pago", valor: `${metodo?.marca ?? ""}${metodo?.ultimos4 ? ` ···· ${metodo.ultimos4}` : ""}`, tipo: "texto" },
					{ rotulo: "Total", valor: orden ? (precio(orden.total) ?? "—") : "—" },
				]}
			/>
		</>
	);
}

// Depende del servidor: sin conexión se muestra un aviso y se carga al reconectar.
export default function PaginaPago() {
	return (
		<div className="contenedor-pagina max-w-[48rem] pb-(--espacio-entre-secciones)">
			<EncabezadoPublico ruta="/menu/pedido/checkout" titulo="Pago" entradilla="Cinco pasos breves: revisa, dinos dónde, factura si la necesitas y paga con seguridad." />
			<OnlineOnly what="el pago de tu pedido">
				<Checkout />
			</OnlineOnly>
		</div>
	);
}
