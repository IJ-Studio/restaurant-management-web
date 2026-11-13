import { test, expect, type Browser, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { archivoSesion } from "./roles";
import { comprobarCalculos } from "./calculos";

// Carta en administración (PLAN 5.9; D-24 y D-31). Contra el build de producción, con sesión de admin,
// `/platillos*`, la firma de imágenes y Cloudinary simulados: todo cambio llega al servidor.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const CLAVE = "elquijote:preferencias";
const FILAS_BD = [
	{ id: 11, categoria_id: 1, nombre: "Croquetas de jamón", descripcion_corta: "Seis piezas", precio: 120, disponible: true, es_popular: true, tiempo_preparacion: 12 },
	{ id: 12, categoria_id: 1, nombre: "Gazpacho", descripcion_corta: "Andaluz, frío", precio: 95, disponible: false, tiempo_preparacion: 5 },
	{ id: 21, categoria_id: 2, nombre: "Paella valenciana", descripcion_corta: "Para dos", precio: 640, disponible: true, tiempo_preparacion: 35 },
];

// Lo que devuelve `POST /platillos/importar` al reemplazar: una fila con error, y la paella no viene.
const PLAN = {
	nuevos: [{ fila: 2, nombre: "Tortilla de patatas", categoria: "Categoría 1", precio: 140, existenteId: null }],
	actualizados: [{ fila: 3, nombre: "Croquetas de jamón", categoria: "Categoría 1", precio: 125, existenteId: 11 }],
	deshabilitar: [{ id: 21, nombre: "Paella valenciana" }],
	categoriasNuevas: [],
	avisos: [],
	errores: [{ fila: 4, mensaje: "El precio debe ser un número mayor que 0." }],
};

async function abrir(browser: Browser, opciones: { ancho?: number; preferencias?: Record<string, string> } = {}) {
	const contexto = await browser.newContext({ storageState: archivoSesion("admin"), viewport: { width: opciones.ancho ?? 1440, height: 900 } });
	const page = await contexto.newPage();
	await page.addInitScript(([clave, valor]) => localStorage.setItem(clave, valor), [CLAVE, JSON.stringify({ v: 1, ...(opciones.preferencias ?? {}) })]);
	page.on("dialog", () => {
		throw new Error("La página abrió un alert() o confirm()");
	});
	const pedidos: { metodo: string; ruta: string; cuerpo: unknown }[] = [];
	let filas = FILAS_BD.map((f) => ({ ...f }));
	await page.route(
		(url) => url.origin === "http://localhost:3100" && /^\/(platillos|import|imagenes|menu\/categories)/.test(url.pathname),
		async (r) => {
			const p = r.request();
			const url = new URL(p.url());
			const metodo = p.method();
			const tipo = p.headers()["content-type"] ?? "";
			const json = (cuerpo: unknown) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(cuerpo) });
			if (metodo !== "GET") pedidos.push({ metodo, ruta: url.pathname + url.search, cuerpo: tipo.includes("json") ? JSON.parse(p.postData() ?? "null") : "form-data" });
			if (url.pathname.startsWith("/menu/categories")) return json([]);
			if (url.pathname === "/imagenes/firma") return json({ cloudName: "dcb1tspbj", apiKey: "clave-publica-ficticia", timestamp: 1_800_000_000, signature: "firma-ficticia", folder: "ElQuijote/menu" });
			if (metodo === "GET") return json(filas);
			if (url.pathname === "/platillos/importar") return json({ ...PLAN, aplicado: url.searchParams.get("confirmar") === "true" });
			const id = Number(url.pathname.split("/").pop());
			if (metodo === "PATCH") {
				const cuerpo = JSON.parse(p.postData() ?? "{}") as Record<string, unknown>;
				filas = filas.map((f) => (f.id === id ? { ...f, ...(cuerpo.disponible !== undefined ? { disponible: cuerpo.disponible as boolean } : {}), ...(typeof cuerpo.precio === "number" ? { precio: cuerpo.precio } : {}) } : f));
				return json({ success: true });
			}
			if (metodo === "DELETE") {
				filas = filas.filter((f) => f.id !== id);
				return json({ success: true });
			}
			if (metodo === "POST") return json({ id: 99 });
			return json({});
		},
	);
	// La subida a Cloudinary se simula: ninguna prueba sube nada a la nube.
	await page.route("https://api.cloudinary.com/**", async (r) => {
		pedidos.push({ metodo: r.request().method(), ruta: new URL(r.request().url()).pathname, cuerpo: "form-data" });
		await r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ secure_url: "https://res.cloudinary.com/dcb1tspbj/image/upload/v1/ElQuijote/menu/nueva.jpg", public_id: "ElQuijote/menu/nueva" }) });
	});
	await page.goto("/dashboard/admin/menu", { waitUntil: "load" });
	await expect(page.locator("main").getByText("Croquetas de jamón").filter({ visible: true }).first()).toBeVisible();
	return { contexto, page, pedidos };
}

