"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Boton, EstadoError, EstadoVacio, Insignia, Paginacion, Pestanas, Tabla } from "@/components/ui";
import type { ColumnaTabla } from "@/components/ui/Tabla";
import type { TonoInsignia } from "@/components/ui/Insignia";
import { Muestra } from "./Muestra";

interface Reserva {
	id: number;
	cliente: string;
	hora: string;
	personas: number;
	mesa: string;
	telefono: string;
	importe: number;
	estado: { tono: TonoInsignia; texto: string };
}

const RESERVAS: Reserva[] = [
	{ id: 1, cliente: "Ana López Hernández", hora: "13:30", personas: 2, mesa: "Terraza 4", telefono: "771 123 4567", importe: 640, estado: { tono: "exito", texto: "Confirmada" } },
	{ id: 2, cliente: "Familia Bautista", hora: "14:00", personas: 8, mesa: "Salón 1", telefono: "771 987 6543", importe: 3_280, estado: { tono: "aviso", texto: "Por confirmar" } },
	{ id: 3, cliente: "Luis Pérez", hora: "14:15", personas: 4, mesa: "Ventana 2", telefono: "789 555 0102", importe: 1_150, estado: { tono: "info", texto: "En mesa" } },
	{ id: 4, cliente: "Mariana Cruz del Ángel", hora: "15:45", personas: 3, mesa: "Terraza 1", telefono: "771 222 3344", importe: 0, estado: { tono: "error", texto: "Cancelada" } },
	{ id: 5, cliente: "Jorge Hernández", hora: "21:00", personas: 6, mesa: "Junto a la fuente", telefono: "771 444 5566", importe: 2_410, estado: { tono: "exito", texto: "Confirmada" } },
];

const pesos = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 });

const COLUMNAS: ColumnaTabla<Reserva>[] = [
	{ clave: "cliente", titulo: "Cliente", celda: (r) => r.cliente, principal: true },
	{ clave: "hora", titulo: "Hora", celda: (r) => `${r.hora} h`, numerica: true },
	{ clave: "personas", titulo: "Personas", celda: (r) => r.personas, numerica: true },
	{ clave: "mesa", titulo: "Mesa", celda: (r) => r.mesa },
	{ clave: "telefono", titulo: "Teléfono", celda: (r) => <span className="whitespace-nowrap numeros-tabulares">{r.telefono}</span> },
	{ clave: "importe", titulo: "Anticipo", celda: (r) => `$ ${pesos.format(r.importe)}`, numerica: true },
	{ clave: "estado", titulo: "Estado", celda: (r) => <Insignia tono={r.estado.tono}>{r.estado.texto}</Insignia> },
];

const acciones = (r: Reserva) => (
	<Boton variante="secundario" tamano="compacto">
		Ver<span className="solo-lectores"> la reserva de {r.cliente}</span>
	</Boton>
);

function Rotulo({ children }: { children: string }) {
	return <code className="text-(length:--texto-pequeno) text-texto-tenue">{children}</code>;
}

/** Paginación ligada a la URL del catálogo (`?pagina=N`). */
function PaginacionEnUrl() {
	const parametros = useSearchParams();
	const pagina = Number(parametros.get("pagina") ?? "1");
	return (
		<div className="flex flex-col gap-2" data-prueba="paginacion-url">
			<Paginacion
				pagina={pagina}
				totalPaginas={12}
				parametros={Object.fromEntries(parametros.entries())}
			/>
			<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario" role="status" data-prueba="pagina-actual">
				Mostrando la página {Math.min(Math.max(1, pagina || 1), 12)}
			</p>
		</div>
	);
}

