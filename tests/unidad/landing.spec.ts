import { test, expect } from "@playwright/test";
import { seleccionarPlatos } from "../../lib/publico/seleccion-platos";
import { formatearImporte, formatearPrecio } from "../../lib/formato/precio";
import { formatearDia } from "../../lib/formato/fecha";
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

test("«Platos de la casa» solo con comida: fuera las categorías de bebida (Prioridad 5.1)", () => {
	const carta: CategoriaCarta[] = [
		{ id: 1, nombre: "Cervezas", tipo: "bebida", platillos: [{ id: 101, nombre: "Lager", precio: 60, imagenUrl: foto("lager") }] },
		{ id: 2, nombre: "Tacos", tipo: "comida", platillos: [{ id: 201, nombre: "Pastor", precio: 25, imagenUrl: foto("pastor") }] },
		{ id: 3, nombre: "Sin clasificar", platillos: [{ id: 301, nombre: "Algo", precio: 10, imagenUrl: foto("algo") }] },
	];
	const { menu, galeria } = seleccionarPlatos(carta);
	expect(menu.map((p) => p.id)).toEqual([201]);
	expect([...menu, ...galeria].some((p) => p.id === 101)).toBe(false);
	// Si el API aún no clasifica ninguna como comida, se excluyen solo las de bebida.
	const sinComida = carta.map((c) => (c.tipo === "comida" ? { ...c, tipo: undefined } : c));
	expect(seleccionarPlatos(sinComida).menu.map((p) => p.id).sort()).toEqual([201, 301]);
});

test("precio con espacio duro, sin decimales si es entero y nunca un cero inventado", () => {
	expect(formatearPrecio(420)).toBe("$ 420");
	expect(formatearPrecio(1250.5)).toBe("$ 1,250.5");
	expect(formatearPrecio(null)).toBeNull();
	expect(formatearPrecio(Number.NaN)).toBeNull();
	expect(formatearPrecio(-3)).toBeNull();
});

test("importe de los paneles: siempre dos decimales, espacio duro y signo menos tipográfico", () => {
	expect(formatearImporte(18420.5)).toBe("$ 18,420.50");
	expect(formatearImporte(0)).toBe("$ 0.00");
	expect(formatearImporte(-35)).toBe("−$ 35.00");
	expect(formatearImporte(undefined)).toBeNull();
	expect(formatearImporte(Number.POSITIVE_INFINITY)).toBeNull();
});

test("la vigencia se lee como el día escrito, sin desplazarse por la zona horaria", () => {
	expect(formatearDia("2026-11-30")).toBe("30 de noviembre");
	expect(formatearDia("2026-12-01")).toBe("1 de diciembre");
	expect(formatearDia("no es fecha")).toBeNull();
	expect(formatearDia(undefined)).toBeNull();
});
