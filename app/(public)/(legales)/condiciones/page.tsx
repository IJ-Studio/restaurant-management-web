import type { Metadata } from "next";
import Link from "next/link";
import { DatoLegal } from "@/components/marca/DatoLegal";
import { PaginaLegal, SeccionLegal } from "@/components/marca/PaginaLegal";
import { DATOS_LEGALES } from "@/config/legal";
import { restaurantConfig } from "@/config/restaurant.config";

export const metadata: Metadata = { title: "Términos y condiciones" };

/**
 * Términos y condiciones de uso y compra (PLAN-AMPLIACION D-36), con el texto del documento legal
 * público. Pendiente de revisión por un abogado antes de publicar.
 */
export default function CondicionesPage() {
	const d = DATOS_LEGALES;
	return (
		<PaginaLegal ruta="/condiciones" titulo="Términos y condiciones" entradilla="Las reglas para usar el sitio y la app de El Quijote y comprar en ellos.">
			<SeccionLegal titulo="1. Identidad del proveedor">
				<ul>
					<li>
						Razón social: <DatoLegal valor={d.razonSocial} />
					</li>
					<li>
						RFC: <DatoLegal valor={d.rfc} />
					</li>
					<li>
						Domicilio: <DatoLegal valor={d.domicilioFiscal} />
					</li>
					<li>
						Contacto: <a href={restaurantConfig.contact.phoneHref}>{restaurantConfig.contact.phone}</a> · <DatoLegal valor={d.correoContacto} correo />
					</li>
				</ul>
			</SeccionLegal>

			<SeccionLegal titulo="2. Objeto">
				<p>Estos términos regulan el uso del sitio web y la aplicación móvil de El Quijote para realizar pedidos de alimentos.</p>
			</SeccionLegal>

			<SeccionLegal titulo="3. Proceso de compra">
				<ul>
					<li>Antes de confirmar el pago revisas un resumen completo del pedido: artículos, precio unitario, IVA, costo de envío y total en pesos mexicanos.</li>
					<li>Puedes corregir tu pedido antes de la confirmación final.</li>
					<li>{`Una vez confirmado, el cobro se procesa a través de ${d.pasarelaPago}.`}</li>
				</ul>
			</SeccionLegal>

			<SeccionLegal titulo="4. Precios">
				<p>Todos los precios se muestran en pesos mexicanos (MXN), con el IVA incluido o desglosado y sin cargos ocultos.</p>
			</SeccionLegal>

			<SeccionLegal titulo="5. Facturación">
				<p>
					Puedes generar tu CFDI 4.0 sin costo adicional, dentro del plazo fiscal correspondiente, desde <DatoLegal valor={d.portalFacturacion} />.
				</p>
			</SeccionLegal>

			<SeccionLegal titulo="6. Cancelaciones, reembolsos y compensación">
				<p>
					Consulta la <Link href="/devoluciones">política de cancelaciones y reembolsos</Link>.
				</p>
			</SeccionLegal>

			<SeccionLegal titulo="7. Seguridad">
				<p>Todas las transacciones se hacen mediante conexión cifrada (HTTPS/TLS). Nunca almacenamos los datos completos de tu tarjeta.</p>
			</SeccionLegal>

			<SeccionLegal titulo="8. Uso aceptable">
				<p>Te comprometes a usar la plataforma de forma lícita y a no intentar vulnerar su seguridad.</p>
			</SeccionLegal>

			<SeccionLegal titulo="9. Modificaciones">
				<p>Podemos actualizar estos términos; la versión vigente siempre está disponible en esta página, con la fecha de la última actualización.</p>
			</SeccionLegal>

			<SeccionLegal titulo="10. Legislación aplicable">
				<p>Estos términos se rigen por las leyes mexicanas, incluidas la Ley Federal de Protección al Consumidor y el Código de Comercio.</p>
				<p>{`Última actualización: ${d.ultimaActualizacion}.`}</p>
			</SeccionLegal>
		</PaginaLegal>
	);
}
