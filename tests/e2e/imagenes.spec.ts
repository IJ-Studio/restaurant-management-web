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
			["image_l57jar", { src: "image_l57jar", cloudinary: true }],
			["image_l57jar.jpg", { src: "image_l57jar.jpg", cloudinary: true }],
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
			["https://fotos.example.com/abc", null],
			["https://images.example.org/photo-1", null],
			["https://avatares.example.net/150", null],
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

	test("el fondo del login es una imagen propia de la nube, con el cargador", async ({ page }) => {
		const pedidas: string[] = [];
		page.on("request", (r) => pedidas.push(r.url()));
		await simularApi(page);
		await page.goto("/login", { waitUntil: "load" });
		const fondo = page.locator('img[src*="image_l57jar"]');
		await expect(fondo).toBeVisible();
		await expect.poll(() => fondo.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
		expect(await fondo.getAttribute("src")).toMatch(CARGADOR);
		expect(await fondo.getAttribute("alt")).toBe("");
		expect(await fondo.getAttribute("sizes")).toBe("(min-width: 1024px) 50vw, 100vw");
		// Solo imágenes propias (D-23): ninguna petición a otro host de imágenes.
		expect(pedidas.filter((u) => /\.(jpe?g|png|webp|avif)(\?|$)/i.test(u) && !u.includes("res.cloudinary.com/dcb1tspbj/") && !u.startsWith("http://localhost"))).toEqual([]);
	});

	for (const [ruta, id] of [
		["/login", "image_l57jar"],
		["/register", "image_l57jar"],
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

	// PLAN 4.21 y D-18: /about ya no lleva la foto de Google de la fachada ni el mapa incrustado.
	test("/about no pide la foto de Google ni incrusta el mapa", async ({ page }) => {
		const google: string[] = [];
		page.on("request", (r) => {
			if (/googleusercontent\.com|google\.com\/maps\/embed/.test(r.url())) google.push(r.url());
		});
		await simularApi(page);
		await page.goto("/about", { waitUntil: "load" });
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
		await expect(page.locator("iframe")).toHaveCount(0);
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
