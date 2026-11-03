import { test, expect } from "@playwright/test";
import { seleccionarPlatos } from "../../lib/publico/seleccion-platos";
import type { CategoriaCarta } from "../../lib/publico/datos-landing";

// Selección de platos de la landing (PLAN 4.4 y 4.5). Las secciones con datos se ven en el catálogo.
const foto = (id: string) => `https://res.cloudinary.com/dcb1tspbj/image/upload/v1/${id}.jpg`;
const CARTA: CategoriaCarta[] = [
	{ id: 1, nombre: "Entrantes", platillos: [
		{ id: 11, nombre: "Croquetas de jamón", precio: 120, imagenUrl: foto("croquetas") },
		{ id: 12, nombre: "Pan con tomate", precio: 60 },
		{ id: 13, nombre: "Pimientos de padrón", precio: 90, imagenUrl: foto("pimientos") },
	] },
	{ id: 2, nombre: "Arroces", platillos: [
		{ id: 21, nombre: "Paella de mariscos", precio: 380, imagenUrl: foto("paella") },
		{ id: 22, nombre: "Arroz negro", precio: 340, imagenUrl: foto("arroz-negro") },
	] },
	{ id: 3, nombre: "Postres", platillos: [{ id: 31, nombre: "Crema catalana", precio: 110 }] },
];

test("el menú toma un plato por categoría, primero con foto, y la galería no repite", () => {
	const { menu, galeria } = seleccionarPlatos(CARTA);
	expect(menu.map((p) => p.id)).toEqual([11, 21, 31, 13]);
	expect(galeria.map((p) => p.id)).toEqual([22]);
	expect(galeria.every((p) => p.imagenUrl)).toBe(true);
	expect(seleccionarPlatos([])).toEqual({ menu: [], galeria: [] });
});
