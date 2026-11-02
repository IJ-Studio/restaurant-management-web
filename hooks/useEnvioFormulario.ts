"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import type { z } from "zod";
import { erroresPorCampo } from "@/lib/validacion/formularios";
import { NOMBRE_CAMPO_TRAMPA } from "@/components/ui/CampoTrampa";

/**
 * Envío protegido de un formulario (PLAN 3.3):
 *
 * - **bloquea el envío doble** (también un Enter repetido antes de que React vuelva a pintar);
 * - valida con el esquema de zod y, si hay errores, **enfoca el primer campo inválido** en el
 *   orden del formulario y **anuncia** cuántos son en una región `aria-live`;
 * - borra el error de un campo en cuanto se corrige;
 * - no envía si el **campo trampa** llega relleno ni si el formulario se envía antes del
 *   **tiempo mínimo de rellenado** (los robots tardan milisegundos). En los dos casos se muestra
 *   un mensaje neutro y se puede volver a intentar: si una persona fue demasiado rápida, el
 *   segundo intento ya pasa.
 *
 * Los datos se leen del propio formulario por el `name` de cada control: las casillas dan un
 * booleano, los `type="number"` un número y el resto, el texto. `obtenerDatos` lo sustituye
 * para formularios con estado propio.
 */
export interface OpcionesEnvio<E extends z.ZodType> {
	esquema: E;
	alEnviar: (datos: z.output<E>) => void | Promise<unknown>;
	/** Milisegundos desde que se monta el formulario. 0 lo desactiva (p. ej., en el inicio de sesión, con autorrelleno). */
	tiempoMinimoMs?: number;
	/** `name` del campo trampa; `null` si el formulario no lleva. */
	campoTrampa?: string | null;
	obtenerDatos?: (formulario: HTMLFormElement) => unknown;
	/** Mensaje si `alEnviar` falla sin un mensaje propio. */
	mensajeError?: string;
}

const MENSAJE_NEUTRO = "No se pudo enviar. Revisa los datos e inténtalo de nuevo.";

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const esControl = (e: Element): e is Control =>
	e instanceof HTMLInputElement || e instanceof HTMLSelectElement || e instanceof HTMLTextAreaElement;

/** Lee los controles con `name`, en orden. */
export function leerFormulario(formulario: HTMLFormElement, excluir: string[] = []): Record<string, unknown> {
	const datos: Record<string, unknown> = {};
	for (const e of Array.from(formulario.elements)) {
		if (!esControl(e) || !e.name || excluir.includes(e.name) || e.disabled) continue;
		if (e instanceof HTMLInputElement && e.type === "checkbox") datos[e.name] = e.checked;
		else if (e instanceof HTMLInputElement && e.type === "radio") {
			if (e.checked) datos[e.name] = e.value;
			else datos[e.name] ??= undefined;
		} else if (e instanceof HTMLInputElement && e.type === "number") datos[e.name] = e.value === "" ? undefined : e.valueAsNumber;
		else datos[e.name] = e.value;
	}
	return datos;
}

/** Nombre visible del campo para el anuncio: su etiqueta, sin «(opcional)». */
function nombreDe(control: Control): string {
	const etiqueta = control.labels?.[0]?.textContent ?? control.getAttribute("aria-label") ?? control.name;
	return etiqueta.replace(/\s*\(opcional\)\s*$/, "").trim();
}

export function useEnvioFormulario<E extends z.ZodType>({
	esquema,
	alEnviar,
	tiempoMinimoMs = 3_000,
	campoTrampa = NOMBRE_CAMPO_TRAMPA,
	obtenerDatos,
	mensajeError = "No se pudo enviar. Revisa la conexión e inténtalo de nuevo.",
}: OpcionesEnvio<E>) {
	const [errores, setErrores] = useState<Record<string, string>>({});
	const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
	const [enviando, setEnviando] = useState(false);
	const [anuncio, setAnuncio] = useState("");
	const enCurso = useRef(false);
	const montado = useRef(0);

	useEffect(() => {
		montado.current = Date.now();
	}, []);

	const anunciar = useCallback((texto: string) => {
		// Vaciar y volver a escribir hace que el lector repita un mensaje igual al anterior.
		setAnuncio("");
		window.setTimeout(() => setAnuncio(texto), 50);
	}, []);

	const onSubmit = useCallback(
		async (evento: FormEvent<HTMLFormElement>) => {
			evento.preventDefault();
			if (enCurso.current) return;
			const formulario = evento.currentTarget;
			setErrorGeneral(null);

			const trampa = campoTrampa ? formulario.elements.namedItem(campoTrampa) : null;
			const conTrampa = trampa instanceof HTMLInputElement && trampa.value !== "";
			const demasiadoRapido = tiempoMinimoMs > 0 && Date.now() - montado.current < tiempoMinimoMs;
			if (conTrampa || demasiadoRapido) {
				setErrorGeneral(MENSAJE_NEUTRO);
				anunciar(MENSAJE_NEUTRO);
				return;
			}

			const crudos = obtenerDatos ? obtenerDatos(formulario) : leerFormulario(formulario, campoTrampa ? [campoTrampa] : []);
			const resultado = esquema.safeParse(crudos);
			if (!resultado.success) {
				const nuevos = erroresPorCampo(resultado.error);
				setErrores(nuevos);
				const invalidos = Array.from(formulario.elements).filter(
					(e): e is Control => esControl(e) && !!e.name && e.name in nuevos,
				);
				invalidos[0]?.focus();
				const nombres = [...new Set(invalidos.map(nombreDe))];
				const total = Object.keys(nuevos).length;
				anunciar(
					total === 1
						? `Revisa 1 campo: ${nombres[0] ?? "el formulario"}.`
						: `Revisa ${total} campos${nombres.length ? `: ${nombres.join(", ")}` : ""}.`,
				);
				if (nuevos._formulario) setErrorGeneral(nuevos._formulario);
				return;
			}

			setErrores({});
			enCurso.current = true;
			setEnviando(true);
			try {
				await alEnviar(resultado.data);
			} catch (error) {
				const texto = error instanceof Error && error.message ? error.message : mensajeError;
				setErrorGeneral(texto);
				anunciar(texto);
			} finally {
				enCurso.current = false;
				setEnviando(false);
			}
		},
		[alEnviar, anunciar, campoTrampa, esquema, mensajeError, obtenerDatos, tiempoMinimoMs],
	);

	/** Al corregir un campo, su error desaparece. */
	const onInput = useCallback((evento: FormEvent<HTMLFormElement>) => {
		const objetivo = evento.target;
		if (!(objetivo instanceof Element) || !esControl(objetivo) || !objetivo.name) return;
		const nombre = objetivo.name;
		setErrores((actuales) => {
			if (!(nombre in actuales)) return actuales;
			const resto = { ...actuales };
			delete resto[nombre];
			return resto;
		});
	}, []);

	return {
		/** Para el `<form>`: `<form {...propsFormulario}>`. `noValidate` deja los mensajes al sistema. */
		propsFormulario: { onSubmit, onInput, onChange: onInput, noValidate: true },
		errores,
		errorGeneral,
		enviando,
		/** Texto para `AnuncioFormulario`. */
		anuncio,
	};
}
