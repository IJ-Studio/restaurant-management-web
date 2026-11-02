import { paginaDePrueba } from "@/app/(dev)/_limites/pagina-de-prueba";

// Solo en next dev (PLAN 2.17): fuerza el límite de error o el «no encontrado» de app/dashboard
// (va bajo admin porque el proxy solo deja entrar en las rutas de cada rol).
export default function Pagina({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
	return paginaDePrueba(searchParams);
}
