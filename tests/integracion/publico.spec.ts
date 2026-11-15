import { test, expect, type Browser, type BrowserContext, type Page } from "@playwright/test";

// Flujos públicos de punta a punta contra el API local real, sin simular respuestas (ver
// playwright.integracion.config.ts): pedido desde la ficha del platillo con la sesión del cliente,
// reserva con mesas bloqueadas por capacidad y por una reserva en curso, y dos clientes a la vez
// por la misma mesa. Regresión de los bugs del 14-nov (401 al pedir y reserva rechazada al final).
const API = process.env.API_URL ?? "http://localhost:10000";
const CLAVE = process.env.CLAVE_PRUEBAS ?? "Prueba#2026";
const CAPTURAS = process.env.CAPTURAS ?? "test-results/integracion/capturas";

test.skip(!/^http:\/\/(localhost|127\.0\.0\.1)/.test(API), "solo contra el API local con datos de prueba");
test.describe.configure({ mode: "serial" });

interface Reglas {
	utcOffsetMin: number;
	reservas: { duracionMin: number };
	horario: { dia: number; apertura: string; cerrado: boolean }[];
	diasEspeciales: { fecha: string }[];
}
interface Mesa {
	id: number;
	numero: string;
	capacidad: number;
	estado: string;
}

let reglas: Reglas;
let fecha: string;
let apertura: number;
let sesion: Awaited<ReturnType<BrowserContext["storageState"]>>;

const hora = (min: number) => {
	const t = apertura + min;
	return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};
const iso = (h: string) => {
	const [y, m, d] = fecha.split("-").map(Number);
	const [hh, mm] = h.split(":").map(Number);
	return new Date(Date.UTC(y, m - 1, d, hh, mm) - reglas.utcOffsetMin * 60_000).toISOString();
};
const plano = async (h: string, n = 2) => (await (await fetch(`${API}/reservations/map?fechaHora=${fecha}T${h}&numComensales=${n}`)).json()) as Mesa[];
const captura = (page: Page, nombre: string) => page.screenshot({ path: `${CAPTURAS}/${nombre}.png`, fullPage: true });

test.beforeAll(async ({ browser }) => {
	reglas = (await (await fetch(`${API}/reglas`)).json()) as Reglas;
	const especiales = new Set(reglas.diasEspeciales.map((d) => d.fecha));
	// Un día abierto lejano y distinto en cada corrida: no choca con reservas anteriores.
	for (let n = 30 + Math.floor(Math.random() * 300); ; n++) {
		const f = new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10);
		const dia = reglas.horario.find((h) => h.dia === new Date(`${f}T12:00:00Z`).getUTCDay());
		if (dia && !dia.cerrado && !especiales.has(f)) {
			fecha = f;
			const [h, m] = dia.apertura.split(":").map(Number);
			apertura = h * 60 + m;
			break;
		}
	}
	// Un solo inicio de sesión (el API admite 5 por minuto); las pruebas reutilizan la sesión.
	const page = await browser.newPage();
	await page.goto("/login");
	await page.getByLabel("Correo").fill("cliente@prueba.local");
	await page.getByLabel("Contraseña").fill(CLAVE);
	await page.getByRole("button", { name: "Iniciar sesión" }).click();
	await page.waitForURL((u) => !u.pathname.startsWith("/login"));
	sesion = await page.context().storageState();
	await page.close();
});

async function conSesion(browser: Browser) {
	return (await browser.newContext({ storageState: sesion })).newPage();
}

test.describe("pedido desde la ficha del platillo", () => {
	let platillo: number;
	test.beforeAll(async () => {
		const menu = (await (await fetch(`${API}/menu`)).json()) as { id: number; disponible?: boolean }[];
		platillo = Number((menu.find((p) => p.disponible !== false) ?? menu[0]).id);
	});

	test("a domicilio: el POST lleva el token y el cliente llega a su pedido", async ({ browser }) => {
		const page = await conSesion(browser);
		await page.goto(`/menu/producto/${platillo}`);
		const peticion = page.waitForRequest((r) => r.url().endsWith("/pedidos/mesa") && r.method() === "POST");
		const respuesta = page.waitForResponse((r) => r.url().endsWith("/pedidos/mesa") && r.request().method() === "POST");
		await page.getByRole("button", { name: "Para domicilio" }).click();
		expect((await peticion).headers()["authorization"]).toMatch(/^Bearer \S+/);
		expect((await respuesta).status()).toBe(201);
		await page.waitForURL(/\/menu\/pedido\?tab=domicilio/);
		await captura(page, "pedido-domicilio");
	});

	test("en mesa: se añade o se ve el motivo real del API, nunca el genérico", async ({ browser }) => {
		const mesas = (await (await fetch(`${API}/mesas`)).json()) as { numero: string }[];
		const page = await conSesion(browser);
		await page.goto(`/menu/producto/${platillo}?mesaQuery=${encodeURIComponent(mesas[0].numero)}`);
		const respuesta = page.waitForResponse((r) => r.url().endsWith("/pedidos/mesa") && r.request().method() === "POST");
		await page.getByRole("button", { name: "Pedir en mesa" }).click();
		const r = await respuesta;
		expect(r.status()).not.toBe(401);
		if (r.status() === 201) await page.waitForURL(/\/menu\/pedido\?.*tab=mesa/);
		else {
			// Fuera del horario de cocina: el cliente ve el texto del API («Cocina recibe pedidos de…»).
			const { message } = (await r.json()) as { message: string };
			await expect(page.getByText(message).first()).toBeVisible();
			await expect(page.getByText(/No pudimos añadirlo a tu pedido/)).toHaveCount(0);
		}
		await captura(page, "pedido-mesa");
	});
});

