import { paginaDePrueba } from "@/app/(dev)/_limites/pagina-de-prueba";

// Solo en next dev (PLAN 2.17): fuerza el límite de error o el «no encontrado» de este segmento.
export default function Pagina({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
	return paginaDePrueba(searchParams);
}
