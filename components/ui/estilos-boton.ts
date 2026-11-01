// Clases de Boton y BotonEnlace (DESIGN.md § Buttons). Sin "use client": BotonEnlace
// puede ser componente de servidor. Los estados al-pasar y al-pulsar están en globals.css.
import { cn } from "@/lib/utils";

export type VarianteBoton = "primario" | "secundario" | "fantasma" | "peligro" | "peligro-confirmar";
export type TamanoBoton = "compacto" | "normal";

export interface OpcionesBoton {
	variante?: VarianteBoton;
	tamano?: TamanoBoton;
	/** Ocupa todo el ancho del contenedor (móvil, pie de diálogo). */
	anchoCompleto?: boolean;
	/** Solo se ve el icono; el texto queda para lectores de pantalla. */
	soloIcono?: boolean;
	className?: string;
}

const BASE =
	"relative inline-flex min-h-11 items-center justify-center gap-2 rounded-control border font-texto font-semibold uppercase " +
	"text-(length:--texto-etiqueta) leading-[1.2] tracking-[0.16em] whitespace-nowrap select-none cursor-pointer " +
	"transition-[background-color,border-color,color,text-decoration-color,transform] duration-(--duracion-breve) ease-estandar " +
	"al-pulsar:translate-y-px " +
	"aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-busy:cursor-progress " +
	"[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.5]";

const VARIANTES: Record<VarianteBoton, string> = {
	// La única superficie rellena de acento de la pantalla.
	primario: "border-acento bg-acento text-texto-sobre-acento al-pasar:border-acento-intenso al-pasar:bg-acento-intenso",
	secundario: "border-texto-principal bg-transparent text-texto-principal al-pasar:bg-superficie-cafe",
	fantasma:
		"border-transparent bg-transparent text-texto-principal underline decoration-transparent decoration-1 underline-offset-[0.3em] " +
		"al-pasar:decoration-acento",
	peligro:
		"border-error bg-transparent text-error al-pasar:bg-[color-mix(in_oklab,var(--color-error)_12%,var(--color-superficie))]",
	// Solo en el paso que confirma una acción destructiva (DialogoConfirmacion, 3.5).
	"peligro-confirmar":
		"border-error bg-error text-texto-sobre-acento " +
		"al-pasar:border-[color-mix(in_oklab,var(--color-error)_80%,var(--color-texto-principal))] " +
		"al-pasar:bg-[color-mix(in_oklab,var(--color-error)_80%,var(--color-texto-principal))]",
};

const TAMANOS: Record<TamanoBoton, string> = {
	compacto: "px-4",
	normal: "px-6",
};

export function clasesBoton({
	variante = "primario",
	tamano = "normal",
	anchoCompleto = false,
	soloIcono = false,
	className,
}: OpcionesBoton = {}): string {
	return cn(
		BASE,
		VARIANTES[variante],
		soloIcono ? "min-w-11 px-0 [&_svg]:size-5" : TAMANOS[tamano],
		anchoCompleto && "w-full",
		className,
	);
}
