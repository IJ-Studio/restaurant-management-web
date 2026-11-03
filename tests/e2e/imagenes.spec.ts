import { test, expect } from "@playwright/test";
import { resolverOrigen } from "@/lib/imagen/origen";
import { cargadorCloudinary } from "@/lib/imagen/cargador-cloudinary";
import { simularApi } from "./utilidades/api-simulada";

// PLAN 1.9: cargador de Cloudinary, hosts permitidos y respaldo que sí existe.
const NUBE = "https://res.cloudinary.com/dcb1tspbj/image/upload/";
const CARGADOR = /^https:\/\/res\.cloudinary\.com\/dcb1tspbj\/image\/upload\/f_auto,q_auto,c_limit,w_\d+\//;

test.describe("origen de las imágenes", () => {
	test.skip(({ browserName }) => browserName !== "chromium", "no usa navegador: basta con un proyecto");

	test("acepta solo rutas locales, la nube de la casa y los hosts permitidos", () => {
		const casos: Array<[string, { src: string; cloudinary: boolean } | null]> = [
			["/icons/icon-192.png", { src: "/icons/icon-192.png", cloudinary: false }],
			["food-3955317_1280_zstvf7", { src: "food-3955317_1280_zstvf7", cloudinary: true }],
			["food-3955317_1280_zstvf7.jpg", { src: "food-3955317_1280_zstvf7.jpg", cloudinary: true }],
			["ElQuijote/menu/paella.jpg", { src: "ElQuijote/menu/paella.jpg", cloudinary: true }],
			[".oculto", null],
			["ElQuijote/.oculto", null],
			[`${NUBE}q_auto/f_auto/v1776/logo.svg`, { src: "v1776/logo.svg", cloudinary: true }],
			[`${NUBE}c_limit,w_400/v1/a/b.png`, { src: "v1/a/b.png", cloudinary: true }],
			[
				"https://mdygrtdebtmuhmirnbxz.supabase.co/storage/v1/object/public/platos/a.jpg",
				{ src: "https://mdygrtdebtmuhmirnbxz.supabase.co/storage/v1/object/public/platos/a.jpg", cloudinary: false },
			],
			["https://res.cloudinary.com/otra-nube/image/upload/a.jpg", null],
			["http://res.cloudinary.com/dcb1tspbj/image/upload/a.jpg", null],
			["https://res.cloudinary.com:8443/dcb1tspbj/image/upload/a.jpg", null],
			["https://usuario:clave@res.cloudinary.com/dcb1tspbj/image/upload/a.jpg", null],
			[`${NUBE}a.jpg?x=1`, null],
			["https://lh3.googleusercontent.com/gps-cs-s/abc", null],
			["https://images.unsplash.com/photo-1", null],
			["https://i.pravatar.cc/150", null],
			["javascript:alert(1)", null],
			["data:image/svg+xml,<svg/>", null],
			["//res.cloudinary.com/dcb1tspbj/image/upload/a.jpg", null],
			["/../secreto", null],
			["a/../../b", null],
			["con espacio.jpg", null],
			["", null],
		];
		for (const [entrada, esperado] of casos) {
			const r = resolverOrigen(entrada);
			expect(r && { src: r.src, cloudinary: r.loader === cargadorCloudinary }, entrada).toEqual(esperado);
		}
		expect(resolverOrigen(null)).toBeNull();
		expect(cargadorCloudinary({ src: "v1/a.jpg", width: 640 })).toBe(`${NUBE}f_auto,q_auto,c_limit,w_640/v1/a.jpg`);
	});
});

