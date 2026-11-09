import type { ReactNode } from "react";

// Datos personales: siempre por petición y sin caché (PLAN 2.6). La página es de cliente y no
// puede declarar la configuración del segmento; lo hace este layout, que no cambia la ruta.
export const dynamic = "force-dynamic";

export default function LayoutPerfil({ children }: { children: ReactNode }) {
	return children;
}
