"use client";

import { useEffect, useRef } from "react";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

/**
 * Tiempo real de pedidos (paridad con la móvil): escucha `GET /pedidos/stream` (SSE del API) con la
 * sesión y llama a `alCambiar` cuando llega un evento `order`. `EventSource` no manda el token, así que
 * se lee el flujo con `fetch`. Si se corta, reconecta con espera creciente (2 s → 60 s). El sondeo de
 * cada panel sigue como respaldo.
 */
export function useEventosPedidos(alCambiar: () => void) {
	const aviso = useRef(alCambiar);
	useEffect(() => {
		aviso.current = alCambiar;
	}, [alCambiar]);

	useEffect(() => {
		let vivo = true;
		let control: AbortController | null = null;
		let espera = 2000;
		let reintento: ReturnType<typeof setTimeout> | undefined;
		let agrupado: ReturnType<typeof setTimeout> | undefined;
		// Varios cambios seguidos (p. ej., confirmar un pedido) recargan una sola vez.
		const avisar = () => {
			clearTimeout(agrupado);
			agrupado = setTimeout(() => aviso.current(), 300);
		};

		async function conectar() {
			const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
			if (!token || !API) return;
			control = new AbortController();
			try {
				const r = await fetch(`${API}/pedidos/stream`, {
					cache: "no-store",
					headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
					signal: control.signal,
				});
				if (!r.ok || !r.body) throw new Error(`stream ${r.status}`);
				espera = 2000;
				const lector = r.body.pipeThrough(new TextDecoderStream()).getReader();
				let resto = "";
				for (;;) {
					const { value, done } = await lector.read();
					if (done) break;
					resto += value;
					const bloques = resto.split("\n\n");
					resto = bloques.pop() ?? "";
					if (bloques.some((b) => /^event: ?order$/m.test(b))) avisar();
				}
			} catch {
				// Sin conexión o sesión vencida: se reintenta más tarde; el sondeo cubre mientras tanto.
			}
			if (!vivo) return;
			reintento = setTimeout(() => void conectar(), espera);
			espera = Math.min(espera * 2, 60_000);
		}

		void conectar();
		return () => {
			vivo = false;
			control?.abort();
			clearTimeout(reintento);
			clearTimeout(agrupado);
		};
	}, []);
}
