import { defineConfig, devices } from "@playwright/test";

const PUERTO = 3100;

export default defineConfig({
	testDir: "./tests/e2e",
	outputDir: "./test-results",
	reporter: [["list"], ["html", { open: "never" }]],
	use: {
		baseURL: `http://localhost:${PUERTO}`,
		trace: "retain-on-failure",
	},
	projects: [
		{ name: "chromium", use: { ...devices["Desktop Chrome"] } },
		{ name: "firefox", use: { ...devices["Desktop Firefox"] } },
		{ name: "webkit", use: { ...devices["Desktop Safari"] } },
		{ name: "movil-ios", use: { ...devices["iPhone 13"] } },
		{ name: "movil-android", use: { ...devices["Pixel 7"] } },
		// Opcional en local: requiere Microsoft Edge instalado.
		...(process.env.E2E_EDGE
			? [{ name: "edge", use: { ...devices["Desktop Edge"], channel: "msedge" } }]
			: []),
	],
	webServer: {
		command: `corepack pnpm build && corepack pnpm start -p ${PUERTO}`,
		url: `http://localhost:${PUERTO}`,
		reuseExistingServer: true,
		timeout: 2_700_000,
		// Valores ficticios: el build importa lib/db.ts, que exige DATABASE_URL.
		// No hay conexión real; la API se simula con page.route (paso 0.7).
		env: {
			DATABASE_URL: "postgres://prueba:prueba@127.0.0.1:5432/prueba",
			JWT_SECRET: process.env.E2E_JWT_SECRET ?? "secreto-ficticio-solo-para-pruebas-e2e",
			NEXT_PUBLIC_API_URL: `http://localhost:${PUERTO}`,
			NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "dcb1tspbj",
		},
	},
});
