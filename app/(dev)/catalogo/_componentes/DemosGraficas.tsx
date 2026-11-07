"use client";

import { useState } from "react";
import { GraficaBarras, GraficaDonut, GraficaLinea, Indicador } from "@/components/ui";
import { Muestra } from "./Muestra";

const esperar = (ms: number) => new Promise((resolver) => window.setTimeout(resolver, ms));
const pesos = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 });
const enPesos = (n: number) => `$ ${pesos.format(n)}`;

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const SEMANAS = ["1 sep", "8 sep", "15 sep", "22 sep", "29 sep", "6 oct", "13 oct", "20 oct", "27 oct", "3 nov", "10 nov", "17 nov"];

function Rotulo({ children }: { children: string }) {
	return <code className="text-(length:--texto-pequeno) text-texto-tenue">{children}</code>;
}

function IndicadorConReintento() {
	const [estado, setEstado] = useState<"error" | "listo">("error");
	return (
		<Indicador
			data-prueba="indicador-reintento"
			rotulo="Ticket medio"
			estado={estado}
			valor="$ 412"
			comparacion={{ cambio: 0.034, referencia: "frente a octubre" }}
			alReintentar={async () => {
				await esperar(900);
				setEstado("listo");
			}}
		/>
	);
}

/** Contenido de la sección «Indicadores y gráficas» del catálogo. */
export function DemosGraficas() {
	return (
		<div className="flex flex-col gap-10">
			<div className="flex flex-col gap-4">
				<h3 className="m-0 text-(length:--texto-titulo-interfaz) font-semibold">Indicador</h3>
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<Muestra ancho>
						<Indicador
							rotulo="Ventas de hoy"
							valor="$ 18 420"
							comparacion={{ cambio: 0.08, referencia: "frente al martes pasado" }}
							detalle="Hasta las 21:40 h · caja y en línea"
						/>
					</Muestra>
					<Muestra ancho>
						<Indicador
							rotulo="Cancelaciones"
							valor="6"
							comparacion={{ cambio: 0.5, referencia: "frente a la semana pasada", mejorSiSube: false }}
						/>
					</Muestra>
					<Muestra ancho>
						<Indicador rotulo="Mesas ocupadas" valor="14 de 22" comparacion={{ cambio: 0, referencia: "igual que ayer a esta hora" }} />
					</Muestra>
					<Muestra ancho>
						<Indicador rotulo="Reservas del mes" valor="148" detalle="Sin comparación: es el primer mes con datos" />
					</Muestra>
					<Muestra ancho>
						<Indicador
							rotulo="Propinas"
							valor="$ 2 310"
							comparacion={{ cambio: -0.12, referencia: "frente a ayer" }}
						/>
					</Muestra>
					<Muestra ancho>
						<Indicador rotulo="Pedidos en línea" estado="cargando" />
					</Muestra>
					<Muestra ancho>
						<IndicadorConReintento />
					</Muestra>
				</div>
			</div>

			<div className="flex flex-col gap-4">
				<h3 className="m-0 text-(length:--texto-titulo-interfaz) font-semibold">Gráficas</h3>
				<p className="m-0 max-w-(--ancho-lectura) text-(length:--texto-pequeno) text-texto-secundario">
					Paleta en orden fijo, leyenda a partir de dos series, tooltip con el puntero o con las flechas tras enfocar la gráfica, y
					«Ver tabla» con los mismos datos. Los textos usan los colores de texto, nunca el de la serie.
				</p>
				<div className="grid gap-6 xl:grid-cols-2">
					<div className="flex flex-col gap-2" data-prueba="grafica-barras">
						<Rotulo>barras · 1 serie</Rotulo>
						<Muestra ancho>
							<GraficaBarras
								titulo="Ventas por día"
								descripcion="Semana del 27 de octubre, en pesos."
								categorias={DIAS}
								series={[{ clave: "ventas", nombre: "Ventas", valores: [12_400, 9_800, 11_200, 13_900, 21_300, 26_800, 19_400] }]}
								formatoValor={enPesos}
								tituloCategoria="Día"
							/>
						</Muestra>
					</div>
					<div className="flex flex-col gap-2" data-prueba="grafica-barras-series">
						<Rotulo>barras · 4 series agrupadas</Rotulo>
						<Muestra ancho>
							<GraficaBarras
								titulo="Pedidos por canal"
								descripcion="Pedidos por día y canal."
								categorias={DIAS}
								series={[
									{ clave: "mesa", nombre: "En mesa", valores: [42, 38, 45, 51, 74, 92, 80] },
									{ clave: "domicilio", nombre: "A domicilio", valores: [18, 15, 17, 22, 35, 41, 37] },
									{ clave: "llevar", nombre: "Para llevar", valores: [12, 10, 14, 13, 19, 24, 21] },
									{ clave: "eventos", nombre: "Eventos", valores: [0, 0, 4, 0, 8, 12, 6] },
								]}
								tituloCategoria="Día"
							/>
						</Muestra>
					</div>
					<div className="flex flex-col gap-2" data-prueba="grafica-linea">
						<Rotulo>línea · 1 serie, con velo</Rotulo>
						<Muestra ancho>
							<GraficaLinea
								titulo="Ticket medio por semana"
								categorias={SEMANAS}
								series={[{ clave: "ticket", nombre: "Ticket medio", valores: [356, 362, 349, 371, 388, 380, 392, 401, 398, 405, 412, 409] }]}
								formatoValor={enPesos}
								tituloCategoria="Semana"
							/>
						</Muestra>
					</div>
					<div className="flex flex-col gap-2" data-prueba="grafica-linea-series">
						<Rotulo>línea · 3 series</Rotulo>
						<Muestra ancho>
							<GraficaLinea
								titulo="Reservas por zona"
								categorias={SEMANAS}
								series={[
									{ clave: "salon", nombre: "Salón", valores: [64, 70, 66, 72, 80, 78, 85, 88, 84, 90, 96, 94] },
									{ clave: "terraza", nombre: "Terraza", valores: [40, 44, 47, 52, 49, 46, 41, 38, 36, 33, 30, 31] },
									{ clave: "privado", nombre: "Privado", valores: [8, 6, 10, 9, 12, 11, 14, 12, 15, 18, 16, 20] },
								]}
								tituloCategoria="Semana"
							/>
						</Muestra>
					</div>
					<div className="flex flex-col gap-2" data-prueba="grafica-donut">
						<Rotulo>donut · 6 partes: de la 5.ª en adelante van en «Otros»</Rotulo>
						<Muestra ancho>
							<GraficaDonut
								titulo="Ventas por categoría"
								descripcion="Octubre, en pesos."
								porciones={[
									{ nombre: "Platos fuertes", valor: 184_200 },
									{ nombre: "Bebidas", valor: 96_400 },
									{ nombre: "Entradas", valor: 51_800 },
									{ nombre: "Postres", valor: 22_100 },
									{ nombre: "Café", valor: 9_300 },
									{ nombre: "Pan", valor: 4_200 },
								]}
								formatoValor={enPesos}
								tituloCategoria="Categoría"
							/>
						</Muestra>
					</div>
					<div className="flex flex-col gap-2">
						<Rotulo>cargando · error · vacía</Rotulo>
						<div className="flex flex-col gap-4">
							<GraficaBarras titulo="Ventas por hora" estado="cargando" categorias={[]} series={[]} />
							<GraficaLinea titulo="Clientes nuevos" estado="error" alReintentar={() => undefined} categorias={[]} series={[]} />
							<GraficaBarras titulo="Mermas por insumo" categorias={[]} series={[]} textoVacio="No hay mermas registradas este mes." />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
