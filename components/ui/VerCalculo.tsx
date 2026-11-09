"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Boton } from "@/components/ui/Boton";
import { Dialogo } from "@/components/ui/Dialogo";

/**
 * Desglose de un resultado tal como lo devuelve el API (o armado en el cliente con las mismas filas
 * que dieron la cifra): la fórmula, la operación y cada dato que se usó. `suma` (por defecto): el
 * resultado es la suma de los valores; `conteo`: el número de datos; `cociente`: el primero entre el segundo.
 */
export interface Calculo {
	formula: string;
	operacion?: "suma" | "conteo" | "cociente";
	datos: { clave: string; valor: number | string; origen?: string }[];
	periodo?: { inicio: string; fin: string };
	filtros?: Record<string, string | number | boolean | null>;
}

/**
 * «Ver cálculo» (Prioridad 1.4 de la tanda): muestra la fórmula, el periodo, los filtros y cada
 * dato con su clave y su valor. Lo que se muestra sale de los mismos datos que produjeron el
 * resultado (los devuelve el API junto con él), así que siempre coincide.
 */
export function VerCalculo({ titulo, resultado, valor, calculo }: { titulo: string; resultado: string; /** El resultado como número, para comprobarlo. */ valor?: number; calculo: Calculo }) {
	const [abierto, setAbierto] = useState(false);
	return (
		<Dialogo
			abierto={abierto}
			alCambiarAbierto={setAbierto}
			disparador={
				<Boton variante="fantasma" tamano="compacto" icono={<Calculator />} aria-label={`Ver cálculo de ${titulo}`}>
					Ver cálculo
				</Boton>
			}
			titulo={`Cálculo: ${titulo}`}
			descripcion={calculo.formula}
		>
			<div className="flex flex-col gap-(--espacio-md)" data-calculo data-operacion={calculo.operacion ?? "suma"}>
				{calculo.datos.length === 0 && <p className="m-0 text-texto-secundario">Sin datos en este periodo.</p>}
				{calculo.periodo && (
					<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">
						Periodo: <span className="cifras-consola">{calculo.periodo.inicio}</span> a <span className="cifras-consola">{calculo.periodo.fin}</span>
					</p>
				)}
				{calculo.filtros && Object.keys(calculo.filtros).length > 0 && (
					<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">
						Filtros: {Object.entries(calculo.filtros).map(([k, v]) => `${k} = ${String(v)}`).join(" · ")}
					</p>
				)}
				<table className="w-full border-collapse text-(length:--texto-pequeno)">
					<caption className="solo-lectores">Datos usados en el cálculo</caption>
					<thead>
						<tr className="text-start text-texto-secundario">
							<th scope="col" className="py-1 text-start font-medium">Clave</th>
							<th scope="col" className="py-1 text-end font-medium">Valor</th>
						</tr>
					</thead>
					<tbody>
						{calculo.datos.map((d, i) => (
							<tr key={`${i}-${d.clave}`} className="border-t border-borde-sutil" data-clave={d.clave} data-valor={d.valor}>
								<th scope="row" className="py-1 text-start font-normal">
									<span className="cifras-consola">{d.clave}</span>
									{d.origen && <span className="block text-texto-tenue">{d.origen}</span>}
								</th>
								<td className="py-1 text-end cifras-consola">{String(d.valor)}</td>
							</tr>
						))}
					</tbody>
					<tfoot>
						<tr className="border-t-2 border-borde-control">
							<th scope="row" className="py-1 text-start">Resultado</th>
							<td className="py-1 text-end font-semibold cifras-consola" data-resultado data-resultado-valor={valor}>
								{resultado}
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</Dialogo>
	);
}
