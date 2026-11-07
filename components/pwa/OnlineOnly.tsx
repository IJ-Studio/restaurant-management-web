"use client";

import { useState, type ReactNode } from "react";
import { WifiOff } from "lucide-react";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface OnlineOnlyProps {
	children: ReactNode;
	/** Qué no se puede ver sin conexión («la carta»). */
	what?: string;
	/** Otra salida bajo el aviso (p. ej. un enlace para llamar). */
	extra?: ReactNode;
	className?: string;
}

/**
 * Contenido que necesita el servidor. Sin conexión, un aviso con el estilo del sistema
 * (`EstadoVacio`, PLAN 4.10) y, si se da, otra salida; al volver la conexión se carga solo.
 *
 * Si el contenido ya se había montado, solo se oculta mientras no hay red, para no perder lo
 * que la persona estuviera llenando.
 */
export default function OnlineOnly({ children, what = "este contenido", extra, className }: OnlineOnlyProps) {
	const online = useOnlineStatus();
	const [hasMounted, setHasMounted] = useState(online);
	// Estado derivado durante el render (sin efecto): una vez con conexión, el contenido se queda montado.
	if (online && !hasMounted) setHasMounted(true);

	return (
		<>
			{!online && (
				<div className={className ?? "py-(--espacio-2xl)"}>
					<EstadoVacio
						icono={<WifiOff />}
						titulo="Ahora mismo no hay conexión"
						descripcion={`Para ver ${what} necesitas conexión. Se cargará sola en cuanto vuelvas a tenerla.`}
						accion={extra}
					/>
				</div>
			)}
			{hasMounted && <div hidden={!online}>{children}</div>}
		</>
	);
}