async function subir(page: Page, modo: "agregar" | "reemplazar", archivo: { name: string; mimeType: string; buffer: Buffer }) {
	await page.locator("main").getByRole("button", { name: "Importar" }).click();
	const dialogo = page.getByRole("dialog", { name: "Importar platillos" });
	await dialogo.getByLabel("¿Agregar a la carta o reemplazarla?").selectOption(modo);
	const selector = page.waitForEvent("filechooser");
	await dialogo.getByRole("button", { name: "Subir Excel o CSV" }).click();
	await (await selector).setFiles(archivo);
}

test("la carta de la BD, por categorías, con filtro y disponibilidad", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	const main = page.locator("main");
	await expect(main).toContainText("Disponibles: 1 de 2");
	const tabla = main.getByRole("table", { name: "Platillos de Categoría 1" });
	await expect(tabla.locator("tbody tr").filter({ hasText: "Gazpacho" })).toContainText("Agotado");
	await main.getByRole("button", { name: "Agotar Croquetas de jamón" }).filter({ visible: true }).click();
	// D-31: agotar llega al servidor y la tabla se vuelve a leer de él.
	await expect(tabla.locator("tbody tr").filter({ hasText: "Croquetas" })).toContainText("Agotado");
	await main.getByLabel("Mostrar").selectOption("disponibles");
	await expect(tabla.locator("tbody tr")).toHaveCount(0);
	await main.getByLabel("Mostrar").selectOption("agotados");
	await expect(tabla.locator("tbody tr")).toHaveCount(2);
	// Ningún platillo de prueba tiene imagen: «Sin imagen» los muestra todos.
	await main.getByLabel("Mostrar").selectOption("sin-imagen");
	await expect(tabla.locator("tbody tr")).toHaveCount(2);
	await contexto.close();
});

test("editar y añadir platillo: PATCH y POST con el contrato de siempre", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	const main = page.locator("main");
	await main.getByRole("button", { name: "Editar Paella valenciana" }).filter({ visible: true }).click();
	const editar = page.getByRole("dialog", { name: "Editar Paella valenciana" });
	await editar.getByLabel("Precio").fill("680");
	await editar.getByRole("button", { name: "Guardar cambios" }).click();
	await expect(editar).toBeHidden();
	await expect.poll(() => pedidos.find((p) => p.metodo === "PATCH")).toMatchObject({ ruta: "/platillos/21", cuerpo: { nombre: "Paella valenciana", precio: 680, disponible: true } });

	await main.getByRole("button", { name: "Añadir a Categoría 2" }).click();
	const nuevo = page.getByRole("dialog", { name: "Platillo nuevo" });
	await nuevo.getByRole("button", { name: "Añadir platillo" }).click();
	await expect(nuevo.getByLabel("Nombre")).toHaveAttribute("aria-invalid", "true");
	await nuevo.getByLabel("Nombre").fill("Fideuá");
	await nuevo.getByLabel("Precio").fill("590");
	await nuevo.getByLabel("Popular").check();
	await nuevo.getByRole("button", { name: "Añadir platillo" }).click();
	await expect.poll(() => pedidos.find((p) => p.metodo === "POST")).toMatchObject({ ruta: "/platillos", cuerpo: { categoria_id: 2, nombre: "Fideuá", precio: 590, tags: ["popular"] } });
	await contexto.close();
});

