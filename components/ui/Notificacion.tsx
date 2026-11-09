"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type HTMLAttributes,
	type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Boton } from "./Boton";
import { COLOR_ESTADO, ICONOS_ESTADO, type TonoEstado } from "./Aviso";

/**
 * Notificaciones flotantes (DESIGN.md § Otros componentes base). Confirman algo que acaba de
 * pasar sin interrumpir: «Reserva guardada», «Platillo eliminado · Deshacer».
 *
 * - **Anuncio:** el texto se lee en una región `aria-live="polite"` aparte, oculta a la vista; así
 *   el lector dice el mensaje y no los nombres de los botones.
 * - **Tiempo (WCAG 2.2.1):** las de información y éxito se van solas a los 6 s; el tiempo se
 *   detiene mientras el puntero o el foco están encima. Los errores y las que llevan acción se
 *   quedan hasta que se cierran.
 * - Como mucho `maximo` a la vez; al llegar otra, sale la más antigua que se puede ir sola.
 */

export interface DatosNotificacion {
	tono?: TonoEstado;
	titulo: string;
	descripcion?: string;
	/** Acción breve, como «Deshacer». Al pulsarla, la notificación se cierra. */
	accion?: { texto: string; alPulsar: () => void };
	/** Milisegundos hasta cerrarse sola; `null` la deja hasta que se cierre. */
	duracionMs?: number | null;
}

interface Notificacion extends DatosNotificacion {
	id: number;
	saliendo: boolean;
}

interface ContextoNotificaciones {
	notificar: (datos: DatosNotificacion) => number;
	descartar: (id: number) => void;
}

const Contexto = createContext<ContextoNotificaciones | null>(null);

export const DURACION_NOTIFICACION_MS = 6_000;

const duracionDe = (n: DatosNotificacion) =>
	n.duracionMs !== undefined ? n.duracionMs : n.tono === "error" || n.accion ? null : DURACION_NOTIFICACION_MS;

export function useNotificaciones(): ContextoNotificaciones {
	const contexto = useContext(Contexto);
	if (!contexto) throw new Error("useNotificaciones necesita un <ProveedorNotificaciones> por encima.");
	return contexto;
}

export function ProveedorNotificaciones({ children, maximo = 3 }: { children: ReactNode; maximo?: number }) {
	const [lista, setLista] = useState<Notificacion[]>([]);
	const [anuncio, setAnuncio] = useState("");
	const siguiente = useRef(1);

	const descartar = useCallback((id: number) => {
		setLista((actual) => actual.map((n) => (n.id === id ? { ...n, saliendo: true } : n)));
	}, []);

	const retirar = useCallback((id: number) => setLista((actual) => actual.filter((n) => n.id !== id)), []);

	const notificar = useCallback(
		(datos: DatosNotificacion) => {
			const id = siguiente.current++;
			setLista((actual) => {
				const visibles = actual.filter((n) => !n.saliendo);
				let sobran = visibles.length + 1 - maximo;
				const resultado = actual.map((n) => {
					if (sobran > 0 && !n.saliendo && duracionDe(n) !== null) {
						sobran--;
						return { ...n, saliendo: true };
					}
					return n;
				});
				return [...resultado, { ...datos, id, saliendo: false }];
			});
			// Vaciar y volver a escribir hace que el lector repita un mensaje igual al anterior.
			setAnuncio("");
			window.setTimeout(() => setAnuncio([datos.titulo, datos.descripcion].filter(Boolean).join(". ")), 50);
			return id;
		},
		[maximo],
	);

	const valor = useMemo(() => ({ notificar, descartar }), [notificar, descartar]);

	return (
		<Contexto.Provider value={valor}>
			{children}
			<p aria-live="polite" aria-atomic="true" className="solo-lectores" data-prueba="anuncio-notificacion">
				{anuncio}
			</p>
			{/* Sin región ni nombre si no hay nada: un punto de referencia vacío confunde. */}
			{lista.length > 0 && (
				<section aria-label="Notificaciones" className="pila-notificaciones">
					<ol className="m-0 flex list-none flex-col gap-2 p-0">
						{lista.map((n) => (
							<ElementoNotificacion key={n.id} notificacion={n} alDescartar={descartar} alRetirar={retirar} />
						))}
					</ol>
				</section>
			)}
		</Contexto.Provider>
	);
}

export interface VistaNotificacionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
	como?: "li" | "div";
	tono?: TonoEstado;
	titulo: string;
	descripcion?: string;
	accion?: { texto: string; alPulsar: () => void };
	alCerrar: () => void;
}

/** La notificación tal como se pinta; la usa la pila y, fija, el catálogo. */
export function VistaNotificacion({
	como: Elemento = "div",
	tono = "info",
	titulo,
	descripcion,
	accion,
	alCerrar,
	className,
	...resto
}: VistaNotificacionProps) {
	return (
		<Elemento className={cn("notificacion", COLOR_ESTADO[tono], className)} data-tono={tono} {...resto}>
			<span aria-hidden="true" className="mt-0.5 shrink-0 [&_svg]:size-5 [&_svg]:stroke-[1.5]">
				{ICONOS_ESTADO[tono]}
			</span>
			<div className="flex min-w-0 flex-1 flex-col items-start gap-2 py-0.5 text-(length:--texto-pequeno) leading-[1.5]">
				<div className="flex flex-col gap-0.5 [text-wrap:pretty]">
					<p className="m-0 font-semibold text-texto-principal">{titulo}</p>
					{descripcion && <p className="m-0 text-texto-secundario">{descripcion}</p>}
				</div>
				{accion && (
					<Boton
						variante="secundario"
						tamano="compacto"
						onClick={() => {
							accion.alPulsar();
							alCerrar();
						}}
					>
						{accion.texto}
					</Boton>
				)}
			</div>
			<Boton variante="fantasma" soloIcono icono={<X />} onClick={alCerrar} className="-my-1.5 shrink-0">
				Cerrar notificación
			</Boton>
		</Elemento>
	);
}

function ElementoNotificacion({
	notificacion: n,
	alDescartar,
	alRetirar,
}: {
	notificacion: Notificacion;
	alDescartar: (id: number) => void;
	alRetirar: (id: number) => void;
}) {
	const duracion = duracionDe(n);
	const [enPausa, setEnPausa] = useState(false);
	const restante = useRef(duracion ?? 0);

	useEffect(() => {
		if (duracion === null || enPausa || n.saliendo) return;
		const inicio = Date.now();
		const espera = window.setTimeout(() => alDescartar(n.id), restante.current);
		return () => {
			window.clearTimeout(espera);
			restante.current = Math.max(0, restante.current - (Date.now() - inicio));
		};
	}, [alDescartar, duracion, enPausa, n.id, n.saliendo]);

	return (
		<VistaNotificacion
			como="li"
			tono={n.tono}
			titulo={n.titulo}
			descripcion={n.descripcion}
			accion={n.accion}
			alCerrar={() => alDescartar(n.id)}
			data-saliendo={n.saliendo || undefined}
			data-prueba="notificacion"
			onAnimationEnd={(e) => {
				if (n.saliendo && e.target === e.currentTarget) alRetirar(n.id);
			}}
			onPointerEnter={() => setEnPausa(true)}
			onPointerLeave={() => setEnPausa(false)}
			onFocus={() => setEnPausa(true)}
			onBlur={(e) => {
				if (!e.currentTarget.contains(e.relatedTarget)) setEnPausa(false);
			}}
		/>
	);
}
