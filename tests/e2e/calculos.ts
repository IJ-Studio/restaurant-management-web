import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Abre cada «Ver cálculo» visible y rehace el resultado desde el desglose (P1.4): suma de los
 * valores, número de datos o cociente, según la operación que declara. Devuelve cuántos comprobó.
 */
export async function comprobarCalculos(page: Page, alcance: Locator = page.locator("main")): Promise<string[]> {
	const botones = alcance.getByRole("button", { name: /^Ver cálculo de / }).filter({ visible: true });
	const nombres = await botones.evaluateAll((bs) => bs.map((b) => b.getAttribute("aria-label") ?? ""));
	for (const nombre of nombres) {
		await alcance.getByRole("button", { name: nombre, exact: true }).filter({ visible: true }).first().click();
		const dialogo = page.getByRole("dialog", { name: /^Cálculo: / });
		const caja = dialogo.locator("[data-calculo]");
		await expect(caja).toBeVisible();
		const operacion = await caja.getAttribute("data-operacion");
		const valores = (await caja.locator("tr[data-clave]").evaluateAll((filas) => filas.map((f) => f.getAttribute("data-valor") ?? ""))).map(Number);
		const esperado = Number(await caja.locator("[data-resultado]").getAttribute("data-resultado-valor"));
		const rehecho =
			operacion === "conteo" ? valores.length : operacion === "cociente" ? (valores[1] ? Math.round((valores[0] / valores[1]) * 100) / 100 : 0) : Math.round(valores.reduce((s, v) => s + v * 100, 0)) / 100;
		expect(rehecho, nombre).toBeCloseTo(esperado, 2);
		await page.keyboard.press("Escape");
		await expect(dialogo).toBeHidden();
	}
	return nombres;
}
