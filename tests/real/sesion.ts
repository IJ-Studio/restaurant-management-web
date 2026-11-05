import { expect, type Page } from "@playwright/test";

/** Espera a que React haya hidratado el formulario (en WebKit con next dev, escribir antes se pierde). */
async function hidratado(page: Page) {
	await page.waitForFunction(() => {
		const form = document.querySelector("main form");
		return !!form && Object.keys(form).some((k) => k.startsWith("__reactProps"));
	});
}

/** Inicia sesión por la pantalla real con un usuario de prueba de la copia local. */
export async function entrar(page: Page, rol: "admin" | "cajero" | "mesero" | "cocina" | "cliente") {
	await page.goto("/login", { waitUntil: "networkidle" });
	await hidratado(page);
	await page.getByLabel("Correo").fill(`${rol}@prueba.local`);
	await page.getByLabel("Contraseña", { exact: true }).fill("Prueba#2026x");
	await expect(page.getByLabel("Correo")).toHaveValue(`${rol}@prueba.local`);
	await page.getByRole("button", { name: /Entrar|Iniciar sesión/ }).click();
	await expect(page).not.toHaveURL(/\/login/, { timeout: 30_000 });
}
