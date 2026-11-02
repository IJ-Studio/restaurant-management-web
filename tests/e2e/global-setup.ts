import { mkdirSync, writeFileSync } from "node:fs";
import { SignJWT } from "jose";
import { ROLES, archivoSesion, type Rol } from "./roles";
import { SECRETO_E2E } from "./secreto";

const ORIGEN = "http://localhost:3100";

/** Firma un JWT de pruebas por rol y guarda el estado de sesión (cookie + localStorage). */
export default async function globalSetup() {
	mkdirSync("playwright/.auth", { recursive: true });
	const clave = new TextEncoder().encode(SECRETO_E2E);
	for (const rol of Object.keys(ROLES) as Rol[]) {
		const usuario = { id: `e2e-${rol}`, email: `${rol}@prueba.invalid`, name: `Prueba ${rol}`, roleId: ROLES[rol].roleId };
		const token = await new SignJWT({ ...usuario, tokenId: `e2e-${rol}` })
			.setProtectedHeader({ alg: "HS256" })
			.setIssuedAt()
			.setExpirationTime("2h")
			.sign(clave);
		const estado = {
			cookies: [
				{ name: "session", value: token, domain: "localhost", path: "/", expires: -1, httpOnly: false, secure: false, sameSite: "Lax" },
			],
			origins: [
				{
					origin: ORIGEN,
					localStorage: [
						{ name: "authToken", value: token },
					],
				},
			],
		};
		writeFileSync(archivoSesion(rol), JSON.stringify(estado));
	}
}
