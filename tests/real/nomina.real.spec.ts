import { test, expect } from "@playwright/test";
import { entrar } from "./sesion";

// Nómina, sumas y restas (Prioridad 3.1) contra el API real y la copia local de la BD.
test("el admin registra una resta con justificación, la ve en el historial y la corrige", async ({ page }) => {
	const marca = `Prueba ${Date.now()}`;
	await entrar(page, "admin");
	await page.goto("/dashboard/admin?panel=nomina", { waitUntil: "networkidle" });
	const main = page.locator("main");
	const boton = main.getByRole("button", { name: /^Sumar o restar a / }).filter({ visible: true }).first();
	await boton.click();
	const dialogo = page.getByRole("dialog", { name: /^Sumar o restar a / });
	await dialogo.getByLabel("Monto").fill("12.34");
	await dialogo.getByLabel("Justificación").fill(marca);
	await dialogo.getByRole("button", { name: "Registrar" }).click();
	await expect(dialogo).toBeHidden({ timeout: 20_000 });
	const historial = main.getByRole("table", { name: "Historial de sumas y restas" });
	const fila = historial.locator("tr").filter({ hasText: marca });
	await expect(fila).toBeVisible({ timeout: 20_000 });
	await fila.getByRole("button", { name: /^Corregir el movimiento/ }).click();
	const corregir = page.getByRole("dialog", { name: "Corregir un movimiento" });
	await corregir.getByLabel("¿Por qué se corrige?").fill("Prueba de corrección");
	await corregir.getByRole("button", { name: "Registrar corrección" }).click();
	await expect(corregir).toBeHidden({ timeout: 20_000 });
	await expect(historial.locator("tr").filter({ hasText: marca })).toContainText("Corregido");
});
