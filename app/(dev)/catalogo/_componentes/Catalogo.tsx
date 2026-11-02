"use client";

import { useState, type ReactNode } from "react";
import { ArrowRight, CalendarDays, CircleAlert, Plus, Trash2, X } from "lucide-react";
import { Boton, BotonEnlace, Insignia, Tarjeta } from "@/components/ui";
import type { VarianteBoton } from "@/components/ui/estilos-boton";
import type { TonoInsignia } from "@/components/ui/Insignia";
import { usePreferencias } from "@/components/providers/PreferenciasProvider";
import type { Preferencias } from "@/lib/preferencias/preferencias";
import { DemosAvisos } from "./DemosAvisos";
import { DemosCampos } from "./DemosCampos";
import { DemosDialogo } from "./DemosDialogo";
import { DemosEstados } from "./DemosEstados";
import { DemosGraficas } from "./DemosGraficas";
import { DemosMarca } from "./DemosMarca";
import { DemosTabla } from "./DemosTabla";
import { Muestra } from "./Muestra";

const esperar = (ms: number) => new Promise((resolver) => window.setTimeout(resolver, ms));

const ESTADOS = ["Reposo", "Hover", "Foco visible", "Pulsado", "Deshabilitado", "Cargando"] as const;
const DEMO: Partial<Record<(typeof ESTADOS)[number], string>> = {
	Hover: "hover",
	"Foco visible": "foco",
	Pulsado: "pulsado",
};

const VARIANTES: { variante: VarianteBoton; texto: string; uso: string }[] = [
	{ variante: "primario", texto: "Reservar mesa", uso: "Una por pantalla" },
	{ variante: "secundario", texto: "Ver la carta", uso: "Acción alternativa" },
	{ variante: "fantasma", texto: "Más detalles", uso: "Acción terciaria" },
	{ variante: "peligro", texto: "Cancelar reserva", uso: "Destructiva, antes de confirmar" },
	{ variante: "peligro-confirmar", texto: "Sí, cancelar", uso: "Solo al confirmar" },
];

const TONOS: { tono: TonoInsignia; texto: string }[] = [
	{ tono: "neutro", texto: "Borrador" },
	{ tono: "acento", texto: "De la casa" },
	{ tono: "exito", texto: "Confirmada" },
	{ tono: "aviso", texto: "Datos de ejemplo" },
	{ tono: "error", texto: "Rechazada" },
	{ tono: "info", texto: "En cocina" },
];

function Seccion({ id, titulo, children, reglas }: { id: string; titulo: string; reglas: string; children: ReactNode }) {
	return (
		<section id={id} aria-labelledby={`${id}-titulo`} className="flex flex-col gap-6 border-t border-borde-sutil pt-12">
			<header className="flex max-w-(--ancho-lectura) flex-col gap-2">
				<h2 id={`${id}-titulo`} className="m-0 text-(length:--texto-titulo-2) leading-[1.15]">
					{titulo}
				</h2>
				<p className="m-0 text-texto-secundario">{reglas}</p>
			</header>
			{children}
		</section>
	);
}

/** Tabla de estados: filas por variante, columnas por estado. */
function Matriz({ leyenda, columnas, children }: { leyenda: string; columnas: readonly string[]; children: ReactNode }) {
	return (
		<div className="overflow-x-auto rounded-tarjeta border border-borde-sutil" tabIndex={0} role="region" aria-label={leyenda}>
			<table className="w-full border-collapse text-left">
				<caption className="solo-lectores">{leyenda}</caption>
				<thead>
					<tr className="border-b border-borde-sutil">
						<th scope="col" className="px-4 py-3 text-(length:--texto-etiqueta) font-semibold uppercase tracking-[0.16em] text-texto-secundario">
							Variante
						</th>
						{columnas.map((c) => (
							<th
								key={c}
								scope="col"
								className="px-4 py-3 text-(length:--texto-etiqueta) font-semibold uppercase tracking-[0.16em] text-texto-secundario whitespace-nowrap"
							>
								{c}
							</th>
						))}
					</tr>
				</thead>
				<tbody>{children}</tbody>
			</table>
		</div>
	);
}

