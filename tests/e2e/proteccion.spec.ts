import { test, expect, type APIRequestContext } from "@playwright/test";
import { readFileSync } from "node:fs";
import { archivoSesion, type Rol } from "./roles";
import { RUTAS_API_PUBLICAS } from "../../config/seguridad/rutas-api-publicas";

// Protección de rutas en el proxy (PLAN 2.10, D-15). Contra el build de producción, sin navegador.
test.skip(process.env.E2E_MODO === "dev", "protección: se comprueba contra el build de producción");

type Sujeto = Rol | "anónimo";

const cookieDe = (sujeto: Sujeto): Record<string, string> => {
	if (sujeto === "anónimo") return {};
	const estado = JSON.parse(readFileSync(archivoSesion(sujeto), "utf8")) as { cookies: { name: string; value: string }[] };
	const sesion = estado.cookies.find((c) => c.name === "session")!.value;
	return { Cookie: `session=${sesion}` };
};

async function pedir(request: APIRequestContext, metodo: string, ruta: string, sujeto: Sujeto) {
	return request.fetch(ruta, { method: metodo, headers: cookieDe(sujeto), maxRedirects: 0, failOnStatusCode: false, data: metodo === "GET" ? undefined : {} });
}

/** Inventario de app/api (2026-11-02): ruta y métodos que exporta cada route.ts. */
const API: [string, string[]][] = [
	["/api/admin/users", ["GET", "POST"]],
	["/api/admin/users/1", ["PUT", "DELETE"]],
	["/api/auth/login", ["POST"]],
	["/api/auth/logout", ["POST"]],
	["/api/auth/me", ["GET"]],
	["/api/auth/register", ["POST"]],
	["/api/backups", ["GET", "POST", "DELETE"]],
	["/api/cron/backups", ["GET"]],
	["/api/inventory/mermas", ["GET", "POST"]],
	["/api/inventory/orders", ["GET", "POST", "PUT", "DELETE"]],
	["/api/inventory/products", ["GET", "POST", "PUT", "DELETE"]],
	["/api/inventory/products/adjust", ["POST"]],
	["/api/inventory/suppliers", ["GET", "POST", "PUT", "DELETE"]],
	["/api/menu/categories", ["GET"]],
	["/api/mesas", ["GET"]],
	["/api/public/combos", ["GET"]],
	["/api/public/cupones", ["GET"]],
	["/api/settings", ["GET", "POST"]],
];

const publica = (ruta: string, metodo: string) => RUTAS_API_PUBLICAS.some((r) => r.ruta === ruta && r.metodos.includes(metodo));

test("cada ruta de /api sin token responde 401 en JSON y sin caché, salvo las públicas documentadas", async ({ request }) => {
	const fallos: string[] = [];
	for (const [ruta, metodos] of API) {
		for (const metodo of metodos) {
			const r = await pedir(request, metodo, ruta, "anónimo");
			if (publica(ruta, metodo)) {
				// /api/auth/me ya responde 401 sin sesión por sí misma; el resto no lo bloquea el proxy.
				if (ruta !== "/api/auth/me" && r.status() === 401) fallos.push(`${metodo} ${ruta}: 401 siendo pública`);
				continue;
			}
			const cuerpo = await r.text();
			if (r.status() !== 401) fallos.push(`${metodo} ${ruta}: ${r.status()} en lugar de 401`);
			else if (cuerpo !== '{"error":"No autorizado"}') fallos.push(`${metodo} ${ruta}: cuerpo ${cuerpo.slice(0, 60)}`);
			else if (!(r.headers()["cache-control"] ?? "").includes("no-store")) fallos.push(`${metodo} ${ruta}: sin no-store`);
		}
	}
	expect(fallos).toEqual([]);
});

test("una ruta pública con otro método exige token", async ({ request }) => {
	expect((await pedir(request, "POST", "/api/menu/categories", "anónimo")).status()).toBe(401);
	expect((await pedir(request, "DELETE", "/api/auth/me", "anónimo")).status()).toBe(401);
});

test("un token inválido equivale a no tener token", async ({ request }) => {
	const r = await request.get("/api/settings", { headers: { Cookie: "session=no-es-un-jwt" }, maxRedirects: 0 });
	expect(r.status()).toBe(401);
});

test("/api/admin y /api/backups exigen el rol de administrador", async ({ request }) => {
	for (const sujeto of ["cliente", "cajero", "mesero", "cocina"] as const) {
		for (const [metodo, ruta] of [["GET", "/api/admin/users"], ["GET", "/api/backups"], ["DELETE", "/api/admin/users/1"]] as const) {
			const r = await pedir(request, metodo, ruta, sujeto);
			expect(r.status(), `${sujeto} ${metodo} ${ruta}`).toBe(403);
			expect(await r.text()).toBe('{"error":"Acceso denegado"}');
		}
	}
	// El administrador pasa el proxy (lo que responda después depende del backend).
	const r = await pedir(request, "GET", "/api/admin/users", "admin");
	expect([401, 403]).not.toContain(r.status());
});

/** Matriz rol × página: destino esperado (200, o la ruta a la que redirige). */
const MATRIZ: Record<string, Partial<Record<Sujeto, number | string>> & { resto: number | string }> = {
	"/": { resto: 200 },
	"/login": { resto: 200 },
	"/register": { resto: 200 },
	"/menu": { resto: 200 },
	"/menu/producto/1": { resto: 200 },
	"/profile": { "anónimo": "/login?callbackUrl=%2Fprofile", resto: 200 },
	"/menu/pedido": { "anónimo": "/login?callbackUrl=%2Fmenu%2Fpedido", resto: 200 },
	"/menu/pedido/checkout": { "anónimo": "/login?callbackUrl=%2Fmenu%2Fpedido%2Fcheckout", resto: 200 },
	"/dashboard/admin": { "anónimo": "/login?callbackUrl=%2Fdashboard%2Fadmin", admin: 200, resto: "/forbidden" },
	"/dashboard/cajero": { "anónimo": "/login?callbackUrl=%2Fdashboard%2Fcajero", cajero: 200, resto: "/forbidden" },
	"/dashboard/mesero": { "anónimo": "/login?callbackUrl=%2Fdashboard%2Fmesero", mesero: 200, resto: "/forbidden" },
	"/dashboard/cocina": { "anónimo": "/login?callbackUrl=%2Fdashboard%2Fcocina", cocina: 200, resto: "/forbidden" },
};

for (const sujeto of ["anónimo", "cliente", "cajero", "mesero", "cocina", "admin"] as const) {
	test(`matriz de páginas: ${sujeto}`, async ({ request }) => {
		const fallos: string[] = [];
		for (const [ruta, esperado] of Object.entries(MATRIZ)) {
			const objetivo = esperado[sujeto] ?? esperado.resto;
			const r = await pedir(request, "GET", ruta, sujeto);
			const destino = r.headers()["location"] ? new URL(r.headers()["location"], "http://x").pathname + new URL(r.headers()["location"], "http://x").search : null;
			const obtenido = r.status() === 200 ? 200 : destino ?? r.status();
			if (obtenido !== objetivo) fallos.push(`${ruta}: ${obtenido} en lugar de ${objetivo}`);
		}
		expect(fallos).toEqual([]);
	});
}
