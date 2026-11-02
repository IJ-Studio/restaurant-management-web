"use client";

import {
	useId,
	useState,
	type InputHTMLAttributes,
	type ReactNode,
	type Ref,
	type SelectHTMLAttributes,
	type TextareaHTMLAttributes,
} from "react";
import { ChevronDown, CircleAlert, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Campos de formulario (DESIGN.md § Inputs / Fields): etiqueta siempre visible encima del
 * control, ayuda y contador debajo, y el error al final, con icono y texto. El control lleva
 * `aria-invalid` y `aria-describedby` con la ayuda, el contador y el error.
 */

interface PropsEnvoltura {
	/** Texto de la etiqueta; siempre visible. */
	etiqueta: ReactNode;
	/** Indicación breve debajo del control: formato, para qué se usa. */
	ayuda?: ReactNode;
	/** Mensaje de error; si existe, el campo se marca inválido. */
	error?: string | null;
	/** Añade «(opcional)» a la etiqueta. Los campos obligatorios no se marcan con asterisco. */
	opcional?: boolean;
	/** Clase del contenedor (ancho en la rejilla del formulario). */
	className?: string;
}

interface Ids {
	control: string;
	ayuda?: string;
	contador?: string;
	error?: string;
}

function idsDe(base: string, { ayuda, contador, error }: { ayuda: boolean; contador: boolean; error: boolean }): Ids {
	return {
		control: base,
		ayuda: ayuda ? `${base}-ayuda` : undefined,
		contador: contador ? `${base}-contador` : undefined,
		error: error ? `${base}-error` : undefined,
	};
}

const describe = (ids: Ids, propio?: string) =>
	[propio, ids.ayuda, ids.contador, ids.error].filter(Boolean).join(" ") || undefined;

/** Rótulo de campo: DM Sans 600 en `--texto-pequeno`, nunca flotante. */
const CLASE_ETIQUETA = "text-(length:--texto-pequeno) font-semibold leading-[1.4] text-texto-principal";

export function MensajeError({ id, children }: { id?: string; children: ReactNode }) {
	return (
		<p id={id} className="m-0 flex items-start gap-1.5 text-(length:--texto-pequeno) leading-[1.45] text-error">
			<CircleAlert aria-hidden="true" className="mt-[0.1875rem] size-4 shrink-0 stroke-[1.5]" />
			<span>{children}</span>
		</p>
	);
}

function Envoltura({
	ids,
	etiqueta,
	ayuda,
	error,
	opcional,
	contador,
	className,
	children,
}: PropsEnvoltura & { ids: Ids; contador?: ReactNode; children: ReactNode }) {
	return (
		<div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
			<label htmlFor={ids.control} className={CLASE_ETIQUETA}>
				{etiqueta}
				{opcional && <span className="font-normal text-texto-secundario"> (opcional)</span>}
			</label>
			{children}
			{(ayuda || contador) && (
				<div className="flex items-start justify-between gap-3 text-(length:--texto-pequeno) leading-[1.45] text-texto-secundario">
					{ayuda ? (
						<p id={ids.ayuda} className="m-0">
							{ayuda}
						</p>
					) : (
						<span />
					)}
					{contador}
				</div>
			)}
			{error && <MensajeError id={ids.error}>{error}</MensajeError>}
		</div>
	);
}

function Contador({ id, longitud, maximo }: { id: string; longitud: number; maximo: number }) {
	const cerca = longitud >= maximo * 0.9;
	return (
		<p id={id} className={cn("m-0 shrink-0 numeros-tabulares", cerca && "font-semibold text-texto-principal")}>
			{longitud} / {maximo}
			<span className="solo-lectores"> caracteres</span>
		</p>
	);
}

/** Caja común de los controles de texto. El foco pinta el filete en `--color-foco` y el anillo global. */
const CLASE_CONTROL =
	"w-full min-h-11 rounded-control border border-borde-control bg-superficie px-3.5 font-texto text-(length:--texto-cuerpo) " +
	"leading-[1.4] text-texto-principal placeholder:text-texto-tenue " +
	"transition-[border-color] duration-(--duracion-breve) ease-estandar " +
	"focus:border-foco aria-invalid:border-error aria-invalid:focus:border-foco " +
	"disabled:cursor-not-allowed disabled:border-dashed disabled:bg-transparent disabled:text-texto-secundario " +
	"read-only:bg-transparent [&[data-demo=foco]]:border-foco";

/** Tipos en los que el corrector y las mayúsculas automáticas estorban. */
const SIN_CORRECTOR = new Set(["email", "tel", "url", "password", "number"]);

export interface CampoProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "children">,
		PropsEnvoltura {
	ref?: Ref<HTMLInputElement>;
	/** Muestra el contador «n / máximo»; necesita `maxLength`. */
	contador?: boolean;
	/** Código (RFC, CP, cupón): sin corrector ni mayúsculas automáticas, con cifras tabulares. */
	codigo?: boolean;
	/** En contraseñas, botón para mostrar u ocultar lo escrito. */
	revelable?: boolean;
	classNameControl?: string;
}

export function Campo({
	ref,
	id,
	etiqueta,
	ayuda,
	error,
	opcional,
	contador = false,
	codigo = false,
	revelable = false,
	className,
	classNameControl,
	type = "text",
	maxLength,
	value,
	defaultValue,
	onChange,
	"aria-describedby": describedby,
	...resto
}: CampoProps) {
	const base = useId();
	const conContador = contador && maxLength !== undefined;
	const ids = idsDe(id ?? base, { ayuda: !!ayuda, contador: conContador, error: !!error });
	const [visible, setVisible] = useState(false);
	// El contador funciona controlado o no controlado.
	const [longitudPropia, setLongitudPropia] = useState(String(defaultValue ?? "").length);
	const longitud = value !== undefined ? String(value).length : longitudPropia;
	const sinCorrector = codigo || SIN_CORRECTOR.has(type);
	const conBoton = revelable && type === "password";

	return (
		<Envoltura
			ids={ids}
			etiqueta={etiqueta}
			ayuda={ayuda}
			error={error}
			opcional={opcional}
			className={className}
			contador={conContador && <Contador id={ids.contador!} longitud={longitud} maximo={maxLength!} />}
		>
			<div className="relative">
				<input
					ref={ref}
					id={ids.control}
					type={conBoton && visible ? "text" : type}
					maxLength={maxLength}
					value={value}
					defaultValue={defaultValue}
					onChange={(evento) => {
						setLongitudPropia(evento.target.value.length);
						onChange?.(evento);
					}}
					aria-invalid={error ? true : undefined}
					aria-describedby={describe(ids, describedby)}
					spellCheck={sinCorrector ? false : undefined}
					autoCapitalize={sinCorrector ? "none" : undefined}
					autoCorrect={sinCorrector ? "off" : undefined}
					className={cn(CLASE_CONTROL, codigo && "numeros-tabulares tracking-[0.04em]", conBoton && "pe-12", classNameControl)}
					{...resto}
				/>
				{conBoton && (
					<button
						type="button"
						aria-pressed={visible}
						aria-controls={ids.control}
						onClick={() => setVisible((v) => !v)}
						disabled={resto.disabled}
						className={
							"area-tactil-minima absolute inset-y-0 end-0 cursor-pointer rounded-control text-texto-secundario " +
							"transition-colors duration-(--duracion-breve) al-pasar:text-texto-principal disabled:cursor-not-allowed " +
							"[&_svg]:size-5 [&_svg]:stroke-[1.5]"
						}
					>
						{visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
						<span className="solo-lectores">Mostrar contraseña</span>
					</button>
				)}
			</div>
		</Envoltura>
	);
}

export interface AreaTextoProps
	extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "children">,
		PropsEnvoltura {
	ref?: Ref<HTMLTextAreaElement>;
	contador?: boolean;
}

export function AreaTexto({
	ref,
	id,
	etiqueta,
	ayuda,
	error,
	opcional,
	contador = false,
	className,
	maxLength,
	value,
	defaultValue,
	onChange,
	rows = 4,
	"aria-describedby": describedby,
	...resto
}: AreaTextoProps) {
	const base = useId();
	const conContador = contador && maxLength !== undefined;
	const ids = idsDe(id ?? base, { ayuda: !!ayuda, contador: conContador, error: !!error });
	const [longitudPropia, setLongitudPropia] = useState(String(defaultValue ?? "").length);
	const longitud = value !== undefined ? String(value).length : longitudPropia;

	return (
		<Envoltura
			ids={ids}
			etiqueta={etiqueta}
			ayuda={ayuda}
			error={error}
			opcional={opcional}
			className={className}
			contador={conContador && <Contador id={ids.contador!} longitud={longitud} maximo={maxLength!} />}
		>
			<textarea
				ref={ref}
				id={ids.control}
				rows={rows}
				maxLength={maxLength}
				value={value}
				defaultValue={defaultValue}
				onChange={(evento) => {
					setLongitudPropia(evento.target.value.length);
					onChange?.(evento);
				}}
				aria-invalid={error ? true : undefined}
				aria-describedby={describe(ids, describedby)}
				className={cn(CLASE_CONTROL, "resize-y py-2.5 leading-[1.55]")}
				{...resto}
			/>
		</Envoltura>
	);
}

export interface OpcionSelector {
	valor: string;
	texto: string;
	deshabilitada?: boolean;
}

export interface SelectorProps
	extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "children" | "multiple">,
		PropsEnvoltura {
	ref?: Ref<HTMLSelectElement>;
	opciones: OpcionSelector[];
	/** Primera opción vacía («Elige un régimen»), que no se puede volver a elegir. */
	marcador?: string;
}

/**
 * `<select>` nativo (en móvil abre el selector del sistema). Fondo y color explícitos, también
 * en las opciones, para que la lista desplegable respete el tema.
 */
export function Selector({
	ref,
	id,
	etiqueta,
	ayuda,
	error,
	opcional,
	className,
	opciones,
	marcador,
	"aria-describedby": describedby,
	...resto
}: SelectorProps) {
	const base = useId();
	const ids = idsDe(id ?? base, { ayuda: !!ayuda, contador: false, error: !!error });
	const sinValor = resto.value === undefined && resto.defaultValue === undefined && marcador ? { defaultValue: "" } : {};
	return (
		<Envoltura ids={ids} etiqueta={etiqueta} ayuda={ayuda} error={error} opcional={opcional} className={className}>
			<div className="relative">
				<select
					ref={ref}
					id={ids.control}
					aria-invalid={error ? true : undefined}
					aria-describedby={describe(ids, describedby)}
					className={cn(
						CLASE_CONTROL,
						"cursor-pointer appearance-none pe-11 [&_option]:bg-superficie [&_option]:text-texto-principal",
					)}
					{...sinValor}
					{...resto}
				>
					{marcador && (
						<option value="" disabled>
							{marcador}
						</option>
					)}
					{opciones.map((o) => (
						<option key={o.valor} value={o.valor} disabled={o.deshabilitada}>
							{o.texto}
						</option>
					))}
				</select>
				<ChevronDown
					aria-hidden="true"
					className="pointer-events-none absolute inset-y-0 end-3.5 my-auto size-5 stroke-[1.5] text-texto-secundario"
				/>
			</div>
		</Envoltura>
	);
}
