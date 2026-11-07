import type { Metadata } from "next";
import { PaginaLegal, SeccionLegal } from "@/components/marca/PaginaLegal";
import { DATOS_LEGALES } from "@/config/legal";

export const metadata: Metadata = { title: "Política de cookies" };

/**
 * Política de cookies (PLAN-AMPLIACION D-36). Parte del texto del documento legal público y lo
 * ajusta a lo que el sitio hace hoy: solo usa cookies esenciales (sesión) y guarda en el navegador
 * las opciones de accesibilidad; no hay analítica ni publicidad, así que no hay banner. Si se
 * añaden cookies no esenciales, hará falta el banner para aceptarlas, rechazarlas o personalizarlas.
 * Adaptación anotada fuera del repo, pendiente de revisión legal.
 */
export default function CookiesPage() {
	return (
		<PaginaLegal ruta="/cookies" titulo="Política de cookies" entradilla="Qué guardamos en tu navegador y para qué.">
			<SeccionLegal titulo="Cookies esenciales">
				<p>
					Usamos cookies para el funcionamiento esencial del sitio, como mantener tu sesión iniciada mientras haces un pedido. <strong>No requieren tu consentimiento</strong>:
					son necesarias para el servicio.
				</p>
			</SeccionLegal>

			<SeccionLegal titulo="Tus opciones de accesibilidad">
				<p>Si cambias el tema, el tamaño del texto o el movimiento en el panel de accesibilidad, guardamos esa elección en tu navegador para recordarla. No contiene datos personales.</p>
			</SeccionLegal>

			<SeccionLegal titulo="Analítica y publicidad">
				<p>Hoy no usamos cookies de analítica ni de publicidad. Si algún día las usamos, te pediremos que las aceptes, las rechaces o las personalices antes de activarlas.</p>
			</SeccionLegal>

			<SeccionLegal titulo="Cómo desactivar las cookies">
				<p>
					Puedes borrar o bloquear las cookies desde la configuración de privacidad de tu navegador (Chrome, Firefox, Safari o Edge). Si bloqueas las esenciales, no podrás iniciar sesión
					ni completar un pedido.
				</p>
				<p>{`Última actualización: ${DATOS_LEGALES.ultimaActualizacion}.`}</p>
			</SeccionLegal>
		</PaginaLegal>
	);
}
