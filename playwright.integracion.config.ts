import { defineConfig, devices } from "@playwright/test";

/**
 * Flujos contra el API real (no simulado) para la evidencia de caja, pagos y facturación. No los
 * corre la suite normal: necesitan el API local (puerto 10000) con su base de pruebas y la web en
 * modo producción en el puerto 3000 (el único origen que acepta el CORS del API local).
 *
 *   NEXT_PUBLIC_API_URL=http://localhost:10000 pnpm build && pnpm start -p 3000
 *   API_URL=http://localhost:10000 PLATILLO_CENTAVOS=<id de 100.01> \
 *     pnpm exec playwright test -c playwright.integracion.config.ts
 */
export default defineConfig({
	testDir: "./tests/integracion",
	outputDir: "./test-results/integracion",
	reporter: [["list"]],
	workers: 1,
	timeout: 120_000,
	use: {
		baseURL: process.env.WEB_URL ?? "http://localhost:3000",
		viewport: { width: 1280, height: 900 },
		trace: "retain-on-failure",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } }],
});
