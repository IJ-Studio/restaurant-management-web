"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { PlantillaPanel } from "@/components/paneles/PlantillaPanel";
import { PROTAGONISTA_DE_TRES, REJILLA_TRES_INDICADORES } from "@/components/paneles/rejilla";
import { Boton } from "@/components/ui/Boton";
import { Buscador } from "@/components/ui/Buscador";
import { AreaTexto, Campo, Selector } from "@/components/ui/Campo";
import { Dialogo } from "@/components/ui/Dialogo";
import { useConfirmacion } from "@/components/ui/DialogoConfirmacion";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Indicador } from "@/components/ui/Indicador";
import { Insignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import { SubidaImagen } from "@/features/dashboard/admin/comun/SubidaImagen";
import { authHeaders } from "@/features/dashboard/admin/utils/menuUtils";
import { GRADIENT_PRESETS, mapPromotionRow, type Promotion, type PromotionRow } from "@/features/shared/data/promotions";
import { formatearDia } from "@/lib/formato/fecha";
import { formatearImporte } from "@/lib/formato/precio";
import { promocionesVigentes } from "@/lib/publico/promociones-vigentes";
import { registrarError } from "@/lib/registro/registrar-error";
import { esquemaPromocion } from "@/lib/validacion/formularios";

/**
 * Promociones en administración (PLAN 5.10). Mismas llamadas (`GET /promociones/admin`, `POST`,
 * `PATCH` y `DELETE /promociones/:id`) con el mismo cuerpo (`toBody`). Lo nuevo:
 * - el diálogo valida con `esquemaPromocion` (paso 3.1): título obligatorio, precios ≥ 0 y la
 *   fecha de inicio no posterior a la de fin, que pide 5.10;
 * - la imagen, con la subida firmada de `SubidaImagen` (D-31): tipo, tamaño y firma de bytes antes de subir;
 * - eliminar pide confirmación del sistema; los errores, notificaciones (antes `alert()`).
 *
 * El color sigue en el cuerpo porque es un dato del API; la web pública no lo pinta desde la
 * fase 4, y aquí se elige por nombre, sin muestras. Sin emojis (D-25): el formulario ya no tiene ese
 * campo y el cuerpo no lo envía, así que el API conserva lo que tuviera.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL?.trim();
const API = (BASE && BASE.length > 0 ? BASE : "/api").replace(/\/$/, "");
const importe = (n?: number) => (n === undefined ? "—" : (formatearImporte(n) ?? "—"));
const entero = new Intl.NumberFormat("es-MX");
const numOpcional = (t: string) => (t.trim() === "" ? undefined : Number(t));

function cuerpo(d: Partial<Promotion>) {
	return {
		titulo: d.title,
		descripcion: d.description,
		badge: d.badge || null,
		color: d.color,
		precio_original: d.originalPrice ?? null,
		precio_descuento: d.discountedPrice ?? null,
		imagen_url: d.imageUrl || null,
		imagen_public_id: d.imagePublicId || null,
		activa: d.active,
		orden: d.order ?? 0,
		fecha_inicio: d.startDate || null,
		fecha_fin: d.endDate || null,
	};
}

function DialogoPromocion({ promo, disparador, alGuardar }: { promo?: Promotion; disparador: ReactNode; alGuardar: (d: Partial<Promotion>) => Promise<boolean> }) {
	const inicial = () => ({
		title: promo?.title ?? "",
		description: promo?.description ?? "",
		badge: promo?.badge ?? "",
		color: promo?.color ?? GRADIENT_PRESETS[0].value,
		originalPrice: promo?.originalPrice === undefined ? "" : String(promo.originalPrice),
		discountedPrice: promo?.discountedPrice === undefined ? "" : String(promo.discountedPrice),
		startDate: promo?.startDate ?? "",
		endDate: promo?.endDate ?? "",
		imageUrl: promo?.imageUrl ?? "",
		imagePublicId: promo?.imagePublicId ?? "",
	});
	const [abierto, setAbierto] = useState(false);
	const [f, setF] = useState(inicial);
	const [errores, setErrores] = useState<Record<string, string>>({});
	const [guardando, setGuardando] = useState(false);
	const id = promo ? `promo-${promo.id}` : "promo-nueva";

	async function guardar() {
		const datos = { ...f, originalPrice: numOpcional(f.originalPrice), discountedPrice: numOpcional(f.discountedPrice) };
		const r = esquemaPromocion.safeParse(datos);
		const e: Record<string, string> = {};
		if (!r.success) for (const i of r.error.issues) e[String(i.path[0])] ??= i.message;
		setErrores(e);
		if (!r.success) return;
		setGuardando(true);
		const ok = await alGuardar({ ...(promo ?? { active: true, order: 0 }), ...r.data, imageUrl: f.imageUrl, imagePublicId: f.imagePublicId, color: f.color } as Partial<Promotion>);
		setGuardando(false);
		if (ok) setAbierto(false);
	}

	return (
		<Dialogo
			ancho="amplio"
			abierto={abierto}
			alCambiarAbierto={(a) => {
				setAbierto(a);
				if (a) setF(inicial());
				else setErrores({});
			}}
			cerrable={!guardando}
			disparador={disparador}
			titulo={promo ? `Editar «${promo.title}»` : "Promoción nueva"}
			pie={
				<>
					<Boton variante="secundario" deshabilitado={guardando} onClick={() => setAbierto(false)}>
						Cancelar
					</Boton>
					<Boton type="submit" form={id} cargando={guardando} textoCargando="Guardando…">
						{promo ? "Guardar cambios" : "Crear promoción"}
					</Boton>
				</>
			}
		>
			<form
				id={id}
				noValidate
				className="flex flex-col gap-(--espacio-md)"
				onSubmit={(ev) => {
					ev.preventDefault();
					void guardar();
				}}
			>
				<Campo etiqueta="Título" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} error={errores.title} maxLength={120} autoComplete="off" />
				<AreaTexto etiqueta="Descripción" opcional rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} error={errores.description} maxLength={300} contador />
				<Campo etiqueta="Etiqueta" opcional value={f.badge} onChange={(e) => setF({ ...f, badge: e.target.value })} error={errores.badge} maxLength={30} ayuda="Palabra corta sobre la tarjeta: «Fin de semana»." />
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2">
					<Campo etiqueta="Precio normal" opcional type="number" inputMode="decimal" min={0} step="0.01" value={f.originalPrice} onChange={(e) => setF({ ...f, originalPrice: e.target.value })} error={errores.originalPrice} />
					<Campo etiqueta="Precio de la promoción" opcional type="number" inputMode="decimal" min={0} step="0.01" value={f.discountedPrice} onChange={(e) => setF({ ...f, discountedPrice: e.target.value })} error={errores.discountedPrice} />
				</div>
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2">
					<Campo etiqueta="Desde" opcional type="date" value={f.startDate} max={f.endDate || undefined} onChange={(e) => setF({ ...f, startDate: e.target.value })} error={errores.startDate} />
					<Campo etiqueta="Hasta" opcional type="date" value={f.endDate} min={f.startDate || undefined} onChange={(e) => setF({ ...f, endDate: e.target.value })} error={errores.endDate} />
				</div>
				<Selector etiqueta="Color de la tarjeta" opciones={GRADIENT_PRESETS.map((g) => ({ valor: g.value, texto: g.label }))} value={f.color} onChange={(e) => setF({ ...f, color: e.target.value })} ayuda="Dato del sistema; la web usa los colores de la casa." />
				<SubidaImagen
					destino="promociones"
					valor={{ url: f.imageUrl, publicId: f.imagePublicId }}
					alCambiar={(v) => setF((x) => ({ ...x, imageUrl: v.url, imagePublicId: v.publicId }))}
					textoAlternativo={`Imagen de ${f.title || "la promoción"}`}
				/>
			</form>
		</Dialogo>
	);
}

export function PromocionesAdmin() {
	const [promos, setPromos] = useState<Promotion[]>([]);
	const [estado, setEstado] = useState<"cargando" | "error" | "listo">("cargando");
	const [busqueda, setBusqueda] = useState("");
	const [filtro, setFiltro] = useState("todas");
	const { notificar } = useNotificaciones();
	const { confirmar, dialogo } = useConfirmacion();

	const cargar = useCallback(async () => {
		setEstado("cargando");
		try {
			const res = await fetch(`${API}/promociones/admin`, { cache: "no-store", headers: authHeaders() });
			if (!res.ok) throw new Error(`promociones/admin respondió ${res.status}`);
			const datos: PromotionRow[] = await res.json();
			setPromos((Array.isArray(datos) ? datos : []).map(mapPromotionRow).sort((a, b) => a.order - b.order));
			setEstado("listo");
		} catch (e) {
			registrarError(e, "promociones admin: cargar");
			setEstado("error");
		}
	}, []);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
		void cargar();
	}, [cargar]);

	async function guardar(d: Partial<Promotion>) {
		try {
			const res = await fetch(d.id ? `${API}/promociones/${d.id}` : `${API}/promociones`, {
				cache: "no-store",
				method: d.id ? "PATCH" : "POST",
				headers: { "Content-Type": "application/json", ...authHeaders() },
				body: JSON.stringify(cuerpo(d)),
			});
			if (!res.ok) throw new Error(`promoción respondió ${res.status}`);
			const p = mapPromotionRow((await res.json()) as PromotionRow);
			setPromos((ps) => (d.id ? ps.map((x) => (x.id === p.id ? p : x)) : [...ps, p]));
			notificar({ tono: "exito", titulo: d.id ? "Promoción guardada" : "Promoción creada", descripcion: p.title });
			return true;
		} catch (e) {
			registrarError(e, "promociones admin: guardar");
			notificar({ tono: "error", titulo: "No se pudo guardar la promoción", descripcion: "Vuelve a intentarlo en un momento." });
			return false;
		}
	}

	async function alternar(p: Promotion) {
		const siguiente = !p.active;
		setPromos((ps) => ps.map((x) => (x.id === p.id ? { ...x, active: siguiente } : x)));
		try {
			const res = await fetch(`${API}/promociones/${p.id}`, {
				cache: "no-store",
				method: "PATCH",
				headers: { "Content-Type": "application/json", ...authHeaders() },
				body: JSON.stringify({ activa: siguiente }),
			});
			if (!res.ok) throw new Error(`activar respondió ${res.status}`);
		} catch (e) {
			registrarError(e, "promociones admin: activar");
			setPromos((ps) => ps.map((x) => (x.id === p.id ? { ...x, active: !siguiente } : x)));
			notificar({ tono: "error", titulo: "No se pudo cambiar el estado", descripcion: p.title });
		}
	}

	async function eliminar(p: Promotion) {
		const ok = await confirmar({
			titulo: `¿Eliminar «${p.title}»?`,
			descripcion: "Deja de verse en la web y en este panel. No se puede deshacer.",
			textoConfirmar: "Eliminar promoción",
			destructiva: true,
		});
		if (!ok) return;
		const antes = promos;
		setPromos((ps) => ps.filter((x) => x.id !== p.id));
		try {
			const res = await fetch(`${API}/promociones/${p.id}`, { cache: "no-store", method: "DELETE", headers: authHeaders() });
			if (!res.ok) throw new Error(`eliminar respondió ${res.status}`);
			notificar({ tono: "exito", titulo: "Promoción eliminada", descripcion: p.title });
		} catch (e) {
			registrarError(e, "promociones admin: eliminar");
			setPromos(antes);
			notificar({ tono: "error", titulo: "No se pudo eliminar la promoción", descripcion: "Vuelve a intentarlo en un momento." });
		}
	}

	const vigentes = useMemo(() => new Set(promocionesVigentes(promos).map((p) => p.id)), [promos]);
	const filtradas = useMemo(() => {
		const q = busqueda.trim().toLowerCase();
		return promos.filter(
			(p) =>
				(!q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) &&
				(filtro === "todas" || (filtro === "activas" ? p.active : filtro === "inactivas" ? !p.active : vigentes.has(p.id))),
		);
	}, [promos, busqueda, filtro, vigentes]);

	const columnas: ColumnaTabla<Promotion>[] = [
		{
			clave: "promocion",
			titulo: "Promoción",
			principal: true,
			celda: (p) => (
				<span className="flex flex-col gap-0.5">
					<span>{p.title}</span>
					{p.badge && <span className="text-(length:--texto-pequeno) font-normal text-texto-secundario">{p.badge}</span>}
				</span>
			),
		},
		{
			clave: "precio",
			titulo: "Precio",
			numerica: true,
			celda: (p) =>
				p.discountedPrice === undefined ? (
					"—"
				) : (
					<span className="flex flex-col items-end">
						<span>{importe(p.discountedPrice)}</span>
						{p.originalPrice !== undefined && (
							<span className="text-(length:--texto-pequeno) text-texto-secundario line-through">
								<span className="solo-lectores">Antes </span>
								{importe(p.originalPrice)}
							</span>
						)}
					</span>
				),
		},
		{
			clave: "vigencia",
			titulo: "Vigencia",
			celda: (p) =>
				p.startDate || p.endDate ? (
					`${p.startDate ? formatearDia(p.startDate) : "Ya"} – ${p.endDate ? formatearDia(p.endDate) : "sin fin"}`
				) : (
					"Sin fechas"
				),
		},
		{
			clave: "estado",
			titulo: "Estado",
			celda: (p) =>
				!p.active ? (
					<Insignia tono="neutro" className="whitespace-nowrap">
						Inactiva
					</Insignia>
				) : vigentes.has(p.id) ? (
					<Insignia tono="exito" className="whitespace-nowrap">
						En la web
					</Insignia>
				) : (
					<Insignia tono="aviso" className="whitespace-nowrap">
						Fuera de fechas
					</Insignia>
				),
		},
	];

	return (
		<PlantillaPanel
				titulo="Promociones"
				descripcion="Las propuestas que se ven en la web, con su precio y sus fechas."
				acciones={<DialogoPromocion alGuardar={guardar} disparador={<Boton icono={<Plus />}>Promoción nueva</Boton>} />}
		>

			<div className={REJILLA_TRES_INDICADORES}>
				<Indicador estado={estado} alReintentar={cargar} rotulo="En la web ahora" valor={entero.format(vigentes.size)} detalle="Activas y dentro de sus fechas" className={PROTAGONISTA_DE_TRES} />
				<Indicador estado={estado} alReintentar={cargar} rotulo="Activas" valor={entero.format(promos.filter((p) => p.active).length)} />
				<Indicador estado={estado} alReintentar={cargar} rotulo="En total" valor={entero.format(promos.length)} />
			</div>

			<BloquePanel
				titulo="Todas las promociones"
				acciones={
					<div className="flex w-full flex-wrap items-end gap-3 sm:w-auto">
						<Buscador etiqueta="Buscar promoción" valor={busqueda} alCambiar={setBusqueda} marcador="Título o descripción" />
						<Selector
							etiqueta="Mostrar"
							opciones={[
								{ valor: "todas", texto: "Todas" },
								{ valor: "web", texto: "En la web" },
								{ valor: "activas", texto: "Activas" },
								{ valor: "inactivas", texto: "Inactivas" },
							]}
							value={filtro}
							onChange={(e) => setFiltro(e.target.value)}
						/>
					</div>
				}
			>
				<Tabla
					leyenda="Promociones"
					tablaDesde="lg"
					columnas={columnas}
					filas={filtradas}
					claveFila={(p) => p.id}
					estado={estado === "cargando" ? "cargando" : "listo"}
					error={estado === "error" ? <EstadoError titulo="No pudimos traer las promociones" descripcion="Vuelve a intentarlo en un momento." alReintentar={cargar} /> : undefined}
					tituloAcciones="Acciones"
					acciones={(p) => (
						<>
							<Boton variante="fantasma" tamano="compacto" aria-label={p.active ? `Desactivar ${p.title}` : `Activar ${p.title}`} onClick={() => alternar(p)}>
								{p.active ? "Desactivar" : "Activar"}
							</Boton>
							<DialogoPromocion
								promo={p}
								alGuardar={guardar}
								disparador={
									<Boton variante="secundario" tamano="compacto" soloIcono icono={<Pencil />}>
										{`Editar ${p.title}`}
									</Boton>
								}
							/>
							<Boton variante="secundario" tamano="compacto" soloIcono icono={<Trash2 />} onClick={() => eliminar(p)}>
								{`Eliminar ${p.title}`}
							</Boton>
						</>
					)}
					vacio={<EstadoVacio icono={<Tag />} titulo={busqueda || filtro !== "todas" ? "No hay promociones con esos datos" : "Todavía no hay promociones"} descripcion={busqueda || filtro !== "todas" ? "Prueba con otra búsqueda o con otro filtro." : "Crea la primera para que aparezca en la web."} />}
				/>
			</BloquePanel>
			{dialogo}
		</PlantillaPanel>
	);
}
