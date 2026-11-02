"use client";

import { useState } from "react";
import { CalendarX2, Plus, SearchX } from "lucide-react";
import { Boton, BotonEnlace, Esqueleto, EsqueletoLineas, EstadoError, EstadoVacio, ZonaCargando } from "@/components/ui";
import { Muestra } from "./Muestra";

const esperar = (ms: number) => new Promise((resolver) => window.setTimeout(resolver, ms));

function Rotulo({ children }: { children: string }) {
	return <code className="text-(length:--texto-pequeno) text-texto-tenue">{children}</code>;
}

/** El primer reintento falla y el segundo carga: se ve el botón cargando y el error que vuelve. */
function DemoReintentoEstado() {
	const [intentos, setIntentos] = useState(0);
	const [listo, setListo] = useState(false);
	if (listo)
		return (
			<p className="m-0 rounded-tarjeta border border-borde-sutil p-6" data-prueba="estado-cargado">
				Reservas de la semana: <strong className="numeros-tabulares">148</strong>
			</p>
		);
	return (
		<EstadoError
			data-prueba="estado-error"
			titulo="No se pudieron cargar las reservas"
			descripcion={intentos > 0 ? `Intento ${intentos + 1}. Revisa la conexión e inténtalo de nuevo.` : undefined}
			alReintentar={async () => {
				await esperar(900);
				if (intentos === 0) setIntentos(1);
				else setListo(true);
			}}
		/>
	);
}

function DemoZonaCargando() {
	const [cargando, setCargando] = useState(true);
	return (
		<div className="flex flex-col items-start gap-3">
			<ZonaCargando cargando={cargando} texto="Cargando el menú…" className="w-full" data-prueba="zona-cargando">
				{cargando ? (
					<div className="flex flex-col gap-3 rounded-tarjeta border border-borde-sutil bg-superficie p-6">
						<Esqueleto sobre="superficie" className="h-5 w-1/2" />
						<EsqueletoLineas sobre="superficie" lineas={3} />
					</div>
				) : (
					<div className="flex flex-col gap-2 rounded-tarjeta border border-borde-sutil bg-superficie p-6">
						<p className="m-0 font-semibold">Cabrito al horno</p>
						<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">Asado lento con hierbas de la sierra y papas de cambray.</p>
					</div>
				)}
			</ZonaCargando>
			<Boton variante="secundario" tamano="compacto" onClick={() => setCargando((c) => !c)} data-prueba="alternar-carga">
				{cargando ? "Terminar la carga" : "Volver a cargar"}
			</Boton>
		</div>
	);
}

/** Contenido de la sección «Estados vacío, de carga y de error» del catálogo. */
export function DemosEstados() {
	return (
		<div className="flex flex-col gap-10">
			<div className="flex flex-col gap-4">
				<h3 className="m-0 text-(length:--texto-titulo-interfaz) font-semibold">EstadoVacio</h3>
				<div className="grid gap-6 md:grid-cols-2">
					<div className="flex flex-col gap-2">
						<Rotulo>con acción</Rotulo>
						<Muestra ancho>
							<EstadoVacio
								icono={<CalendarX2 />}
								titulo="Aún no tienes reservas"
								descripcion="Cuando reserves una mesa, la verás aquí con su fecha y su hora."
								accion={
									<BotonEnlace href="#estados" variante="secundario">
										Reservar mesa
									</BotonEnlace>
								}
							/>
						</Muestra>
					</div>
					<div className="flex flex-col gap-2">
						<Rotulo>búsqueda sin resultados</Rotulo>
						<Muestra ancho>
							<EstadoVacio
								icono={<SearchX />}
								titulo="Ningún platillo coincide con «chiles en nogada»"
								descripcion="Prueba con otra palabra o quita los filtros de categoría."
								accion={
									<Boton variante="fantasma" tamano="compacto">
										Quitar filtros
									</Boton>
								}
							/>
						</Muestra>
					</div>
					<div className="flex flex-col gap-2">
						<Rotulo>por defecto, sin acción</Rotulo>
						<Muestra ancho>
							<EstadoVacio titulo="No hay movimientos de caja hoy" />
						</Muestra>
					</div>
					<div className="flex flex-col gap-2">
						<Rotulo>sin marco, dentro de una superficie</Rotulo>
						<div className="rounded-tarjeta border border-borde-sutil bg-superficie">
							<Muestra ancho>
								<EstadoVacio
									sinMarco
									titulo="Sin proveedores"
									descripcion="Da de alta al primero para crear órdenes de compra."
									accion={
										<Boton icono={<Plus />} tamano="compacto">
											Añadir proveedor
										</Boton>
									}
								/>
							</Muestra>
						</div>
					</div>
				</div>
			</div>

			<div className="flex flex-col gap-4">
				<h3 className="m-0 text-(length:--texto-titulo-interfaz) font-semibold">EstadoError</h3>
				<div className="grid gap-6 md:grid-cols-2">
					<div className="flex flex-col gap-2">
						<Rotulo>reintentar: el primero falla, el segundo carga</Rotulo>
						<Muestra ancho>
							<DemoReintentoEstado />
						</Muestra>
					</div>
					<div className="flex flex-col gap-2">
						<Rotulo>con otra salida</Rotulo>
						<Muestra ancho>
							<EstadoError
								titulo="No se pudo cargar la carta"
								alReintentar={() => undefined}
								accion={
									<BotonEnlace href="tel:+527711234567" variante="fantasma">
										Llamar al restaurante
									</BotonEnlace>
								}
							/>
						</Muestra>
					</div>
				</div>
			</div>

			<div className="flex flex-col gap-4">
				<h3 className="m-0 text-(length:--texto-titulo-interfaz) font-semibold">Esqueleto</h3>
				<div className="grid gap-6 md:grid-cols-2">
					<div className="flex flex-col gap-2">
						<Rotulo>sobre el fondo (superficie elevada)</Rotulo>
						<div className="flex flex-col gap-3" data-prueba="esqueleto-fondo">
							<Esqueleto className="h-8 w-2/3" />
							<EsqueletoLineas lineas={4} />
						</div>
					</div>
					<div className="flex flex-col gap-2">
						<Rotulo>ZonaCargando: aria-busy y «Cargando…» para lectores</Rotulo>
						<DemoZonaCargando />
					</div>
				</div>
			</div>
		</div>
	);
}
