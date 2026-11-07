"use client";

import { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { Buscador } from "@/components/ui/Buscador";
import { Selector } from "@/components/ui/Campo";
import { Casilla } from "@/components/ui/Casilla";
import { Dialogo } from "@/components/ui/Dialogo";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Insignia, type TonoInsignia } from "@/components/ui/Insignia";
import { contar } from "@/lib/formato/plural";
import { registrarError } from "@/lib/registro/registrar-error";
import { calcularDiferencias, subirImportacion, type Fila, type TipoDiferencia } from "./importacion";

/**
 * Vista previa de una importación (PLAN 5.9). Sustituye a `ImportPreviewModal` (86 hex, estilos en
 * línea y `text-[Npx]`): las mismas diferencias por nombre, la misma selección (los iguales empiezan
 * sin marcar) y la misma subida. Cada fila es una casilla con su nombre y sus cambios «antes → después».
 */

const TIPOS: Record<TipoDiferencia, { texto: string; tono: TonoInsignia }> = {
	nuevo: { texto: "Nuevo", tono: "exito" },
	modificado: { texto: "Cambia", tono: "aviso" },
	igual: { texto: "Sin cambios", tono: "neutro" },
};

export function DialogoImportacion({
	archivo,
	filas,
	filasBd,
	api,
	alCerrar,
	alTerminar,
}: {
	archivo: File;
	filas: Fila[];
	filasBd: Fila[];
	api: string;
	alCerrar: () => void;
	alTerminar: (r: { inserted: number; updated: number }) => void;
}) {
	const diferencias = useMemo(() => calcularDiferencias(filas, filasBd), [filas, filasBd]);
	const [elegidas, setElegidas] = useState(() => new Set(diferencias.filter((d) => d.tipo !== "igual").map((d) => d.indice)));
	const [busqueda, setBusqueda] = useState("");
	const [tipo, setTipo] = useState<"todos" | TipoDiferencia>("todos");
	const [subiendo, setSubiendo] = useState(false);
	const [error, setError] = useState(false);

	const cuenta = (t: TipoDiferencia) => diferencias.filter((d) => d.tipo === t).length;
	const visibles = diferencias.filter((d) => {
		if (tipo !== "todos" && d.tipo !== tipo) return false;
		const q = busqueda.trim().toLowerCase();
		return !q || d.nombre.toLowerCase().includes(q) || d.categoria.toLowerCase().includes(q);
	});

	async function importar() {
		const seleccion = diferencias.filter((d) => elegidas.has(d.indice)).map((d) => d.fila);
		if (!seleccion.length) return;
		setError(false);
		setSubiendo(true);
		try {
			alTerminar(await subirImportacion(archivo, seleccion, api));
		} catch (e) {
			registrarError(e, "carta: importar");
			setError(true);
		} finally {
			setSubiendo(false);
		}
	}

	const alternar = (indice: number) =>
		setElegidas((s) => {
			const n = new Set(s);
			if (n.has(indice)) n.delete(indice);
			else n.add(indice);
			return n;
		});

	return (
		<Dialogo
			ancho="amplio"
			abierto
			alCambiarAbierto={(a) => !a && alCerrar()}
			cerrable={!subiendo}
			titulo="Revisar la importación"
			descripcion={`${archivo.name}: ${contar(cuenta("nuevo"), "platillo nuevo", "platillos nuevos")}, ${contar(cuenta("modificado"), "con cambios", "con cambios")} y ${contar(cuenta("igual"), "sin cambios", "sin cambios")}.`}
			pie={
				<>
					<Boton variante="secundario" deshabilitado={subiendo} onClick={alCerrar}>
						Cancelar
					</Boton>
					<Boton icono={<Upload />} deshabilitado={elegidas.size === 0} cargando={subiendo} textoCargando="Importando…" onClick={importar}>
						{elegidas.size === 0 ? "Elige al menos uno" : `Importar ${contar(elegidas.size, "platillo")}`}
					</Boton>
				</>
			}
		>
			<div className="flex flex-col gap-(--espacio-md)">
				{error && (
					<Aviso tono="error" titulo="No se completó la importación.">
						Revisa que el archivo siga la plantilla y vuelve a intentarlo.
					</Aviso>
				)}
				<div className="flex flex-wrap items-end gap-3">
					<Buscador etiqueta="Buscar por nombre o categoría" valor={busqueda} alCambiar={setBusqueda} marcador="Nombre o categoría" />
					<Selector
						etiqueta="Mostrar"
						opciones={[
							{ valor: "todos", texto: "Todos" },
							{ valor: "nuevo", texto: "Nuevos" },
							{ valor: "modificado", texto: "Con cambios" },
							{ valor: "igual", texto: "Sin cambios" },
						]}
						value={tipo}
						onChange={(e) => setTipo(e.target.value as typeof tipo)}
					/>
				</div>
				<div className="flex flex-wrap gap-2">
					<Boton variante="fantasma" tamano="compacto" onClick={() => setElegidas(new Set(diferencias.map((d) => d.indice)))}>
						Marcar todos
					</Boton>
					<Boton variante="fantasma" tamano="compacto" onClick={() => setElegidas(new Set())}>
						Desmarcar todos
					</Boton>
				</div>
				{visibles.length === 0 ? (
					<EstadoVacio titulo="Nada que mostrar" descripcion="Prueba con otra búsqueda o con otro filtro." />
				) : (
					<ul className="m-0 flex list-none flex-col p-0" aria-label="Platillos del archivo">
						{visibles.map((d) => {
							const cambios = d.campos.filter((c) => c.cambia && c.campo !== "nombre");
							return (
								<li key={d.indice} className="flex flex-col gap-2 border-b border-borde-sutil py-(--espacio-sm) last:border-b-0">
									<div className="flex flex-wrap items-center justify-between gap-2">
										<Casilla etiqueta={d.nombre} checked={elegidas.has(d.indice)} onChange={() => alternar(d.indice)} />
										<Insignia tono={TIPOS[d.tipo].tono}>{TIPOS[d.tipo].texto}</Insignia>
									</div>
									{d.tipo === "modificado" && cambios.length > 0 && (
										<dl className="m-0 grid grid-cols-[fit-content(40%)_minmax(0,1fr)] gap-x-4 gap-y-1 ps-8 text-(length:--texto-pequeno)">
											{cambios.map((c) => (
												<div key={c.campo} className="contents">
													<dt className="text-texto-secundario">{c.rotulo}</dt>
													<dd className="m-0 text-texto-principal [overflow-wrap:anywhere]">
														<span className="text-texto-secundario line-through">{c.antes}</span>
														<span className="solo-lectores"> pasa a </span>
														<span aria-hidden="true"> → </span>
														{c.despues}
													</dd>
												</div>
											))}
										</dl>
									)}
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</Dialogo>
	);
}
