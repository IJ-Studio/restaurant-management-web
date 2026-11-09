import type { Calculo } from "@/components/ui/VerCalculo";

/**
 * Desgloses «Ver cálculo» (P1.4) armados en el cliente cuando el API da las filas pero no el
 * cálculo: se construyen con las mismas filas que producen la cifra, así que siempre cuadran.
 */
type Extra = Pick<Calculo, "periodo" | "filtros">;

/** Cuántas filas cumplen: un dato por fila, con su descripción como valor. */
export function conteo<T>(formula: string, filas: readonly T[], clave: (f: T, i: number) => string, valor: (f: T) => string = () => "sí", extra: Extra = {}): Calculo {
	return { formula, operacion: "conteo", datos: filas.map((f, i) => ({ clave: clave(f, i), valor: valor(f) })), ...extra };
}

/** Suma de un valor por fila. */
export function suma<T>(formula: string, filas: readonly T[], clave: (f: T, i: number) => string, valor: (f: T) => number, extra: Extra = {}): Calculo {
	return { formula, operacion: "suma", datos: filas.map((f, i) => ({ clave: clave(f, i), valor: Math.round(valor(f) * 1000) / 1000 })), ...extra };
}

/** Un valor entre otro. */
export function cociente(formula: string, a: [string, number], b: [string, number], extra: Extra = {}): Calculo {
	return { formula, operacion: "cociente", datos: [{ clave: a[0], valor: a[1] }, { clave: b[0], valor: b[1] }], ...extra };
}
