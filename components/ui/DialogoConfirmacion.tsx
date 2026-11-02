"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import * as RadixConfirmacion from "@radix-ui/react-alert-dialog";
import { CircleAlert } from "lucide-react";
import { Boton } from "./Boton";
import { CLASE_TITULO_DIALOGO, CuerpoDialogo, useFocoDeRetorno } from "./comun-dialogo";

/**
 * Confirmación de una acción (DESIGN.md § Otros componentes base), sobre AlertDialog de Radix
 * (`role="alertdialog"`). Sustituye a `confirm()`:
 *
 * - el foco empieza en «Cancelar», y ni el velo ni un clic fuera lo cierran;
 * - mientras `alConfirmar` trabaja, el botón carga y se bloquean «Cancelar» y Esc;
 * - si `alConfirmar` falla, el diálogo se queda abierto con el error junto a los botones.
 */
export interface DialogoConfirmacionProps {
	abierto?: boolean;
	alCambiarAbierto?: (abierto: boolean) => void;
	/** Elemento que abre la confirmación (normalmente un `Boton`). */
	disparador?: ReactNode;
	/** La pregunta, con la acción y el objeto: «¿Cancelar la reserva del sábado?». */
	titulo: ReactNode;
	/** Qué pasará y si se puede deshacer. */
	descripcion: ReactNode;
	children?: ReactNode;
	/** El verbo de la acción: «Cancelar reserva», nunca «Aceptar». */
	textoConfirmar: string;
	textoCancelar?: string;
	textoCargando?: string;
	/** Acción destructiva: el botón usa `peligro-confirmar`. */
	destructiva?: boolean;
	/** Si devuelve una promesa, el diálogo espera; si la promesa falla, muestra `mensajeError`. */
	alConfirmar: () => void | Promise<unknown>;
	mensajeError?: string;
}

export function DialogoConfirmacion({
	abierto: abiertoControlado,
	alCambiarAbierto,
	disparador,
	titulo,
	descripcion,
	children,
	textoConfirmar,
	textoCancelar = "Cancelar",
	textoCargando = "Un momento…",
	destructiva = false,
	alConfirmar,
	mensajeError = "No se pudo completar. Revisa la conexión e inténtalo de nuevo.",
}: DialogoConfirmacionProps) {
	const [abiertoPropio, setAbiertoPropio] = useState(false);
	const [ocupado, setOcupado] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const abierto = abiertoControlado ?? abiertoPropio;
	const foco = useFocoDeRetorno(!!disparador);

	function cambiar(siguiente: boolean) {
		// Mientras se confirma no se cierra: el resultado tiene que poder verse.
		if (!siguiente && ocupado) return;
		if (siguiente) setError(null);
		setAbiertoPropio(siguiente);
		alCambiarAbierto?.(siguiente);
	}

	async function confirmar() {
		setError(null);
		setOcupado(true);
		try {
			await alConfirmar();
			setOcupado(false);
			setAbiertoPropio(false);
			alCambiarAbierto?.(false);
		} catch {
			setOcupado(false);
			setError(mensajeError);
		}
	}

	return (
		<RadixConfirmacion.Root open={abierto} onOpenChange={cambiar}>
			{disparador && <RadixConfirmacion.Trigger asChild>{disparador}</RadixConfirmacion.Trigger>}
			<RadixConfirmacion.Portal>
				<RadixConfirmacion.Overlay className="velo-dialogo" />
				<RadixConfirmacion.Content
					className="caja-dialogo"
					data-ancho="normal"
					onEscapeKeyDown={(evento) => ocupado && evento.preventDefault()}
					{...foco}
				>
					<CuerpoDialogo className="flex flex-col gap-3 px-6 pt-6 pb-5">
						<RadixConfirmacion.Title className={CLASE_TITULO_DIALOGO}>
							{titulo}
						</RadixConfirmacion.Title>
						<RadixConfirmacion.Description className="m-0 max-w-(--ancho-lectura) leading-[1.6] text-texto-secundario">
							{descripcion}
						</RadixConfirmacion.Description>
						{children}
						{error && (
							<p role="alert" className="m-0 flex items-start gap-2 text-(length:--texto-pequeno) leading-[1.5] text-error">
								<CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 stroke-[1.5]" />
								{error}
							</p>
						)}
					</CuerpoDialogo>
					<footer className="flex flex-col-reverse gap-3 border-t border-borde-sutil px-6 py-4 sm:flex-row sm:justify-end max-sm:[&>*]:w-full">
						<RadixConfirmacion.Cancel asChild>
							<Boton variante="secundario" deshabilitado={ocupado}>
								{textoCancelar}
							</Boton>
						</RadixConfirmacion.Cancel>
						<Boton
							variante={destructiva ? "peligro-confirmar" : "primario"}
							cargando={ocupado}
							textoCargando={textoCargando}
							onClick={confirmar}
						>
							{textoConfirmar}
						</Boton>
					</footer>
				</RadixConfirmacion.Content>
			</RadixConfirmacion.Portal>
		</RadixConfirmacion.Root>
	);
}

export type OpcionesConfirmacion = Omit<
	DialogoConfirmacionProps,
	"abierto" | "alCambiarAbierto" | "disparador" | "alConfirmar" | "children"
>;

/**
 * `confirm()` con el diálogo del sistema: `if (!(await confirmar({ ... }))) return;`.
 * Devuelve `confirmar` y el `dialogo`, que el componente pinta una sola vez. El foco vuelve al
 * elemento que lo tenía antes de abrir.
 */
export function useConfirmacion() {
	const [abierto, setAbierto] = useState(false);
	const [opciones, setOpciones] = useState<OpcionesConfirmacion | null>(null);
	const resolver = useRef<((confirmado: boolean) => void) | null>(null);

	const responder = useCallback((confirmado: boolean) => {
		resolver.current?.(confirmado);
		resolver.current = null;
		setAbierto(false);
	}, []);

	const confirmar = useCallback((siguientes: OpcionesConfirmacion) => {
		// Una petición anterior sin respuesta cuenta como cancelada.
		resolver.current?.(false);
		setOpciones(siguientes);
		setAbierto(true);
		return new Promise<boolean>((resolve) => {
			resolver.current = resolve;
		});
	}, []);

	// Las opciones se conservan al cerrar, para que la animación de salida tenga contenido.
	const dialogo = opciones ? (
		<DialogoConfirmacion
			{...opciones}
			abierto={abierto}
			alCambiarAbierto={(siguiente) => !siguiente && responder(false)}
			alConfirmar={() => responder(true)}
		/>
	) : null;

	return { confirmar, dialogo };
}
