import { test, expect, type Browser } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";

// Sitio web en administración (P1.5): `GET/PUT /sitio` simulados.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const SITIO = {
	portada: [{ url: "https://res.cloudinary.com/dcb1tspbj/image/upload/v1/ElQuijote/landing/a.jpg", publicId: "ElQuijote/landing/a", alt: "Comedor" }],
	login: null,
	registro: null,
	colorRespaldo: "#2B2119",
	telefono: "+52 771 702 8172",
	whatsapp: null,
};

async function abrir(browser: Browser, respuestaPut?: { status: number; cuerpo: unknown }) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: 1440, height: 900 } });
	const page = await contexto.newPage();
	const envios: unknown[] = [];
	await page.route(
		(url) => url.origin === "http://localhost:3100" && url.pathname === "/sitio",
		async (r) => {
			if (r.request().method() === "PUT") {
				const cuerpo = r.request().postDataJSON();
				envios.push(cuerpo);
				const resp = respuestaPut ?? { status: 200, cuerpo: { ...SITIO, ...cuerpo } };
				return r.fulfill({ status: resp.status, contentType: "application/json", body: JSON.stringify(resp.cuerpo) });
			}
			return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(SITIO) });
		},
	);
	await page.goto("/dashboard/admin/sitio", { waitUntil: "load" });
	await expect(page.getByRole("heading", { level: 1, name: "Sitio web" })).toBeVisible();
	return { contexto, page, envios };
}

test("edita portada, contacto y guarda con PUT /sitio", async ({ browser }) => {
	const { contexto, page, envios } = await abrir(browser);
	const main = page.locator("main");
	await expect(main.getByLabel("Descripción de la imagen (foto 1 de la portada)")).toHaveValue("Comedor");
	await main.getByLabel("Teléfono").fill("+52 771 111 2233");
	await main.getByLabel(/^WhatsApp/).fill("7711112233");
	await main.getByRole("button", { name: "Añadir foto a la portada" }).click();
	await main.getByRole("button", { name: "Guardar cambios" }).click();
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Sitio web guardado");
	// La foto añadida sin imagen no se envía.
	expect(envios).toEqual([{ portada: SITIO.portada, login: null, registro: null, colorRespaldo: "#2B2119", telefono: "+52 771 111 2233", whatsapp: "7711112233" }]);
	const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
	expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
	await contexto.close();
});

test("los errores de validación del API se muestran sin la ruta del campo", async ({ browser }) => {
	const { contexto, page } = await abrir(browser, {
		status: 400,
		cuerpo: { statusCode: 400, message: "Datos inválidos.", details: ["Escribe un teléfono válido (10 dígitos o con lada).", "portada.0.La imagen debe estar en la nube del restaurante."] },
	});
	await page.locator("main").getByRole("button", { name: "Guardar cambios" }).click();
	const alerta = page.locator("main").getByRole("alert");
	await expect(alerta).toContainText("Escribe un teléfono válido (10 dígitos o con lada).");
	await expect(alerta).toContainText("La imagen debe estar en la nube del restaurante.");
	await expect(alerta).not.toContainText("portada.0.");
	await contexto.close();
});
