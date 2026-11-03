import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { simularApi } from "./utilidades/api-simulada";

// Landing de una sola página (PLAN 4.2 a 4.9, D-19 y D-20). Contra el build de producción: los
// datos se piden en el servidor y en las pruebas no hay backend, así que la carta y las
// promociones muestran su error cálido. Su versión con datos la cubren las pruebas unitarias.
test.skip(process.env.E2E_MODO === "dev", "la landing se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const SECCIONES = ["inicio", "nosotros", "menu", "promociones", "reservas", "pedir", "visitanos"];

async function abrir(page: Page, preferencias: Record<string, string> = {}) {
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await simularApi(page);
	await page.goto("/", { waitUntil: "load" });
}

test("las siete secciones llegan en el HTML del servidor, en orden y con un solo h1", async ({ request }) => {
	const html = await (await request.get("/")).text();
	const posiciones = SECCIONES.map((id) => html.indexOf(`id="${id}"`));
	expect(posiciones.every((p) => p > 0)).toBe(true);
	expect([...posiciones].sort((a, b) => a - b)).toEqual(posiciones);
	expect(html.match(/<h1\b/g)?.length).toBe(1);
});

test("la navegación es de anclas y marca la sección visible", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 900 });
	await abrir(page);
	const nav = page.locator("header.cabecera-sitio").getByRole("navigation", { name: "Principal" });
	const hrefs = await nav.getByRole("link").evaluateAll((e) => e.map((a) => a.getAttribute("href")));
	expect(hrefs).toEqual(SECCIONES.map((id) => `/#${id}`));
	await nav.getByRole("link", { name: "Promociones" }).click();
	await expect(page).toHaveURL(/#promociones$/);
	await expect(nav.getByRole("link", { name: "Promociones" })).toHaveAttribute("aria-current", "true");
	// La cabecera fija no tapa el título de la sección.
	const [arriba, cabecera] = await page.evaluate(() => [
		document.getElementById("promociones-titulo")!.getBoundingClientRect().top,
		document.querySelector("header.cabecera-sitio")!.getBoundingClientRect().bottom,
	]);
	expect(arriba).toBeGreaterThanOrEqual(cabecera);
});

