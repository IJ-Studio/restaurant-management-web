"use client";

import { useState, type ReactNode } from "react";
import { Menu, ShoppingBag, Trash2 } from "lucide-react";
import {
	Boton,
	CerrarDialogo,
	Dialogo,
	DialogoConfirmacion,
	PanelLateral,
	useConfirmacion,
} from "@/components/ui";

const esperar = (ms: number) => new Promise((resolver) => window.setTimeout(resolver, ms));

function Demo({ nombre, estados, children }: { nombre: string; estados: string; children: ReactNode }) {
	return (
		<div className="flex min-w-0 flex-col items-start gap-3 rounded-tarjeta border border-borde-sutil p-5">
			<code className="text-(length:--texto-pequeno) text-texto-principal">{nombre}</code>
			<p className="m-0 text-(length:--texto-pequeno) leading-[1.5] text-texto-secundario">{estados}</p>
			<div className="mt-auto flex flex-wrap items-start gap-3 pt-2">{children}</div>
		</div>
	);
}

function Resultado({ prueba, children }: { prueba: string; children: ReactNode }) {
	return (
		<p role="status" data-prueba={prueba} className="m-0 min-h-[1.5em] text-(length:--texto-pequeno) text-texto-secundario">
			{children}
		</p>
	);
}

function DemoEditarReserva() {
	const [abierto, setAbierto] = useState(false);
	const [guardando, setGuardando] = useState(false);
	const [guardado, setGuardado] = useState(false);
	return (
		<>
			<Dialogo
				abierto={abierto}
				alCambiarAbierto={setAbierto}
				cerrable={!guardando}
				disparador={
					<Boton variante="secundario" data-prueba="abrir-dialogo">
						Modificar reserva
					</Boton>
				}
				titulo="Modificar la reserva"
				descripcion="Revisa los datos antes de guardar. Te enviaremos la confirmación por correo."
				pie={
					<>
						<CerrarDialogo asChild>
							<Boton variante="secundario" deshabilitado={guardando}>
								Descartar
							</Boton>
						</CerrarDialogo>
						<Boton
							data-prueba="guardar-dialogo"
							textoCargando="Guardando…"
							onClick={async () => {
								setGuardando(true);
								await esperar(1200);
								setGuardando(false);
								setGuardado(true);
								setAbierto(false);
							}}
						>
							Guardar cambios
						</Boton>
					</>
				}
			>
				<dl className="contraetiqueta">
					<dt>Fecha</dt>
					<dd>Sábado 14 de noviembre</dd>
					<dt>Hora</dt>
					<dd>21:00 h</dd>
					<dt>Personas</dt>
					<dd>4</dd>
					<dt>Mesa</dt>
					<dd>Terraza, junto a la fuente</dd>
				</dl>
			</Dialogo>
			<Resultado prueba="resultado-dialogo">{guardado ? "Cambios guardados." : ""}</Resultado>
		</>
	);
}

const POLITICA = [
	"Puedes cancelar o modificar tu reserva sin coste hasta 24 horas antes de la hora reservada, desde el enlace del correo de confirmación o llamando al restaurante.",
	"Si cancelas con menos de 24 horas de antelación, o si no te presentas, la mesa se libera 20 minutos después de la hora reservada y podremos pedirte una garantía en tu próxima reserva.",
	"Para grupos de 8 personas o más, la cancelación debe hacerse con 48 horas de antelación, porque la cocina prepara el servicio con tiempo.",
	"En fechas señaladas (Nochebuena, Nochevieja, Día de las Madres y San Valentín) el menú es cerrado y la reserva se confirma con un depósito, que se reembolsa si cancelas dentro del plazo.",
	"Si llegas tarde, te guardamos la mesa 20 minutos. Avísanos por teléfono y haremos lo posible por mantenerla más tiempo.",
	"Los cambios en el número de personas están sujetos a disponibilidad. Te confirmaremos la nueva mesa por correo.",
	"Para cualquier duda, escríbenos o llámanos en el horario de atención. Estaremos encantados de ayudarte.",
];

function DemoPolitica() {
	return (
		<Dialogo
			ancho="amplio"
			disparador={
				<Boton variante="fantasma" data-prueba="abrir-politica">
					Ver política
				</Boton>
			}
			titulo="Política de cancelación"
			descripcion="Lo que ocurre si cancelas, cambias o no llegas a tu reserva."
			pie={
				<CerrarDialogo asChild>
					<Boton>Entendido</Boton>
				</CerrarDialogo>
			}
		>
			<div className="flex max-w-(--ancho-lectura) flex-col gap-4 leading-[1.65]" data-prueba="cuerpo-largo">
				{POLITICA.map((parrafo) => (
					<p key={parrafo.slice(0, 24)} className="m-0">
						{parrafo}
					</p>
				))}
			</div>
		</Dialogo>
	);
}

function DemoPedido() {
	return (
		<PanelLateral
			disparador={
				<Boton variante="secundario" icono={<ShoppingBag />} data-prueba="abrir-panel">
					Tu pedido
				</Boton>
			}
			titulo="Tu pedido"
			descripcion="Mesa 12 · 3 platos"
			pie={
				<>
					<CerrarDialogo asChild>
						<Boton variante="secundario">Seguir pidiendo</Boton>
					</CerrarDialogo>
					<Boton>Enviar a cocina</Boton>
				</>
			}
		>
			<dl className="contraetiqueta">
				<dt>Cabrito al horno</dt>
				<dd>$ 420</dd>
				<dt>Enchiladas huastecas ×2</dt>
				<dd>$ 360</dd>
				<dt>Agua de jamaica</dt>
				<dd>$ 60</dd>
				<dt>Total</dt>
				<dd>$ 840</dd>
			</dl>
		</PanelLateral>
	);
}

