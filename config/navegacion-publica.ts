/**
 * Navegación pública (PLAN 3.10, DESIGN.md § Navegación pública): de qué sección de la landing
 * viene cada página de acción, para las migas de pan y el botón «Volver».
 *
 * Es un mapa estático: la ruta no depende de cómo se llegó. Las migas empiezan siempre en
 * «Inicio» y terminan en la página actual (que las páginas con parámetros nombran al usarlas:
 * la categoría o el plato).
 */

/** Anclas de la landing (DESIGN.md § Composición de la landing). */
export const SECCIONES_LANDING = {
	inicio: { nombre: "Inicio", href: "/", volver: "Volver al inicio" },
	laCasa: { nombre: "La casa", href: "/#la-casa", volver: "Volver a «La casa»" },
	carta: { nombre: "La carta", href: "/#carta", volver: "Volver a la carta" },
	promociones: { nombre: "Promociones", href: "/#promociones", volver: "Volver a promociones" },
	reservar: { nombre: "Reservar", href: "/#reservar", volver: "Volver a «Reservar»" },
	pedir: { nombre: "Pedir", href: "/#pedir", volver: "Volver a «Pedir»" },
	visitanos: { nombre: "Visítanos", href: "/#visitanos", volver: "Volver a «Visítanos»" },
} as const;

export interface Miga {
	nombre: string;
	href: string;
	/** Texto de «Volver» cuando esta miga es el origen; nombra el destino. */
	volver?: string;
}

export interface RutaPublica {
	/** Patrón de la ruta, con `[parametro]` para los segmentos variables. */
	patron: string;
	/** Nombre de la página en la última miga (las de parámetros lo sustituyen). */
	titulo: string;
	/** Migas intermedias, entre «Inicio» y la página actual. */
	padres: Miga[];
	/** A dónde vuelve «Volver» si no se puede usar el historial. */
	origen: Miga;
}

const { inicio, laCasa, carta, promociones, reservar, pedir } = SECCIONES_LANDING;
const MENU: Miga = { nombre: "La carta", href: "/menu", volver: "Volver a la carta" };
const PEDIDO: Miga = { nombre: "Tu pedido", href: "/menu/pedido", volver: "Volver a tu pedido" };
const ACCESO: Miga = { nombre: "Iniciar sesión", href: "/login", volver: "Volver a iniciar sesión" };

export const RUTAS_PUBLICAS: RutaPublica[] = [
	{ patron: "/menu", titulo: "La carta", padres: [], origen: carta },
	{ patron: "/menu/categoria/[slug]", titulo: "Categoría", padres: [MENU], origen: MENU },
	{ patron: "/menu/producto/[id]", titulo: "Plato", padres: [MENU], origen: MENU },
	{ patron: "/menu/pedido", titulo: "Tu pedido", padres: [{ nombre: pedir.nombre, href: pedir.href }], origen: pedir },
	{ patron: "/menu/pedido/checkout", titulo: "Pago", padres: [{ nombre: pedir.nombre, href: pedir.href }, PEDIDO], origen: PEDIDO },
	{ patron: "/menu/pedido/checkout/exito", titulo: "Pedido confirmado", padres: [{ nombre: pedir.nombre, href: pedir.href }], origen: pedir },
	{ patron: "/reservations", titulo: "Reservar mesa", padres: [], origen: reservar },
	{ patron: "/promociones", titulo: "Promociones", padres: [], origen: promociones },
	{ patron: "/about", titulo: "La casa", padres: [], origen: laCasa },
	{ patron: "/login", titulo: "Iniciar sesión", padres: [], origen: inicio },
	{ patron: "/register", titulo: "Crear cuenta", padres: [ACCESO], origen: ACCESO },
	{ patron: "/reset", titulo: "Recuperar contraseña", padres: [ACCESO], origen: ACCESO },
	{ patron: "/frm_reset", titulo: "Nueva contraseña", padres: [ACCESO], origen: ACCESO },
	{ patron: "/profile", titulo: "Tu cuenta", padres: [], origen: inicio },
	// Páginas del pie: vuelven al inicio. Los títulos son los de cada página.
	{ patron: "/ayuda", titulo: "Ayuda", padres: [], origen: inicio },
	{ patron: "/corporativo", titulo: "Información corporativa", padres: [], origen: inicio },
	{ patron: "/privacidad", titulo: "Aviso de privacidad", padres: [], origen: inicio },
	{ patron: "/condiciones", titulo: "Condiciones de uso", padres: [], origen: inicio },
	{ patron: "/devoluciones", titulo: "Devoluciones y reemplazos", padres: [], origen: inicio },
	{ patron: "/seguridad", titulo: "Alertas de seguridad", padres: [], origen: inicio },
];

const coincide = (patron: string, ruta: string) => {
	const a = patron.split("/").filter(Boolean);
	const b = ruta.split("?")[0].split("#")[0].replace(/\/+$/, "").split("/").filter(Boolean);
	return a.length === b.length && a.every((s, i) => (s.startsWith("[") && s.endsWith("]")) || s === b[i]);
};

/** La configuración de una ruta, o `null` si no es una página de acción pública (p. ej., la landing). */
export function rutaPublica(ruta: string): RutaPublica | null {
	return RUTAS_PUBLICAS.find((r) => coincide(r.patron, ruta)) ?? null;
}
