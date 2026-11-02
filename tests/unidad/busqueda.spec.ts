import { test, expect } from "@playwright/test";
import { coincide } from "../../hooks/useBusqueda";

// Coincidencia del filtro local del Buscador (PLAN 3.14). Sin navegador.
test.describe("búsqueda: coincidencia", () => {
	test("sin tildes ni mayúsculas, y todas las palabras en cualquier orden", () => {
		expect(coincide("Café de olla", "cafe")).toBe(true);
		expect(coincide("Enchiladas huastecas", "HUASTECAS ench")).toBe(true);
		expect(coincide("Mole de olla", "mole verde")).toBe(false);
		expect(coincide("Ángel Reyes", "angel")).toBe(true);
	});

	test("una consulta vacía o de espacios lo deja todo", () => {
		expect(coincide("Cecina", "")).toBe(true);
		expect(coincide("Cecina", "   ")).toBe(true);
	});
});
