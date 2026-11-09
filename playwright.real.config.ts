import { defineConfig, devices } from "@playwright/test";

/**
 * Pruebas contra el API real (copia local de la BD, nunca producción): `next dev` con
 * NEXT_PUBLIC_API_URL apuntando al API local, que corre contra `quijote_local`. Las arranca el
 * script de la tanda; aquí no hay webServer. Los usuarios de prueba (dominio prueba.local) existen
 * solo en la copia.
 */
export default defineConfig({
	testDir: "./tests/real",
	outputDir: "./test-results/real",
	reporter: [["list"]],
	workers: 1,
	timeout: 120_000,
	use: { baseURL: process.env.E2E_REAL_URL ?? "http://localhost:3100", trace: "retain-on-failure" },
	projects: [
		{ name: "chromium", use: { ...devices["Desktop Chrome"] } },
		{ name: "firefox", use: { ...devices["Desktop Firefox"] } },
		{ name: "webkit", use: { ...devices["Desktop Safari"] } },
	],
});
