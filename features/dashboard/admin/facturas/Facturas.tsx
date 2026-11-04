import { ReceiptText } from "lucide-react";
import { PlantillaPanel } from "@/components/paneles/PlantillaPanel";
import { EstadoVacio } from "@/components/ui/EstadoVacio";

/**
 * Facturas (PLAN 5.5; PLAN-AMPLIACION D-24). La pantalla trabajaba con facturas de ejemplo en
 * memoria; sin datos inventados, queda vacía hasta que el API ofrezca el listado de facturas del
 * administrador (`INVENTARIO-API.md`). Las facturas de cada pedido se siguen pidiendo y
 * descargando desde la confirmación del pago.
 */
export function Facturas() {
	return (
		<PlantillaPanel titulo="Facturas">
			<EstadoVacio
				icono={<ReceiptText />}
				nivelTitulo={2}
				titulo="Las facturas aún no llegan a este panel"
				descripcion="Cada cliente pide y descarga su factura al pagar su pedido. Cuando el sistema reúna todas las facturas, las verás aquí."
			/>
		</PlantillaPanel>
	);
}
