import { test, expect } from "@playwright/test";

// Portada con título y descripción maliciosos en el API simulado (PLAN 2.12).
const TITULO = 'Cocina <span onclick="alert(1)">honesta</span><img src=x onerror=alert(2)><script>alert(3)</script>';
const DESCRIPCION =
	'<p>Desde 1996.</p><a href="javascript:alert(4)">enlace</a><svg onload=alert(5)></svg><span onmouseover="alert(6)">casa</span>';

test("la portada muestra el marcado del API como texto, sin ejecutar nada", async ({ page }) => {
	const dialogos: string[] = [];
	const errores: string[] = [];
	page.on("dialog", async (d) => {
		dialogos.push(d.message());
		await d.dismiss();
	});
	page.on("pageerror", (e) => errores.push(e.message));
	await page.route(
		(url) => url.origin === "http://localhost:3100" && !url.pathname.startsWith("/_next"),
		async (ruta) => {
			const r = ruta.request();
			if (!["fetch", "xhr"].includes(r.resourceType())) return ruta.fallback();
			const { pathname } = new URL(r.url());
			let cuerpo: unknown = [];
			if (pathname.endsWith("/settings")) cuerpo = { heroTitle: TITULO, heroSubtitle: "Subtítulo" };
			else if (pathname === "/about")
				cuerpo = {
					description: DESCRIPCION,
					address: "Centro",
					schedule: "Todos los días",
					phone: "+52 771 702 8172",
					facebookUrl: "https://www.facebook.com/",
					mapsUrl: "https://maps.google.com/",
					reviews: [],
					galleryImages: ["/icons/icon-192.png", "/icons/icon-192.png", "/icons/icon-192.png"],
				};
			else if (pathname.endsWith("/auth/me")) return ruta.fulfill({ status: 401, contentType: "application/json", body: "{}" });
			await ruta.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(cuerpo) });
		},
	);
	await page.goto("/", { waitUntil: "load" });
	const titulo = page.locator("h1").first();
	await expect(titulo).toContainText("Cocina honesta");
	await expect(titulo.locator("em.resaltado")).toHaveText("honesta");
	await expect(titulo.locator("img, script, [onclick]")).toHaveCount(0);
	// La descripción (AboutSection) no se ve: la sección está comentada en app/page.tsx y no se
	// monta. Su conversión la cubre la prueba unitaria con las mismas cargas.
	await expect(page.locator('a[href^="javascript:"], svg[onload], [onmouseover]')).toHaveCount(0);
	await page.waitForTimeout(500);
	expect(dialogos).toEqual([]);
	expect(errores).toEqual([]);
});
