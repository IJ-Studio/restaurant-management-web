// Tipo mínimo de la única función que usan las pruebas unitarias. El proyecto no instala
// @types/react-dom y añadirlo sería una dependencia fuera del PLAN.
declare module "react-dom/server" {
	export function renderToStaticMarkup(elemento: import("react").ReactNode): string;
}
