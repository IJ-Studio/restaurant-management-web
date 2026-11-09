"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Dictado por voz con la Web Speech API (extraído de `VoiceSearch`, PLAN 4.10). Si el navegador
 * no lo admite, `disponible` es `false` y no se ofrece. Los mensajes son cálidos y sin jerga (D-20).
 */
interface ResultadoDictado extends Event {
	results: ArrayLike<ArrayLike<{ transcript: string }>>;
}
interface ErrorDictado extends Event {
	error: string;
}
interface Reconocedor extends EventTarget {
	lang: string;
	interimResults: boolean;
	continuous: boolean;
	start(): void;
	abort(): void;
	onresult: ((e: ResultadoDictado) => void) | null;
	onerror: ((e: ErrorDictado) => void) | null;
	onend: (() => void) | null;
}
type ConstructorReconocedor = new () => Reconocedor;

function constructor(): ConstructorReconocedor | undefined {
	if (typeof window === "undefined") return undefined;
	const w = window as unknown as { SpeechRecognition?: ConstructorReconocedor; webkitSpeechRecognition?: ConstructorReconocedor };
	return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

const MENSAJES: Record<string, string> = {
	"not-allowed": "Permite el acceso al micrófono para buscar por voz.",
	"service-not-allowed": "Permite el acceso al micrófono para buscar por voz.",
	"no-speech": "No te escuchamos. Inténtalo de nuevo.",
	"audio-capture": "No encontramos un micrófono en este dispositivo.",
	network: "La búsqueda por voz necesita conexión.",
};

export function useDictado(alDictar: (texto: string) => void) {
	// Se lee del navegador sin efecto: en el servidor, nunca disponible.
	const disponible = useSyncExternalStore(
		() => () => {},
		() => Boolean(constructor()),
		() => false,
	);
	const [escuchando, setEscuchando] = useState(false);
	const [aviso, setAviso] = useState<string | null>(null);
	const reconocedor = useRef<Reconocedor | null>(null);

	useEffect(() => () => reconocedor.current?.abort(), []);

	const alternar = () => {
		if (escuchando) {
			reconocedor.current?.abort();
			return;
		}
		const Ctor = constructor();
		if (!Ctor) return;
		const r = new Ctor();
		r.lang = "es-MX";
		r.interimResults = true;
		r.continuous = false;
		r.onresult = (e) => {
			const texto = Array.from(e.results)
				.map((resultado) => resultado[0].transcript)
				.join("");
			// Algunos navegadores añaden un punto final al dictado.
			alDictar(texto.replace(/[.。]$/, "").trim());
		};
		r.onerror = (e) => {
			if (e.error !== "aborted") setAviso(MENSAJES[e.error] ?? "No pudimos usar el micrófono.");
		};
		r.onend = () => setEscuchando(false);
		reconocedor.current = r;
		setAviso(null);
		setEscuchando(true);
		r.start();
	};

	return { disponible, escuchando, aviso, alternar };
}
