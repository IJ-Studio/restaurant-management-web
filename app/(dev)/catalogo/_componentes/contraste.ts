// Relación de contraste WCAG 2.2 de lo que el navegador pinta de verdad: resuelve
// cualquier color CSS (también color-mix y oklab) dibujándolo en un lienzo de 1 px.

type Rgba = [number, number, number, number];

let lienzo: CanvasRenderingContext2D | null = null;

function aRgba(color: string): Rgba {
	lienzo ??= Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", {
		willReadFrequently: true,
	});
	if (!lienzo) return [0, 0, 0, 0];
	lienzo.clearRect(0, 0, 1, 1);
	lienzo.fillStyle = color;
	lienzo.fillRect(0, 0, 1, 1);
	const [r, g, b, a] = lienzo.getImageData(0, 0, 1, 1).data;
	return [r, g, b, a / 255];
}

function componer(arriba: Rgba, abajo: Rgba): Rgba {
	const a = arriba[3];
	return [0, 1, 2].map((i) => arriba[i] * a + abajo[i] * (1 - a)).concat(1) as Rgba;
}

/** Fondo opaco efectivo detrás de un elemento, sumando los fondos semitransparentes. */
function fondoEfectivo(elemento: Element): Rgba {
	const capas: Rgba[] = [];
	for (let e: Element | null = elemento; e; e = e.parentElement) {
		const capa = aRgba(getComputedStyle(e).backgroundColor);
		if (capa[3] > 0) capas.push(capa);
		if (capa[3] === 1) break;
	}
	return capas.reduceRight<Rgba>((abajo, arriba) => componer(arriba, abajo), [255, 255, 255, 1]);
}

function luminancia([r, g, b]: Rgba): number {
	const [R, G, B] = [r, g, b].map((v) => {
		const c = v / 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function relacion(primerPlano: Rgba, fondo: Rgba): number {
	const [l1, l2] = [luminancia(componer(primerPlano, fondo)), luminancia(fondo)].sort((x, y) => y - x);
	return (l1 + 0.05) / (l2 + 0.05);
}

export interface MedidaContraste {
	/** Contraste mínimo del texto visible de la muestra. */
	texto: number | null;
	/** Borde del control, anillo de foco e icono frente a lo que hay detrás (no texto, mínimo 3:1). */
	borde: number | null;
	/** Inactivo: WCAG 1.4.3 no lo exige. */
	exento: boolean;
}

function tieneTextoPropio(e: Element): boolean {
	return [...e.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
}

function esVisible(e: Element): boolean {
	const estilo = getComputedStyle(e);
	const caja = e.getBoundingClientRect();
	return estilo.visibility !== "hidden" && estilo.display !== "none" && caja.width > 1 && caja.height > 1;
}

/** Mide la muestra: texto visible, borde del control y anillo de foco si lo hay. */
export function medirMuestra(raiz: Element): MedidaContraste {
	const control = raiz.firstElementChild ?? raiz;
	const exento = control.getAttribute("aria-disabled") === "true";
	const textos = [control, ...control.querySelectorAll("*")].filter((e) => tieneTextoPropio(e) && esVisible(e));
	const texto = textos.length
		? Math.min(...textos.map((e) => relacion(aRgba(getComputedStyle(e).color), fondoEfectivo(e))))
		: null;

	const estilo = getComputedStyle(control);
	const detras = fondoEfectivo(control.parentElement ?? control);
	const medidas: number[] = [];
	if (estilo.outlineStyle !== "none" && parseFloat(estilo.outlineWidth) > 0) {
		medidas.push(relacion(aRgba(estilo.outlineColor), detras));
	}
	if (control.matches("[data-borde-control]") && parseFloat(estilo.borderTopWidth) > 0) {
		medidas.push(relacion(aRgba(estilo.borderTopColor), detras));
	}
	const icono = control.querySelector("svg");
	if (icono && esVisible(icono)) medidas.push(relacion(aRgba(getComputedStyle(icono).color), fondoEfectivo(icono)));
	return { texto, borde: medidas.length ? Math.min(...medidas) : null, exento };
}