test("sin datos del API: errores cálidos con «Reintentar» y ningún texto técnico", async ({ page }) => {
	await abrir(page);
	for (const id of ["menu", "promociones"]) {
		const seccion = page.locator(`section#${id}`);
		await expect(seccion.getByRole("alert")).toBeVisible();
		await expect(seccion.getByRole("button", { name: "Reintentar" })).toBeVisible();
	}
	await expect(page.locator("main")).not.toContainText(/Error al|Intenta más tarde|Cargando|Redirigiendo|undefined|NaN|fetch|Network/);
	await expect(page.locator("section#menu").getByRole("link", { name: "Ver la carta completa" })).toHaveAttribute("href", "/menu");
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[390, "normal"],
		[768, "normal"],
		[1024, "muy-grande"],
		[1440, "normal"],
	] as const) {
		test(`axe, sin desbordar y captura: ${ancho} px, tema ${tema}, texto ${tamanoTexto}`, async ({ page }, info) => {
			await page.setViewportSize({ width: ancho, height: 900 });
			await abrir(page, { tema, tamanoTexto });
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/landing/${info.project.name}/landing-${tema}-${ancho}-${tamanoTexto}.png`, fullPage: true, animations: "disabled" });
		});
	}
}

// PLAN 4.3: el contraste del texto sobre la foto real de la portada, medido en la captura. Se
// oculta el texto, se busca el píxel más claro bajo cada línea y se compara con su color.
for (const tema of ["oscuro", "claro"] as const) {
	for (const ancho of [360, 768, 1440]) {
		test(`portada: texto y cabecera con contraste AA sobre la foto, ${ancho} px, tema ${tema}`, async ({ page }) => {
			await page.setViewportSize({ width: ancho, height: 860 });
			await abrir(page, { tema });
			const foto = page.locator(".portada img");
			await expect.poll(() => foto.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0), { timeout: 20_000 }).toBe(true);
			await expect(page.locator("header.cabecera-sitio")).toHaveAttribute("data-sobre-portada", "true");
			// La marca de agua se recorta en la entrega.
			expect(await foto.evaluate((e: HTMLImageElement) => e.currentSrc)).toContain("/c_crop,w_0.9,h_0.9,g_north_west/");

			const textos = await page.evaluate(() => {
				const lum = (c: string) => {
					const [r, g, b] = (c.match(/[\d.]+/g) ?? []).slice(0, 3).map((v) => {
						const s = Number(v) / 255;
						return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
					});
					return 0.2126 * r + 0.7152 * g + 0.0722 * b;
				};
				const elementos = [...document.querySelectorAll<HTMLElement>(".portada h1, .portada p, .portada a, .cabecera-sitio a, .cabecera-sitio button")];
				return elementos.flatMap((el) => {
					const estilo = getComputedStyle(el);
					// Los botones rellenos (primario) tienen su propio fondo de token, ya verificado.
					if (!/rgba\(0, 0, 0, 0\)|transparent/.test(estilo.backgroundColor)) return [];
					const andador = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
					const rects: DOMRect[] = [];
					for (let n = andador.nextNode(); n; n = andador.nextNode()) {
						// El texto solo para lectores no se pinta: su caja sale del recorte.
						if (!n.textContent?.trim() || (n.parentElement?.getBoundingClientRect().width ?? 0) <= 1) continue;
						const r = document.createRange();
						r.selectNodeContents(n);
						const caja = r.getBoundingClientRect();
						if (caja.width > 1 && caja.height > 1 && caja.bottom > 0 && caja.top < innerHeight) rects.push(caja);
					}
					if (!rects.length) return [];
					const x = Math.min(...rects.map((r) => r.left)), y = Math.min(...rects.map((r) => r.top));
					const w = Math.max(...rects.map((r) => r.right)) - x, h = Math.max(...rects.map((r) => r.bottom)) - y;
					const grande = parseFloat(estilo.fontSize) >= 24 || (parseFloat(estilo.fontSize) >= 18.66 && Number(estilo.fontWeight) >= 700);
					return [{ texto: el.textContent!.trim().slice(0, 30), x, y, w, h, lumTexto: lum(estilo.color), minimo: grande ? 3 : 4.5 }];
				});
			});
			expect(textos.length).toBeGreaterThan(3);

			await page.addStyleTag({ content: ".portada *, .cabecera-sitio * { color: transparent !important; text-shadow: none !important; transition: none !important; }" });
			const captura = (await page.screenshot({ path: `test-results/landing/portada-sin-texto-${tema}-${ancho}.png` })).toString("base64");
			const resultados = await page.evaluate(
				async ({ datos, textos }) => {
					const img = new Image();
					img.src = `data:image/png;base64,${datos}`;
					await img.decode();
					const lienzo = document.createElement("canvas");
					lienzo.width = img.width;
					lienzo.height = img.height;
					const ctx = lienzo.getContext("2d")!;
					ctx.drawImage(img, 0, 0);
					const escala = img.width / innerWidth;
					const canal = (v: number) => {
						const s = v / 255;
						return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
					};
					return textos.map((t) => {
						const d = ctx.getImageData(Math.floor(t.x * escala), Math.floor(t.y * escala), Math.max(1, Math.ceil(t.w * escala)), Math.max(1, Math.ceil(t.h * escala))).data;
						let peor = 0;
						for (let i = 0; i < d.length; i += 4) peor = Math.max(peor, 0.2126 * canal(d[i]) + 0.7152 * canal(d[i + 1]) + 0.0722 * canal(d[i + 2]));
						const [a, b] = [t.lumTexto, peor].sort((m, n) => n - m);
						return { texto: t.texto, ratio: Math.round(((a + 0.05) / (b + 0.05)) * 100) / 100, minimo: t.minimo };
					});
				},
				{ datos: captura, textos },
			);
			for (const r of resultados) expect(r.ratio, `${r.texto} (${tema}, ${ancho} px)`).toBeGreaterThanOrEqual(r.minimo);
		});
	}
}

test("la cabecera deja de ser transparente al pasar la portada", async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 860 });
	await abrir(page);
	const cabecera = page.locator("header.cabecera-sitio");
	await expect(cabecera).toHaveAttribute("data-sobre-portada", "true");
	await page.evaluate(() => document.getElementById("nosotros")!.scrollIntoView({ block: "start" }));
	await expect(cabecera).not.toHaveAttribute("data-sobre-portada");
	await expect(cabecera).toHaveAttribute("data-desplazada", "true");
});

// PLAN 4.7, D-19: el flujo real de reserva se abre en un panel lateral dentro de la landing.
for (const ancho of [360, 1440]) {
	test(`reservas: el formulario real en un panel lateral, con axe y cierre con Esc (${ancho} px)`, async ({ page }) => {
		await page.setViewportSize({ width: ancho, height: 900 });
		await abrir(page);
		const seccion = page.locator("section#reservas");
		await expect(seccion.locator("svg").first()).toBeVisible(); // el sello
		await expect(seccion.getByText(/Lunes a Domingo/)).toBeVisible();
		const abrirReserva = seccion.getByRole("button", { name: "Reservar mesa" });
		await abrirReserva.click();
		const panel = page.getByRole("dialog", { name: "Reservar mesa" });
		await expect(panel).toBeVisible();
		await expect(panel.locator("form")).toBeVisible({ timeout: 15_000 });
		await expect(panel.locator('input[type="tel"]')).toBeVisible(); // primer paso: los datos de contacto
		const caja = await panel.boundingBox();
		expect(caja!.width).toBeLessThanOrEqual(ancho);
		if (ancho === 1440) expect(caja!.width).toBeGreaterThan(500);
		const r = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
		// El interior del formulario se rehace en el 4.16; aquí se exige que el panel no añada violaciones propias.
		const delPanel = r.violations.filter((v) => v.nodes.some((n) => n.target.join(" ").includes("panel-lateral") || n.target.join(" ").includes("[role=\"dialog\"] > header")));
		expect(delPanel.map((v) => v.id)).toEqual([]);
		await page.keyboard.press("Escape");
		await expect(panel).toBeHidden();
		await expect(abrirReserva).toBeFocused();
	});
}

test("pedir: los dos modos con enlace a sus páginas, horario y teléfono de la configuración", async ({ page }) => {
	await abrir(page);
	const seccion = page.locator("section#pedir");
	await expect(seccion.getByRole("heading", { level: 3 })).toHaveText(["En tu mesa", "A domicilio"]);
	await expect(seccion.getByRole("link", { name: "Pedir desde la carta" })).toHaveAttribute("href", "/menu");
	await expect(seccion.getByRole("link", { name: "Ver mis pedidos a domicilio" })).toHaveAttribute("href", "/menu/pedido?tab=domicilio");
	await expect(seccion.locator("dd").first()).toHaveText(/Lunes a Domingo/);
	await expect(seccion.getByRole("link", { name: /771 702 8172/ })).toHaveAttribute("href", "tel:+527717028172");
});

test("visítanos: dirección, horario y teléfono; mapa enlazado sin iframe y redes con nombre", async ({ page }) => {
	await abrir(page);
	const seccion = page.locator("section#visitanos");
	await expect(seccion.locator("dd")).toHaveText([/Pzla\. Hidalgo 5-1/, /Lunes a Domingo/, /771 702 8172/]);
	const mapa = seccion.getByRole("link", { name: /Cómo llegar/ });
	await expect(mapa).toHaveAttribute("href", /^https:\/\/maps\.google\.com\//);
	await expect(mapa).toHaveAttribute("target", "_blank");
	await expect(mapa).toHaveAttribute("rel", "noopener noreferrer");
	await expect(page.locator("iframe")).toHaveCount(0);
	for (const red of ["Facebook", "Instagram"])
		await expect(seccion.getByRole("link", { name: `${red} de El Quijote (abre en otra pestaña)` })).toHaveAttribute("rel", "noopener noreferrer");
});
