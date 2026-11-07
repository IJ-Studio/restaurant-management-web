/**
 * Enlaces de WhatsApp (`https://wa.me/<lada y número>?text=…`, Prioridad 3.4). El número se
 * normaliza con la lada de país: 10 dígitos de México → 52 delante; si ya trae lada (+52…, +1…),
 * se respeta. Devuelve `null` si el número no sirve, para desactivar el botón y decir por qué.
 */
export function numeroWhatsApp(telefono: string | null | undefined): string | null {
	if (!telefono) return null;
	const digitos = telefono.replace(/\D/g, "");
	if (telefono.trim().startsWith("+") && digitos.length >= 10 && digitos.length <= 15) return digitos;
	if (digitos.length === 10) return `52${digitos}`;
	if (digitos.length === 12 && digitos.startsWith("52")) return digitos;
	return null;
}

export function enlaceWhatsApp(telefono: string | null | undefined, mensaje?: string): string | null {
	const numero = numeroWhatsApp(telefono);
	if (!numero) return null;
	return `https://wa.me/${numero}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ""}`;
}