test.describe("reserva", () => {
	async function hastaElPlano(page: Page, h: string, personas: number) {
		await page.goto("/reservations");
		await page.getByLabel("Nombre completo", { exact: true }).fill("Ana López");
		await page.getByLabel("Teléfono", { exact: true }).fill("771 123 4567");
		await page.getByLabel("Correo", { exact: true }).fill("ana@correo.mx");
		await page.getByRole("checkbox", { name: /aviso de privacidad/ }).check();
		await page.getByRole("button", { name: "Continuar" }).click();
		await page.getByLabel("Fecha").fill(fecha);
		await page.getByLabel("Hora").fill(h);
		await page.getByLabel("Comensales").fill(String(personas));
		await page.getByRole("button", { name: "Ver mesas libres" }).click();
		await expect(page.getByText("Buscando mesas libres…")).toHaveCount(0, { timeout: 30_000 });
	}
	async function confirmar(page: Page, numero: string) {
		await page.getByRole("button", { name: new RegExp(`^Mesa ${numero}\\b`) }).click();
		await page.getByRole("button", { name: "Continuar" }).click();
		await page.waitForTimeout(1_100); // tiempo mínimo del formulario protegido
		await page.getByRole("button", { name: "Confirmar reserva" }).click();
	}

	test("para 6 personas las mesas chicas salen bloqueadas con su motivo y se reserva una apta", async ({ page }) => {
		await hastaElPlano(page, hora(60), 6);
		const mesas = await plano(hora(60), 6);
		const chica = mesas.find((m) => m.capacidad < 6)!;
		const apta = mesas.find((m) => m.estado === "disponible")!;
		const botonChica = page.getByRole("button", { name: new RegExp(`^Mesa ${chica.numero}\\b`) });
		await expect(botonChica).toBeDisabled();
		await expect(botonChica).toContainText(`Para ${chica.capacidad} personas`);
		await captura(page, "reserva-mesas-bloqueadas");
		await confirmar(page, apta.numero);
		await expect(page.getByRole("heading", { name: "Mesa reservada" })).toBeVisible();
	});

	test("una reserva que sigue en curso bloquea la mesa media hora después", async ({ page }) => {
		const libre = (await plano(hora(120))).find((m) => m.estado === "disponible")!;
		const r = await fetch(`${API}/reservations`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ clienteNombre: "Otra Persona", clienteTelefono: "7711234567", clienteEmail: "otra@prueba.local", fechaHora: iso(hora(120)), numComensales: 2, mesaId: libre.id }),
		});
		expect(r.status).toBe(201);
		await hastaElPlano(page, hora(150), 2);
		const boton = page.getByRole("button", { name: new RegExp(`^Mesa ${libre.numero}\\b`) });
		await expect(boton).toBeDisabled();
		await expect(boton).toContainText("Reservada a esa hora");
		await captura(page, "reserva-en-curso-bloquea");
	});

	test("dos clientes a la vez por la misma mesa: uno reserva y el otro ve el motivo", async ({ browser }) => {
		const h = hora(240);
		const libre = (await plano(h)).find((m) => m.estado === "disponible")!;
		const [a, b] = await Promise.all([browser.newPage(), browser.newPage()]);
		await Promise.all([hastaElPlano(a, h, 2), hastaElPlano(b, h, 2)]);
		await Promise.all([confirmar(a, libre.numero), confirmar(b, libre.numero)]);
		const MOTIVO = "Esa mesa ya está reservada a esa hora. Elige otra mesa u otra hora.";
		const resultado = async (p: Page) => {
			const exito = p.getByRole("heading", { name: "Mesa reservada" });
			await expect(exito.or(p.getByText(MOTIVO)).first()).toBeVisible();
			return (await exito.count()) > 0;
		};
		const [ganaA, ganaB] = await Promise.all([resultado(a), resultado(b)]);
		expect([ganaA, ganaB].filter(Boolean)).toHaveLength(1);
		const perdedor = ganaA ? b : a;
		await expect(perdedor.getByText(MOTIVO).first()).toBeVisible();
		await captura(perdedor, "reserva-carrera-perdedor");
	});
});
