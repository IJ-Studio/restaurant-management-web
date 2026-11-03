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

const formatoImporte = new Intl.NumberFormat("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Importe de los paneles (ventas, totales, facturas): siempre con dos decimales, para que las
 * cifras se alineen en columnas y se lean como contabilidad. Admite negativos (devoluciones,
 * egresos) con el signo menos tipográfico. `null` si no hay un número válido.
 */
export function formatearImporte(valor: number | null | undefined): string | null {
	if (valor === null || valor === undefined || !Number.isFinite(valor)) return null;
	return `${valor < 0 ? "−" : ""}$ ${formatoImporte.format(Math.abs(valor))}`;
}
