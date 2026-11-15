"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { Dialogo } from "@/components/ui/Dialogo";
import { Insignia, type TonoInsignia } from "@/components/ui/Insignia";
import { contar } from "@/lib/formato/plural";
import { formatearImporte } from "@/lib/formato/precio";
import { enviarImportacion, type ModoImportacion, type PlanImportacion, type Problema } from "./importacion";

/**
 * Vista previa de la importación de la carta (Fase 4.2). El API ya comparó el archivo con la carta:
 * aquí se muestra qué entra, qué cambia, qué queda deshabilitado (al reemplazar) y los problemas.
 * Con errores solo se ofrece «Importar de todas formas», que omite esas filas; si faltan columnas
 * obligatorias no se puede importar.
 */

const filaDe = (p: Problema) => (p.fila === null ? p.mensaje : `Fila ${p.fila}: ${p.mensaje}`);

function Lista({ titulo, tono, elementos }: { titulo: string; tono: TonoInsignia; elementos: { clave: string; texto: string; detalle?: string }[] }) {
	if (!elementos.length) return null;
	return (
		<section aria-label={titulo} className="flex flex-col gap-2">
			<h3 className="m-0 flex items-center gap-2 text-(length:--texto-base) font-semibold">
				{titulo} <Insignia tono={tono}>{elementos.length}</Insignia>
			</h3>
			<ul className="m-0 flex list-none flex-col p-0">
				{elementos.map((e) => (
					<li key={e.clave} className="flex flex-wrap justify-between gap-2 border-b border-borde-sutil py-1 last:border-b-0">
						<span className="[overflow-wrap:anywhere]">{e.texto}</span>
						{e.detalle && <span className="text-texto-secundario">{e.detalle}</span>}
					</li>
				))}
			</ul>
		</section>
	);
}

export function DialogoImportacion({
	archivo,
	modo,
	plan,
	api,
	alCerrar,
	alTerminar,
}: {
	archivo: File;
	modo: ModoImportacion;
	plan: PlanImportacion;
	api: string;
	alCerrar: () => void;
	alTerminar: (plan: PlanImportacion) => void;
}) {
	const [subiendo, setSubiendo] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const faltanColumnas = plan.errores.some((e) => e.fila === null);
	const conErrores = plan.errores.length > 0;
	const cambios = plan.nuevos.length + plan.actualizados.length + plan.deshabilitar.length;
	const platillo = (f: PlanImportacion["nuevos"][number]) => ({ clave: `f${f.fila}`, texto: f.nombre, detalle: `${f.categoria} · ${formatearImporte(f.precio) ?? "—"}` });

	async function importar() {
		setError(null);
		setSubiendo(true);
		const r = await enviarImportacion(api, archivo, modo, { confirmar: true, forzar: conErrores });
		setSubiendo(false);
		if ("error" in r) setError(r.error);
		else alTerminar(r.plan);
	}

	return (
		<Dialogo
			ancho="amplio"
			abierto
			alCambiarAbierto={(a) => !a && alCerrar()}
			cerrable={!subiendo}
			titulo="Revisar la importación"
			descripcion={`${archivo.name} (${modo === "reemplazar" ? "reemplazar la carta" : "agregar a la carta"}): ${contar(plan.nuevos.length, "platillo nuevo", "platillos nuevos")}, ${contar(plan.actualizados.length, "actualizado", "actualizados")} y ${contar(plan.deshabilitar.length, "a deshabilitar", "a deshabilitar")}.`}
			pie={
				<>
					<Boton variante="secundario" deshabilitado={subiendo} onClick={alCerrar}>
						Cancelar
					</Boton>
					<Boton icono={<Upload />} deshabilitado={faltanColumnas || cambios === 0} cargando={subiendo} textoCargando="Importando…" onClick={importar}>
						{conErrores ? "Importar de todas formas" : "Importar"}
					</Boton>
				</>
			}
		>
			<div className="flex flex-col gap-(--espacio-md)">
				{error && (
					<Aviso tono="error" titulo="No se completó la importación.">
						{error}
					</Aviso>
				)}
				{faltanColumnas ? (
					<Aviso tono="error" titulo="El archivo no sigue la plantilla.">
						{plan.errores.filter((e) => e.fila === null).map(filaDe).join(" ")} Descarga la plantilla y vuelve a intentarlo.
					</Aviso>
				) : (
					conErrores && (
						<Aviso tono="aviso" titulo={`${contar(plan.errores.length, "fila tiene errores", "filas tienen errores")} y no se importará.`}>
							Corrige el archivo o usa «Importar de todas formas» para guardar solo las filas válidas.
						</Aviso>
					)
				)}
				{!faltanColumnas && cambios === 0 && <Aviso titulo="No hay nada que importar.">El archivo no trae platillos válidos.</Aviso>}
				<Lista titulo="Errores" tono="error" elementos={plan.errores.map((p, i) => ({ clave: `e${i}`, texto: filaDe(p) }))} />
				<Lista titulo="Avisos" tono="aviso" elementos={plan.avisos.map((p, i) => ({ clave: `a${i}`, texto: filaDe(p) }))} />
				<Lista titulo="Platillos nuevos" tono="exito" elementos={plan.nuevos.map(platillo)} />
				<Lista titulo="Platillos actualizados" tono="info" elementos={plan.actualizados.map(platillo)} />
				<Lista
					titulo="Quedarán deshabilitados (no se borran)"
					tono="neutro"
					elementos={plan.deshabilitar.map((d) => ({ clave: `d${d.id}`, texto: d.nombre }))}
				/>
				<Lista titulo="Categorías nuevas" tono="exito" elementos={plan.categoriasNuevas.map((c) => ({ clave: c, texto: c }))} />
			</div>
		</Dialogo>
	);
}
