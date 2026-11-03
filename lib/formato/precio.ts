/**
 * Precio para la parte pública (DESIGN.md § Typography: espacio duro entre el signo y la cifra).
 * Pesos mexicanos sin decimales si son enteros. `null` si el API no envía un número válido:
 * nunca se muestra «$ 0» en lugar de un precio que falta.
 */
const formato = new Intl.NumberFormat("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export function formatearPrecio(valor: number | null | undefined): string | null {
	if (valor === null || valor === undefined || !Number.isFinite(valor) || valor < 0) return null;
	return `$ ${formato.format(valor)}`;
}
