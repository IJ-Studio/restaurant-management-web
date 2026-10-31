import { test, expect } from "@playwright/test";

// Las cabeceras se comprueban solo contra el build de producción (next start):
// next dev no las emite igual. Usar sin E2E_MODO=dev.
test.skip(process.env.E2E_MODO === "dev", "cabeceras: solo contra el build de producción");

const RUTAS_PRIVADAS = [
	"/dashboard",
	"/dashboard/admin",
	"/profile",
	"/menu/pedido",
	"/login",
	"/register",
];

test.describe("rutas privadas sin caché", () => {
	// Se resuelve en el paso 2.6.
	test.fail(true, "paso 2.6: aún no se emite Cache-Control: no-store");
	for (const ruta of RUTAS_PRIVADAS) {
		test(`${ruta} responde con no-store`, async ({ request }) => {
			const r = await request.get(ruta, { maxRedirects: 0 });
			expect(r.headers()["cache-control"] ?? "").toContain("no-store");
		});
	}
});

// Se resuelve en el paso 2.2 (poweredByHeader: false).
test("no se expone X-Powered-By", async ({ request }) => {
	test.fail(true, "paso 2.2: aún se emite X-Powered-By");
	const r = await request.get("/");
	expect(r.headers()["x-powered-by"]).toBeUndefined();
});
