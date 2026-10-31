import { rmSync } from "node:fs";

/** Borra los JWT de pruebas al terminar. */
export default async function globalTeardown() {
	rmSync("playwright/.auth", { recursive: true, force: true });
}