function DemoMenu() {
	return (
		<PanelLateral
			lado="inicio"
			disparador={
				<Boton variante="secundario" soloIcono icono={<Menu />} data-prueba="abrir-menu">
					Abrir menú
				</Boton>
			}
			titulo="El Quijote"
		>
			<nav aria-label="Secciones">
				<ul className="m-0 flex list-none flex-col p-0">
					{[
						["#boton", "Boton"],
						["#tarjeta", "Tarjeta"],
						["#dialogo", "Diálogos"],
					].map(([href, texto]) => (
						<li key={href} className="border-b border-borde-sutil">
							<CerrarDialogo asChild>
								<a href={href} className="area-tactil-minima w-full py-3 font-titulos text-(length:--texto-titulo-interfaz)">
									{texto}
								</a>
							</CerrarDialogo>
						</li>
					))}
				</ul>
			</nav>
		</PanelLateral>
	);
}

function DemoCancelarReserva() {
	const [resultado, setResultado] = useState("");
	return (
		<>
			<DialogoConfirmacion
				destructiva
				disparador={
					<Boton variante="peligro" data-prueba="abrir-confirmacion">
						Cancelar reserva
					</Boton>
				}
				titulo="¿Cancelar la reserva del sábado?"
				descripcion="Se libera la mesa para 4 del sábado 14 de noviembre a las 21:00 h. No se puede deshacer."
				textoConfirmar="Cancelar reserva"
				textoCancelar="Conservar reserva"
				textoCargando="Cancelando…"
				alConfirmar={async () => {
					await esperar(1200);
					setResultado("Reserva cancelada.");
				}}
			/>
			<Resultado prueba="resultado-confirmacion">{resultado}</Resultado>
		</>
	);
}

function DemoConfirmacionFallida() {
	return (
		<DialogoConfirmacion
			destructiva
			disparador={
				<Boton variante="peligro" icono={<Trash2 />} data-prueba="abrir-fallo">
					Eliminar platillo
				</Boton>
			}
			titulo="¿Eliminar «Mole de olla» de la carta?"
			descripcion="Deja de mostrarse en la carta y en los pedidos nuevos. Los pedidos anteriores lo conservan."
			textoConfirmar="Eliminar platillo"
			textoCancelar="Conservar"
			textoCargando="Eliminando…"
			mensajeError="No se pudo eliminar el platillo. Revisa la conexión e inténtalo de nuevo."
			alConfirmar={async () => {
				await esperar(900);
				throw new Error("demostración");
			}}
		/>
	);
}

function DemoUseConfirmacion() {
	const { confirmar, dialogo } = useConfirmacion();
	const [respuesta, setRespuesta] = useState("");
	return (
		<>
			<Boton
				variante="secundario"
				data-prueba="abrir-hook"
				onClick={async () => {
					const confirmado = await confirmar({
						titulo: "¿Eliminar al proveedor Lácteos de la Huasteca?",
						descripcion: "Se borran sus datos de contacto. Las órdenes de compra anteriores se conservan.",
						textoConfirmar: "Eliminar proveedor",
						textoCancelar: "Conservar",
						destructiva: true,
					});
					setRespuesta(confirmado ? "Respuesta: eliminar." : "Respuesta: conservar.");
				}}
			>
				Eliminar proveedor
			</Boton>
			{dialogo}
			<Resultado prueba="resultado-hook">{respuesta}</Resultado>
		</>
	);
}

/** Contenido de la sección «Diálogos» del catálogo. */
export function DemosDialogo() {
	return (
		<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
			<Demo
				nombre="Dialogo"
				estados="Abierto con descripción y pie. Al guardar, el botón carga y Esc, el velo, «Descartar» y «Cerrar» quedan bloqueados hasta terminar."
			>
				<DemoEditarReserva />
			</Demo>
			<Demo
				nombre="Dialogo ancho amplio"
				estados="Contenido largo: solo se desplaza el cuerpo, y el desplazamiento no pasa a la página. Sustituye a un alert() informativo."
			>
				<DemoPolitica />
			</Demo>
			<Demo nombre="PanelLateral" estados="Lado fin, con pie. Ocupa toda la altura y respeta las zonas seguras.">
				<DemoPedido />
			</Demo>
			<Demo nombre="PanelLateral inicio" estados="Menú de navegación: cada enlace cierra el panel al pulsarlo.">
				<DemoMenu />
			</Demo>
			<Demo
				nombre="DialogoConfirmacion"
				estados="Destructiva. El foco empieza en «Conservar reserva»; al confirmar, carga y no se puede cerrar hasta terminar."
			>
				<DemoCancelarReserva />
			</Demo>
			<Demo nombre="DialogoConfirmacion con fallo" estados="Si la acción falla, se queda abierto con el error junto a los botones.">
				<DemoConfirmacionFallida />
			</Demo>
			<Demo nombre="useConfirmacion" estados="Sustituye a confirm(): devuelve una promesa con la respuesta.">
				<DemoUseConfirmacion />
			</Demo>
		</div>
	);
}
