import type { ReactNode } from "react";

/** Transición suave al cambiar de página (solo presentación; el estilo vive en componentes.css). */
export default function Plantilla({ children }: { children: ReactNode }) {
	return <div className="pagina-entra">{children}</div>;
}
