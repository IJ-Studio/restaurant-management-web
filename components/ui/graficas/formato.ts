/** Formatos de cifras de las gráficas y los indicadores, en es-MX. Sin dependencias: lo usa también `Indicador`. */
const numero = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 });
const compacto = new Intl.NumberFormat("es-MX", { notation: "compact", maximumFractionDigits: 1 });
export const formatoPorDefecto = (n: number) => numero.format(n);

/** Espacio duro entre cifra y unidad (DESIGN.md § Typography): «8 %», no «8%» como da Intl en es-MX. */
const ESPACIO_DURO = String.fromCharCode(160);
const numeroPorcentaje = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 });
const numeroPorcentajeConSigno = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1, signDisplay: "exceptZero" });
/** `fraccion` 0.08 → «8 %»; con `signo`, «+8 %». */
export const formatoPorcentaje = (fraccion: number, signo = false) =>
	`${(signo ? numeroPorcentajeConSigno : numeroPorcentaje).format(Math.round(fraccion * 1000) / 10)}${ESPACIO_DURO}%`;

/** Texto del eje: entero por debajo de 10 000 y compacto («12 mil») si el eje llega a esa cifra. */
export const formatoEje = (n: number, maximo: number) => (maximo >= 10_000 ? compacto.format(n) : numero.format(n));
