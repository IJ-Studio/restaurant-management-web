/**
 * Campo trampa (honeypot) contra el envío automático de formularios: un campo que una persona
 * no ve ni recorre, y que muchos robots rellenan. `useEnvioFormulario` no envía si llega con
 * texto. Es una defensa ligera del front; la protección real contra abuso es del servidor (NP-07).
 *
 * - No usa `display: none` ni `hidden`, que algunos robots detectan: queda fuera de la vista.
 * - `aria-hidden`, `tabIndex={-1}` y `autoComplete="off"`: ni los lectores, ni el tabulador, ni
 *   el autorrelleno del navegador llegan a él.
 */
export const NOMBRE_CAMPO_TRAMPA = "sitio_web";

export function CampoTrampa({ nombre = NOMBRE_CAMPO_TRAMPA }: { nombre?: string }) {
	return (
		<div aria-hidden="true" className="pointer-events-none absolute -left-[100vw] h-px w-px overflow-hidden opacity-0">
			<label htmlFor={`trampa-${nombre}`}>Deja este campo vacío</label>
			<input id={`trampa-${nombre}`} type="text" name={nombre} tabIndex={-1} autoComplete="off" defaultValue="" />
		</div>
	);
}
