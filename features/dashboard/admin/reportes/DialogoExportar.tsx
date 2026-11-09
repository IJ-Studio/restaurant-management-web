"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { Campo, Selector } from "@/components/ui/Campo";
import { Dialogo } from "@/components/ui/Dialogo";
import { registrarError } from "@/lib/registro/registrar-error";

/**
 * Exportar un informe (PLAN 5.3). Sustituye a `components/admin/ExportModal`: la misma petición
 * (`GET ${API}/export?type&format&startDate&endDate&limit`, sin cabeceras) y la misma descarga
 * del archivo que devuelve el API; cambia la forma (`Dialogo`, campos del catálogo) y el error, que ya
 * no muestra el texto crudo de la respuesta (D-20).
 */
const API = process.env.NEXT_PUBLIC_API_URL ?? "";

type Informe = "dishes" | "daily";
type Formato = "csv" | "xlsx" | "pdf";

const INFORMES: { valor: Informe; texto: string; ayuda: string }[] = [
	{ valor: "dishes", texto: "Ventas por plato", ayuda: "Platos ordenados por unidades vendidas, con sus ingresos." },
	{ valor: "daily", texto: "Ventas por día", ayuda: "Pedidos, ventas y ticket medio de cada día." },
];
const FORMATOS: { valor: Formato; texto: string }[] = [
	{ valor: "xlsx", texto: "Excel (.xlsx)" },
	{ valor: "csv", texto: "CSV (.csv)" },
	{ valor: "pdf", texto: "PDF (.pdf)" },
];

const isoDia = (d: Date) => d.toISOString().slice(0, 10);
function haceDias(n: number) {
	const d = new Date();
	d.setDate(d.getDate() - n);
	return isoDia(d);
}

export function DialogoExportar() {
	const [abierto, setAbierto] = useState(false);
	const [informe, setInforme] = useState<Informe>("dishes");
	const [formato, setFormato] = useState<Formato>("xlsx");
	const [desde, setDesde] = useState(() => haceDias(30));
	const [hasta, setHasta] = useState(() => isoDia(new Date()));
	const [limite, setLimite] = useState("50");
	const [enviando, setEnviando] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fechasMal = desde > hasta;

	async function exportar() {
		if (fechasMal) return;
		setError(null);
		setEnviando(true);
		try {
			const params = new URLSearchParams({ type: informe, format: formato, startDate: desde, endDate: hasta });
			if (limite) params.set("limit", limite);
			const res = await fetch(`${API}/export?${params}`, { cache: "no-store" });
			if (!res.ok) throw new Error(`export respondió ${res.status}`);
			const blob = await res.blob();
			const nombre = (res.headers.get("Content-Disposition") ?? "").match(/filename="(.+?)"/)?.[1] ?? `reporte.${formato}`;
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = nombre;
			a.click();
			URL.revokeObjectURL(url);
			setAbierto(false);
		} catch (e) {
			registrarError(e, "reportes: exportar");
			setError("No pudimos preparar el archivo. Revisa las fechas y vuelve a intentarlo.");
		} finally {
			setEnviando(false);
		}
	}

	return (
		<Dialogo
			abierto={abierto}
			alCambiarAbierto={(a) => {
				setAbierto(a);
				if (!a) setError(null);
			}}
			cerrable={!enviando}
			disparador={
				<Boton variante="secundario" icono={<Download />}>
					Exportar
				</Boton>
			}
			titulo="Exportar un informe"
			descripcion="Se descarga un archivo con los datos del periodo que elijas."
			pie={
				<>
					<Boton variante="secundario" onClick={() => setAbierto(false)} deshabilitado={enviando}>
						Cancelar
					</Boton>
					<Boton icono={<Download />} onClick={() => void exportar()} cargando={enviando} textoCargando="Preparando el archivo…">
						Descargar
					</Boton>
				</>
			}
		>
			<div className="flex flex-col gap-(--espacio-md)">
				<Selector
					etiqueta="Informe"
					opciones={INFORMES}
					value={informe}
					onChange={(e) => setInforme(e.target.value as Informe)}
					ayuda={INFORMES.find((i) => i.valor === informe)?.ayuda}
				/>
				<Selector etiqueta="Formato" opciones={FORMATOS} value={formato} onChange={(e) => setFormato(e.target.value as Formato)} />
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2">
					<Campo etiqueta="Desde" type="date" value={desde} max={hasta} onChange={(e) => setDesde(e.target.value)} />
					<Campo
						etiqueta="Hasta"
						type="date"
						value={hasta}
						min={desde}
						onChange={(e) => setHasta(e.target.value)}
						error={fechasMal ? "Tiene que ser igual o posterior a «Desde»." : null}
					/>
				</div>
				{informe === "dishes" && (
					<Campo
						etiqueta="Cuántos platos"
						type="number"
						inputMode="numeric"
						min={1}
						value={limite}
						onChange={(e) => setLimite(e.target.value)}
						opcional
						ayuda="Vacío para incluirlos todos."
					/>
				)}
				{error && (
					<Aviso tono="error" titulo="No se descargó el informe.">
						{error}
					</Aviso>
				)}
			</div>
		</Dialogo>
	);
}
