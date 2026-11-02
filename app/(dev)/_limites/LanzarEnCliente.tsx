"use client";

/** Solo para las páginas de prueba de next dev (PLAN 2.17): falla al renderizar en el cliente. */
export function LanzarEnCliente(): never {
	throw new Error("detalle-interno-cliente: token=e2e-no-mostrar en /api/privado");
}
