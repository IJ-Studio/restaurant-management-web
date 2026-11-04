import type { Metadata } from "next";
import { DatoLegal } from "@/components/marca/DatoLegal";
import { PaginaLegal, SeccionLegal } from "@/components/marca/PaginaLegal";
import { DATOS_LEGALES } from "@/config/legal";

export const metadata: Metadata = { title: "Cancelaciones y reembolsos" };

/**
 * Política de cancelaciones, reembolsos y garantías (PLAN-AMPLIACION D-36), con el texto del
 * documento legal público. La ruta `/devoluciones` no cambia. Pendiente de revisión por un abogado
 * antes de publicar; la compensación también depende del backend (pendiente fuera del repo).
 */
export default function DevolucionesPage() {
	const d = DATOS_LEGALES;
	return (
		<PaginaLegal ruta="/devoluciones" titulo="Cancelaciones y reembolsos" entradilla="Qué pasa si tu pedido no se entrega o no se presta como debe.">
			<SeccionLegal titulo="Tu derecho">
				<p>
					Si tu pedido no se entrega o se presta de forma deficiente <strong>por causas imputables a El Quijote</strong> (por ejemplo, cancelación por falta de ingredientes,
					fallo operativo o ausencia de repartidor), tienes derecho a:
				</p>
				<ul>
					<li>el reembolso íntegro del monto pagado, y</li>
					<li>
						una compensación adicional no menor al <strong>20 % del precio originalmente cobrado</strong>.
					</li>
				</ul>
				<p>Este derecho es irrenunciable conforme a la Ley Federal de Protección al Consumidor.</p>
			</SeccionLegal>

			<SeccionLegal titulo="Cómo solicitarlo">
				<p>
					Escríbenos a <DatoLegal valor={d.contactoReembolsos} />. El tiempo de procesamiento es de <DatoLegal valor={d.plazoReembolsos} />.
				</p>
				<p>{`Última actualización: ${d.ultimaActualizacion}.`}</p>
			</SeccionLegal>
		</PaginaLegal>
	);
}
