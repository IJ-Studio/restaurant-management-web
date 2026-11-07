/**
 * Primera fila de los paneles (DESIGN.md § Paneles): como mucho cuatro indicadores, el primero como
 * protagonista. Por debajo de 1280 px, la protagonista ocupa su fila y las otras tres van juntas
 * debajo (con 2 + 2 la cuarta quedaba huérfana en tableta); desde `xl`, las cuatro en una fila con
 * la protagonista más ancha. En móvil, una columna. Con tres indicadores, `REJILLA_TRES_INDICADORES`.
 */
export const REJILLA_INDICADORES =
	"grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-3 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]";
export const INDICADOR_PROTAGONISTA = "sm:col-span-3 xl:col-span-1";

export const REJILLA_TRES_INDICADORES = "grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))]";
export const PROTAGONISTA_DE_TRES = "sm:col-span-2 xl:col-span-1";
