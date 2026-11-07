"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Bike, Minus, Phone, Plus, Sparkles, UtensilsCrossed } from "lucide-react";
import { useSelector } from "react-redux";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Dialogo } from "@/components/ui/Dialogo";
import { Esqueleto, EsqueletoLineas, ZonaCargando } from "@/components/ui/Esqueleto";
import { EstadoError } from "@/components/ui/EstadoError";
import { Imagen } from "@/components/ui/Imagen";
import { Insignia } from "@/components/ui/Insignia";
import { MigasDePan } from "@/components/ui/MigasDePan";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { useConfirmacion } from "@/components/ui/DialogoConfirmacion";
import { CargadorMarca } from "@/components/marca/CargadorMarca";
import { Contraetiqueta, type ParContraetiqueta } from "@/components/marca/Contraetiqueta";
import { PaginaEstado } from "@/components/marca/PaginaEstado";
import { TEXTOS_ESTADO } from "@/components/marca/textos-estado";
import OnlineOnly from "@/components/pwa/OnlineOnly";
import { restaurantConfig } from "@/config/restaurant.config";
import { formatearPrecio } from "@/lib/formato/precio";
import { registrarError } from "@/lib/registro/registrar-error";
import { cantidadSegura } from "@/lib/seguridad/urls";
import { pedirSesion } from "@/lib/sesion/sesion-cliente";
import { cn } from "@/lib/utils";
import { presentarCarta } from "@/lib/formato/caja";

/**
 * Detalle de un plato (`/menu/producto/[id]`, PLAN 4.12). La lógica no cambia: los mismos
 * endpoints (`/menu/items/{id}`, `/recommendations/combo/{id}`, `/mesas`, `POST /pedidos/mesa`),
 * los mismos payloads, las mismas redirecciones y la confirmación del enlace `autoExecute` (2.13).
 *
 * Lo nuevo es la interfaz: contraetiqueta del plato (sección, precio y alérgenos), selector de
 * cantidad accesible, `Dialogo` para elegir la mesa, notificaciones y avisos en lugar de
 * `alert()`, y estados sin texto técnico (D-20); un plato inexistente muestra `PaginaEstado` (D-21).
 */
const API = process.env.NEXT_PUBLIC_API_URL;
const MAXIMO = 20;
const MENSAJE_FALLO = "No pudimos añadirlo a tu pedido. Inténtalo de nuevo en un momento o pídelo en sala.";

type Estado = "cargando" | "error" | "no-existe" | "listo";

