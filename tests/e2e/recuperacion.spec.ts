import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Recuperar la contraseña (/frm_reset y /reset, PLAN 4.19): aviso en español y salidas reales (NP-16).
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

for (const [ruta, titulo] of [
	["/frm_reset", "Recuperar contraseña"],
	["/reset", "Nueva contraseña"],
] as const) {
	test(`${ruta}: aviso en español, llamar o volver, sin inglés y con axe limpio`, async ({ page }) => {
		await page.goto(ruta, { waitUntil: "load" });
		await expect(page.getByRole("heading", { level: 1 })).toHaveText(titulo);
		await expect(page.getByText("Todavía no puedes hacerlo desde aquí")).toBeVisible();
		await expect(page.getByRole("link", { name: /Llamar al/ })).toHaveAttribute("href", "tel:+527717028172");
		await expect(page.getByRole("link", { name: "Ir a iniciar sesión" })).toHaveAttribute("href", "/login");
		await expect(page.locator("main")).not.toContainText(/Password|Firebase|Supabase|disabled/);
		const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
		expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
	});
}
