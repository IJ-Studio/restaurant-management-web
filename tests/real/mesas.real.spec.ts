import { test, expect } from "@playwright/test";
import { entrar } from "./sesion";

// Mesas (Prioridad 1.3) contra el API real y la copia local de la BD.
test("el admin añade, edita y da de baja una mesa; la que tiene historial solo se desactiva", async ({ page }) => {
	const numero = `P${String(Date.now()).slice(-5)}`;
	await entrar(page, "admin");
	await page.goto("/dashboard/admin/mesas", { waitUntil: "networkidle" });
	const main = page.locator("main");
	const tabla = main.getByRole("table", { name: "Mesas" });
	await expect(tabla.locator("tbody tr").first()).toBeVisible({ timeout: 20_000 });

	await main.getByRole("button", { name: "Mesa nueva" }).click();
	const nueva = page.getByRole("dialog", { name: "Mesa nueva" });
	await nueva.getByLabel("Número").fill(numero);
	await nueva.getByLabel("Capacidad").fill("3");
	await nueva.getByLabel("Área").selectOption({ label: "Terraza" });
	await nueva.getByRole("button", { name: "Añadir mesa" }).click();
	await expect(nueva).toBeHidden({ timeout: 20_000 });
	const fila = tabla.locator("tbody tr").filter({ hasText: numero });
	await expect(fila).toContainText("Terraza", { timeout: 20_000 });

	await main.getByRole("button", { name: `Editar la mesa ${numero}` }).filter({ visible: true }).click();
	const editar = page.getByRole("dialog", { name: `Editar la mesa ${numero}` });
	await editar.getByLabel("Capacidad").fill("5");
	await editar.getByRole("button", { name: "Guardar cambios" }).click();
	await expect(editar).toBeHidden({ timeout: 20_000 });
	await expect(fila).toContainText("5 pers.", { timeout: 20_000 });

	// Sin historial: se borra (queda archivada).
	await main.getByRole("button", { name: `Dar de baja la mesa ${numero}` }).filter({ visible: true }).click();
	await page.getByRole("alertdialog").getByRole("button", { name: "Eliminar mesa" }).click();
	await expect(fila).toHaveCount(0, { timeout: 20_000 });

	// Con historial (S01 tiene órdenes en la copia): se desactiva, y se vuelve a activar.
	const s01 = tabla.locator("tbody tr").filter({ hasText: "S01" });
	await main.getByRole("button", { name: "Dar de baja la mesa S01" }).filter({ visible: true }).click();
	await page.getByRole("alertdialog").getByRole("button", { name: "Desactivar mesa" }).click();
	await expect(s01).toContainText("Inactiva", { timeout: 20_000 });
	await main.getByRole("button", { name: "Activar la mesa S01" }).filter({ visible: true }).click();
	await expect(s01).toContainText("Activa", { timeout: 20_000 });
});
