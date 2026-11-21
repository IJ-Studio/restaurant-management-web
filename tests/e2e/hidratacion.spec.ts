import { test, expect, type Browser, type Page } from "@playwright/test";
import { archivoSesion, type Rol } from "./roles";
import { simularApi } from "./utilidades/api-simulada";

// Hidratación sin errores, con y sin sesión. La sesión llega del store (`/api/auth/me`), que puede
// responder antes de que React hidrate un segmento en streaming (la cabecera pública, por ejemplo):
// si un componente pinta distinto con sesión durante la hidratación, React lanza #418 y regenera
// el árbol. `AppProviders` da a Redux el estado del servidor (`serverState`) para evitarlo.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const ERROR_HIDRATACION = /hydrat|#418|#423|#425/i;

const RUTAS: { rol: Rol | null; rutas: string[] }[] = [
	{ rol: null, rutas: ["/", "/menu", "/reservations", "/about", "/login"] },
	{ rol: "cliente", rutas: ["/", "/menu", "/reservations", "/about", "/promociones", "/profile", "/menu/pedido"] },
	{ rol: "admin", rutas: ["/dashboard/admin", "/dashboard/admin/menu", "/dashboard/admin/reservations", "/dashboard/admin/users"] },
	{ rol: "cajero", rutas: ["/dashboard/cajero"] },
	{ rol: "mesero", rutas: ["/dashboard/mesero"] },
	{ rol: "cocina", rutas: ["/dashboard/cocina"] },
];

async function contexto(browser: Browser, rol: Rol | null) {
	return browser.newContext(rol ? { storageState: archivoSesion(rol) } : {});
}

/** Abre la ruta y espera a que la sesión haya llegado, el streaming termine y React pinte dos fotogramas. */
async function abrir(page: Page, ruta: string) {
	const sesion = page.waitForResponse((r) => new URL(r.url()).pathname === "/api/auth/me");
	await page.goto(ruta, { waitUntil: "load" });
	await sesion;
	await page.waitForFunction(() => document.querySelectorAll('template[id^="B:"], [hidden][id^="S:"]').length === 0, undefined, { timeout: 15_000 });
	await page.evaluate(() => new Promise((listo) => requestAnimationFrame(() => requestAnimationFrame(() => listo(null)))));
}

for (const { rol, rutas } of RUTAS) {
	test(`sin errores de hidratación: ${rol ?? "sin sesión"}`, async ({ browser }) => {
		const ctx = await contexto(browser, rol);
		const page = await ctx.newPage();
		const errores: string[] = [];
		page.on("console", (m) => m.type() === "error" && ERROR_HIDRATACION.test(m.text()) && errores.push(`${page.url()}: ${m.text().slice(0, 200)}`));
		page.on("pageerror", (e) => ERROR_HIDRATACION.test(e.message) && errores.push(`${page.url()}: ${e.message.slice(0, 200)}`));
		await simularApi(page);
		// Sin sesión, /api/auth/me responde 401 como el servidor real.
		if (!rol) await page.route((u) => u.pathname === "/api/auth/me", (r) => r.fulfill({ status: 401, contentType: "application/json", body: '{"message":"No autenticado"}' }));
		for (const ruta of rutas) await abrir(page, ruta);
		expect(errores).toEqual([]);
		await ctx.close();
	});
}
