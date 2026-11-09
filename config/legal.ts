/**
 * Datos legales del proveedor (PLAN-AMPLIACION D-36; Art. 76 BIS de la LFPC): deben verse en el pie
 * y en las páginas legales. **No se inventa ninguno**: mientras un campo esté vacío, el sitio
 * muestra «Dato por confirmar». Los rellena el restaurante, y los textos deben revisarlos un
 * abogado antes de publicar.
 *
 * Lo que sí sale del proyecto: el nombre comercial, el teléfono y la dirección del local
 * (`restaurant.config.ts`), la pasarela de pago (Stripe, integrada en el pago en línea) y el
 * alojamiento del sitio (Vercel, por `vercel.json`).
 */
export const DATOS_LEGALES = {
	/** Responsable del tratamiento: el dueño del restaurante (persona física). */
	razonSocial: "Alejandro Daniel Monterrubio Caballero",
	rfc: "",
	domicilioFiscal: "Pzla. Hidalgo 5-1, Centro, 43000 Huejutla de Reyes, Hgo.",
	correoContacto: "elquijote.atencion@gmail.com",
	/** Correo para ejercer los derechos ARCO. */
	correoPrivacidad: "elquijote.atencion@gmail.com",
	horarioAtencion: "",
	/** Correo o enlace para pedir un reembolso, y en cuánto se procesa. */
	contactoReembolsos: "",
	plazoReembolsos: "",
	/** Enlace del portal de autofacturación CFDI 4.0. */
	portalFacturacion: "",
	pasarelaPago: "Stripe",
	alojamiento: "Vercel",
	/** Nombre de la app móvil del personal, tal como aparece en Google Play. */
	nombreApp: "Restaurante El Quijote",
	/** Fecha de la versión de los textos legales publicados. */
	ultimaActualizacion: "9 de noviembre de 2026",
} as const;

export const POR_CONFIRMAR = "Dato por confirmar";