/** Contenido de la sección «Tabla, paginación y pestañas» del catálogo. */
export function DemosTabla() {
	return (
		<div className="flex flex-col gap-10">
			<div className="flex flex-col gap-3">
				<Rotulo>Tabla · desde 768 px tabla, debajo tarjetas · fila seleccionada: Luis Pérez</Rotulo>
				<Muestra ancho>
					<Tabla
						leyenda="Reservas de hoy"
						leyendaVisible
						columnas={COLUMNAS}
						filas={RESERVAS}
						claveFila={(r) => r.id}
						acciones={acciones}
						filaSeleccionada={3}
					/>
				</Muestra>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="flex flex-col gap-3">
					<Rotulo>Tabla cargando</Rotulo>
					<Tabla leyenda="Reservas de mañana" leyendaVisible columnas={COLUMNAS.slice(0, 4)} filas={[]} claveFila={(r) => r.id} estado="cargando" />
				</div>
				<div className="flex flex-col gap-3">
					<Rotulo>Tabla vacía, con EstadoVacio</Rotulo>
					<Tabla
						leyenda="Reservas canceladas"
						leyendaVisible
						columnas={COLUMNAS.slice(0, 4)}
						filas={[]}
						claveFila={(r) => r.id}
						vacio={<EstadoVacio titulo="No hay reservas canceladas hoy" descripcion="Las cancelaciones del día aparecerán aquí." />}
					/>
				</div>
				<div className="flex flex-col gap-3">
					<Rotulo>Tabla con error, con EstadoError</Rotulo>
					<Tabla
						leyenda="Pedidos a domicilio"
						leyendaVisible
						columnas={COLUMNAS.slice(0, 4)}
						filas={[]}
						claveFila={(r) => r.id}
						error={<EstadoError titulo="No se pudieron cargar los pedidos" alReintentar={() => undefined} />}
					/>
				</div>
			</div>

			<div className="flex flex-col gap-4">
				<h3 className="m-0 text-(length:--texto-titulo-interfaz) font-semibold">Paginacion</h3>
				<Rotulo>en la URL: ?pagina=N</Rotulo>
				<Suspense fallback={null}>
					<PaginacionEnUrl />
				</Suspense>
				<div className="grid gap-6 md:grid-cols-2">
					{[
						[1, 12],
						[6, 12],
						[12, 12],
						[3, 5],
					].map(([pagina, total]) => (
						<div key={`${pagina}-${total}`} className="flex flex-col gap-2">
							<Rotulo>{`página ${pagina} de ${total}`}</Rotulo>
							<Muestra ancho>
								<Paginacion
									pagina={pagina}
									totalPaginas={total}
									etiqueta={`Paginación de muestra, página ${pagina} de ${total}`}
									hrefDe={(n) => `?pagina=${n}#tabla`}
								/>
							</Muestra>
						</div>
					))}
				</div>
			</div>

			<div className="flex flex-col gap-4">
				<h3 className="m-0 text-(length:--texto-titulo-interfaz) font-semibold">Pestanas</h3>
				<Rotulo>en la URL: ?pestana=valor · flechas, Inicio y Fin</Rotulo>
				<Muestra ancho>
					<Pestanas
						etiqueta="Pedidos por estado"
						parametroUrl="pestana"
						pestanas={[
							{
								valor: "pendientes",
								titulo: "Pendientes",
								contador: { valor: 3, descripcion: "3 pedidos" },
								contenido: <p className="m-0 text-texto-secundario">Tres pedidos esperan a que cocina los acepte.</p>,
							},
							{ valor: "cocina", titulo: "En cocina", contenido: <p className="m-0 text-texto-secundario">Dos pedidos en preparación.</p> },
							{ valor: "listos", titulo: "Listos", contenido: <p className="m-0 text-texto-secundario">Un pedido listo para llevar a la mesa 12.</p> },
							{ valor: "entregados", titulo: "Entregados", contenido: <p className="m-0 text-texto-secundario">Catorce pedidos entregados hoy.</p> },
						]}
					/>
				</Muestra>
				<div className="flex max-w-72 flex-col gap-2">
					<Rotulo>columna estrecha: las pestañas se desplazan</Rotulo>
					<Pestanas
						etiqueta="Secciones del perfil"
						pestanas={[
							{ valor: "datos", titulo: "Datos personales", contenido: <p className="m-0 text-texto-secundario">Nombre, correo y teléfono.</p> },
							{ valor: "direcciones", titulo: "Direcciones", contenido: <p className="m-0 text-texto-secundario">Dos direcciones guardadas.</p> },
							{ valor: "pagos", titulo: "Pagos", contenido: <p className="m-0 text-texto-secundario">Sin tarjetas guardadas.</p> },
						]}
					/>
				</div>
			</div>
		</div>
	);
}
