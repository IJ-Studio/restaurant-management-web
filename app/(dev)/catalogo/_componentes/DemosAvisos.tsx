"use client";

import { useState } from "react";
import { Aviso, Boton, useNotificaciones, VistaNotificacion } from "@/components/ui";
import type { TonoEstado } from "@/components/ui/Aviso";
import { Muestra } from "./Muestra";

const AVISOS: { tono: TonoEstado; titulo: string; texto: string }[] = [
	{ tono: "info", titulo: "La cocina cierra a las 22:30 h", texto: "Los pedidos a domicilio se aceptan hasta media hora antes." },
	{ tono: "exito", titulo: "Reserva confirmada", texto: "Te enviamos los detalles a ana.lopez@correo.mx." },
	{ tono: "aviso", titulo: "Datos de ejemplo", texto: "Estas cifras no son reales: el API todavía no las expone." },
	{ tono: "error", titulo: "No se pudo guardar el platillo", texto: "Revisa la conexión e inténtalo de nuevo. Lo escrito se conserva." },
];

function Rotulo({ children }: { children: string }) {
	return <code className="text-(length:--texto-pequeno) text-texto-tenue">{children}</code>;
}

function DemoAvisoDescartable() {
	const [visible, setVisible] = useState(true);
	return visible ? (
		<Aviso tono="info" titulo="Nuevo horario de fin de semana" alDescartar={() => setVisible(false)} data-prueba="aviso-descartable">
			Sábados y domingos abrimos de 9:00 a 23:00 h.
		</Aviso>
	) : (
		<Boton variante="secundario" tamano="compacto" onClick={() => setVisible(true)} data-prueba="restaurar-aviso">
			Mostrar de nuevo
		</Boton>
	);
}

function Disparadores() {
	const { notificar } = useNotificaciones();
	const [deshechos, setDeshechos] = useState(0);
	return (
		<div className="flex flex-col items-start gap-3">
			<div className="flex flex-wrap gap-3">
				<Boton
					variante="secundario"
					data-prueba="notificar-exito"
					onClick={() => {
						notificar({ tono: "exito", titulo: "Reserva guardada", descripcion: "Sábado 14, 21:00 h, mesa para 4." });
					}}
				>
					Guardar reserva
				</Boton>
				<Boton
					variante="secundario"
					data-prueba="notificar-accion"
					onClick={() => {
						notificar({
							tono: "info",
							titulo: "Platillo archivado",
							descripcion: "«Mole de olla» ya no aparece en la carta.",
							accion: { texto: "Deshacer", alPulsar: () => setDeshechos((n) => n + 1) },
						});
					}}
				>
					Archivar platillo
				</Boton>
				<Boton
					variante="secundario"
					data-prueba="notificar-error"
					onClick={() => {
						notificar({ tono: "error", titulo: "No se pudo enviar el pedido", descripcion: "Revisa la conexión e inténtalo de nuevo." });
					}}
				>
					Enviar con fallo
				</Boton>
				<Boton
					variante="fantasma"
					data-prueba="notificar-varias"
					onClick={() => {
						for (const n of [1, 2, 3, 4]) notificar({ tono: "info", titulo: `Pedido ${n} recibido`, duracionMs: 30_000 });
					}}
				>
					Cuatro seguidas
				</Boton>
			</div>
			<p role="status" data-prueba="deshechos" className="m-0 text-(length:--texto-pequeno) text-texto-secundario">
				Acciones deshechas: {deshechos}
			</p>
		</div>
	);
}

/** Contenido de la sección «Avisos y notificaciones» del catálogo. */
export function DemosAvisos() {
	return (
		<div className="flex flex-col gap-10">
			<div className="flex flex-col gap-4">
				<h3 className="m-0 text-(length:--texto-titulo-interfaz) font-semibold">Aviso</h3>
				<div className="grid gap-6 md:grid-cols-2">
					{AVISOS.map(({ tono, titulo, texto }) => (
						<div key={tono} className="flex flex-col gap-2">
							<Rotulo>{`${tono} · role=${tono === "error" ? "alert" : "status"}`}</Rotulo>
							<Muestra ancho>
								<Aviso tono={tono} titulo={titulo} rol={null}>
									{texto}
								</Aviso>
							</Muestra>
						</div>
					))}
					<div className="flex flex-col gap-2">
						<Rotulo>sin título, con acción</Rotulo>
						<Muestra ancho>
							<Aviso
								tono="aviso"
								rol={null}
								accion={
									<Boton variante="secundario" tamano="compacto">
										Completar perfil
									</Boton>
								}
							>
								Falta tu teléfono: lo necesitamos para avisarte si cambia tu reserva.
							</Aviso>
						</Muestra>
					</div>
					<div className="flex flex-col gap-2">
						<Rotulo>descartable</Rotulo>
						<DemoAvisoDescartable />
					</div>
					<div className="flex max-w-80 flex-col gap-2">
						<Rotulo>texto largo, columna estrecha</Rotulo>
						<Muestra ancho>
							<Aviso tono="error" titulo="El archivo no es una imagen válida" rol={null}>
								«menu-temporada-otono-2026-version-final-revisada.exe» no es JPEG, PNG, WebP ni AVIF, aunque su nombre termine en .png.
							</Aviso>
						</Muestra>
					</div>
				</div>
			</div>

			<div className="flex flex-col gap-4">
				<h3 className="m-0 text-(length:--texto-titulo-interfaz) font-semibold">Notificacion</h3>
				<p className="m-0 max-w-(--ancho-lectura) text-(length:--texto-pequeno) text-texto-secundario">
					Aparecen abajo a la derecha (a todo el ancho en móvil). Información y éxito se van solas a los 6 s, y el tiempo se detiene
					con el puntero o el foco encima; los errores y las que llevan acción se quedan hasta cerrarlas. Como mucho tres a la vez.
				</p>
				{/* Usa el proveedor global de AppProviders: uno solo en toda la app, con una sola región viva. */}
				<Disparadores />
				<div className="grid gap-6 md:grid-cols-2">
					{(["info", "exito", "aviso", "error"] as const).map((tono) => (
						<div key={tono} className="flex flex-col gap-2">
							<Rotulo>{`${tono} · fija`}</Rotulo>
							<Muestra ancho>
								<VistaNotificacion
									tono={tono}
									titulo={AVISOS.find((a) => a.tono === tono)!.titulo}
									descripcion={tono === "info" ? undefined : AVISOS.find((a) => a.tono === tono)!.texto}
									accion={tono === "info" ? { texto: "Deshacer", alPulsar: () => undefined } : undefined}
									alCerrar={() => undefined}
								/>
							</Muestra>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