function DetallePlato() {
	const params = useParams();
	const router = useRouter();
	const searchParams = useSearchParams();
	const id = params?.id || params?.slug;
	const { notificar } = useNotificaciones();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- forma del usuario del store, sin tipar desde el 2.15
	const reduxUser = useSelector((state: any) => state.auth.user);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- el API envía el plato sin contrato tipado (NP-17)
	const [platillo, setPlatillo] = useState<any>(null);
	const [estado, setEstado] = useState<Estado>("cargando");
	const [cantidad, setCantidad] = useState(1);
	const [fallo, setFallo] = useState<string | null>(null);
	// Confirmación antes de crear un pedido desde un enlace con autoExecute (PLAN 2.13).
	const { confirmar, dialogo } = useConfirmacion();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mesas del API sin contrato tipado
	const [mesas, setMesas] = useState<any[]>([]);
	const [loadingMesas, setLoadingMesas] = useState(false);
	const [falloMesas, setFalloMesas] = useState(false);

	// La mesa sale del parámetro de la URL (?mesaQuery=...), no de localStorage.
	const urlMesa = searchParams?.get("mesaQuery");
	const [selectedMesa, setSelectedMesa] = useState<string>(urlMesa || "");

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- recomendación del API sin contrato tipado
	const [combo, setCombo] = useState<any>(null);
	const pendingComboRef = useRef<{ platilloId: number; cantidad: number }[] | null>(null);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- usuario de la sesión sin contrato tipado
	const resolveCurrentUser = async (): Promise<any | null> => {
		if (reduxUser?.id) return reduxUser;
		try {
			const res = await pedirSesion();
			if (res.ok) {
				const sessionData = await res.json();
				const activeUser = sessionData?.user || sessionData;
				if (activeUser?.id) return activeUser;
			}
		} catch (e) {
			registrarError(e, "detalle de plato: sesión");
		}
		return null;
	};

	const cargarPlatillo = useCallback(async () => {
		setEstado("cargando");
		try {
			const res = await fetch(`${API}/menu/items/${id}`, { cache: "no-store" });
			if (res.status === 404) {
				setEstado("no-existe");
				return;
			}
			if (!res.ok) throw new Error(`plato ${res.status}`);
			setPlatillo(presentarCarta(await res.json()));
			setEstado("listo");
		} catch (err) {
			registrarError(err, "detalle de plato");
			setEstado("error");
		}
	}, [id]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial del plato
		if (id) void cargarPlatillo();
	}, [id, cargarPlatillo]);

	// Recomendación de combo (reglas de asociación calculadas en el backend).
	useEffect(() => {
		if (!platillo?.id) return;
		(async () => {
			try {
				const res = await fetch(`${API}/recommendations/combo/${platillo.id}`, { cache: "no-store" });
				if (!res.ok) return;
				setCombo(presentarCarta(await res.json()));
			} catch (err) {
				registrarError(err, "detalle de plato: combo");
			}
		})();
	}, [platillo?.id]);

	// Mesas de la base de datos al abrir el diálogo.
	useEffect(() => {
		if (!isModalOpen) return;
		(async () => {
			setLoadingMesas(true);
			setFalloMesas(false);
			try {
				const res = await fetch(`${API}/mesas`, { cache: "no-store" });
				if (!res.ok) throw new Error(`mesas ${res.status}`);
				setMesas(await res.json());
			} catch (error) {
				registrarError(error, "detalle de plato: mesas");
				setFalloMesas(true);
			} finally {
				setLoadingMesas(false);
			}
		})();
	}, [isModalOpen]);


	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- usuario de la sesión sin contrato tipado
	const handleAddToOrderMesa = async (forcedUser?: any, targetMesa?: string) => {
		setFallo(null);
		const currentUser = forcedUser || (await resolveCurrentUser());
		if (!currentUser) {
			router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
			return;
		}
		const mesaFinal = targetMesa || selectedMesa;
		if (!mesaFinal) {
			setIsModalOpen(true);
			return;
		}
		const comboItems = pendingComboRef.current;
		setIsSubmitting(true);
		try {
			const body = comboItems?.length
				? {
						usuarioId: Number(currentUser.id),
						mesa: mesaFinal,
						items: [{ platilloId: Number(platillo?.id), cantidad: Number(cantidad) }, ...comboItems],
					}
				: {
						platilloId: Number(platillo?.id),
						cantidad: Number(cantidad),
						usuarioId: Number(currentUser.id),
						mesa: mesaFinal,
					};
			const res = await fetch(`${API}/pedidos/mesa`, {
				cache: "no-store",
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			if (!res.ok) throw new Error(`pedido en mesa ${res.status}`);
			const data = await res.json();
			// El plato se añade al pedido de la mesa; el envío a cocina se confirma en /menu/pedido.
			notificar({
				tono: "exito",
				titulo: "Añadido a tu pedido",
				descripcion: comboItems?.length
					? `${cantidad} × ${platillo?.nombre} y ${combo?.sugerido?.nombre}. Revísalo y confírmalo cuando quieras.`
					: `${cantidad} × ${platillo?.nombre}. Revísalo y confírmalo cuando quieras.`,
			});
			setIsModalOpen(false);
			router.push(`/menu/pedido?mesaQuery=${data.mesaId || mesaFinal}&tab=mesa`);
		} catch (err) {
			registrarError(err, "detalle de plato: pedido en mesa");
			setFallo(MENSAJE_FALLO);
		} finally {
			setIsSubmitting(false);
			pendingComboRef.current = null;
		}
	};

	// Enlace escaneado con autoExecute: pide confirmación antes de crear nada (2.13).
	useEffect(() => {
		const autoExecute = searchParams?.get("autoExecute");
		const qtyParam = searchParams?.get("qty");
		if (!platillo || autoExecute !== "pedir_mesa") return;

		const ejecutarAutoPedido = async () => {
			const currentUser = await resolveCurrentUser();
			if (!currentUser) return;
			// Cantidad de la URL: entero entre 1 y 20 (PLAN 2.13).
			const qty = cantidadSegura(qtyParam);
			if (qtyParam) setCantidad(qty);
			window.history.replaceState({}, document.title, window.location.pathname);
			const confirmado = await confirmar({
				titulo: "¿Añadir este plato a tu pedido?",
				descripcion: `${qty} × ${platillo.nombre}${urlMesa ? `, mesa ${urlMesa}` : ""}.`,
				textoConfirmar: "Añadir al pedido",
				textoCancelar: "Ahora no",
			});
			if (!confirmado) return;
			handleAddToOrderMesa(currentUser, urlMesa || undefined);
		};
		ejecutarAutoPedido();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- mismas dependencias que antes del rediseño
	}, [platillo, reduxUser, searchParams, urlMesa]);

	const handleAddCombo = () => {
		if (!combo?.disponible) return;
		pendingComboRef.current = [{ platilloId: combo.sugerido.id, cantidad: 1 }];
		handleAddToOrderMesa();
	};

	const handleAddToCartDomicilio = async () => {
		setFallo(null);
		const currentUser = await resolveCurrentUser();
		if (!currentUser) {
			router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
			return;
		}
		setIsSubmitting(true);
		try {
			const res = await fetch(`${API}/pedidos/mesa`, {
				cache: "no-store",
				method: "POST",
				headers: { "Content-Type": "application/json" },
				// Sin «mesa»: así sabe el backend que es a domicilio.
				body: JSON.stringify({ platilloId: Number(platillo?.id), cantidad: Number(cantidad), usuarioId: Number(currentUser.id) }),
			});
			if (!res.ok) throw new Error(`pedido a domicilio ${res.status}`);
			notificar({ tono: "exito", titulo: "Añadido a tu pedido a domicilio", descripcion: `${cantidad} × ${platillo?.nombre}.` });
			router.push("/menu/pedido?tab=domicilio");
		} catch (err) {
			registrarError(err, "detalle de plato: pedido a domicilio");
			setFallo(MENSAJE_FALLO);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (estado === "no-existe")
		return (
			<PaginaEstado
				{...TEXTOS_ESTADO.platoNoEncontrado}
				pantallaCompleta={false}
				acciones={
					<BotonEnlace href="/menu" variante="primario" icono={<ArrowLeft />}>
						Ver la carta
					</BotonEnlace>
				}
			/>
		);

	const ruta = `/menu/producto/${id}`;
	const nombre: string = platillo?.nombre || "Plato de la casa";

	return (
		<div className="contenedor-pagina pt-(--espacio-xl) pb-(--espacio-entre-secciones)">
			{dialogo}
			<div className="mb-(--espacio-xl) flex flex-col-reverse items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
				<MigasDePan ruta={ruta} actual={estado === "listo" ? nombre : "Plato"} />
				<BotonVolver className="-ms-3 sm:ms-0" />
			</div>

			{estado === "error" ? (
				<EstadoError
					titulo="No pudimos traer este plato"
					descripcion="A veces tarda un poco más de la cuenta. Vuelve a intentarlo o llámanos."
					alReintentar={cargarPlatillo}
					accion={
						<BotonEnlace href={restaurantConfig.contact.phoneHref} variante="fantasma" icono={<Phone />}>
							Llamar al restaurante
						</BotonEnlace>
					}
				/>
			) : estado === "cargando" ? (
				<ZonaCargando cargando texto="Preparando el plato…">
					<div className="grid gap-(--espacio-2xl) lg:grid-cols-2">
						<Esqueleto className="aspect-[4/5] w-full" />
						<div className="flex flex-col gap-4">
							<Esqueleto className="h-4 w-1/4" />
							<Esqueleto className="h-12 w-3/4" />
							<EsqueletoLineas lineas={5} />
						</div>
					</div>
				</ZonaCargando>
			) : (
				<Ficha
					platillo={platillo}
					nombre={nombre}
					cantidad={cantidad}
					alCambiarCantidad={setCantidad}
					enviando={isSubmitting}
					fallo={fallo}
					combo={combo}
					alPedirMesa={() => handleAddToOrderMesa()}
					alPedirDomicilio={handleAddToCartDomicilio}
					alPedirCombo={handleAddCombo}
				/>
			)}

			<Dialogo
				abierto={isModalOpen}
				alCambiarAbierto={setIsModalOpen}
				titulo="¿En qué mesa estás?"
				descripcion="Elige tu mesa para que el pedido llegue a ella."
				cerrable={!isSubmitting}
				pie={
					<>
						<Boton variante="secundario" onClick={() => setIsModalOpen(false)} deshabilitado={isSubmitting}>
							Cancelar
						</Boton>
						<Boton variante="primario" onClick={() => handleAddToOrderMesa()} deshabilitado={!selectedMesa} cargando={isSubmitting} textoCargando="Añadiendo…">
							Confirmar mesa
						</Boton>
					</>
				}
			>
				{loadingMesas ? (
					<CargadorMarca texto="Buscando las mesas…" className="py-8" />
				) : falloMesas ? (
					<Aviso tono="error" titulo="No pudimos ver las mesas">
						Vuelve a abrir esta ventana en un momento o pide tu mesa en sala.
					</Aviso>
				) : mesas.length > 0 ? (
					<fieldset className="m-0 border-0 p-0">
						<legend className="solo-lectores">Mesa</legend>
						<div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
							{mesas.map((m) => {
								const numero = String(m.numero);
								const elegida = selectedMesa === m.numero || selectedMesa === numero;
								return (
									<label
										key={m.id || numero}
										className={cn(
											"flex min-h-14 cursor-pointer flex-col items-center justify-center rounded-control border text-center",
											"transition-[background-color,border-color] duration-(--duracion-breve) ease-estandar",
											"has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-foco",
											elegida ? "border-acento bg-superficie-cafe" : "border-borde-control al-pasar:bg-superficie-cafe",
										)}
									>
										<input type="radio" name="mesa" value={numero} checked={elegida} onChange={() => setSelectedMesa(m.numero)} className="solo-lectores" />
										<span className="text-(length:--texto-etiqueta) uppercase tracking-[0.16em] text-texto-secundario">Mesa</span>
										<span className="font-titulos text-(length:--texto-titulo-3) leading-none numeros-tabulares">{numero}</span>
									</label>
								);
							})}
						</div>
					</fieldset>
				) : (
					<p className="m-0 text-texto-secundario">Ahora mismo no hay mesas para elegir. Pide la tuya en sala.</p>
				)}
				{fallo && isModalOpen && (
					<Aviso tono="error" className="mt-4">
						{fallo}
					</Aviso>
				)}
			</Dialogo>
		</div>
	);
}

function Ficha({
	platillo,
	nombre,
	cantidad,
	alCambiarCantidad,
	enviando,
	fallo,
	combo,
	alPedirMesa,
	alPedirDomicilio,
	alPedirCombo,
}: {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- plato del API sin contrato tipado
	platillo: any;
	nombre: string;
	cantidad: number;
	alCambiarCantidad: (n: number) => void;
	enviando: boolean;
	fallo: string | null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- recomendación del API sin contrato tipado
	combo: any;
	alPedirMesa: () => void;
	alPedirDomicilio: () => void;
	alPedirCombo: () => void;
}) {
	const disponible = platillo.disponible !== false;
	const precio = formatearPrecio(typeof platillo.precio === "string" ? Number(platillo.precio) : platillo.precio);
	const alergenos: string[] = Array.isArray(platillo.alergenos) ? platillo.alergenos : [];
	const seccion = typeof platillo.categoria === "string" ? platillo.categoria : platillo.categoria?.nombre;
	const pares: ParContraetiqueta[] = [{ rotulo: "Sección", valor: seccion || "De la casa", tipo: "texto" }];
	if (precio)
		pares.push({
			rotulo: "Precio",
			valor: (
				<span>
					{precio} <span className="text-(length:--texto-pequeno) font-normal text-texto-tenue">IVA incluido</span>
				</span>
			),
		});
	pares.push({ rotulo: "Alérgenos", valor: alergenos.length > 0 ? alergenos.join(", ") : "No se han declarado", tipo: "texto" });

	return (
		<div className="grid items-start gap-(--espacio-2xl) lg:grid-cols-2">
			<div className="relative aspect-[4/5] overflow-hidden rounded-tarjeta border border-borde-sutil bg-superficie lg:sticky lg:top-[calc(var(--alto-cabecera)+var(--espacio-lg))]">
				<Imagen src={platillo.imagenUrl} alt={nombre} fill preload sizes="(min-width: 64rem) 36rem, 100vw" className="object-cover" />
			</div>

			<div className="flex flex-col gap-(--espacio-lg)">
				<div className="flex flex-col gap-(--espacio-sm)">
					<span aria-hidden="true" className="filete-doble" />
					<h1 className="m-0 font-titulos text-(length:--texto-titulo-1) font-normal leading-[1.08] [text-wrap:balance]">{nombre}</h1>
					{(platillo.esNuevo || platillo.esPopular || !disponible) && (
						<div className="flex flex-wrap gap-2">
							{!disponible && <Insignia tono="aviso">Agotado</Insignia>}
							{platillo.esNuevo && <Insignia tono="acento">Nuevo</Insignia>}
							{platillo.esPopular && <Insignia tono="neutro">De los más pedidos</Insignia>}
						</div>
					)}
					{platillo.descripcionCorta && <p className="m-0 font-titulos text-(length:--texto-titulo-3) italic leading-[1.35] text-texto-secundario">{platillo.descripcionCorta}</p>}
					{platillo.descripcion && <p className="m-0 max-w-(--ancho-lectura) text-texto-secundario [text-wrap:pretty]">{platillo.descripcion}</p>}
				</div>

				<Contraetiqueta pares={pares} />

				<div className="flex flex-col gap-(--espacio-md)">
					<SelectorCantidad cantidad={cantidad} alCambiar={alCambiarCantidad} />
					<div className="grid gap-3 sm:grid-cols-2">
						<Boton variante="primario" icono={<UtensilsCrossed />} onClick={alPedirMesa} deshabilitado={!disponible} cargando={enviando} textoCargando="Añadiendo…">
							Pedir en mesa
						</Boton>
						<Boton variante="secundario" icono={<Bike />} onClick={alPedirDomicilio} deshabilitado={!disponible || enviando}>
							Para domicilio
						</Boton>
					</div>
					{!disponible && <p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">Este plato está agotado; vuelve a intentarlo más tarde.</p>}
					{fallo && <Aviso tono="error">{fallo}</Aviso>}
				</div>

				{combo?.disponible && (
					<section aria-labelledby="combo-titulo" className="flex flex-col gap-(--espacio-md) rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-lg)">
						<div className="flex flex-wrap items-center gap-2">
							<Insignia tono="acento" icono={<Sparkles />}>
								Recomendación
							</Insignia>
						</div>
						<h2 id="combo-titulo" className="m-0 font-texto text-(length:--texto-titulo-interfaz) font-semibold">
							Arma tu combo
						</h2>
						<div className="flex items-center gap-(--espacio-md)">
							<div className="relative size-16 shrink-0 overflow-hidden rounded-control border border-borde-sutil bg-superficie-cafe">
								<Imagen src={combo.sugerido.imagenUrl} alt={combo.sugerido.nombre} fill sizes="4rem" className="object-cover" />
							</div>
							<p className="m-0 min-w-0 text-(length:--texto-pequeno) leading-[1.5] text-texto-secundario">
								El {combo.confianza} % de los pedidos con este plato llevan también <strong className="text-texto-principal">{combo.sugerido.nombre}</strong>. Juntos,{" "}
								<strong className="text-texto-principal numeros-tabulares">{formatearPrecio(Number(combo.precioCombo))}</strong> en lugar de{" "}
								<span className="numeros-tabulares">{formatearPrecio(Number(combo.sugerido.precio))}</span> por el segundo.
							</p>
						</div>
						<div>
							<Boton variante="secundario" onClick={alPedirCombo} deshabilitado={!disponible || enviando}>
								Añadir el combo
							</Boton>
						</div>
					</section>
				)}
			</div>
		</div>
	);
}

/** Cantidad de 1 a 20 con botones de 44 px; el valor se anuncia al cambiar. */
function SelectorCantidad({ cantidad, alCambiar }: { cantidad: number; alCambiar: (n: number) => void }) {
	return (
		<div role="group" aria-labelledby="cantidad-rotulo" className="flex items-center justify-between gap-4 border-y border-borde-sutil py-2">
			<span id="cantidad-rotulo" className="text-(length:--texto-etiqueta) font-semibold uppercase tracking-[0.16em] text-texto-secundario">
				Cantidad
			</span>
			<div className="flex items-center gap-1">
				<Boton variante="fantasma" soloIcono icono={<Minus />} onClick={() => alCambiar(Math.max(1, cantidad - 1))} deshabilitado={cantidad <= 1}>
					Quitar uno
				</Boton>
				<output aria-live="polite" className="w-8 text-center font-titulos text-(length:--texto-titulo-3) numeros-tabulares">
					{cantidad}
				</output>
				<Boton variante="fantasma" soloIcono icono={<Plus />} onClick={() => alCambiar(Math.min(MAXIMO, cantidad + 1))} deshabilitado={cantidad >= MAXIMO}>
					Añadir uno
				</Boton>
			</div>
		</div>
	);
}

// Depende del servidor: sin conexión se muestra un aviso y se carga al reconectar.
export default function PaginaPlato() {
	return (
		<OnlineOnly what="este plato">
			<DetallePlato />
		</OnlineOnly>
	);
}
