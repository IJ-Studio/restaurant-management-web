import { expect, type APIRequestContext, type Page } from "@playwright/test";

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

/** Token del API para un usuario de prueba. El API limita a 5 inicios de sesión por minuto: ante un 429 espera y reintenta. */
export async function tokenDe(request: APIRequestContext, api: string, rol: string): Promise<string> {
	for (let intento = 0; intento < 3; intento++) {
		const r = await request.post(`${api}/auth/sign-in`, { data: { email: `${rol}@prueba.local`, password: "Prueba#2026x" } });
		if (r.status() !== 429) return ((await r.json()) as { accessToken: string }).accessToken;
		await new Promise((listo) => setTimeout(listo, 61_000));
	}
	throw new Error(`No se pudo iniciar sesión como ${rol}: límite de intentos.`);
}