function Fila({ nombre, detalle, children }: { nombre: string; detalle?: string; children: ReactNode }) {
	return (
		<tr className="border-b border-borde-sutil last:border-b-0">
			<th scope="row" className="px-4 py-4 align-top font-normal">
				<code className="text-(length:--texto-pequeno) text-texto-principal">{nombre}</code>
				{detalle && <span className="block text-(length:--texto-pequeno) text-texto-tenue">{detalle}</span>}
			</th>
			{children}
		</tr>
	);
}

function Celda({ children }: { children: ReactNode }) {
	return <td className="px-4 py-4 align-top">{children}</td>;
}

function Opciones<K extends "tema" | "tamanoTexto" | "movimiento">({
	clave,
	rotulo,
	opciones,
}: {
	clave: K;
	rotulo: string;
	opciones: { valor: Preferencias[K]; texto: string }[];
}) {
	const { preferencias, actualizar } = usePreferencias();
	return (
		<fieldset className="m-0 flex flex-wrap items-center gap-x-4 gap-y-2 border-0 p-0">
			<legend className="float-left mr-2 text-(length:--texto-etiqueta) font-semibold uppercase tracking-[0.16em] text-texto-secundario">
				{rotulo}
			</legend>
			{opciones.map((o) => (
				<label key={o.valor} className="area-tactil-minima cursor-pointer gap-2 text-(length:--texto-pequeno)">
					<input
						type="radio"
						name={`catalogo-${clave}`}
						checked={preferencias[clave] === o.valor}
						onChange={() => actualizar({ [clave]: o.valor } as Partial<Preferencias>)}
					/>
					{o.texto}
				</label>
			))}
		</fieldset>
	);
}

function DemoDobleClic() {
	const [atendidas, setAtendidas] = useState(0);
	const [fallo, setFallo] = useState(false);
	return (
		<div className="flex flex-wrap items-start gap-6">
			<div className="flex flex-col items-start gap-2">
				<Boton
					data-prueba="doble-clic"
					onClick={async () => {
						setAtendidas((n) => n + 1);
						await esperar(1200);
					}}
				>
					Guardar cambios
				</Boton>
				<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario numeros-tabulares" data-prueba="atendidas">
					Pulsaciones atendidas: {atendidas}
				</p>
			</div>
			<div className="flex flex-col items-start gap-2">
				<Boton
					variante="secundario"
					data-prueba="fallo"
					aria-describedby={fallo ? "catalogo-fallo" : undefined}
					onClick={async () => {
						setFallo(false);
						await esperar(900);
						setFallo(true);
					}}
				>
					Enviar con fallo
				</Boton>
				{fallo && (
					<p id="catalogo-fallo" role="alert" className="m-0 flex items-center gap-2 text-(length:--texto-pequeno) text-error">
						<CircleAlert aria-hidden="true" className="size-4 stroke-[1.5]" />
						No se pudo enviar. Revisa la conexión y vuelve a intentarlo.
					</p>
				)}
			</div>
		</div>
	);
}

function DemoReintento() {
	const [estado, setEstado] = useState<"error" | "cargando" | "listo">("error");
	return (
		<Tarjeta
			data-prueba="reintento"
			titulo="Ventas de hoy"
			estado={estado}
			alReintentar={async () => {
				setEstado("cargando");
				await esperar(1200);
				setEstado("listo");
			}}
			pie={
				<Boton variante="fantasma" tamano="compacto" onClick={() => setEstado("error")}>
					Volver a fallar
				</Boton>
			}
		>
			<p className="m-0 texto-cifra-destacada">$ 18 420</p>
			<Insignia tono="aviso">Datos de ejemplo</Insignia>
		</Tarjeta>
	);
}

