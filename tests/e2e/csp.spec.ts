import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { RUTAS_PANEL, RUTAS_PUBLICAS } from "./rutas";
import { archivoSesion, rolParaRuta } from "./roles";
import { simularApi } from "./utilidades/api-simulada";

// CSP con nonce en modo informe (PLAN 2.3). Contra el build de producción: next dev añade
// 'unsafe-eval' y no representa la política real.
test.skip(process.env.E2E_MODO === "dev", "csp: solo contra el build de producción");
test.describe.configure({ timeout: 120_000 });

const SALIDA = join("test-results", "csp");

/** Violaciones que se toleran de forma temporal, con el paso del PLAN que las retira. */
const JUSTIFICADAS = [
	// Fotos de muestra de aboutMock.ts en el editor de «Acerca de». Sustituirlas cambia contenido y
	// permitir el origen amplía la CSP: decisión del usuario antes del 2.5 (NP-36).
	{ directiva: "img-src", bloqueado: "https://images.unsplash.com/", resuelve: "NP-36, antes del 2.5" },
];

test("la cabecera de informe lleva un nonce distinto en cada petición y Next lo pone en sus scripts", async ({ request }) => {
	const politicaDe = async () => (await request.get("/")).headers()["content-security-policy-report-only"] ?? "";
	const [a, b] = [await politicaDe(), await politicaDe()];
	const nonce = (p: string) => /'nonce-([^']+)'/.exec(p)?.[1];
	expect(nonce(a)).toBeTruthy();
	expect(nonce(a)).not.toBe(nonce(b));
	// Aún no se aplica (2.5 pendiente de aprobación): no hay cabecera Content-Security-Policy.
	expect((await request.get("/")).headers()["content-security-policy"]).toBeUndefined();
	for (const directiva of ["default-src 'self'", "'strict-dynamic'", "object-src 'none'", "frame-ancestors 'none'", "worker-src 'none'"])
		expect(a).toContain(directiva);
	expect(a).not.toContain("unsafe-eval");

	// Todo <script> del HTML que envía el servidor lleva el nonce de esa respuesta. Los que Next
	// añade después desde sus propios scripts no lo necesitan: los cubre 'strict-dynamic'.
	const respuesta = await request.get("/");
	const n = nonce(respuesta.headers()["content-security-policy-report-only"] ?? "");
	const etiquetas = (await respuesta.text()).match(/<script\b[^>]*>/g) ?? [];
	expect(etiquetas.length).toBeGreaterThan(0);
	expect(etiquetas.filter((s) => !s.includes(`nonce="${n}"`))).toEqual([]);
});

/** Visita cada ruta y devuelve las violaciones que informa el navegador. */
for (const [grupo, rutas, conSesion] of [
	["públicas", RUTAS_PUBLICAS, false],
	["de panel", RUTAS_PANEL, true],
] as const) {
	test(`violaciones de la CSP en las rutas ${grupo}`, async ({ browser }, info) => {
		test.setTimeout(30_000 * rutas.length);
		const violaciones: { ruta: string; directiva: string; bloqueado: string; origen: string }[] = [];
		for (const ruta of rutas) {
			const contexto = await browser.newContext(conSesion ? { storageState: archivoSesion(rolParaRuta(ruta)) } : {});
			const page = await contexto.newPage();
			await simularApi(page);
			await page.addInitScript(() => {
				(window as unknown as { __csp: unknown[] }).__csp = [];
				document.addEventListener("securitypolicyviolation", (e) =>
					(window as unknown as { __csp: unknown[] }).__csp.push({
						directiva: e.effectiveDirective,
						bloqueado: e.blockedURI,
						origen: `${e.sourceFile.replace(location.origin, "")}:${e.lineNumber}`,
					}),
				);
			});
			await page.goto(ruta, { waitUntil: "load" });
			await page.waitForTimeout(1500);
			const encontradas = await page.evaluate(() => (window as unknown as { __csp: { directiva: string; bloqueado: string; origen: string }[] }).__csp);
			violaciones.push(...encontradas.map((v) => ({ ruta, ...v })));
			await contexto.close();
		}
		mkdirSync(SALIDA, { recursive: true });
		writeFileSync(join(SALIDA, `violaciones-${grupo.replace(" ", "-")}-${info.project.name}.json`), JSON.stringify(violaciones, null, 1));
		console.log(`CSP ${grupo} (${info.project.name}): ${violaciones.length} violaciones`);
		for (const v of violaciones) console.log(`  ${v.ruta} · ${v.directiva} · ${v.bloqueado} · ${v.origen}`);
		// Desde el 2.4, 0 violaciones salvo las justificadas, cada una con el paso que la retira.
		const sinJustificar = violaciones.filter((v) => !JUSTIFICADAS.some((j) => j.directiva === v.directiva && v.bloqueado.includes(j.bloqueado)));
		expect(sinJustificar, JSON.stringify(sinJustificar, null, 1)).toEqual([]);
	});
}

// /about: el carrusel de reseñas conserva su animación, que pasó del <style> en línea al CSS global (2.4).
test("/about: el carrusel de reseñas sigue animado sin <style> en línea", async ({ page }) => {
	await page.goto("/about", { waitUntil: "load" });
	const carrusel = page.locator(".animate-marquee-elegant").first();
	await expect(carrusel).toBeAttached();
	expect(await carrusel.evaluate((e) => getComputedStyle(e).animationName)).toBe("marquee");
	expect(await page.locator("style:not([nonce])").count()).toBe(0);
});

// PLAN 2.8: la página de un producto que no existe no registra el notFound() como error.
test("un producto inexistente no deja un error en la consola", async ({ page }) => {
	const errores: string[] = [];
	page.on("console", (m) => {
		if (m.type() === "error") errores.push(m.text());
	});
	await simularApi(page);
	await page.goto("/menu/producto/999999", { waitUntil: "load" });
	await page.waitForTimeout(1500);
	expect(errores.filter((e) => /NEXT_|error de página|notFound/i.test(e))).toEqual([]);
});
