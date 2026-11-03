"use client";

import type { ComponentProps, ReactNode } from "react";
import * as RadixDialogo from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Boton } from "./Boton";
import { CLASE_DESCRIPCION_DIALOGO, CLASE_TITULO_DIALOGO, CuerpoDialogo, useFocoDeRetorno } from "./comun-dialogo";

/**
 * Diálogo modal y panel lateral (DESIGN.md § Otros componentes base), sobre Dialog de Radix:
 * trampa de foco, cierre con Esc, el foco vuelve al disparador al cerrar, el resto de la página
 * queda inerte para los lectores y la página de detrás no se desplaza.
 */

interface BaseDialogoProps {
	/** Abierto o cerrado, si lo controla el componente padre. */
	abierto?: boolean;
	/** Abierto al montar, si no lo controla el padre. */
	abiertoInicial?: boolean;
	alCambiarAbierto?: (abierto: boolean) => void;
	/** Elemento que abre el diálogo (normalmente un `Boton`); recibe los atributos ARIA. */
	disparador?: ReactNode;
	titulo: ReactNode;
	/** Qué se puede hacer aquí, o qué pasará; se enlaza con `aria-describedby`. */
	descripcion?: ReactNode;
	children?: ReactNode;
	/** Acciones: primero la secundaria y después la principal (en móvil, la principal queda arriba). */
	pie?: ReactNode;
	/** Mientras es `false` (p. ej., guardando), ni Esc, ni el velo, ni «Cerrar» lo cierran. */
	cerrable?: boolean;
	textoCerrar?: string;
	className?: string;
}

/** Cierra el diálogo o el panel que lo contiene; se usa con `asChild` sobre un `Boton`. */
export const CerrarDialogo = RadixDialogo.Close;

function useCierre(cerrable: boolean) {
	// Radix cierra con Esc, con un clic fuera o al perder el foco; mientras no se puede cerrar,
	// se anulan las tres vías (el botón «Cerrar» se deshabilita aparte).
	const impedir = (evento: Event) => {
		if (!cerrable) evento.preventDefault();
	};
	return {
		onEscapeKeyDown: impedir,
		onPointerDownOutside: impedir,
		onInteractOutside: impedir,
	} satisfies Partial<ComponentProps<typeof RadixDialogo.Content>>;
}

function BotonCerrar({ cerrable, texto, className }: { cerrable: boolean; texto: string; className?: string }) {
	return (
		<RadixDialogo.Close asChild>
			<Boton variante="fantasma" soloIcono icono={<X />} deshabilitado={!cerrable} className={className}>
				{texto}
			</Boton>
		</RadixDialogo.Close>
	);
}

function Raiz({
	abierto,
	abiertoInicial,
	alCambiarAbierto,
	disparador,
	children,
}: Pick<BaseDialogoProps, "abierto" | "abiertoInicial" | "alCambiarAbierto" | "disparador"> & { children: ReactNode }) {
	return (
		<RadixDialogo.Root open={abierto} defaultOpen={abiertoInicial} onOpenChange={alCambiarAbierto}>
			{disparador && <RadixDialogo.Trigger asChild>{disparador}</RadixDialogo.Trigger>}
			<RadixDialogo.Portal>
				<RadixDialogo.Overlay className="velo-dialogo" />
				{children}
			</RadixDialogo.Portal>
		</RadixDialogo.Root>
	);
}

const CLASE_PIE =
	"flex flex-col-reverse gap-3 border-t border-borde-sutil px-6 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end " +
	"max-sm:[&>*]:w-full";
const CLASE_PIE_PANEL = "flex flex-col-reverse gap-3 border-t border-borde-sutil px-6 py-4 [&>*]:w-full";

export interface DialogoProps extends BaseDialogoProps {
	ancho?: "normal" | "amplio";
}

export function Dialogo({
	ancho = "normal",
	titulo,
	descripcion,
	children,
	pie,
	cerrable = true,
	textoCerrar = "Cerrar",
	className,
	...raiz
}: DialogoProps) {
	const cierre = useCierre(cerrable);
	const foco = useFocoDeRetorno(!!raiz.disparador);
	return (
		<Raiz {...raiz}>
			<RadixDialogo.Content
				className={cn("caja-dialogo", className)}
				data-ancho={ancho}
				// Sin descripción, Radix no debe apuntar a un elemento que no existe.
				{...(descripcion ? {} : { "aria-describedby": undefined })}
				{...cierre}
				{...foco}
			>
				<header className="flex flex-col gap-2 px-6 pt-6 pb-4 pe-16">
					<RadixDialogo.Title className={CLASE_TITULO_DIALOGO}>{titulo}</RadixDialogo.Title>
					{descripcion && <RadixDialogo.Description className={CLASE_DESCRIPCION_DIALOGO}>{descripcion}</RadixDialogo.Description>}
				</header>
				{children && <CuerpoDialogo className="px-6 pb-6">{children}</CuerpoDialogo>}
				{pie && <footer className={CLASE_PIE}>{pie}</footer>}
				{/* Último en el orden del tabulador: el foco empieza en el contenido, no en «Cerrar». */}
				<BotonCerrar cerrable={cerrable} texto={textoCerrar} className="absolute top-3 right-3" />
			</RadixDialogo.Content>
		</Raiz>
	);
}

export interface PanelLateralProps extends BaseDialogoProps {
	/** Lado de la pantalla: `fin` (derecha, por defecto) o `inicio` (izquierda, menús). */
	lado?: "inicio" | "fin";
	/** `normal` (24rem) o `amplio` (40rem), para un formulario con plano, como la reserva (PLAN 4.7). */
	ancho?: "normal" | "amplio";
}

export function PanelLateral({
	lado = "fin",
	ancho = "normal",
	titulo,
	descripcion,
	children,
	pie,
	cerrable = true,
	textoCerrar = "Cerrar",
	className,
	...raiz
}: PanelLateralProps) {
	const cierre = useCierre(cerrable);
	const foco = useFocoDeRetorno(!!raiz.disparador);
	return (
		<Raiz {...raiz}>
			<RadixDialogo.Content
				className={cn("panel-lateral", className)}
				data-lado={lado}
				data-ancho={ancho === "amplio" ? "amplio" : undefined}
				{...(descripcion ? {} : { "aria-describedby": undefined })}
				{...cierre}
				{...foco}
			>
				<header className="flex items-start gap-3 border-b border-borde-sutil py-3 ps-6 pe-3">
					<div className="flex min-w-0 flex-1 flex-col gap-1 pt-2.5">
						<RadixDialogo.Title className={CLASE_TITULO_DIALOGO}>{titulo}</RadixDialogo.Title>
						{descripcion && <RadixDialogo.Description className={CLASE_DESCRIPCION_DIALOGO}>{descripcion}</RadixDialogo.Description>}
					</div>
					<BotonCerrar cerrable={cerrable} texto={textoCerrar} className="shrink-0" />
				</header>
				<CuerpoDialogo className="p-6">{children}</CuerpoDialogo>
				{/* En un panel estrecho, las acciones siempre apiladas a todo el ancho, la principal arriba. */}
				{pie && <footer className={CLASE_PIE_PANEL}>{pie}</footer>}
			</RadixDialogo.Content>
		</Raiz>
	);
}
