import { test, expect, type Page } from "@playwright/test";

// Campos de formulario del catálogo (PLAN 3.3). El catálogo solo existe en next dev.
const MODO_DEV = process.env.E2E_MODO === "dev";
const CLAVE = "elquijote:preferencias";
// Tiempo mínimo de rellenado del formulario de demostración (useEnvioFormulario).
const TIEMPO_MINIMO_MS = 1_000;
const RECHAZADO = "No se pudo enviar el formulario. Inténtalo de nuevo.";

async function abrirCatalogo(page: Page, preferencias: Record<string, string> = {}) {
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...preferencias })]);
	await page.goto("/catalogo#campos", { waitUntil: "load" });
	await expect(page.locator("[data-catalogo-dev]")).toBeVisible();
	await page.waitForTimeout(400);
	return Date.now();
}

const prueba = (page: Page, id: string) => page.locator(`[data-prueba="${id}"]`);
const formulario = (page: Page) => prueba(page, "formulario");

async function rellenarValido(page: Page) {
	const f = formulario(page);
	await f.getByLabel("Nombre").fill("Ana");
	await f.getByLabel("Correo electrónico").fill("ana.lopez@correo.mx");
	await f.getByLabel("Teléfono").fill("55 1234 5678");
	await f.getByLabel("Código postal").fill("43000");
	await f.getByLabel("Personas").selectOption("2");
	await f.getByLabel("Acepto el aviso de privacidad").check();
}

/** Espera hasta que haya pasado el tiempo mínimo desde la carga. */
async function esperarTiempoMinimo(page: Page, cargado: number) {
	const resto = TIEMPO_MINIMO_MS + 300 - (Date.now() - cargado);
	if (resto > 0) await page.waitForTimeout(resto);
}

