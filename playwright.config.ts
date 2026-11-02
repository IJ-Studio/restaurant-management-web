import { defineConfig, devices } from "@playwright/test";
import { SECRETO_E2E } from "./tests/e2e/secreto";

const PUERTO = 3100;
// E2E_MODO=dev en pasos intermedios (next dev); por defecto build + next start.
const MODO_DEV = process.env.E2E_MODO === "dev";

export default defineConfig({
	testDir: "./tests/e2e",
	globalSetup: "./tests/e2e/global-setup.ts",
	globalTeardown: "./tests/e2e/global-teardown.ts",
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
		command: MODO_DEV
			? `corepack pnpm dev -p ${PUERTO}`
			: `corepack pnpm build && corepack pnpm start -p ${PUERTO}`,
		url: `http://localhost:${PUERTO}`,
		reuseExistingServer: true,
		timeout: 2_700_000,
		// Valores ficticios: el build importa lib/db.ts, que exige DATABASE_URL.
		// No hay conexión real; la API se simula con page.route (paso 0.7).
		env: {
			DATABASE_URL: "postgres://prueba:prueba@127.0.0.1:5432/prueba",
			JWT_SECRET: SECRETO_E2E,
			NEXT_PUBLIC_API_URL: `http://localhost:${PUERTO}`,
			NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "dcb1tspbj",
			// Clave publicable ficticia: el build la exige (PLAN 2.16); el pago no se prueba.
			NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_e2e_ficticia",
		},
	},
});
