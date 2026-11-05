import { test, expect } from "@playwright/test";
import { enlaceWhatsApp, numeroWhatsApp } from "../../lib/contacto/whatsapp";

// Enlaces de WhatsApp (Prioridad 3.4). Sin navegador.
test.describe("whatsapp", () => {
	test("normaliza el número con la lada de país", () => {
		expect(numeroWhatsApp("771 123 4567")).toBe("527711234567");
		expect(numeroWhatsApp("+52 771 123 4567")).toBe("527711234567");
		expect(numeroWhatsApp("527711234567")).toBe("527711234567");
		expect(numeroWhatsApp("+1 415 555 0100")).toBe("14155550100");
	});
	test("un número que no sirve devuelve null (el botón se desactiva)", () => {
		expect(numeroWhatsApp("")).toBeNull();
		expect(numeroWhatsApp("12345")).toBeNull();
		expect(enlaceWhatsApp(undefined)).toBeNull();
	});
	test("el mensaje va codificado", () => {
		expect(enlaceWhatsApp("7711234567", "Hola, Ana: ¿confirmas?")).toBe("https://wa.me/527711234567?text=Hola%2C%20Ana%3A%20%C2%BFconfirmas%3F");
	});
});
