import { notFound } from "next/navigation";
import { LanzarEnCliente } from "./LanzarEnCliente";

/**
 * Páginas de prueba de los límites de error (PLAN 2.17). Solo existen en next dev (`page.dev.tsx`):
 * - sin parámetro, fallan en el servidor con un mensaje que nunca debe verse;
 * - `?tipo=cliente`, fallan al renderizar en el cliente;
 * - `?tipo=no-encontrado`, llaman a `notFound()`.
 */
export async function paginaDePrueba(searchParams: Promise<{ tipo?: string }>) {
	const { tipo } = await searchParams;
	if (tipo === "no-encontrado") notFound();
	if (tipo === "cliente") return <LanzarEnCliente />;
	throw new Error("detalle-interno-servidor: SELECT * FROM usuarios falló en db-01");
}
