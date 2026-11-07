import type { TipoEstado } from "./PaginaEstado";

/**
 * Textos de las páginas de estado (D-17 y D-21): sobrios, cálidos y sin datos que no estén en la
 * configuración. Los usan `PaginaEstado` en el catálogo y las páginas de sistema del 4.23.
 */
export interface TextoEstado {
	tipo: TipoEstado;
	codigo?: string;
	titulo: string;
	texto: string;
}

export const TEXTOS_ESTADO = {
	noEncontrado: {
		tipo: "no-encontrado",
		codigo: "404",
		titulo: "Aquí no hay nada servido",
		texto: "La página que buscas no existe o cambió de sitio. La carta y las reservas siguen donde siempre.",
	},
	platoNoEncontrado: {
		tipo: "no-encontrado",
		codigo: "404",
		titulo: "Este plato ya no está en la carta",
		texto: "Puede que haya salido de temporada. En la carta te esperan los demás.",
	},
	categoriaNoEncontrada: {
		tipo: "no-encontrado",
		codigo: "404",
		titulo: "Esta sección de la carta no existe",
		texto: "Quizá cambió de nombre. Encontrarás todos los platos en la carta completa.",
	},
	sinSesion: {
		tipo: "sin-sesion",
		codigo: "401",
		titulo: "Primero, tu llave",
		texto: "Para entrar aquí necesitas iniciar sesión con tu cuenta.",
	},
	prohibido: {
		tipo: "prohibido",
		codigo: "403",
		titulo: "Esta puerta está cerrada",
		texto: "Tu cuenta no tiene acceso a esta parte. Si crees que debería tenerlo, habla con la gerencia.",
	},
	errorServidor: {
		tipo: "error-servidor",
		codigo: "500",
		titulo: "Algo se nos ha pasado en la cocina",
		texto: "Ya estamos en ello. Vuelve a intentarlo en un momento.",
	},
	error: {
		tipo: "error",
		titulo: "Disculpa, algo no salió como esperábamos",
		texto: "No pudimos mostrar esta página. Vuelve a intentarlo en un momento.",
	},
	mantenimiento: {
		tipo: "mantenimiento",
		titulo: "Estamos preparando la sala",
		texto: "El sitio vuelve en breve. Mientras tanto, puedes llamarnos para reservar.",
	},
	sinConexion: {
		tipo: "sin-conexion",
		titulo: "Ahora mismo no hay conexión",
		texto: "Cuando vuelvas a tener conexión, inténtalo de nuevo.",
	},
} satisfies Record<string, TextoEstado>;
