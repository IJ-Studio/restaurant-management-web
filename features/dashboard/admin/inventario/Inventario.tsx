"use client";

import { useMemo, useState } from "react";
import { Archive, Layers, Package, Pencil, Plus, Trash2, TrendingDown, Truck } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { EncabezadoPagina } from "@/components/paneles/EncabezadoPagina";
import { INDICADOR_PROTAGONISTA, REJILLA_INDICADORES } from "@/components/paneles/rejilla";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { Buscador } from "@/components/ui/Buscador";
import { Selector } from "@/components/ui/Campo";
import { useConfirmacion } from "@/components/ui/DialogoConfirmacion";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Indicador } from "@/components/ui/Indicador";
import { Insignia, type TonoInsignia } from "@/components/ui/Insignia";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { Pestanas } from "@/components/ui/Pestanas";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import { useInventory, type Merma, type Product } from "@/hooks/useInventory";
import { formatearDia } from "@/lib/formato/fecha";
import { contar } from "@/lib/formato/plural";
import { formatearImporte } from "@/lib/formato/precio";
import { registrarError } from "@/lib/registro/registrar-error";
import { CATEGORIAS, DialogoAjuste, DialogoMerma, DialogoProducto, MOTIVOS_MERMA } from "./DialogosInventario";

/**
 * Inventario: productos y existencias (PLAN 5.7). Mismo hook y mismas rutas (`/api/inventory/*`).
 * Cada operación espera la respuesta y avisa si falla (antes cerraba el modal sin saberlo), eliminar
 * pide confirmación (antes borraba al primer clic) y el nivel de existencias se dice con texto,
 * no solo con color. Sin emojis ni hex.
 */

type Nivel = "correcto" | "bajo" | "critico" | "exceso";
function nivel(p: Product): Nivel {
	if (p.stock <= 0) return "critico";
	if (p.stock < p.minStock) return p.stock < p.minStock * 0.5 ? "critico" : "bajo";
	if (p.stock > p.maxStock) return "exceso";
	return "correcto";
}
const NIVELES: Record<Nivel, { texto: string; tono: TonoInsignia; relleno: string }> = {
	correcto: { texto: "Correcto", tono: "exito", relleno: "fill-exito" },
	bajo: { texto: "Bajo", tono: "aviso", relleno: "fill-aviso" },
	critico: { texto: "Crítico", tono: "error", relleno: "fill-error" },
	exceso: { texto: "Exceso", tono: "info", relleno: "fill-info" },
};

const importe = (n: number) => formatearImporte(n) ?? "—";
const entero = new Intl.NumberFormat("es-MX");
const cantidad = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 });

/** Barra de nivel respecto al máximo; decorativa, porque la insignia dice lo mismo con texto. */
function BarraNivel({ p }: { p: Product }) {
	const pct = p.maxStock > 0 ? Math.max(0, Math.min(100, (p.stock / p.maxStock) * 100)) : 0;
	return (
		<svg aria-hidden="true" viewBox="0 0 100 6" preserveAspectRatio="none" className="block h-1.5 w-24 overflow-hidden rounded-full">
			<rect width="100" height="6" className="fill-borde-sutil" />
			<rect width={pct} height="6" className={NIVELES[nivel(p)].relleno} />
		</svg>
	);
}

const ESTADOS_FILTRO = [
	{ valor: "todos", texto: "Todos" },
	{ valor: "activos", texto: "Activos" },
	{ valor: "inactivos", texto: "Inactivos" },
	{ valor: "bajos", texto: "Bajos o críticos" },
];

