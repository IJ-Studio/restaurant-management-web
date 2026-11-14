"use client";

import { useMemo, useRef, useState } from "react";
import { Download, FileSpreadsheet, Pencil, Plus, Trash2, Upload, UtensilsCrossed } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { PlantillaPanel } from "@/components/paneles/PlantillaPanel";
import { INDICADOR_PROTAGONISTA, REJILLA_INDICADORES } from "@/components/paneles/rejilla";
import { Boton } from "@/components/ui/Boton";
import { Buscador } from "@/components/ui/Buscador";
import { Selector } from "@/components/ui/Campo";
import { Dialogo } from "@/components/ui/Dialogo";
import { useConfirmacion } from "@/components/ui/DialogoConfirmacion";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Imagen } from "@/components/ui/Imagen";
import { Indicador } from "@/components/ui/Indicador";
import { Insignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import type { MenuItem } from "./tipos";
import { contar } from "@/lib/formato/plural";
import { formatearImporte } from "@/lib/formato/precio";
import { DialogoImportacion } from "./DialogoImportacion";
import { DialogoPlatillo, ETIQUETAS } from "./DialogoPlatillo";
import { ACEPTA_CARTA, enviarImportacion, validarArchivo, type ModoImportacion, type PlanImportacion } from "./importacion";
import { API, useCartaAdmin } from "./useCartaAdmin";
import { conteo } from "@/lib/paneles/calculo";

/**
 * Carta en administración (PLAN 5.9). Misma lógica (`useCartaAdmin`), otra forma: indicadores,
 * una tabla por categoría (tarjetas por debajo de 1024 px), diálogos del catálogo, importar y
 * exportar en diálogos con opciones nombradas (antes, menús desplegables hechos a mano) y, al
 * importar, el archivo se valida antes de subirlo y el API devuelve la vista previa (Fase 4.2).
 */

const importe = (n: number) => formatearImporte(n) ?? "—";
const entero = new Intl.NumberFormat("es-MX");

type Pendiente = { archivo: File; modo: ModoImportacion; plan: PlanImportacion };

export function CartaAdmin() {
	const carta = useCartaAdmin();
	const [busqueda, setBusqueda] = useState("");
	const [disponibilidad, setDisponibilidad] = useState("todos");
	const [pendiente, setPendiente] = useState<Pendiente | null>(null);
	const [leyendo, setLeyendo] = useState(false);
	const [dialogo, setDialogo] = useState<null | "importar" | "exportar">(null);
	const entrada = useRef<HTMLInputElement>(null);
	const [modo, setModo] = useState<ModoImportacion>("agregar");
	const { notificar } = useNotificaciones();
	const { confirmar, dialogo: confirmacion } = useConfirmacion();

	const todos = carta.categorias.flatMap((c) => c.items);
	const disponibles = todos.filter((i) => i.available).length;

	const filtrar = useMemo(() => {
		const q = busqueda.trim().toLowerCase();
		return (items: MenuItem[]) =>
			items.filter(
				(i) =>
					(!q || i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)) &&
					(disponibilidad === "todos" ||
						(disponibilidad === "disponibles" ? i.available : disponibilidad === "sin-imagen" ? !i.imageUrl : !i.available)),
			);
	}, [busqueda, disponibilidad]);

	async function eliminar(categoria: string, p: MenuItem) {
		const ok = await confirmar({
			titulo: `¿Eliminar ${p.name} de la carta?`,
			descripcion: "Deja de aparecer en la carta de este panel. No se puede deshacer.",
			textoConfirmar: "Eliminar platillo",
			destructiva: true,
		});
		if (!ok) return;
		if (await carta.eliminar(categoria, p.id)) notificar({ tono: "exito", titulo: `${p.name} eliminado` });
		else notificar({ tono: "error", titulo: "No se pudo eliminar", descripcion: "Vuelve a intentarlo en un momento." });
	}

	async function alternar(categoria: string, p: MenuItem) {
		if (await carta.alternarDisponible(categoria, p.id)) notificar({ tono: "exito", titulo: p.available ? `${p.name} agotado` : `${p.name} disponible` });
		else notificar({ tono: "error", titulo: "No se pudo cambiar la disponibilidad", descripcion: "Vuelve a intentarlo en un momento." });
	}

	async function guardar(categoria: string, d: Partial<MenuItem>): Promise<boolean> {
		const ok = await carta.guardar(categoria, d);
		if (ok) notificar({ tono: "exito", titulo: d.id === undefined ? "Platillo añadido" : "Cambios guardados", descripcion: d.name });
		else notificar({ tono: "error", titulo: "No se pudo guardar", descripcion: "Vuelve a intentarlo en un momento." });
		return ok;
	}

	function elegirArchivo() {
		setDialogo(null);
		entrada.current?.click();
	}

	async function alElegir(archivo: File | undefined) {
		if (entrada.current) entrada.current.value = "";
		if (!archivo) return;
		setLeyendo(true);
		const invalido = await validarArchivo(archivo);
		const r = invalido ? { error: invalido } : await enviarImportacion(API, archivo, modo, { confirmar: false });
		setLeyendo(false);
		if ("error" in r) notificar({ tono: "error", titulo: "No se puede importar ese archivo", descripcion: r.error, duracionMs: null });
		else setPendiente({ archivo, modo, plan: r.plan });
	}

	async function descargar(tipo: "excel" | "plantilla-csv") {
		setDialogo(null);
		if (!(await carta.descargarDelApi(tipo))) notificar({ tono: "error", titulo: "No se pudo descargar", descripcion: "Vuelve a intentarlo en un momento." });
	}

	const columnas: ColumnaTabla<MenuItem>[] = [
		{
			clave: "platillo",
			titulo: "Platillo",
			principal: true,
			celda: (p) => (
				<span className="flex items-center gap-3">
					<span className="relative aspect-square w-12 shrink-0 overflow-hidden rounded-control border border-borde-sutil bg-superficie-cafe">
						<Imagen src={p.imageUrl || null} decorativa fill sizes="3rem" className="object-cover" />
					</span>
					<span className="flex min-w-0 flex-col gap-0.5">
						<span>{p.name}</span>
						{p.description && <span className="text-(length:--texto-pequeno) font-normal text-texto-secundario">{p.description}</span>}
					</span>
				</span>
			),
		},
		{ clave: "precio", titulo: "Precio", numerica: true, celda: (p) => importe(p.price) },
		{ clave: "preparacion", titulo: "Preparación", numerica: true, celda: (p) => <span className="whitespace-nowrap">{`${p.prepTime ?? 0} min`}</span> },
		{ clave: "etiquetas", titulo: "Etiquetas", celda: (p) => (p.tags?.length ? p.tags.map((t) => ETIQUETAS[t] ?? t).join(", ") : "—") },
		{
			clave: "estado",
			titulo: "Estado",
			celda: (p) =>
				p.available ? (
					<Insignia tono="exito" className="whitespace-nowrap">
						Disponible
					</Insignia>
				) : (
					<Insignia tono="neutro" className="whitespace-nowrap">
						Agotado
					</Insignia>
				),
		},
	];

	return (
		<PlantillaPanel
				titulo="Platillos"
				descripcion="Lo que se ofrece, a qué precio y si está disponible."
				acciones={
					<>
						<Boton variante="secundario" icono={<Upload />} cargando={leyendo} textoCargando="Leyendo el archivo…" onClick={() => setDialogo("importar")}>
							Importar
						</Boton>
						<Boton variante="secundario" icono={<Download />} onClick={() => setDialogo("exportar")}>
							Exportar
						</Boton>
					</>
				}
		>
			<input ref={entrada} type="file" accept={ACEPTA_CARTA} hidden onChange={(e) => void alElegir(e.target.files?.[0])} />

			<div className={REJILLA_INDICADORES}>
				<Indicador rotulo="Platillos en la carta" calculo={conteo("platillos = todos los platillos de todas las categorías", todos, (i) => i.name, (i) => (i.available ? "disponible" : "agotado"))} valorCalculo={todos.length} valor={entero.format(todos.length)} detalle={contar(carta.categorias.length, "categoría")} className={INDICADOR_PROTAGONISTA} estado={carta.carga.estado} alReintentar={carta.recargar} />
				<Indicador rotulo="Disponibles" calculo={conteo("disponibles = platillos marcados como disponibles", todos.filter((i) => i.available), (i) => i.name, () => "disponible")} valorCalculo={disponibles} valor={entero.format(disponibles)} estado={carta.carga.estado} alReintentar={carta.recargar} />
				<Indicador rotulo="Agotados" calculo={conteo("agotados = platillos no disponibles", todos.filter((i) => !i.available), (i) => i.name, () => "agotado")} valorCalculo={todos.length - disponibles} valor={entero.format(todos.length - disponibles)} estado={carta.carga.estado} alReintentar={carta.recargar} />
				<Indicador rotulo="Populares" calculo={conteo("populares = platillos con la etiqueta «popular»", todos.filter((i) => i.tags?.includes("popular")), (i) => i.name, () => "popular")} valorCalculo={todos.filter((i) => i.tags?.includes("popular")).length} valor={entero.format(todos.filter((i) => i.tags?.includes("popular")).length)} estado={carta.carga.estado} alReintentar={carta.recargar} />
			</div>

			<div className="flex flex-wrap items-end gap-3">
				<Buscador etiqueta="Buscar platillo" valor={busqueda} alCambiar={setBusqueda} marcador="Nombre o descripción" />
				<Selector
					etiqueta="Mostrar"
					opciones={[
						{ valor: "todos", texto: "Todos" },
						{ valor: "disponibles", texto: "Disponibles" },
						{ valor: "agotados", texto: "Deshabilitados (agotados)" },
						{ valor: "sin-imagen", texto: "Sin imagen" },
					]}
					value={disponibilidad}
					onChange={(e) => setDisponibilidad(e.target.value)}
				/>
			</div>

			{carta.carga.estado === "error" && (
				<EstadoError titulo="No pudimos traer la carta" descripcion="Vuelve a intentarlo en un momento." alReintentar={carta.recargar} />
			)}
			{carta.carga.estado === "listo" && carta.categorias.length === 0 && (
				<EstadoVacio icono={<UtensilsCrossed />} titulo="La carta está vacía" descripcion="Importa los platillos desde una plantilla para empezar." />
			)}

			{carta.categorias.length > 1 && (
				// Fase 4.7: saltar a una categoría sin recorrer toda la carta; queda fijo bajo la cabecera del panel.
				<nav aria-label="Categorías de la carta" className="sticky top-(--alto-cabecera) z-20 -mx-1 bg-fondo px-1 py-2">
					<ul className="m-0 flex list-none gap-2 overflow-x-auto p-0 [scrollbar-width:thin]">
						{carta.categorias.map((c) => (
							<li key={c.id} className="shrink-0">
								<a
									href={`#categoria-${c.id}`}
									className="inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-pastilla border border-borde-sutil px-3 text-(length:--texto-pequeno) text-texto-secundario al-pasar:text-texto-principal"
								>
									{c.name}
									<span className="text-texto-tenue">{entero.format(c.items.length)}</span>
								</a>
							</li>
						))}
					</ul>
				</nav>
			)}

			{carta.categorias.map((c) => {
				const filas = filtrar(c.items);
				if (filas.length === 0 && busqueda) return null;
				return (
					<div key={c.id} id={`categoria-${c.id}`} className="scroll-mt-[calc(var(--alto-cabecera)+4.5rem)]">
					<BloquePanel
						titulo={c.name}
						descripcion={`Disponibles: ${entero.format(c.items.filter((i) => i.available).length)} de ${entero.format(c.items.length)}`}
						acciones={
							<DialogoPlatillo
								categoria={c.name}
								alGuardar={(d) => guardar(c.id, d)}
								disparador={
									<Boton variante="secundario" icono={<Plus />}>
										{`Añadir a ${c.name}`}
									</Boton>
								}
							/>
						}
					>
						<Tabla
							leyenda={`Platillos de ${c.name}`}
							tablaDesde="lg"
							columnas={columnas}
							filas={filas}
							claveFila={(p) => p.id}
							tituloAcciones="Acciones"
							acciones={(p) => (
								<>
									<Boton
										variante="fantasma"
										tamano="compacto"
										// El nombre accesible empieza por el texto visible (WCAG 2.5.3).
										aria-label={p.available ? `Agotar ${p.name}` : `Ofrecer ${p.name}`}
										onClick={() => void alternar(c.id, p)}
									>
										{p.available ? "Agotar" : "Ofrecer"}
									</Boton>
									<DialogoPlatillo
										platillo={p}
										categoria={c.name}
										alGuardar={(d) => guardar(c.id, d)}
										disparador={
											<Boton variante="secundario" tamano="compacto" soloIcono icono={<Pencil />}>
												{`Editar ${p.name}`}
											</Boton>
										}
									/>
									<Boton variante="secundario" tamano="compacto" soloIcono icono={<Trash2 />} onClick={() => eliminar(c.id, p)}>
										{`Eliminar ${p.name}`}
									</Boton>
								</>
							)}
							vacio={<EstadoVacio icono={<UtensilsCrossed />} titulo="Nada que mostrar" descripcion={busqueda || disponibilidad !== "todos" ? "Prueba con otro filtro." : "Añade el primer platillo de esta categoría."} />}
						/>
					</BloquePanel>
					</div>
				);
			})}

			<Dialogo
				abierto={dialogo === "importar"}
				alCambiarAbierto={(a) => setDialogo(a ? "importar" : null)}
				titulo="Importar platillos"
				descripcion="Descarga la plantilla, rellénala y súbela. Antes de guardar verás qué cambia."
			>
				<div className="flex flex-col gap-(--espacio-md)">
					<Selector
						etiqueta="¿Agregar a la carta o reemplazarla?"
						ayuda={
							modo === "reemplazar"
								? "Los platillos que no vengan en el archivo quedan deshabilitados; no se borran y se pueden volver a activar."
								: "Se añaden los platillos nuevos y se actualizan los que ya existen; el resto no cambia."
						}
						opciones={[
							{ valor: "agregar", texto: "Agregar a la carta" },
							{ valor: "reemplazar", texto: "Reemplazar la carta" },
						]}
						value={modo}
						onChange={(e) => setModo(e.target.value as ModoImportacion)}
					/>
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
						<Boton variante="secundario" icono={<FileSpreadsheet />} onClick={() => descargar("plantilla-csv")}>
							Descargar plantilla
						</Boton>
						<Boton icono={<Upload />} onClick={elegirArchivo}>
							Subir Excel o CSV
						</Boton>
					</div>
					<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">Excel (.xlsx) o CSV, de hasta 2 MB. La plantilla se abre en Excel.</p>
				</div>
			</Dialogo>

			<Dialogo abierto={dialogo === "exportar"} alCambiarAbierto={(a) => setDialogo(a ? "exportar" : null)} titulo="Exportar la carta">
				<div className="flex flex-col gap-2">
					<Boton
						variante="secundario"
						onClick={() => {
							carta.exportarCsv();
							setDialogo(null);
						}}
					>
						CSV de este panel
					</Boton>
					<Boton
						variante="secundario"
						onClick={() => {
							carta.exportarJson();
							setDialogo(null);
						}}
					>
						JSON de este panel
					</Boton>
					<Boton variante="secundario" onClick={() => descargar("excel")}>
						Excel desde el sistema
					</Boton>
				</div>
			</Dialogo>

			{pendiente && (
				<DialogoImportacion
					archivo={pendiente.archivo}
					modo={pendiente.modo}
					plan={pendiente.plan}
					api={API}
					alCerrar={() => setPendiente(null)}
					alTerminar={(r) => {
						setPendiente(null);
						notificar({
							tono: "exito",
							titulo: "Importación completa",
							descripcion: `${contar(r.nuevos.length, "nuevo")}, ${contar(r.actualizados.length, "actualizado")} y ${contar(r.deshabilitar.length, "deshabilitado")}.`,
						});
						void carta.recargar({ silenciosa: true });
					}}
				/>
			)}
			{confirmacion}
		</PlantillaPanel>
	);
}
