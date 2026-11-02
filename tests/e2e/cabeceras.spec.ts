import { test, expect } from "@playwright/test";

// Las cabeceras se comprueban solo contra el build de producción (next start):
// next dev no las emite igual. Usar sin E2E_MODO=dev.
test.skip(process.env.E2E_MODO === "dev", "cabeceras: solo contra el build de producción");

const RUTAS_PRIVADAS = [
	"/dashboard",
	"/dashboard/admin",
	"/dashboard/cajero",
	"/profile",
	"/menu/pedido",
	"/menu/pedido/checkout",
	"/login",
	"/register",
	"/reset",
	"/frm_reset",
];

test.describe("rutas privadas sin caché", () => {
	for (const ruta of RUTAS_PRIVADAS) {
		// Paso 2.6: también la redirección del proxy (/dashboard sin sesión) lleva no-store.
		test(`${ruta} responde con no-store`, async ({ request }) => {
			const r = await request.get(ruta, { maxRedirects: 0 });
			const valor = r.headers()["cache-control"] ?? "";
			expect(valor).toContain("no-store");
			expect(valor).toContain("private");
		});
	}

	test("los estáticos versionados conservan su caché inmutable", async ({ request }) => {
		const html = await (await request.get("/")).text();
		const estatico = /\/_next\/static\/[^"]+\.js/.exec(html)?.[0];
		expect(estatico).toBeTruthy();
		expect((await request.get(estatico!)).headers()["cache-control"]).toContain("immutable");
	});
});

// Paso 2.2: poweredByHeader: false.
test("no se expone X-Powered-By", async ({ request }) => {
	const r = await request.get("/");
	expect(r.headers()["x-powered-by"]).toBeUndefined();
});

// Paso 2.2: los valores se escriben aquí a propósito, no se importan de la configuración.
const CABECERAS = {
	"strict-transport-security": "max-age=63072000; includeSubDomains; preload",
	"x-content-type-options": "nosniff",
	"x-frame-options": "DENY",
	"referrer-policy": "strict-origin-when-cross-origin",
	"permissions-policy": 'camera=(), microphone=(self), geolocation=(self), payment=(self "https://js.stripe.com"), usb=(), browsing-topics=()',
	"cross-origin-opener-policy": "same-origin-allow-popups",
	"cross-origin-resource-policy": "same-site",
	"origin-agent-cluster": "?1",
};

for (const ruta of ["/", "/menu", "/login", "/dashboard", "/icon.svg"]) {
	test(`${ruta}: cabeceras de seguridad base y sin Cross-Origin-Embedder-Policy`, async ({ request }) => {
		const r = await request.get(ruta, { maxRedirects: 0 });
		const h = r.headers();
		for (const [clave, valor] of Object.entries(CABECERAS)) expect(h[clave], clave).toBe(valor);
		expect(h["cross-origin-embedder-policy"]).toBeUndefined();
	});
}

// Paso 2.2: la Permissions-Policy deja al propio sitio la geolocalización (DistanceToRestaurant)
// y el micrófono (VoiceSearch), y bloquea la cámara. Solo Chromium expone la política al documento.
test("la política de permisos deja geolocalización y micrófono al sitio", async ({ page, browserName }) => {
	test.skip(browserName !== "chromium", "document.featurePolicy solo existe en Chromium");
	await page.goto("/", { waitUntil: "domcontentloaded" });
	const permitidos = await page.evaluate(() => {
		const politica = (document as unknown as { featurePolicy: { allowsFeature: (f: string) => boolean } }).featurePolicy;
		return { geolocalizacion: politica.allowsFeature("geolocation"), microfono: politica.allowsFeature("microphone"), camara: politica.allowsFeature("camera") };
	});
	expect(permitidos).toEqual({ geolocalizacion: true, microfono: true, camara: false });
});
