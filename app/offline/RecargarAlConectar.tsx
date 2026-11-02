"use client";

import { useEffect } from "react";

/**
 * Recarga la página en cuanto vuelve la conexión. Antes era un <script> en línea con
 * dangerouslySetInnerHTML, que la CSP con nonce bloquearía (PLAN 2.4).
 */
export function RecargarAlConectar() {
	useEffect(() => {
		const recargar = () => window.location.reload();
		window.addEventListener("online", recargar);
		return () => window.removeEventListener("online", recargar);
	}, []);
	return null;
}
