import Image from "next/image";
import { APP_OPERACIONES } from "@/config/app-operaciones";
import { BloquePanel } from "./BloquePanel";

/**
 * Bloque «App del personal» (PLAN-AMPLIACION D-37) en los paneles de caja, cocina y sala: el QR
 * para instalar la app de operaciones. Solo aparece si `config/app-operaciones.ts` tiene la ruta de
 * la imagen; no inventa direcciones de tiendas. La imagen del QR trae su propio fondo claro (zona
 * de silencio), así que se pinta tal cual en los dos temas.
 */
export function AppOperaciones({ ruta = APP_OPERACIONES.rutaImagenQr }: { ruta?: string }) {
	if (!ruta) return null;
	return (
		<BloquePanel titulo="App del personal" descripcion="Escanea el código con el teléfono para instalar la app de operaciones.">
			<div className="w-40 rounded-tarjeta border border-borde-sutil p-2" data-prueba="qr-app-operaciones">
				<Image src={ruta} alt="Código QR para instalar la app de operaciones del personal" width={160} height={160} className="h-auto w-full" />
			</div>
		</BloquePanel>
	);
}
