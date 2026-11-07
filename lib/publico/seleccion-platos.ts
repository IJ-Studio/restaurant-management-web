import type { CategoriaCarta, PlatoCarta } from "./datos-landing";

export interface PlatoDestacado extends PlatoCarta {
	categoria: string;
}

/**
 * Reparte los platos que envía el API entre la sección «Menú» y la galería de «Nosotros»
 * (PLAN 4.4 y 4.5, D-19). Sin inventar nada: solo platos reales, en el orden del API.
 *
 * - **Menú («Platos de la casa»):** solo comida (Prioridad 5.1): las categorías que el API marca
 *   como `comida`; si ninguna está clasificada, las que no son `bebida`. Hasta `enMenu` platos, uno
 *   por categoría mientras se pueda, primero los que traen foto.
 * - **Galería:** hasta `enGaleria` fotos de otros platos, ninguno repetido con el menú.
 */
export function seleccionarPlatos(carta: CategoriaCarta[], enMenu = 4, enGaleria = 3) {
	const comida = carta.some((c) => c.tipo === "comida") ? carta.filter((c) => c.tipo === "comida") : carta.filter((c) => c.tipo !== "bebida");
	const todos: PlatoDestacado[] = comida.flatMap((c) => c.platillos.map((p) => ({ ...p, categoria: c.nombre })));
	const conFoto = (p: PlatoDestacado) => Boolean(p.imagenUrl);
	const ordenados = [...todos.filter(conFoto), ...todos.filter((p) => !conFoto(p))];

	const menu: PlatoDestacado[] = [];
	const usadas = new Set<string>();
	for (const p of ordenados) {
		if (menu.length === enMenu) break;
		if (!usadas.has(p.categoria)) {
			menu.push(p);
			usadas.add(p.categoria);
		}
	}
	for (const p of ordenados) {
		if (menu.length === enMenu) break;
		if (!menu.includes(p)) menu.push(p);
	}
	const galeria = ordenados.filter((p) => conFoto(p) && !menu.includes(p)).slice(0, enGaleria);
	return { menu, galeria };
}
