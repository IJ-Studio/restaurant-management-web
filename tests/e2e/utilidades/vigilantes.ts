import type { Page } from "@playwright/test";
import { EXCEPCIONES, cubre } from "../excepciones";

export interface Hallazgo {
	tipo: "consola" | "pagina" | "red" | "http" | "imagen" | "dimensiones" | "desborde" | "csp";
	detalle: string;
}

/** Engancha los vigilantes a la página y devuelve la lista viva de hallazgos. */
export function vigilar(page: Page): Hallazgo[] {
	const hallazgos: Hallazgo[] = [];
	page.on("console", (m) => {
		if (m.type() === "error" || m.type() === "warning") {
			// WebKit no pone la URL en el texto de «Failed to load resource»: va en el origen del mensaje.
			const origen = m.location().url;
			const texto = origen && !m.text().includes(origen) ? `${m.text()} [${origen}]` : m.text();
			hallazgos.push({ tipo: "consola", detalle: `${m.type()}: ${texto}` });
		}
	});
	page.on("pageerror", (e) => hallazgos.push({ tipo: "pagina", detalle: e.message }));
	page.on("requestfailed", (r) =>
		hallazgos.push({ tipo: "red", detalle: `${r.url()} ${r.failure()?.errorText ?? ""}` }),
	);
	page.on("response", (r) => {
		if (r.status() >= 400) hallazgos.push({ tipo: "http", detalle: `${r.status()} ${r.url()}` });
	});
	return hallazgos;
}

/** Instala el captador de violaciones de CSP; llamar antes de navegar. */
export async function vigilarCsp(page: Page) {
	await page.addInitScript(() => {
		(window as unknown as { __csp: string[] }).__csp = [];
		document.addEventListener("securitypolicyviolation", (e) =>
			(window as unknown as { __csp: string[] }).__csp.push(`${e.violatedDirective} ${e.blockedURI}`),
		);
	});
}

/** Comprobaciones del DOM: imágenes rotas, desborde horizontal y violaciones de CSP. */
export async function inspeccionarDom(page: Page): Promise<Hallazgo[]> {
	const r = await page.evaluate(() => ({
		rotas: [...document.images]
			.filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc)
			.map((i) => i.currentSrc),
		// PLAN 1.9: toda <img> reserva su caja (width y height, o fill de next/image con sizes).
		sinDimensiones: [...document.images]
			.filter((i) =>
				i.dataset.nimg === "fill" ? !i.getAttribute("sizes") : !(i.getAttribute("width") && i.getAttribute("height")),
			)
			.map((i) => i.getAttribute("src") ?? ""),
		desborde: document.documentElement.scrollWidth > document.documentElement.clientWidth,
		csp: (window as unknown as { __csp?: string[] }).__csp ?? [],
	}));
	const h: Hallazgo[] = [];
	r.rotas.forEach((src) => h.push({ tipo: "imagen", detalle: src }));
	r.sinDimensiones.forEach((src) => h.push({ tipo: "dimensiones", detalle: src }));
	if (r.desborde) h.push({ tipo: "desborde", detalle: "scrollWidth > clientWidth" });
	r.csp.forEach((c) => h.push({ tipo: "csp", detalle: c }));
	return h;
}

/** Quita los hallazgos cubiertos por una excepción documentada. */
export function sinExcepciones(hallazgos: Hallazgo[]): Hallazgo[] {
	return hallazgos.filter(
		(h) => !EXCEPCIONES.some((e) => cubre(e, h.tipo, h.detalle)),
	);
}
