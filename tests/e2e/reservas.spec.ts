import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Reservar mesa (/reservations, PLAN 4.16). Contra el build de producción, con el API simulado
// desde el navegador. El flujo y el payload de createReservation no cambian.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const MESAS = [
	{ id: 11, numero: "4", capacidad: 2, areaId: 1, areaNombre: "Salón", estado: "disponible" },
	{ id: 12, numero: "5", capacidad: 4, areaId: 1, areaNombre: "Salón", estado: "ocupada" },
	{ id: 21, numero: "9", capacidad: 6, areaId: 2, areaNombre: "Terraza", estado: "disponible" },
];

async function abrir(page: Page, preferencias: Record<string, string> = {}) {
	const reservas: unknown[] = [];
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	await page.route(
		(url) => url.origin === "http://localhost:3100" && !url.pathname.startsWith("/_next"),
		async (r) => {
			const p = r.request();
			if (!["fetch", "xhr"].includes(p.resourceType()) || p.headers()["rsc"]) return r.fallback();
			const url = new URL(p.url());
			if (url.pathname.endsWith("/auth/me")) return r.fulfill({ status: 401, contentType: "application/json", body: '{"user":null}' });
			if (url.pathname === "/reservations" && p.method() === "POST") {
				reservas.push(JSON.parse(p.postData() ?? "{}"));
				return r.fulfill({ status: 201, contentType: "application/json", body: '{"mensaje":"Te esperamos el sábado."}' });
			}
			const cuerpo = url.pathname === "/reservations/map" ? MESAS : {};
			await r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(cuerpo) });
		},
	);
	await page.goto("/reservations", { waitUntil: "load" });
	return reservas;
}

async function rellenarHastaMesa(page: Page) {
	await page.getByLabel("Nombre completo", { exact: true }).fill("Ana López");
	await page.getByLabel("Teléfono", { exact: true }).fill("771 123 4567");
	await page.getByLabel("Correo", { exact: true }).fill("ana@correo.mx");
	// D-36: aviso de privacidad simplificado, con la casilla desmarcada.
	await expect(page.getByRole("checkbox", { name: /aviso de privacidad/ })).not.toBeChecked();
	await page.getByRole("checkbox", { name: /aviso de privacidad/ }).check();
	await page.getByRole("button", { name: "Continuar" }).click();
	await page.getByLabel("Fecha").fill("2030-06-15");
	await page.getByLabel("Hora").fill("14:30");
	await page.getByLabel("Comensales").fill("2");
	await page.getByRole("button", { name: "Ver mesas libres" }).click();
}

test("los cuatro pasos, la mesa en el plano, el mismo payload y la confirmación visible", async ({ page }) => {
	const reservas = await abrir(page);
	await expect(page.getByRole("heading", { level: 1 })).toHaveText("Reservar mesa");
	await expect(page.getByLabel("Nombre completo", { exact: true })).toHaveAttribute("autocomplete", "name");
	await expect(page.getByLabel("Teléfono", { exact: true })).toHaveAttribute("autocomplete", "tel");
	await rellenarHastaMesa(page);
	await expect(page.getByRole("button", { name: /Mesa 5/ })).toBeDisabled();
	await expect(page.getByRole("button", { name: /Mesa 5/ })).toContainText("Ocupada");
	const mesa4 = page.getByRole("button", { name: /Mesa 4/ });
	await mesa4.click();
	await expect(mesa4).toHaveAttribute("aria-pressed", "true");
	await page.getByRole("button", { name: "Continuar" }).click();
	await expect(page.locator("dl")).toContainText("Ana López");
	// Envío protegido (3.3): una persona no completa los cuatro pasos en menos de 1 s; la prueba sí.
	await page.waitForTimeout(1_100);
	await page.getByRole("button", { name: "Confirmar reserva" }).click();
	await expect(page.getByRole("heading", { name: "Mesa reservada" })).toBeVisible();
	await expect(page.getByText("Te esperamos el sábado.")).toBeVisible();
	expect(reservas).toEqual([
		{
			clienteNombre: "Ana López",
			clienteTelefono: "771 123 4567",
			clienteEmail: "ana@correo.mx",
			fechaHora: new Date("2030-06-15T14:30:00").toISOString(),
			numComensales: 2,
			mesaId: 11,
			peticionesEspeciales: "",
			ocasion: "",
		},
	]);
});

test("mientras se consulta la disponibilidad, «Continuar» espera", async ({ page }) => {
	let responder: () => void = () => {};
	const pendiente = new Promise<void>((r) => (responder = r));
	const consultas: string[] = [];
	await abrir(page);
	await page.route("**/reservations/availability?**", async (r) => {
		consultas.push(new URL(r.request().url()).search);
		await pendiente;
		await r.fulfill({ status: 200, contentType: "application/json", body: "{}" });
	});
	await rellenarHastaMesa(page);
	await page.getByRole("button", { name: /Mesa 4/ }).click();
	const continuar = page.getByRole("button", { name: "Continuar" });
	await expect(continuar).toHaveAttribute("aria-disabled", "true");
	responder();
	await expect(continuar).not.toHaveAttribute("aria-disabled", "true");
	expect(consultas.at(-1)).toBe("?fecha=2030-06-15&hora=14:30&numComensales=2");
});

test("errores por campo con los mensajes de siempre", async ({ page }) => {
	await abrir(page);
	await page.getByLabel("Correo", { exact: true }).fill("no-es-correo");
	await page.getByRole("button", { name: "Continuar" }).click();
	await expect(page.getByLabel("Nombre completo", { exact: true })).toHaveAttribute("aria-invalid", "true");
	await expect(page.getByText("El nombre es requerido")).toBeVisible();
	await expect(page.getByText("Email inválido")).toBeVisible();
	await expect(page.getByText("Para reservar, acepta el uso de tus datos para gestionar la reserva.")).toBeVisible();
});

test("el campo trampa rechaza el envío sin llamar al API", async ({ page }) => {
	const reservas = await abrir(page);
	await rellenarHastaMesa(page);
	await page.getByRole("button", { name: /Mesa 9/ }).click();
	await page.getByRole("button", { name: "Continuar" }).click();
	await page.locator('input[name="sitio_web"], form input[tabindex="-1"]').first().evaluate((e: HTMLInputElement) => (e.value = "spam"));
	await page.getByRole("button", { name: "Confirmar reserva" }).click();
	await expect(page.locator("form").getByRole("alert")).toContainText("Inténtalo de nuevo");
	expect(reservas).toEqual([]);
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[768, "normal"],
		[1440, "normal"],
	] as const) {
		test(`axe en el plano de mesas, sin desbordar: ${ancho} px, tema ${tema}`, async ({ page }, info) => {
			await page.setViewportSize({ width: ancho, height: 900 });
			await abrir(page, { tema, tamanoTexto });
			await rellenarHastaMesa(page);
			await expect(page.getByRole("button", { name: /Mesa 4/ })).toBeVisible();
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/reservas/${info.project.name}/reservas-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
		});
	}
}
