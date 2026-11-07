import type { Metadata } from "next";
import Link from "next/link";
import { DatoLegal } from "@/components/marca/DatoLegal";
import { PaginaLegal, SeccionLegal } from "@/components/marca/PaginaLegal";
import { DATOS_LEGALES } from "@/config/legal";

export const metadata: Metadata = { title: "Aviso de privacidad" };

/**
 * Aviso de privacidad integral para clientes (PLAN-AMPLIACION D-36), con el texto del documento
 * legal público. Los datos del responsable salen de `config/legal.ts`; los que faltan se marcan
 * como «Dato por confirmar». Pendiente de revisión por un abogado antes de publicar.
 */
export default function PrivacidadPage() {
	const d = DATOS_LEGALES;
	return (
		<PaginaLegal ruta="/privacidad" titulo="Aviso de privacidad" entradilla="Para clientes de El Quijote: qué datos tratamos, para qué y cómo ejercer tus derechos.">
			<SeccionLegal titulo="Responsable">
				<p>
					<DatoLegal valor={d.razonSocial} />, con domicilio en <DatoLegal valor={d.domicilioFiscal} />, México.
				</p>
			</SeccionLegal>

			<SeccionLegal titulo="Finalidades primarias">
				<p>Son necesarias para el servicio; sin ellas no podemos atenderte:</p>
				<ul>
					<li>Procesar y dar seguimiento a tus pedidos.</li>
					<li>Facturación y cumplimiento de obligaciones fiscales.</li>
					<li>Gestión de pagos a través de nuestras pasarelas de pago.</li>
					<li>Entrega a domicilio (incluye geolocalización únicamente durante el pedido activo).</li>
					<li>Atención de dudas, quejas y ejercicio de tus derechos ARCO.</li>
				</ul>
			</SeccionLegal>

			<SeccionLegal titulo="Finalidades secundarias">
				<p>Son opcionales: puedes negarte sin que se afecte el servicio.</p>
				<ul>
					<li>Envío de boletines, promociones y publicidad.</li>
					<li>Análisis de hábitos de consumo con fines de mercadotecnia.</li>
					<li>Encuestas de satisfacción.</li>
				</ul>
				<p>Al registrarte, marcas por separado tu aceptación de las finalidades primarias (obligatorias) y las secundarias (opcionales, con las casillas desmarcadas).</p>
			</SeccionLegal>

			<SeccionLegal titulo="Datos que recabamos">
				<ul>
					<li>Datos de identificación y contacto: nombre, teléfono, correo y dirección de entrega.</li>
					<li>Datos de la transacción: historial de pedidos y método de pago, que guarda el proveedor de pagos; nunca almacenamos tu tarjeta en nuestros servidores.</li>
					<li>
						Datos de salud (sensibles), <strong>solo si tú los proporcionas voluntariamente</strong>: alergias o restricciones alimentarias que agregues a tu pedido. Se tratan con
						medidas de seguridad reforzadas y no se usan para ningún fin distinto de preparar tu pedido correctamente.
					</li>
				</ul>
			</SeccionLegal>

			<SeccionLegal titulo="Transferencias de datos">
				<p>Compartimos datos, únicamente para los fines aquí descritos, con:</p>
				<ul>
					<li>{`Pasarela de pago: ${d.pasarelaPago}.`}</li>
					<li>{`Alojamiento del sitio: ${d.alojamiento}.`}</li>
				</ul>
				<p>Estas transferencias requieren tu consentimiento expreso, que otorgas al aceptar este aviso.</p>
			</SeccionLegal>

			<SeccionLegal titulo="Derechos ARCO">
				<p>
					Puedes acceder, rectificar, cancelar u oponerte al tratamiento de tus datos personales escribiendo a <DatoLegal valor={d.correoPrivacidad} />, con tu nombre completo y
					una identificación oficial. Respondemos en un máximo de 20 días hábiles.
				</p>
			</SeccionLegal>

			<SeccionLegal titulo="Personal del restaurante">
				<p>
					El tratamiento de los datos del personal tiene su propio{" "}
					<Link href="/privacidad/personal">aviso de privacidad del personal</Link>.
				</p>
			</SeccionLegal>

			<SeccionLegal titulo="Cambios al aviso">
				<p>Cualquier modificación se publicará en esta misma página, con la fecha de la última actualización.</p>
				<p>{`Última actualización: ${d.ultimaActualizacion}.`}</p>
			</SeccionLegal>
		</PaginaLegal>
	);
}
