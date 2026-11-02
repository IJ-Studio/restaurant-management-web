import { defineConfig } from "@playwright/test";

// Pruebas unitarias sin navegador ni servidor (PLAN 3.1): `pnpm test:unidad`.
// No arrancan `next` ni abren navegadores, así que pueden ejecutarse en cualquier momento.
export default defineConfig({
	testDir: "./tests/unidad",
	outputDir: "./test-results/unidad",
	reporter: [["list"]],
	workers: 1,
	projects: [{ name: "unidad" }],
});