test.describe("campos de formulario del catálogo", () => {
	test.skip(!MODO_DEV, "el catálogo solo existe en next dev");
	test.describe.configure({ timeout: 180_000 });

	test("cada control tiene etiqueta; los errores se enlazan con aria-describedby y aria-invalid", async ({ page }) => {
		await abrirCatalogo(page);
		const informe = await page.locator("section#campos").evaluate((seccion) =>
			[...seccion.querySelectorAll("input, select, textarea")]
				.filter((c) => !c.closest("[aria-hidden='true']"))
				.map((c) => {
					const control = c as HTMLInputElement;
					const describe = (control.getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean);
					return {
						nombre: control.labels?.[0]?.textContent?.trim() ?? "",
						invalido: control.getAttribute("aria-invalid") === "true",
						describeExiste: describe.every((id) => document.getElementById(id)),
						errorEnlazado: describe.some((id) => document.getElementById(id)?.querySelector("svg")),
					};
				}),
		);
		expect(informe.length).toBeGreaterThan(20);
		for (const c of informe) {
			expect(c.nombre, JSON.stringify(c)).not.toBe("");
			expect(c.describeExiste, JSON.stringify(c)).toBe(true);
			// Si es inválido, uno de sus descriptores es el mensaje con icono.
			if (c.invalido) expect(c.errorEnlazado, JSON.stringify(c)).toBe(true);
		}
		expect(informe.filter((c) => c.invalido).length).toBeGreaterThanOrEqual(3);
	});

	test("autocomplete, inputmode y corrector en el formulario", async ({ page }) => {
		await abrirCatalogo(page);
		const f = formulario(page);
		const atributos = async (etiqueta: string) =>
			f.getByLabel(etiqueta).evaluate((e) => ({
				autocomplete: e.getAttribute("autocomplete"),
				inputmode: e.getAttribute("inputmode"),
				spellcheck: e.getAttribute("spellcheck"),
				type: e.getAttribute("type"),
			}));
		expect(await atributos("Nombre")).toMatchObject({ autocomplete: "given-name" });
		expect(await atributos("Correo electrónico")).toEqual({ autocomplete: "email", inputmode: "email", spellcheck: "false", type: "email" });
		expect(await atributos("Teléfono")).toEqual({ autocomplete: "tel-national", inputmode: "tel", spellcheck: "false", type: "tel" });
		expect(await atributos("Código postal")).toEqual({ autocomplete: "postal-code", inputmode: "numeric", spellcheck: "false", type: "text" });
		// El campo trampa: oculto a lectores, fuera del tabulador y sin autorrelleno.
		const trampa = f.locator("input[name='sitio_web']");
		await expect(trampa).toHaveAttribute("tabindex", "-1");
		await expect(trampa).toHaveAttribute("autocomplete", "off");
		expect(await trampa.evaluate((e) => !!e.closest("[aria-hidden='true']"))).toBe(true);
	});

	test("teclado: el tabulador recorre el formulario en orden y salta el campo trampa", async ({ page }) => {
		await abrirCatalogo(page);
		const f = formulario(page);
		await f.getByLabel("Nombre").focus();
		const orden = ["Correo electrónico", "Teléfono", "Código postal", "Personas", "Peticiones especiales", "Acepto el aviso de privacidad"];
		for (const etiqueta of orden) {
			await page.keyboard.press("Tab");
			await expect(f.getByLabel(etiqueta)).toBeFocused();
		}
		await page.keyboard.press("Space");
		await expect(f.getByLabel("Acepto el aviso de privacidad")).toBeChecked();
		await page.keyboard.press("Tab");
		const interruptor = f.getByRole("switch", { name: "Recordatorio por correo el día anterior" });
		await expect(interruptor).toBeFocused();
		await page.keyboard.press("Space");
		await expect(interruptor).toBeChecked();
		await page.keyboard.press("Tab");
		await expect(prueba(page, "enviar")).toBeFocused();
	});

	test("al enviar con errores, el foco va al primer campo inválido y se anuncia el resumen", async ({ page }) => {
		const cargado = await abrirCatalogo(page);
		await esperarTiempoMinimo(page, cargado);
		const f = formulario(page);
		await prueba(page, "enviar").click();
		const nombre = f.getByLabel("Nombre");
		await expect(nombre).toBeFocused();
		await expect(nombre).toHaveAttribute("aria-invalid", "true");
		await expect(nombre).toHaveAccessibleDescription(/Escribe tu nombre/);
		await expect(f.getByRole("status").filter({ hasText: "Revisa" })).toHaveText(
			"Revisa 6 campos: Nombre, Correo electrónico, Teléfono, Código postal, Personas, Acepto el aviso de privacidad.",
		);
		// Al corregir un campo, su error desaparece.
		await nombre.fill("Ana");
		await expect(nombre).not.toHaveAttribute("aria-invalid", "true");
		await expect(f.getByText("Escribe tu nombre.")).toHaveCount(0);
		await expect(prueba(page, "envios")).toHaveText("Envíos atendidos: 0");
	});

	test("un envío antes del tiempo mínimo espera y sale con un solo clic, una sola vez", async ({ page }) => {
		// Prioridad 2.1: antes se rechazaba y hacía falta un segundo clic. Ahora espera lo que falta.
		await abrirCatalogo(page);
		await rellenarValido(page);
		await prueba(page, "enviar").click();
		// Mientras espera, un Enter más no duplica el envío.
		await formulario(page).getByLabel("Nombre").focus();
		await page.keyboard.press("Enter");
		await expect(prueba(page, "resultado-formulario")).toHaveText("Solicitud enviada para 2 personas.", { timeout: 5_000 });
		await expect(prueba(page, "envios")).toHaveText("Envíos atendidos: 1");
		await expect(prueba(page, "error-general")).toHaveCount(0);
	});

	test("con el campo trampa relleno no se envía", async ({ page }) => {
		const cargado = await abrirCatalogo(page);
		await rellenarValido(page);
		await formulario(page).locator("input[name='sitio_web']").evaluate((e: HTMLInputElement) => (e.value = "https://spam.example"));
		await esperarTiempoMinimo(page, cargado);
		await prueba(page, "enviar").click();
		await expect(prueba(page, "error-general")).toHaveText(RECHAZADO);
		await expect(prueba(page, "envios")).toHaveText("Envíos atendidos: 0");
	});

	test("si el servidor falla, el error se anuncia y se conserva lo escrito", async ({ page }) => {
		const cargado = await abrirCatalogo(page);
		await rellenarValido(page);
		await formulario(page).getByLabel("Correo electrónico").fill("falla@ejemplo.mx");
		await esperarTiempoMinimo(page, cargado);
		await prueba(page, "enviar").click();
		await expect(prueba(page, "error-general")).toHaveAttribute("role", "alert");
		await expect(prueba(page, "error-general")).toHaveText(/No se pudo enviar la solicitud/, { timeout: 5_000 });
		await expect(formulario(page).getByLabel("Nombre")).toHaveValue("Ana");
		await expect(prueba(page, "enviar")).not.toHaveAttribute("aria-busy", "true");
	});

	test("contraseña revelable y contador de caracteres", async ({ page }) => {
		await abrirCatalogo(page);
		const seccion = page.locator("section#campos");
		const clave = seccion.getByLabel("Contraseña", { exact: true });
		const mostrar = seccion.getByRole("button", { name: "Mostrar contraseña" });
		await expect(clave).toHaveAttribute("type", "password");
		await expect(mostrar).toHaveAttribute("aria-pressed", "false");
		await mostrar.click();
		await expect(clave).toHaveAttribute("type", "text");
		await expect(mostrar).toHaveAttribute("aria-pressed", "true");

		const peticiones = formulario(page).getByLabel("Peticiones especiales");
		await peticiones.fill("Sin gluten");
		await expect(peticiones).toHaveAccessibleDescription(/10 \/ 300 caracteres/);
	});

	for (const tema of ["oscuro", "claro"] as const) {
		test(`contraste no textual de los controles y del texto escrito, tema ${tema}`, async ({ page }) => {
			await abrirCatalogo(page, { tema });
			const medidas = await page.locator("section#campos").evaluate((seccion) => {
				const ctx = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true })!;
				const rgba = (c: string) => {
					ctx.clearRect(0, 0, 1, 1);
					ctx.fillStyle = c;
					ctx.fillRect(0, 0, 1, 1);
					const d = ctx.getImageData(0, 0, 1, 1).data;
					return [d[0], d[1], d[2], d[3] / 255];
				};
				const sobre = (a: number[], b: number[]) => [0, 1, 2].map((i) => a[i] * a[3] + b[i] * (1 - a[3])).concat(1);
				const fondo = (e: Element | null) => {
					const capas: number[][] = [];
					for (; e; e = e.parentElement) {
						const c = rgba(getComputedStyle(e).backgroundColor);
						if (c[3] > 0) capas.push(c);
						if (c[3] === 1) break;
					}
					return capas.reduceRight((abajo, arriba) => sobre(arriba, abajo), [255, 255, 255, 1]);
				};
				const lum = (c: number[]) =>
					c
						.slice(0, 3)
						.map((v) => v / 255)
						.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
						.reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
				const rel = (fg: number[], bg: number[]) => {
					const [a, b] = [lum(sobre(fg, bg)), lum(bg)].sort((x, y) => y - x);
					return (a + 0.05) / (b + 0.05);
				};
				const resultado: { que: string; valor: number; minimo: number }[] = [];
				for (const c of seccion.querySelectorAll<HTMLElement>("input, select, textarea")) {
					if (c.closest("[aria-hidden='true']") || (c as HTMLInputElement).disabled) continue;
					const s = getComputedStyle(c);
					const detras = fondo(c.parentElement);
					const nombre = (c as HTMLInputElement).labels?.[0]?.textContent?.trim().slice(0, 30) ?? c.tagName;
					// El filete del control frente a lo que hay detrás y frente a su propio relleno (WCAG 1.4.11).
					resultado.push({ que: `filete ${nombre}`, valor: rel(rgba(s.borderTopColor), detras), minimo: 3 });
					if (c.getAttribute("role") === "switch") {
						const pomo = c.nextElementSibling!;
						resultado.push({ que: `pomo ${nombre}`, valor: rel(rgba(getComputedStyle(pomo).backgroundColor), rgba(s.backgroundColor)), minimo: 3 });
						continue;
					}
					if ((c as HTMLInputElement).type === "checkbox") continue;
					const relleno = fondo(c);
					resultado.push({ que: `filete sobre relleno ${nombre}`, valor: rel(rgba(s.borderTopColor), relleno), minimo: 3 });
					resultado.push({ que: `texto ${nombre}`, valor: rel(rgba(s.color), relleno), minimo: 4.5 });
					if ((c as HTMLInputElement).placeholder) {
						const marcador = getComputedStyle(c, "::placeholder").color;
						resultado.push({ que: `marcador ${nombre}`, valor: rel(rgba(marcador), relleno), minimo: 4.5 });
					}
				}
				return resultado;
			});
			expect(medidas.length).toBeGreaterThan(40);
			const fallos = medidas.filter((m) => m.valor < m.minimo);
			expect(fallos, JSON.stringify(fallos, null, 1)).toEqual([]);
		});
	}

	test("el foco real del campo pinta lo mismo que la muestra fijada", async ({ page }) => {
		await abrirCatalogo(page);
		const fijado = page.locator("section#campos input[data-demo='foco']").first();
		const real = formulario(page).getByLabel("Correo electrónico");
		await real.focus();
		const estilo = (l: typeof real) =>
			l.evaluate((e) => {
				const s = getComputedStyle(e);
				return { filete: s.borderTopColor, outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}` };
			});
		await page.waitForTimeout(300);
		expect(await estilo(real)).toEqual(await estilo(fijado));
	});
});
