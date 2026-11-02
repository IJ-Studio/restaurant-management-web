import { test, expect, type Page } from "@playwright/test";
import { archivoSesion } from "./roles";

// autoExecute en el detalle de producto (PLAN 2.13): un enlace no crea un pedido sin confirmación.
test.skip(process.env.E2E_MODO === "dev", "se comprueba contra el build de producción");

const PLATILLO = {
	id: 7,
	nombre: "Mole de olla",
	precio: 180,
	descripcion: "Mole de la casa.",
	descripcionCorta: "Mole de la casa.",
	alergenos: [],
	categoria: "Platos fuertes",
	disponible: true,
	esNuevo: false,
	esPopular: false,
	imagenUrl: "/icons/icon-192.png",
};

async function simular(page: Page, pedidos: string[]) {
	await page.route(
		(url) => url.origin === "http://localhost:3100" && !url.pathname.startsWith("/_next"),
		async (ruta) => {
			const r = ruta.request();
			if (!["fetch", "xhr"].includes(r.resourceType())) return ruta.fallback();
			const { pathname } = new URL(r.url());
			if (pathname.endsWith("/pedidos/mesa") && r.method() === "POST") {
				pedidos.push(r.postData() ?? "");
				return ruta.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
			}
			let cuerpo: unknown = [];
			if (pathname === "/menu/items/7") cuerpo = PLATILLO;
			else if (pathname.endsWith("/auth/me")) cuerpo = { user: { id: "e2e-cliente", name: "Prueba", roleId: 5 } };
			else if (pathname.includes("/recommendations/")) cuerpo = {};
			await ruta.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(cuerpo) });
		},
	);
}

test("autoExecute pide confirmación: «Ahora no» no crea el pedido; confirmar sí", async ({ browser }) => {
	const contexto = await browser.newContext({ storageState: archivoSesion("cliente") });
	const page = await contexto.newPage();
	const pedidos: string[] = [];
	await simular(page, pedidos);

	await page.goto("/menu/producto/7?autoExecute=pedir_mesa&qty=50&mesaQuery=4", { waitUntil: "load" });
	const confirmacion = page.getByRole("alertdialog", { name: "¿Añadir este platillo a tu pedido?" });
	await expect(confirmacion).toBeVisible();
	// La cantidad de la URL se limita a 20.
	await expect(confirmacion).toContainText("20 × Mole de olla, mesa 4.");
	await expect(page).not.toHaveURL(/autoExecute/);
	await page.waitForTimeout(500);
	expect(pedidos).toEqual([]);
	await confirmacion.getByRole("button", { name: "Ahora no" }).click();
	await expect(confirmacion).toBeHidden();
	await page.waitForTimeout(800);
	expect(pedidos).toEqual([]);

	// Con el clic de confirmación, la llamada al API es la de siempre.
	await page.goto("/menu/producto/7?autoExecute=pedir_mesa&qty=2&mesaQuery=4", { waitUntil: "load" });
	await confirmacion.getByRole("button", { name: "Añadir al pedido" }).click();
	await expect.poll(() => pedidos.length).toBe(1);
	await contexto.close();
});