export function Inventario({ vistaInicial }: { vistaInicial?: string }) {
	const { products: productos, mermas, loading, error, saveProduct, deleteProduct, adjustStock, saveMerma, recargar } = useInventory();
	const [busqueda, setBusqueda] = useState("");
	const [categoria, setCategoria] = useState("todas");
	const [estado, setEstado] = useState("todos");
	const { notificar } = useNotificaciones();
	const { confirmar, dialogo } = useConfirmacion();

	/** Ejecuta una operación del hook, avisa del resultado y dice si salió bien. */
	async function operar(accion: () => Promise<unknown>, exito: string, fallo: string, contexto: string) {
		try {
			await accion();
			notificar({ tono: "exito", titulo: exito });
			return true;
		} catch (e) {
			registrarError(e, `inventario: ${contexto}`);
			notificar({ tono: "error", titulo: fallo, descripcion: "Vuelve a intentarlo en un momento." });
			return false;
		}
	}

	async function eliminar(p: Product) {
		const ok = await confirmar({
			titulo: `¿Eliminar ${p.name} del inventario?`,
			descripcion: "Se borra el producto con sus existencias. No se puede deshacer.",
			textoConfirmar: "Eliminar producto",
			destructiva: true,
		});
		if (ok) await operar(() => deleteProduct(p.id), `${p.name} eliminado`, "No se pudo eliminar el producto", "eliminar");
	}

	const criticos = productos.filter((p) => nivel(p) === "critico").length;
	const bajos = productos.filter((p) => nivel(p) === "bajo").length;
	const valor = productos.reduce((a, p) => a + p.stock * p.costPerUnit, 0);
	const perdida = mermas.reduce((a, m) => a + m.cost, 0);

	const filtrados = useMemo(() => {
		const q = busqueda.trim().toLowerCase();
		return productos.filter((p) => {
			if (q && ![p.name, p.sku, p.supplier].join(" ").toLowerCase().includes(q)) return false;
			if (categoria !== "todas" && p.category !== categoria) return false;
			if (estado === "activos") return p.active;
			if (estado === "inactivos") return !p.active;
			if (estado === "bajos") return nivel(p) === "bajo" || nivel(p) === "critico";
			return true;
		});
	}, [productos, busqueda, categoria, estado]);

	const columnasProductos: ColumnaTabla<Product>[] = [
		{
			clave: "producto",
			titulo: "Producto",
			principal: true,
			celda: (p) => (
				<span className="flex flex-col">
					<span>{p.name}</span>
					{p.sku && <span className="text-(length:--texto-pequeno) font-normal text-texto-secundario numeros-tabulares">{p.sku}</span>}
				</span>
			),
		},
		{ clave: "categoria", titulo: "Categoría", celda: (p) => CATEGORIAS[p.category] ?? "Otra" },
		{ clave: "existencias", titulo: "Existencias", numerica: true, celda: (p) => <span className="whitespace-nowrap">{`${cantidad.format(p.stock)} ${p.unit}`}</span> },
		{
			clave: "nivel",
			titulo: "Nivel",
			celda: (p) => (
				<span className="flex flex-col items-start gap-1.5">
					<Insignia tono={NIVELES[nivel(p)].tono}>{NIVELES[nivel(p)].texto}</Insignia>
					<BarraNivel p={p} />
					<span className="text-(length:--texto-pequeno) text-texto-secundario whitespace-nowrap">{`Mín. ${cantidad.format(p.minStock)} · máx. ${cantidad.format(p.maxStock)}`}</span>
				</span>
			),
		},
		{ clave: "costo", titulo: "Costo", numerica: true, celda: (p) => <span className="whitespace-nowrap">{`${importe(p.costPerUnit)} / ${p.unit}`}</span> },
		{ clave: "proveedor", titulo: "Proveedor", celda: (p) => p.supplier || "—" },
		{ clave: "estado", titulo: "Estado", celda: (p) => (p.active ? <Insignia tono="neutro">Activo</Insignia> : <Insignia tono="neutro" icono={null}>Inactivo</Insignia>) },
	];

	const columnasMermas: ColumnaTabla<Merma>[] = [
		{ clave: "producto", titulo: "Producto", principal: true, celda: (m) => m.productName },
		{ clave: "cantidad", titulo: "Cantidad", numerica: true, celda: (m) => <span className="whitespace-nowrap">{`${cantidad.format(m.quantity)} ${m.unit}`}</span> },
		{ clave: "motivo", titulo: "Motivo", celda: (m) => MOTIVOS_MERMA[m.reason] ?? m.reason },
		{ clave: "que", titulo: "Qué pasó", celda: (m) => m.justification },
		{ clave: "reporta", titulo: "Reportado por", celda: (m) => m.reportedBy || "—" },
		{ clave: "fecha", titulo: "Fecha", celda: (m) => <span className="whitespace-nowrap">{formatearDia(m.date)}</span> },
		{ clave: "perdida", titulo: "Pérdida", numerica: true, celda: (m) => importe(Number(m.cost)) },
	];

	const guardarMerma = (m: Merma) => operar(() => saveMerma(m), "Merma registrada", "No se pudo registrar la merma", "merma");
	const botonMerma = (
		<DialogoMerma
			productos={productos}
			alGuardar={guardarMerma}
			disparador={
				<Boton variante="secundario" icono={<TrendingDown />}>
					Registrar merma
				</Boton>
			}
		/>
	);

	const errorCarga = error ? <EstadoError titulo="No pudimos traer el inventario" descripcion="Vuelve a intentarlo en un momento." alReintentar={recargar} /> : undefined;
	const indicador = { estado: loading ? ("cargando" as const) : error ? ("error" as const) : ("listo" as const), alReintentar: recargar };

	const vistaProductos = (
		<BloquePanel
			titulo="Productos"
			acciones={
				<div className="flex w-full flex-wrap items-end gap-3 sm:w-auto">
					<Buscador etiqueta="Buscar por nombre, SKU o proveedor" valor={busqueda} alCambiar={setBusqueda} marcador="Nombre, SKU o proveedor" />
					<Selector etiqueta="Categoría" opciones={[{ valor: "todas", texto: "Todas" }, ...Object.entries(CATEGORIAS).map(([valor, texto]) => ({ valor, texto }))]} value={categoria} onChange={(e) => setCategoria(e.target.value)} />
					<Selector etiqueta="Mostrar" opciones={ESTADOS_FILTRO} value={estado} onChange={(e) => setEstado(e.target.value)} />
				</div>
			}
		>
			<Tabla
				leyenda="Productos del inventario"
				tablaDesde="xl"
				columnas={columnasProductos}
				filas={filtrados}
				claveFila={(p) => p.id}
				estado={loading ? "cargando" : "listo"}
				error={errorCarga}
				tituloAcciones="Acciones"
				acciones={(p) => (
					<>
						<DialogoAjuste
							producto={p}
							alGuardar={(id, existencias) => operar(() => adjustStock(id, existencias), "Existencias ajustadas", "No se pudo ajustar", "ajustar")}
							disparador={
								<Boton variante="secundario" tamano="compacto" soloIcono icono={<Layers />}>
									{`Ajustar las existencias de ${p.name}`}
								</Boton>
							}
						/>
						<DialogoProducto
							producto={p}
							alGuardar={(datos) => operar(() => saveProduct(datos), "Producto guardado", "No se pudo guardar el producto", "guardar")}
							disparador={
								<Boton variante="secundario" tamano="compacto" soloIcono icono={<Pencil />}>
									{`Editar ${p.name}`}
								</Boton>
							}
						/>
						<Boton variante="secundario" tamano="compacto" soloIcono icono={<Trash2 />} onClick={() => eliminar(p)}>
							{`Eliminar ${p.name}`}
						</Boton>
					</>
				)}
				vacio={<EstadoVacio icono={<Package />} titulo="No hay productos con esos datos" descripcion="Prueba con otra búsqueda o quita los filtros." />}
			/>
		</BloquePanel>
	);

	const vistaMermas = (
		<BloquePanel titulo="Mermas" descripcion={loading || error ? undefined : `Pérdida acumulada: ${importe(perdida)}.`} acciones={botonMerma}>
			<Tabla
				leyenda="Mermas registradas"
				tablaDesde="xl"
				columnas={columnasMermas}
				filas={mermas}
				claveFila={(m) => m.id}
				estado={loading ? "cargando" : "listo"}
				error={errorCarga}
				vacio={<EstadoVacio icono={<Archive />} titulo="Sin mermas registradas" descripcion="Cuando se pierda producto, regístralo aquí." />}
			/>
		</BloquePanel>
	);

	return (
		<div className="mx-auto flex w-full max-w-(--ancho-amplio) flex-col gap-(--espacio-xl) px-(--margen-pagina) py-(--espacio-xl) lg:py-(--espacio-2xl)">
			<EncabezadoPagina
				antetitulo="Inventario"
				titulo="Productos y existencias"
				descripcion="Lo que hay en bodega, su nivel y las mermas."
				acciones={
					<>
						<BotonEnlace href="/dashboard/admin/inventory/suppliers" variante="secundario" icono={<Truck />}>
							Proveedores
						</BotonEnlace>
						{botonMerma}
						<DialogoProducto
							alGuardar={(datos) => operar(() => saveProduct(datos), "Producto añadido", "No se pudo añadir el producto", "añadir")}
							disparador={<Boton icono={<Plus />}>Producto nuevo</Boton>}
						/>
					</>
				}
			/>

			<div className={REJILLA_INDICADORES}>
				<Indicador {...indicador} rotulo="Valor en bodega" valor={importe(valor)} detalle="Existencias por su costo" className={INDICADOR_PROTAGONISTA} />
				<Indicador {...indicador} rotulo="Productos" valor={entero.format(productos.length)} detalle={`${entero.format(productos.filter((p) => p.active).length)} activos`} />
				<Indicador {...indicador} rotulo="En nivel crítico" valor={entero.format(criticos)} detalle={`${entero.format(bajos)} en nivel bajo`} />
				<Indicador {...indicador} rotulo="Pérdida por mermas" valor={importe(perdida)} detalle={contar(mermas.length, "registro")} />
			</div>

			{!loading && !error && criticos + bajos > 0 && (
				<Aviso
					tono={criticos > 0 ? "error" : "aviso"}
					rol={null}
					titulo={criticos > 0 ? `${criticos} ${criticos === 1 ? "producto está" : "productos están"} en nivel crítico.` : `${bajos} ${bajos === 1 ? "producto está" : "productos están"} en nivel bajo.`}
					accion={
						<div className="flex flex-wrap gap-2">
							<Boton variante="secundario" tamano="compacto" onClick={() => setEstado("bajos")}>
								Ver solo esos
							</Boton>
							<BotonEnlace href="/dashboard/admin/inventory/suppliers" variante="fantasma" tamano="compacto">
								Ver proveedores
							</BotonEnlace>
						</div>
					}
				>
					{criticos > 0 && bajos > 0 ? `Y ${bajos} en nivel bajo. Conviene reabastecer.` : "Conviene reabastecer."}
				</Aviso>
			)}

			<Pestanas
				etiqueta="Secciones del inventario"
				parametroUrl="vista"
				valorInicial={vistaInicial === "mermas" ? "mermas" : "productos"}
				pestanas={[
					{ valor: "productos", titulo: "Productos", contador: { valor: productos.length, descripcion: "productos" }, contenido: vistaProductos },
					{ valor: "mermas", titulo: "Mermas", contador: { valor: mermas.length, descripcion: "mermas" }, contenido: vistaMermas },
				]}
			/>
			{dialogo}
		</div>
	);
}
