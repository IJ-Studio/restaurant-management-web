import type { Metadata } from "next";
import Link from "next/link";
import { DatoLegal } from "@/components/marca/DatoLegal";
import { PaginaLegal, SeccionLegal } from "@/components/marca/PaginaLegal";
import { DATOS_LEGALES } from "@/config/legal";
import { restaurantConfig } from "@/config/restaurant.config";

export const metadata: Metadata = {
	title: "Eliminar cuenta",
	description: `Cómo pedir que se elimine tu cuenta y tus datos de la web y de la app «${DATOS_LEGALES.nombreApp}».`,
};

/**
 * Recurso web para pedir la eliminación de la cuenta, el que Google Play pide capturar en la
 * sección «Seguridad de los datos». Página de servidor, sin sesión ni JavaScript: Google y quien ya
 * no puede entrar a la app la abren tal cual. La solicitud se atiende por correo hasta que exista
 * el flujo automático en el API; por eso aquí no se promete un borrado instantáneo.
 */
export default function EliminarCuentaPage() {
	const d = DATOS_LEGALES;
	const { contact } = restaurantConfig;
	return (
		<PaginaLegal
			ruta="/eliminar-cuenta"
			titulo="Eliminar cuenta"
			entradilla={`Cómo pedir que eliminemos tu cuenta y tus datos personales de la web de El Quijote y de la app «${d.nombreApp}».`}
		>
			<SeccionLegal titulo="A quién aplica">
				<ul>
					<li>
						{`App «${d.nombreApp}» para Android, publicada en Google Play. La usa el personal del restaurante.`}
					</li>
					<li>Cuentas de clientes de la web de El Quijote.</li>
				</ul>
			</SeccionLegal>

			<SeccionLegal titulo="Cómo pedirlo">
				<p>No necesitas tener la app instalada ni poder iniciar sesión.</p>
				<ul>
					<li>
						Escribe a <DatoLegal valor={d.correoPrivacidad} correo /> con el asunto «Eliminar cuenta», desde el correo con el que te registraste. Si ya no tienes acceso a
						ese correo, dinos cuál era y te pediremos una identificación para confirmar que la cuenta es tuya.
					</li>
					<li>
						También puedes llamar al <a href={contact.phoneHref}>{contact.phone}</a> o pedirlo en el restaurante.
					</li>
					<li>Si eres parte del personal, puedes pedírselo también a la administración del restaurante.</li>
				</ul>
				<p>Te confirmamos por correo cuando la cuenta quede eliminada, en un máximo de 20 días hábiles.</p>
			</SeccionLegal>

			<SeccionLegal titulo="Qué se elimina">
				<ul>
					<li>Tu cuenta y tu acceso: correo, contraseña y sesiones abiertas en la web y en la app.</li>
					<li>Tus datos de contacto: nombre, teléfono y direcciones guardadas.</li>
					<li>Tus datos de facturación guardados (RFC y razón social) que no estén en una factura ya emitida.</li>
					<li>El identificador de tu teléfono para notificaciones.</li>
				</ul>
			</SeccionLegal>

			<SeccionLegal titulo="Qué se conserva y por cuánto tiempo">
				<ul>
					<li>
						Las facturas (CFDI) ya emitidas y los registros contables de pedidos y cobros: cinco años, como exige el artículo 30 del Código Fiscal de la Federación. Los
						pedidos y cobros se conservan sin tu nombre ni tus datos de contacto.
					</li>
					<li>Si eres parte del personal, los registros laborales y de nómina, por el plazo que fijan las leyes laborales y de seguridad social.</li>
					<li>Los reportes de errores de la app no llevan tu nombre y se borran solos en un máximo de 90 días.</li>
				</ul>
				<p>Al terminar esos plazos, los datos se eliminan.</p>
			</SeccionLegal>

			<SeccionLegal titulo="Eliminar solo algunos datos">
				<p>Si no quieres eliminar la cuenta, puedes pedir por el mismo correo que borremos solo tus direcciones o tus datos de facturación guardados.</p>
				<p>Para dejar de recibir notificaciones de la app, desactívalas en los ajustes de tu teléfono.</p>
			</SeccionLegal>

			<SeccionLegal titulo="Más información">
				<p>
					El tratamiento completo de tus datos está en el <Link href="/privacidad">aviso de privacidad</Link>, y los datos del responsable, en{" "}
					<Link href="/corporativo">Información corporativa</Link>.
				</p>
				<p>{`Última actualización: ${d.ultimaActualizacion}.`}</p>
			</SeccionLegal>
		</PaginaLegal>
	);
}
