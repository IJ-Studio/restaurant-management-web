/**
 * Región `aria-live` del formulario: anuncia a los lectores de pantalla el resumen que prepara
 * `useEnvioFormulario` («Revisa 2 campos: …»). Va oculta a la vista; los errores visibles están
 * en cada campo y en el aviso junto al botón de envío.
 */
export function AnuncioFormulario({ mensaje }: { mensaje: string }) {
	return (
		<p role="status" aria-live="polite" aria-atomic="true" className="solo-lectores">
			{mensaje}
		</p>
	);
}
