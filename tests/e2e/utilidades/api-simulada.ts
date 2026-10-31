import type { Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const fixture = (nombre: string) => readFileSync(join("tests/e2e/fixtures/api", `${nombre}.json`), "utf8");

/**
 * Simula la API del backend (NEXT_PUBLIC_API_URL apunta al propio servidor de pruebas)
 * para ver páginas y paneles sin backend. Solo toca peticiones fetch/XHR del mismo origen.
 * Los datos son mínimos; el contenido real se simula mejor cuando cada paso lo necesite.
 */
export async function simularApi(page: Page) {
	await page.route(
		(url) => url.origin === "http://localhost:3100" && !url.pathname.startsWith("/_next"),
		async (route) => {
			const r = route.request();
			if (!["fetch", "xhr"].includes(r.resourceType())) return route.fallback();
			const { pathname } = new URL(r.url());
			let cuerpo = fixture("lista-vacia");
			if (pathname.endsWith("/auth/me")) cuerpo = fixture("auth-me");
			else if (/\/(settings|footer|ajustes)$/.test(pathname)) cuerpo = fixture("objeto-vacio");
			await route.fulfill({ status: 200, contentType: "application/json", body: cuerpo });
		},
	);
}