export function Catalogo() {
	return (
		<main className="contenedor-pagina flex flex-col gap-12 py-12 lg:py-16" data-catalogo-dev>
			<header className="flex flex-col gap-4">
				<h1 className="m-0 text-(length:--texto-titulo-1) leading-[1.08]">Catálogo de componentes</h1>
				<p className="m-0 max-w-(--ancho-lectura) text-(length:--texto-entradilla) leading-[1.6] text-texto-secundario">
					Solo existe en <code>next dev</code>. Cada muestra lleva su contraste medido sobre el color que pinta el navegador; cambia
					el tema y el tamaño de texto aquí para revisar las dos versiones.
				</p>
				<div className="flex flex-col gap-3 rounded-tarjeta border border-borde-sutil bg-superficie p-4 md:flex-row md:flex-wrap md:gap-x-10">
					<Opciones
						clave="tema"
						rotulo="Tema"
						opciones={[
							{ valor: "oscuro", texto: "Oscuro" },
							{ valor: "claro", texto: "Claro" },
						]}
					/>
					<Opciones
						clave="tamanoTexto"
						rotulo="Texto"
						opciones={[
							{ valor: "normal", texto: "100 %" },
							{ valor: "grande", texto: "112,5 %" },
							{ valor: "muy-grande", texto: "125 %" },
						]}
					/>
					<Opciones
						clave="movimiento"
						rotulo="Movimiento"
						opciones={[
							{ valor: "sistema", texto: "Según el sistema" },
							{ valor: "reducido", texto: "Reducido" },
						]}
					/>
				</div>
				<nav aria-label="Componentes del catálogo">
					<ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0">
						{[
							["#boton", "Boton"],
							["#boton-enlace", "BotonEnlace"],
							["#insignia", "Insignia"],
							["#tarjeta", "Tarjeta"],
							["#avisos", "Avisos"],
							["#campos", "Campos"],
							["#dialogo", "Diálogos"],
							["#tabla", "Tabla"],
							["#estados", "Estados"],
							["#graficas", "Gráficas"],
							["#marca", "Marca"],
						].map(([href, texto]) => (
							<li key={href}>
								<a href={href} className="enlace-subrayado area-tactil-minima">
									{texto}
								</a>
							</li>
						))}
					</ul>
				</nav>
			</header>

			<Seccion
				id="boton"
				titulo="Boton"
				reglas="Alto mínimo de 44 px y texto en versalitas espaciadas. Hover: el acento pasa a acento intenso; en el secundario, el fondo pasa a café. Pulsado: baja 1 px. Deshabilitado y cargando siguen siendo enfocables, lo anuncian con aria-disabled y aria-busy, e ignoran los clics."
			>
				<Matriz leyenda="Estados de Boton por variante" columnas={ESTADOS}>
					{VARIANTES.map(({ variante, texto, uso }) => (
						<Fila key={variante} nombre={variante} detalle={uso}>
							{ESTADOS.map((estado) => (
								<Celda key={estado}>
									<Muestra>
										<Boton
											variante={variante}
											data-demo={DEMO[estado]}
											data-borde-control={variante === "secundario" || variante === "peligro" ? "" : undefined}
											deshabilitado={estado === "Deshabilitado"}
											cargando={estado === "Cargando"}
										>
											{texto}
										</Boton>
									</Muestra>
								</Celda>
							))}
						</Fila>
					))}
				</Matriz>

				<div className="grid gap-8 md:grid-cols-2">
					<div className="flex flex-col gap-3">
						<h3 className="m-0 text-(length:--texto-titulo-interfaz) font-semibold">Tamaños, iconos y ancho</h3>
						<div className="flex flex-wrap items-start gap-4">
							<Muestra>
								<Boton icono={<CalendarDays />}>Reservar</Boton>
							</Muestra>
							<Muestra>
								<Boton variante="secundario" tamano="compacto" icono={<ArrowRight />} posicionIcono="fin" data-borde-control="">
									Compacto
								</Boton>
							</Muestra>
							<Muestra>
								<Boton variante="secundario" soloIcono icono={<Plus />} data-borde-control="">
									Añadir plato
								</Boton>
							</Muestra>
							<Muestra>
								<Boton variante="fantasma" soloIcono icono={<X />}>
									Cerrar
								</Boton>
							</Muestra>
							<Muestra>
								<Boton variante="peligro" soloIcono icono={<Trash2 />} data-borde-control="">
									Eliminar
								</Boton>
							</Muestra>
							<Muestra>
								<Boton variante="secundario" soloIcono icono={<Plus />} cargando>
									Añadir plato
								</Boton>
							</Muestra>
						</div>
						<Muestra ancho>
							<Boton anchoCompleto>Confirmar pedido</Boton>
						</Muestra>
					</div>
					<div className="flex flex-col gap-3">
						<h3 className="m-0 text-(length:--texto-titulo-interfaz) font-semibold">Doble clic y error</h3>
						<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">
							Pulsa dos veces seguidas: solo se atiende la primera mientras dura la operación. Si falla, el botón vuelve a reposo y el
							mensaje va junto a él con icono y texto.
						</p>
						<DemoDobleClic />
					</div>
				</div>
			</Seccion>

			<Seccion
				id="boton-enlace"
				titulo="BotonEnlace"
				reglas="Mismo aspecto que Boton sobre next/link, para navegar. Un enlace no se deshabilita ni carga: si el destino no está disponible, no se pinta el enlace."
			>
				<Matriz leyenda="Estados de BotonEnlace por variante" columnas={ESTADOS.slice(0, 4)}>
					{VARIANTES.slice(0, 3).map(({ variante, texto }) => (
						<Fila key={variante} nombre={variante}>
							{ESTADOS.slice(0, 4).map((estado) => (
								<Celda key={estado}>
									<Muestra>
										<BotonEnlace
											href="#boton-enlace"
											variante={variante}
											data-demo={DEMO[estado]}
											data-borde-control={variante === "secundario" ? "" : undefined}
										>
											{texto}
										</BotonEnlace>
									</Muestra>
								</Celda>
							))}
						</Fila>
					))}
				</Matriz>
			</Seccion>

			<Seccion
				id="insignia"
				titulo="Insignia"
				reglas="Pastilla de estado o contador. Los estados llevan siempre icono y texto, con el fondo al 12 % del color del estado. No es interactiva: no tiene hover, foco, deshabilitado ni carga."
			>
				<div className="flex flex-wrap items-start gap-6">
					{TONOS.map(({ tono, texto }) => (
						<div key={tono} className="flex flex-col gap-2">
							<code className="text-(length:--texto-pequeno) text-texto-tenue">{tono}</code>
							<Muestra>
								<Insignia tono={tono}>{texto}</Insignia>
							</Muestra>
						</div>
					))}
				</div>
				<div className="flex flex-wrap items-start gap-6">
					<div className="flex flex-col gap-2">
						<code className="text-(length:--texto-pequeno) text-texto-tenue">contador</code>
						<Muestra>
							<Insignia contador={3} descripcion="3 pedidos nuevos" />
						</Muestra>
					</div>
					<div className="flex flex-col gap-2">
						<code className="text-(length:--texto-pequeno) text-texto-tenue">contador acento</code>
						<Muestra>
							<Insignia tono="acento" contador={128} descripcion="128 reservas este mes" />
						</Muestra>
					</div>
					<div className="flex max-w-56 flex-col gap-2">
						<code className="text-(length:--texto-pequeno) text-texto-tenue">texto largo</code>
						<Muestra>
							<Insignia tono="aviso">Pendiente de confirmar por el restaurante</Insignia>
						</Muestra>
					</div>
				</div>
			</Seccion>

			<Seccion
				id="tarjeta"
				titulo="Tarjeta"
				reglas="Superficie, filete sutil y radio de 4 px, sin sombra. Si lleva enlace, la tarjeta entera responde: al pasar cambian el relleno y el filete, y el foco rodea la tarjeta. Cargando conserva el tamaño; el error dice «No se pudo cargar» y ofrece Reintentar, nunca un cero."
			>
				<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
					<Muestra ancho>
						<Tarjeta
							titulo="Reserva para 4"
							descripcion="Sábado 14 de noviembre, 21:00 h. Terraza, junto a la fuente."
							insignia={<Insignia tono="exito">Confirmada</Insignia>}
							pie={
								<>
									<Boton variante="secundario" tamano="compacto">
										Modificar
									</Boton>
									<Boton variante="fantasma" tamano="compacto">
										Cancelar
									</Boton>
								</>
							}
						/>
					</Muestra>
					<Muestra ancho>
						<Tarjeta
							destacada
							titulo="Cabrito al horno"
							descripcion="Asado lento con hierbas de la sierra, papas de cambray y salsa borracha."
							insignia={<Insignia tono="acento">De la casa</Insignia>}
						>
							<p className="m-0 text-(length:--texto-cifra-tabla) font-medium numeros-tabulares">$ 420</p>
						</Tarjeta>
					</Muestra>
					{(["Reposo", "Hover", "Foco visible"] as const).map((estado) => (
						<Muestra ancho key={estado}>
							<Tarjeta
								href="#tarjeta"
								data-demo={DEMO[estado]}
								titulo={`Con enlace · ${estado.toLowerCase()}`}
								descripcion="Toda la tarjeta lleva al detalle; el enlace es el título."
							/>
						</Muestra>
					))}
					<Muestra ancho>
						<Tarjeta
							href="#tarjeta"
							deshabilitada
							motivoDeshabilitada="Agotado"
							titulo="Mole de olla"
							descripcion="Vuelve mañana a partir de las 13:00 h."
						/>
					</Muestra>
					<Muestra ancho>
						<Tarjeta titulo="Reservas de la semana" estado="cargando" />
					</Muestra>
					<Muestra ancho>
						<Tarjeta titulo="Reservas de la semana" estado="error" alReintentar={() => undefined} />
					</Muestra>
					<Muestra ancho>
						<DemoReintento />
					</Muestra>
				</div>
			</Seccion>

			<Seccion
				id="avisos"
				titulo="Avisos y notificaciones"
				reglas="El aviso va en línea, junto a lo que explica: filete y relleno al 12 % del color del estado, icono y texto en el color principal. Error se anuncia al instante (role=alert); el resto, con role=status. La notificación flota abajo, confirma algo que acaba de pasar y se lee en una región aria-live educada."
			>
				<DemosAvisos />
			</Seccion>

			<Seccion
				id="campos"
				titulo="Campos de formulario"
				reglas="Etiqueta siempre visible encima del control; ayuda y contador debajo; el error al final, con icono y texto, enlazado con aria-describedby y aria-invalid. Filete de control que pasa a foco con el anillo. Casilla e interruptor son casillas nativas con toda la etiqueta como área táctil. Al enviar con errores, el foco va al primer campo inválido."
			>
				<DemosCampos />
			</Seccion>

			<Seccion
				id="dialogo"
				titulo="Diálogos"
				reglas="Dialogo, PanelLateral y DialogoConfirmacion sobre Radix: trampa de foco, Esc para cerrar, el foco vuelve a quien los abrió y la página de detrás no se desplaza. Velo opaco sin desenfoque, superficie elevada, radio de 6 px y sombra flotante. La confirmación empieza en «Cancelar» y no se cierra con un clic fuera."
			>
				<DemosDialogo />
			</Seccion>

			<Seccion
				id="tabla"
				titulo="Tabla, paginación y pestañas"
				reglas="Desde 768 px, tabla semántica con leyenda para lectores y desplazamiento horizontal enfocable si no cabe; por debajo, tarjetas con contraetiqueta. Cifras alineadas al final y tabulares. La página y la pestaña van en la URL. La pestaña seleccionada lleva el filete doble; la página actual, relleno café y filete de acento."
			>
				<DemosTabla />
			</Seccion>

			<Seccion
				id="estados"
				titulo="Estados vacío, de carga y de error"
				reglas="El vacío explica por qué no hay nada y ofrece la acción que lo resuelve. La carga conserva el tamaño de lo que viene, con un pulso que se detiene si el movimiento está reducido, y lo anuncia con aria-busy. El error dice qué no se pudo cargar, nunca muestra un cero en su lugar y ofrece Reintentar."
			>
				<DemosEstados />
			</Seccion>

			<Seccion
				id="graficas"
				titulo="Indicadores y gráficas"
				reglas="El indicador da la cifra y su comparación con icono y texto: el color dice si es buena o mala noticia, nunca solo. Si falla, «No se pudo cargar», nunca un cero. Las gráficas son SVG propias con la paleta validada en orden fijo, marcas finas, cuadrícula recesiva, leyenda a partir de dos series, tooltip con puntero y teclado, y siempre una vista de tabla."
			>
				<DemosGraficas />
			</Seccion>

			<Seccion
				id="marca"
				titulo="Piezas de marca"
				reglas="La etiqueta de sección abre cada sección como la etiqueta de un vino: lote, rótulo en versalitas, filete doble de acento y título serif. La contraetiqueta da los datos en pares rótulo/valor con filetes finos, a una o dos columnas. El sello aparece una vez por página, como firma."
			>
				<DemosMarca />
			</Seccion>
		</main>
	);
}
