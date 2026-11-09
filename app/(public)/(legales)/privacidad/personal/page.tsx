import type { Metadata } from "next";
import Link from "next/link";
import { DatoLegal } from "@/components/marca/DatoLegal";
import { PaginaLegal, SeccionLegal } from "@/components/marca/PaginaLegal";
import { DATOS_LEGALES } from "@/config/legal";

export const metadata: Metadata = { title: "Aviso de privacidad del personal" };

/**
 * Aviso de privacidad integral del personal operativo y repartidores (PLAN-AMPLIACION D-36), con el
 * texto del documento legal público. Se enlaza desde la cuenta de los paneles. Pendiente de
 * revisión por un abogado antes de publicar.
 */
export default function PrivacidadPersonalPage() {
	const d = DATOS_LEGALES;
	return (
		<PaginaLegal ruta="/privacidad/personal" titulo="Aviso de privacidad del personal" entradilla="Para el personal operativo y los repartidores de El Quijote.">
			<SeccionLegal titulo="Responsable">
				<p>
					<DatoLegal valor={d.razonSocial} />, con domicilio en <DatoLegal valor={d.domicilioFiscal} />, México.
				</p>
			</SeccionLegal>

			<SeccionLegal titulo="Finalidades">
				<ul>
					<li>Control de asistencia y jornada laboral.</li>
					<li>Administración de nómina y prestaciones.</li>
					<li>Asignación y seguimiento de pedidos y rutas de entrega (incluye geolocalización durante la jornada activa de reparto).</li>
					<li>Cumplimiento de obligaciones ante el IMSS y las autoridades laborales.</li>
					<li>Seguridad de acceso a los sistemas internos (roles y permisos).</li>
				</ul>
			</SeccionLegal>

			<SeccionLegal titulo="Datos que se recaban">
				<ul>
					<li>Identificación, contacto, datos bancarios para el pago y RFC o CURP cuando aplique.</li>
					<li>Geolocalización durante los turnos activos de reparto (no se rastrea fuera de la jornada).</li>
					<li>Registros de uso de los sistemas internos (auditoría de seguridad).</li>
					<li>
						{`En la app «${d.nombreApp}»: el identificador del teléfono para notificaciones y reportes de errores. El detalle está en el `}
						<Link href="/privacidad#app-movil">aviso de privacidad</Link>.
					</li>
				</ul>
			</SeccionLegal>

			<SeccionLegal titulo="Eliminación de la cuenta">
				<p>
					Al terminar la relación laboral, la administración da de baja la cuenta. También puedes pedirlo tú, como se explica en{" "}
					<Link href="/eliminar-cuenta">Eliminar cuenta</Link>.
				</p>
			</SeccionLegal>

			<SeccionLegal titulo="Derechos ARCO">
				<p>
					En los mismos términos que el aviso para clientes. Contacto: <DatoLegal valor={d.correoPrivacidad} />.
				</p>
				<p>{`Última actualización: ${d.ultimaActualizacion}.`}</p>
			</SeccionLegal>
		</PaginaLegal>
	);
}
