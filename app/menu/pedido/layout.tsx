import type { ReactNode } from "react";

// Pedido y pago del comensal: siempre por petición y sin caché (PLAN 2.6). Las páginas son de
// cliente y no pueden declarar la configuración del segmento; lo hace este layout.
export const dynamic = "force-dynamic";

export default function LayoutPedido({ children }: { children: ReactNode }) {
	return children;
}