test.describe("imágenes en las páginas", () => {
	test.describe.configure({ timeout: 90_000 });
	test.use({ viewport: { width: 1440, height: 900 } });

	test("el fondo del login sale de Cloudinary con el cargador y el ID correcto", async ({ page }) => {
		const pedidas: string[] = [];
		page.on("request", (r) => pedidas.push(r.url()));
		await simularApi(page);
		await page.goto("/login", { waitUntil: "load" });
		const fondo = page.locator('img[src*="food-3955317_1280_zstvf7"]');
		await expect(fondo).toBeVisible();
		await expect.poll(() => fondo.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
		expect(await fondo.getAttribute("src")).toMatch(CARGADOR);
		expect(await fondo.getAttribute("alt")).toBe("");
		expect(await fondo.getAttribute("sizes")).toBe("(min-width: 1024px) 50vw, 100vw");
		// Ya no se pide el ID sin sufijo que daba 404 (NP-33).
		expect(pedidas.filter((u) => /food-3955317_1280(?!_zstvf7)/.test(u))).toEqual([]);
	});

	for (const [ruta, id] of [
		["/login", "food-3955317_1280_zstvf7.jpg"],
		["/register", "meal-4840665_1280_azmrqq.jpg"],
	] as const) {
		test(`el fondo de ${ruta} no cambia de foto al leer los ajustes tras hidratar`, async ({ page }) => {
			const ids = new Set<string>();
			page.on("request", (r) => {
				const m = r.url().match(/\/image\/upload\/f_auto,q_auto,c_limit,w_\d+\/(.+)$/);
				if (m) ids.add(m[1]);
			});
			await simularApi(page);
			await page.goto(ruta, { waitUntil: "load" });
			await page.waitForTimeout(1_500);
			expect([...ids]).toEqual([id]);
		});
	}

	test("si Cloudinary no responde, el login muestra el respaldo y no una caja vacía", async ({ page }) => {
		await page.route("https://res.cloudinary.com/**", (r) => r.abort());
		await simularApi(page);
		await page.goto("/login", { waitUntil: "load" });
		const respaldo = page.locator("[data-respaldo-imagen]");
		await expect(respaldo).toBeVisible();
		await expect(respaldo).toHaveAttribute("aria-hidden", "true");
		const caja = await respaldo.boundingBox();
		expect(caja!.width).toBeGreaterThan(300);
		expect(caja!.height).toBeGreaterThan(500);
		expect(await respaldo.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe("rgb(43, 33, 25)"); // --color-superficie-cafe, oscuro
		await expect(respaldo.locator("svg path")).toHaveCount(1);
		await expect(page.locator('img[src*="res.cloudinary.com"]')).toHaveCount(0);
	});

	test("la fachada de /about muestra el respaldo con su alt y no pide la foto de Google", async ({ page }) => {
		const google: string[] = [];
		page.on("request", (r) => {
			if (r.url().includes("googleusercontent.com")) google.push(r.url());
		});
		await simularApi(page);
		await page.goto("/about", { waitUntil: "load" });
		const fachada = page.getByRole("img", { name: "Fachada Adaptada El Quijote" });
		await expect(fachada).toBeVisible();
		await expect(fachada).toHaveAttribute("data-respaldo-imagen", "");
		const caja = await fachada.boundingBox();
		expect(caja!.width).toBeGreaterThan(150);
		expect(caja!.height).toBeGreaterThan(150);
		expect(google).toEqual([]);
	});

	// PLAN 4.3 y 4.10: la foto de portada vive ahora solo en la landing (/menu ya no la repite).
	test("la portada de la landing se precarga desde Cloudinary con el cargador y el recorte", async ({ page }) => {
		await simularApi(page);
		await page.goto("/", { waitUntil: "load" });
		const portada = page.locator('img[src*="Gemini_Generated_Image"]');
		await expect(portada).toBeVisible();
		expect(await portada.getAttribute("src")).toContain("/c_crop,w_0.9,h_0.9,g_north_west/f_auto,q_auto,c_limit,w_");
		// En Next 16, `preload` (antes `priority`) añade la precarga en <head>; no pone fetchpriority.
		await expect(page.locator('head link[rel="preload"][as="image"][imagesrcset*="Gemini_Generated_Image"]')).toHaveCount(1);
		await expect.poll(() => portada.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
	});
});
