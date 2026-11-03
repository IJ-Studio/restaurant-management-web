"use client";

import { useCallback, useEffect, useState } from "react";
import { Database, Save, Trash2 } from "lucide-react";
import { Contraetiqueta } from "@/components/marca/Contraetiqueta";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { EncabezadoPagina } from "@/components/paneles/EncabezadoPagina";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { AreaTexto, Campo, Selector } from "@/components/ui/Campo";
import { Casilla, Interruptor } from "@/components/ui/Casilla";
import { Dialogo } from "@/components/ui/Dialogo";
import { useConfirmacion } from "@/components/ui/DialogoConfirmacion";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Insignia, type TonoInsignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { esImagenPermitida } from "@/config/seguridad/hosts-permitidos";
import { GATEWAYS_DEFAULT, type Backup, type Gateway } from "@/features/dashboard/admin/data/settingsMock";
import { INITIAL_SETTINGS, type MenuCategory, type SystemSettings } from "@/features/shared/data/restaurantData";
import { MenuService, SettingsService } from "@/features/shared/services/dataService";
import { contar } from "@/lib/formato/plural";
import { registrarError } from "@/lib/registro/registrar-error";

/**
 * Ajustes (PLAN 5.14, D-12). Lo que hacía la página, sin la sección «Apariencia» (colores y fuentes)
 * ni `DesignSystemProvider`: el sistema visual es el de DESIGN.md. Y en las pasarelas de pago, sin
 * los campos «API Key» y «Secret Key», que no se leían ni se enviaban (verificado el 2026-10-31): las
 * claves se gestionan en el sistema (NP-09).
 *
 * - **Marca y textos** se guardan en este navegador (`SettingsService`), como antes.
 * - **Fondo del inicio de sesión:** solo imágenes propias (D-18), comprobadas con
 *   `esImagenPermitida`; antes el campo sugería Unsplash o Pixabay.
 * - **Respaldos:** las mismas llamadas a `/backups`. La programación (automático, frecuencia, hora,
 *   nube) era estado local que no se guardaba: va marcada como datos de ejemplo.
 * - **Sin conexión y pasarelas:** datos de ejemplo, también marcados.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL?.trim();
const API = (BASE && BASE.length > 0 ? BASE : "/api").replace(/\/$/, "");
const API_EXTERNA = API.startsWith("http");

function urlDeImagenValida(valor: string): boolean {
	if (!valor) return true;
	if (valor.startsWith("/") && !valor.startsWith("//")) return true;
	// Identificador de una imagen de la nube de la casa (el valor por defecto lo es): `Imagen` lo
	// resuelve contra `dcb1tspbj`. Sin esquema ni dominio, no puede apuntar a otro sitio.
	if (/^[\w./-]+\.(jpe?g|png|webp|avif)$/i.test(valor) && !valor.includes("//")) return true;
	try {
		return esImagenPermitida(new URL(valor));
	} catch {
		return false;
	}
}

const tamano = (bytes: number) => (bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`);

function Respaldos() {
	const [respaldos, setRespaldos] = useState<Backup[]>([]);
	const [estado, setEstado] = useState<"cargando" | "error" | "listo">("cargando");
	const [creando, setCreando] = useState(false);
	const [programa, setPrograma] = useState({ automatico: true, frecuencia: "diario", hora: "23:00", nube: true });
	const { notificar } = useNotificaciones();
	const { confirmar, dialogo } = useConfirmacion();

	const cargar = useCallback(async () => {
		setEstado("cargando");
		try {
			const res = await fetch(`${API}/backups`, { cache: "no-store" });
			if (!res.ok) throw new Error(`backups respondió ${res.status}`);
			const datos = await res.json();
			setRespaldos(Array.isArray(datos) ? datos : []);
			setEstado("listo");
		} catch (e) {
			registrarError(e, "ajustes: respaldos");
			setEstado("error");
		}
	}, []);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
		void cargar();
	}, [cargar]);

	async function crear() {
		setCreando(true);
		try {
			const res = await fetch(`${API}/backups`, { cache: "no-store", method: "POST" });
			if (!res.ok) throw new Error(`crear respaldo respondió ${res.status}`);
			const nuevo: Backup = await res.json();
			setRespaldos((rs) => [nuevo, ...rs]);
			notificar({ tono: "exito", titulo: "Respaldo creado", descripcion: nuevo.name });
		} catch (e) {
			registrarError(e, "ajustes: crear respaldo");
			notificar({ tono: "error", titulo: "No se pudo crear el respaldo", descripcion: "Vuelve a intentarlo en un momento." });
		} finally {
			setCreando(false);
		}
	}

	async function eliminar(b: Backup) {
		const ok = await confirmar({ titulo: `¿Eliminar el respaldo ${b.name}?`, descripcion: "Se borra la copia. No se puede deshacer.", textoConfirmar: "Eliminar respaldo", destructiva: true });
		if (!ok) return;
		try {
			const res = await fetch(API_EXTERNA ? `${API}/backups/${b.id}` : `${API}/backups?id=${b.id}`, { cache: "no-store", method: "DELETE" });
			if (!res.ok) throw new Error(`eliminar respaldo respondió ${res.status}`);
			setRespaldos((rs) => rs.filter((x) => x.id !== b.id));
			notificar({ tono: "exito", titulo: "Respaldo eliminado" });
		} catch (e) {
			registrarError(e, "ajustes: eliminar respaldo");
			notificar({ tono: "error", titulo: "No se pudo eliminar el respaldo", descripcion: "Vuelve a intentarlo en un momento." });
		}
	}

	const columnas: ColumnaTabla<Backup>[] = [
		{ clave: "nombre", titulo: "Respaldo", principal: true, celda: (b) => <span className="[overflow-wrap:anywhere]">{b.name}</span> },
		{ clave: "fecha", titulo: "Creado", celda: (b) => b.createdAt },
		{ clave: "tamano", titulo: "Tamaño", numerica: true, celda: (b) => tamano(b.sizeBytes) },
		{ clave: "tipo", titulo: "Tipo", celda: (b) => (b.type === "auto" ? "Automático" : "Manual") },
		{ clave: "estado", titulo: "Estado", celda: (b) => (b.status === "ok" ? <Insignia tono="exito">Correcto</Insignia> : <Insignia tono="error">Con error</Insignia>) },
	];

	return (
		<BloquePanel
			titulo="Respaldos"
			descripcion={estado === "listo" ? `${contar(respaldos.filter((b) => b.status === "ok").length, "copia correcta", "copias correctas")}.` : undefined}
			acciones={
				<Boton icono={<Database />} cargando={creando} textoCargando="Creando el respaldo…" onClick={crear}>
					Crear respaldo ahora
				</Boton>
			}
		>
			<Tabla
				leyenda="Respaldos"
				columnas={columnas}
				filas={respaldos}
				claveFila={(b) => b.id}
				estado={estado === "cargando" ? "cargando" : "listo"}
				error={estado === "error" ? <EstadoError titulo="No pudimos traer los respaldos" descripcion="Vuelve a intentarlo en un momento." alReintentar={cargar} /> : undefined}
				tituloAcciones="Acciones"
				acciones={(b) => (
					<Boton variante="secundario" tamano="compacto" soloIcono icono={<Trash2 />} onClick={() => eliminar(b)}>
						{`Eliminar ${b.name}`}
					</Boton>
				)}
				vacio={<EstadoVacio icono={<Database />} titulo="Todavía no hay respaldos" descripcion="Crea el primero con «Crear respaldo ahora»." />}
			/>
			<fieldset className="m-0 mt-(--espacio-md) flex min-w-0 flex-col gap-(--espacio-md) rounded-tarjeta border border-borde-sutil p-(--espacio-md)">
				<legend className="flex flex-wrap items-center gap-2 px-2 font-semibold text-texto-principal">
					Programación <Insignia tono="neutro">Datos de ejemplo</Insignia>
				</legend>
				<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">Aún no se guarda: el sistema no tiene dónde recibir esta programación.</p>
				<Interruptor etiqueta="Respaldo automático" checked={programa.automatico} onChange={(e) => setPrograma({ ...programa, automatico: e.target.checked })} />
				{programa.automatico && (
					<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2">
						<Selector
							etiqueta="Frecuencia"
							opciones={[
								{ valor: "diario", texto: "Cada día" },
								{ valor: "semanal", texto: "Cada semana" },
								{ valor: "mensual", texto: "Cada mes" },
							]}
							value={programa.frecuencia}
							onChange={(e) => setPrograma({ ...programa, frecuencia: e.target.value })}
						/>
						<Campo etiqueta="Hora" type="time" value={programa.hora} onChange={(e) => setPrograma({ ...programa, hora: e.target.value })} />
					</div>
				)}
				<Interruptor etiqueta="Copia también en la nube" checked={programa.nube} onChange={(e) => setPrograma({ ...programa, nube: e.target.checked })} />
			</fieldset>
			{dialogo}
		</BloquePanel>
	);
}

const ESTADO_PASARELA: Record<Gateway["status"], { texto: string; tono: TonoInsignia }> = {
	activo: { texto: "Activa", tono: "exito" },
	inactivo: { texto: "Inactiva", tono: "neutro" },
	prueba: { texto: "En pruebas", tono: "aviso" },
};

function Pasarelas() {
	const [pasarelas, setPasarelas] = useState(GATEWAYS_DEFAULT);
	const [entornos, setEntornos] = useState<Record<number, string>>({});

	return (
		<BloquePanel titulo="Pasarelas de pago" datosDeEjemplo descripcion="Las claves se configuran en el sistema, no desde este panel.">
			<ul className="m-0 grid list-none grid-cols-1 gap-(--espacio-md) p-0 md:grid-cols-2">
				{pasarelas.map((g) => (
					<Tarjeta
						key={g.id}
						como="li"
						titulo={g.name}
						nivelTitulo={3}
						insignia={<Insignia tono={ESTADO_PASARELA[g.status].tono}>{ESTADO_PASARELA[g.status].texto}</Insignia>}
						pie={
							<Dialogo
								titulo={`Ajustes de ${g.name}`}
								descripcion="Las claves de acceso se gestionan en el sistema por seguridad; aquí solo el estado y el entorno."
								disparador={
									<Boton variante="secundario" tamano="compacto" aria-label={`Ajustes de ${g.name}`}>
										Ajustes
									</Boton>
								}
							>
								<div className="flex flex-col gap-(--espacio-md)">
									<Selector
										etiqueta="Estado"
										opciones={Object.entries(ESTADO_PASARELA).map(([valor, { texto }]) => ({ valor, texto }))}
										value={g.status}
										onChange={(e) => setPasarelas((ps) => ps.map((x) => (x.id === g.id ? { ...x, status: e.target.value as Gateway["status"] } : x)))}
									/>
									<Selector
										etiqueta="Entorno"
										opciones={[
											{ valor: "produccion", texto: "Producción" },
											{ valor: "pruebas", texto: "Pruebas" },
										]}
										value={entornos[g.id] ?? (g.status === "prueba" ? "pruebas" : "produccion")}
										onChange={(e) => setEntornos((x) => ({ ...x, [g.id]: e.target.value }))}
									/>
									<Aviso tono="info" rol={null} titulo="Las claves no se muestran ni se editan aquí.">
										Pide al equipo técnico que las cambie en el sistema (NP-09).
									</Aviso>
								</div>
							</Dialogo>
						}
					>
						<Contraetiqueta
							pares={[
								{ rotulo: "Comisión", valor: `${g.commission} %` },
								{ rotulo: "Métodos", valor: g.methods.join(", "), tipo: "texto" },
							]}
						/>
					</Tarjeta>
				))}
			</ul>
		</BloquePanel>
	);
}

function SinConexion() {
	const [m, setM] = useState({ activo: false, sincronizar: true, pedidos: true, caja: true, carta: false });
	return (
		<BloquePanel titulo="Trabajo sin conexión" datosDeEjemplo descripcion="Aún sin efecto: el sistema no tiene todavía este modo.">
			<div className="flex flex-col gap-(--espacio-md) rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-md)">
				<Interruptor etiqueta="Modo sin conexión" checked={m.activo} onChange={(e) => setM({ ...m, activo: e.target.checked })} />
				<Interruptor etiqueta="Sincronizar al volver la conexión" checked={m.sincronizar} onChange={(e) => setM({ ...m, sincronizar: e.target.checked })} />
				<Interruptor etiqueta="Pedidos en mesa" ayuda="Tomar y gestionar pedidos sin internet." checked={m.pedidos} onChange={(e) => setM({ ...m, pedidos: e.target.checked })} />
				<Interruptor etiqueta="Caja y cobros" ayuda="Registrar pagos y movimientos." checked={m.caja} onChange={(e) => setM({ ...m, caja: e.target.checked })} />
				<Interruptor etiqueta="Carta" ayuda="Ver la carta para tomar pedidos." checked={m.carta} onChange={(e) => setM({ ...m, carta: e.target.checked })} />
			</div>
		</BloquePanel>
	);
}

export function AjustesAdmin() {
	const [ajustes, setAjustes] = useState<SystemSettings>(INITIAL_SETTINGS);
	const [categorias, setCategorias] = useState<MenuCategory[]>([]);
	const [errorFondo, setErrorFondo] = useState<string | null>(null);
	const { notificar } = useNotificaciones();

	// El almacenamiento del navegador se lee al montar, no al pintar en el servidor.
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- lectura inicial del almacenamiento local
		setAjustes(SettingsService.getSettings());
		setCategorias(MenuService.getMenu());
	}, []);

	const cambiar = <K extends keyof SystemSettings>(clave: K, valor: SystemSettings[K]) => setAjustes((a) => ({ ...a, [clave]: valor }));

	function guardar() {
		if (!urlDeImagenValida(ajustes.loginBgImageUrl.trim())) {
			setErrorFondo("Usa una imagen propia: de la nube de Cloudinary de la casa o del sitio (empieza por «/»).");
			return;
		}
		setErrorFondo(null);
		SettingsService.saveSettings({ ...ajustes, loginBgImageUrl: ajustes.loginBgImageUrl.trim() });
		notificar({ tono: "exito", titulo: "Ajustes guardados", descripcion: "Se aplican en este navegador." });
	}

	const destacadas = ajustes.featuredCategoryIds ?? [];
	return (
		<div className="mx-auto flex w-full max-w-(--ancho-amplio) flex-col gap-(--espacio-xl) px-(--margen-pagina) py-(--espacio-xl) lg:py-(--espacio-2xl)">
			<EncabezadoPagina
				antetitulo="Sistema"
				titulo="Ajustes"
				descripcion="Nombre, textos del área de clientes, respaldos y pasarelas de pago."
				acciones={
					<Boton icono={<Save />} onClick={guardar}>
						Guardar ajustes
					</Boton>
				}
			/>
			<Aviso tono="info" rol={null} titulo="La marca y los textos se guardan en este navegador.">
				Así funcionaba antes del rediseño; el sistema aún no los guarda para todos los equipos.
			</Aviso>

			<BloquePanel titulo="Marca">
				<div className="grid grid-cols-1 gap-(--espacio-md) rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-md) md:grid-cols-2">
					<Campo etiqueta="Nombre del restaurante" value={ajustes.restaurantName} onChange={(e) => cambiar("restaurantName", e.target.value)} maxLength={60} />
					<Campo etiqueta="Nombre corto" value={ajustes.shortName} onChange={(e) => cambiar("shortName", e.target.value)} maxLength={4} ayuda="Una o dos letras para los espacios pequeños." />
					<Campo etiqueta="Lema" opcional value={ajustes.tagline} onChange={(e) => cambiar("tagline", e.target.value)} maxLength={80} />
					<Campo etiqueta="Emoji" opcional value={ajustes.logoEmoji} onChange={(e) => cambiar("logoEmoji", e.target.value)} maxLength={4} />
				</div>
			</BloquePanel>

			<BloquePanel titulo="Área de clientes e inicio de sesión">
				<div className="flex flex-col gap-(--espacio-md) rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-md)">
					<div className="grid grid-cols-1 gap-(--espacio-md) md:grid-cols-2">
						<Campo etiqueta="Título de bienvenida" value={ajustes.heroTitle} onChange={(e) => cambiar("heroTitle", e.target.value)} maxLength={80} />
						<Campo etiqueta="Texto del botón" value={ajustes.heroButtonText} onChange={(e) => cambiar("heroButtonText", e.target.value)} maxLength={40} />
					</div>
					<AreaTexto etiqueta="Subtítulo" rows={2} value={ajustes.heroSubtitle} onChange={(e) => cambiar("heroSubtitle", e.target.value)} maxLength={160} />
					<Campo
						etiqueta="Imagen del inicio de sesión"
						opcional
						type="url"
						value={ajustes.loginBgImageUrl}
						onChange={(e) => cambiar("loginBgImageUrl", e.target.value)}
						error={errorFondo}
						ayuda="Una foto propia: su dirección en la nube de Cloudinary de la casa, su nombre en esa nube o una ruta del sitio. Vacío, la de siempre."
					/>
					{categorias.length > 0 && (
						<fieldset className="m-0 flex min-w-0 flex-col gap-(--espacio-sm) border-0 p-0">
							<legend className="mb-(--espacio-xs) p-0 font-semibold text-texto-principal">Categorías destacadas</legend>
							<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
								{categorias.map((c) => (
									<Casilla
										key={c.id}
										etiqueta={c.name}
										checked={destacadas.includes(c.id)}
										onChange={(e) => cambiar("featuredCategoryIds", e.target.checked ? [...destacadas, c.id] : destacadas.filter((x) => x !== c.id))}
									/>
								))}
							</div>
						</fieldset>
					)}
				</div>
			</BloquePanel>

			<Respaldos />
			<Pasarelas />
			<SinConexion />
		</div>
	);
}
