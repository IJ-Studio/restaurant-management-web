/** Secreto ficticio solo para firmar los JWT de las pruebas; el servidor de pruebas usa el mismo. */
export const SECRETO_E2E = process.env.E2E_JWT_SECRET ?? "secreto-ficticio-solo-para-pruebas-e2e";