test("importar: un .xlsx que no es Excel se rechaza antes de subirlo; al reemplazar se revisa y se importa de todas formas", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	await subir(page, "agregar", { name: "carta.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer: Buffer.from("nombre,precio\nNo es Excel,1") });
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Elige una hoja de cálculo de Excel (.xlsx).");
	await expect(page.getByRole("dialog", { name: "Revisar la importación" })).toHaveCount(0);
	expect(pedidos.filter((p) => p.ruta.includes("importar"))).toEqual([]);

	const csv = "nombre,categoria,precio\nTortilla de patatas,Categoría 1,140\nCroquetas de jamón,Categoría 1,125\nGazpacho,Categoría 1,0\n";
	await subir(page, "reemplazar", { name: "carta.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
	const revision = page.getByRole("dialog", { name: "Revisar la importación" });
	await expect(revision).toContainText("1 platillo nuevo");
	await expect(revision.getByRole("region", { name: "Quedarán deshabilitados (no se borran)" })).toContainText("Paella valenciana");
	await expect(revision.getByRole("region", { name: "Errores" })).toContainText("Fila 4: El precio debe ser un número mayor que 0.");
	await revision.getByRole("button", { name: "Importar de todas formas" }).click();
	await expect(revision).toBeHidden();
	expect(pedidos.filter((p) => p.ruta.includes("importar")).map((p) => p.ruta)).toEqual([
		"/platillos/importar?modo=reemplazar&confirmar=false&forzar=false",
		"/platillos/importar?modo=reemplazar&confirmar=true&forzar=true",
	]);
	await expect(page.locator('section[aria-label="Notificaciones"]')).toContainText("Importación completa");
	await contexto.close();
});

test("la imagen: firma de bytes antes de subir y subida firmada con la miniatura nueva", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	await page.locator("main").getByRole("button", { name: "Editar Paella valenciana" }).filter({ visible: true }).click();
	const editar = page.getByRole("dialog", { name: "Editar Paella valenciana" });
	const entrada = editar.locator('input[type="file"]');
	// Un .png que no es PNG se rechaza sin pedir firma ni subir nada.
	await entrada.setInputFiles({ name: "foto.png", mimeType: "image/png", buffer: Buffer.from("no es una imagen") });
	await expect(editar.getByRole("alert")).toBeVisible();
	expect(pedidos.filter((p) => p.ruta.includes("imagenes") || p.ruta.includes("upload"))).toEqual([]);
	// Un PNG de verdad (firma de bytes correcta): firma del API y subida a Cloudinary.
	const png = Buffer.from("89504e470d0a1a0a0000000d4948445200000001000000010806000000", "hex");
	await entrada.setInputFiles({ name: "foto.png", mimeType: "image/png", buffer: png });
	await expect.poll(() => pedidos.map((p) => `${p.metodo} ${p.ruta}`)).toEqual(["POST /imagenes/firma", "POST /v1_1/dcb1tspbj/image/upload"]);
	await expect(editar.locator('[data-prueba="miniatura-imagen"] img')).toHaveAttribute("src", /ElQuijote%2Fmenu%2Fnueva|ElQuijote\/menu\/nueva/);
	await editar.getByRole("button", { name: "Guardar cambios" }).click();
	await expect.poll(() => pedidos.find((p) => p.metodo === "PATCH")).toMatchObject({ ruta: "/platillos/21", cuerpo: { imagen_url: "https://res.cloudinary.com/dcb1tspbj/image/upload/v1/ElQuijote/menu/nueva.jpg", imagen_public_id: "ElQuijote/menu/nueva" } });
	await contexto.close();
});

test("eliminar pide confirmación del sistema y llega al servidor", async ({ browser }) => {
	const { contexto, page, pedidos } = await abrir(browser);
	const main = page.locator("main");
	await main.getByRole("button", { name: "Eliminar Gazpacho" }).filter({ visible: true }).click();
	await page.getByRole("alertdialog", { name: "¿Eliminar Gazpacho de la carta?" }).getByRole("button", { name: "Eliminar platillo" }).click();
	await expect(main.getByRole("table", { name: "Platillos de Categoría 1" })).not.toContainText("Gazpacho");
	expect(pedidos.filter((p) => p.metodo === "DELETE").map((p) => p.ruta)).toEqual(["/platillos/12"]);
	await contexto.close();
});

for (const tema of ["oscuro", "claro"] as const) {
	for (const [ancho, tamanoTexto] of [
		[360, "muy-grande"],
		[768, "normal"],
		[1440, "normal"],
	] as const) {
		test(`axe, sin desbordar y captura: ${ancho} px, tema ${tema}`, async ({ browser }, info) => {
			const { contexto, page } = await abrir(browser, { ancho, preferencias: { tema, tamanoTexto } });
			const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
			expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
			await page.screenshot({ path: `test-results/carta-admin/${info.project.name}/carta-${tema}-${ancho}.png`, fullPage: true, animations: "disabled" });
			await page.locator("main").getByRole("button", { name: "Editar Croquetas de jamón" }).filter({ visible: true }).click();
			await expect(page.getByRole("dialog")).toBeVisible();
			const rDialogo = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
			expect(rDialogo.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
			await contexto.close();
		});
	}
}

test("«Ver cálculo»: cada cifra de las tarjetas se rehace desde su desglose (P1.4)", async ({ browser }) => {
	const { contexto, page } = await abrir(browser);
	await expect(page.locator("main").getByRole("button", { name: /^Ver cálculo de / }).filter({ visible: true }).first()).toBeVisible({ timeout: 15_000 });
	expect(await comprobarCalculos(page)).toHaveLength(4);
	await contexto.close();
});
