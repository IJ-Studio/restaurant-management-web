import { test, expect, type Page } from "@playwright/test";
import { archivoSesion } from "./roles";

// Límites de error por segmento (PLAN 2.17). Las páginas que fallan a propósito son page.dev.tsx:
// solo existen en next dev.
test.skip(process.env.E2E_MODO !== "dev", "las páginas de prueba solo existen en next dev");
test.describe.configure({ timeout: 120_000 });

const SEGMENTOS = [
	{ ruta: "/menu/prueba-limites", salida: { texto: "Ver la carta", href: "/menu" } },
	{ ruta: "/prueba-limites-publico", salida: { texto: "Ir al inicio", href: "/" } },
	{ ruta: "/prueba-limites-auth", salida: { texto: "Ir al inicio", href: "/" } },
	{ ruta: "/dashboard/admin/prueba-limites", salida: { texto: "Ir al panel", href: "/dashboard" }, rol: "admin" as const },
];

/** Nada interno en el DOM de la página (el aviso de errores de next dev vive en su propia raíz de sombra). */
async function sinDetalles(page: Page) {
	const dom = await page.evaluate(() => ({
		texto: document.body.innerText,
		pre: document.querySelectorAll("pre").length,
	}));
	expect(dom.pre, "ningún <pre>").toBe(0);
	for (const prohibido of ["detalle-interno", "SELECT", "token=", "/api/privado", "stack", ".tsx:"]) expect(dom.texto).not.toContain(prohibido);
	expect(dom.texto).not.toMatch(/\n\s*at \S+/);
}

for (const { ruta, salida, rol } of SEGMENTOS) {
	test.describe(ruta, () => {
		test.use(rol ? { storageState: archivoSesion(rol) } : {});

		for (const tipo of ["servidor", "cliente"] as const) {
			test(`error en el ${tipo}: mensaje genérico, Reintentar, salida y sin trazas`, async ({ page }) => {
				await page.goto(tipo === "cliente" ? `${ruta}?tipo=cliente` : ruta);
				const limite = page.locator("[data-limite-error]");
				await page.waitForLoadState("load");
				expect(new URL(page.url()).pathname).toBe(ruta);
				await expect(limite).toBeVisible({ timeout: 60_000 });
				// D-21 (4.23): página de estado; el error del servidor (con digest) es el 500, el del navegador, el genérico.
				await expect(limite.getByRole("heading", { level: 1 })).toHaveText(/Algo se nos ha pasado en la cocina|Disculpa, algo no salió como esperábamos/);
				await expect(limite.locator("svg[data-ilustracion]")).toHaveAttribute("aria-hidden", "true");
				await expect(limite.getByRole("button", { name: "Reintentar" })).toBeVisible();
				await expect(limite.getByRole("link", { name: salida.texto })).toHaveAttribute("href", salida.href);
				await sinDetalles(page);
				// El digest, si aparece, es un código corto sin espacios.
				const codigo = limite.locator("code");
				if (await codigo.count()) expect(await codigo.innerText()).toMatch(/^\S{1,40}$/);
			});
		}

		test("notFound(): página «no encontrada» del segmento", async ({ page }) => {
			await page.goto(`${ruta}?tipo=no-encontrado`);
			const nf = page.locator("[data-no-encontrado]");
			await expect(nf).toBeVisible({ timeout: 60_000 });
			await expect(nf.getByRole("heading", { name: "Aquí no hay nada servido" })).toBeVisible();
			await expect(nf.locator('svg[data-ilustracion="plato-cloche"]')).toBeVisible();
			await expect(nf.getByRole("link", { name: salida.texto })).toHaveAttribute("href", salida.href);
			await sinDetalles(page);
		});
	});
}
