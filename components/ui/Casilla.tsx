"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { MensajeError } from "./Campo";

/**
 * Casilla e interruptor (DESIGN.md § Inputs / Fields). Los dos son un `<input type="checkbox">`
 * nativo: funcionan en un `<form>` sin JavaScript, se marcan con la barra espaciadora y la
 * etiqueta entera es el área táctil (mínimo 44 px de alto). El interruptor añade
 * `role="switch"`: para ajustes que se aplican al momento, no para aceptar condiciones.
 */
interface PropsOpcion extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className" | "children"> {
	ref?: Ref<HTMLInputElement>;
	etiqueta: ReactNode;
	ayuda?: ReactNode;
	error?: string | null;
	className?: string;
}

function useIds(id: string | undefined, ayuda: boolean, error: boolean) {
	const base = useId();
	const control = id ?? base;
	return {
		control,
		ayuda: ayuda ? `${control}-ayuda` : undefined,
		error: error ? `${control}-error` : undefined,
	};
}

function Textos({ ids, etiqueta, ayuda }: { ids: ReturnType<typeof useIds>; etiqueta: ReactNode; ayuda?: ReactNode }) {
	return (
		<span className="flex min-w-0 flex-col gap-0.5 pt-[0.6875rem]">
			<span className="leading-[1.4] text-texto-principal">{etiqueta}</span>
			{ayuda && (
				<span id={ids.ayuda} className="text-(length:--texto-pequeno) leading-[1.45] text-texto-secundario">
					{ayuda}
				</span>
			)}
		</span>
	);
}

const CLASE_ETIQUETA = "flex min-h-11 cursor-pointer items-start gap-3 has-disabled:cursor-not-allowed";

export function Casilla({ ref, id, etiqueta, ayuda, error, className, "aria-describedby": describedby, ...resto }: PropsOpcion) {
	const ids = useIds(id, !!ayuda, !!error);
	return (
		<div className={cn("flex flex-col gap-1", className)}>
			<label htmlFor={ids.control} className={CLASE_ETIQUETA}>
				{/* La caja ocupa 44 × 44 para el dedo; el dibujo, 1,25rem. El relleno lo pinta un
				    span bajo el input transparente, para que la marca quede sobre su propio fondo. */}
				{/* -ms-3: el dibujo queda alineado con el borde de los demás campos; el área táctil no cambia. */}
				<span className="relative -ms-3 grid size-11 shrink-0 place-items-center">
					<input
						ref={ref}
						id={ids.control}
						type="checkbox"
						aria-invalid={error ? true : undefined}
						aria-describedby={[describedby, ids.ayuda, ids.error].filter(Boolean).join(" ") || undefined}
						className={
							"peer relative z-10 size-5 cursor-pointer appearance-none rounded-control border border-borde-control bg-transparent " +
							"transition-[border-color] duration-(--duracion-breve) ease-estandar " +
							"checked:border-acento aria-invalid:border-error " +
							"disabled:cursor-not-allowed disabled:border-dashed disabled:opacity-50 " +
							"al-pasar:border-texto-principal checked:al-pasar:border-acento-intenso"
						}
						{...resto}
					/>
					<span
						aria-hidden="true"
						className={
							"pointer-events-none absolute grid size-5 place-items-center rounded-control bg-superficie " +
							"transition-[background-color] duration-(--duracion-breve) ease-estandar " +
							"peer-checked:bg-acento peer-disabled:opacity-50 " +
							"[&>svg]:invisible peer-checked:[&>svg]:visible"
						}
					>
						<Check className="size-3.5 stroke-[2.5] text-texto-sobre-acento" />
					</span>
				</span>
				<Textos ids={ids} etiqueta={etiqueta} ayuda={ayuda} />
			</label>
			{error && (
				<div className="ps-11">
					<MensajeError id={ids.error}>{error}</MensajeError>
				</div>
			)}
		</div>
	);
}

export function Interruptor({ ref, id, etiqueta, ayuda, error, className, "aria-describedby": describedby, ...resto }: PropsOpcion) {
	const ids = useIds(id, !!ayuda, !!error);
	return (
		<div className={cn("flex flex-col gap-1", className)}>
			<label htmlFor={ids.control} className={cn(CLASE_ETIQUETA, "justify-between")}>
				<Textos ids={ids} etiqueta={etiqueta} ayuda={ayuda} />
				<span className="relative -me-1.5 grid h-11 w-14 shrink-0 place-items-center">
					{/* Formas rectas, como el resto de controles: carril y pomo con el radio de control. */}
					<input
						ref={ref}
						id={ids.control}
						type="checkbox"
						role="switch"
						aria-invalid={error ? true : undefined}
						aria-describedby={[describedby, ids.ayuda, ids.error].filter(Boolean).join(" ") || undefined}
						className={
							"peer h-6 w-11 cursor-pointer appearance-none rounded-control border border-borde-control bg-superficie-cafe " +
							"transition-[background-color,border-color] duration-(--duracion-breve) ease-estandar " +
							"checked:border-acento checked:bg-acento disabled:cursor-not-allowed disabled:border-dashed disabled:opacity-50 " +
							"al-pasar:border-texto-principal checked:al-pasar:border-acento-intenso checked:al-pasar:bg-acento-intenso"
						}
						{...resto}
					/>
					<span
						aria-hidden="true"
						className={
							"pointer-events-none absolute top-1/2 left-[0.5625rem] size-4 -translate-y-1/2 rounded-control bg-texto-secundario " +
							"transition-transform duration-(--duracion-breve) ease-estandar " +
							"peer-checked:translate-x-[1.3125rem] peer-checked:bg-texto-sobre-acento peer-disabled:opacity-50"
						}
					/>
				</span>
			</label>
			{error && <MensajeError id={ids.error}>{error}</MensajeError>}
		</div>
	);
}
