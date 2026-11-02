"use client";

import { useState, type ReactNode } from "react";
import { z } from "zod";
import { AnuncioFormulario, AreaTexto, Boton, Campo, CampoTrampa, Casilla, Interruptor, MensajeError, Selector } from "@/components/ui";
import { useEnvioFormulario } from "@/hooks/useEnvioFormulario";
import { codigoPostal, correo, nombrePersona, telefono, textoLibre } from "@/lib/validacion/campos";
import { Muestra } from "./Muestra";

const esperar = (ms: number) => new Promise((resolver) => window.setTimeout(resolver, ms));

const PERSONAS = [1, 2, 3, 4, 5, 6, 8, 10].map((n) => ({ valor: String(n), texto: n === 1 ? "1 persona" : `${n} personas` }));

const ESTADOS = ["Vacío", "Con valor", "Foco visible", "Error", "Deshabilitado", "Solo lectura"] as const;

function Columna({ titulo, children }: { titulo: string; children: ReactNode }) {
	return (
		<div className="flex min-w-0 flex-col gap-2">
			<code className="text-(length:--texto-pequeno) text-texto-tenue">{titulo}</code>
			{children}
		</div>
	);
}

/** Cada estado del campo de texto, fijo, con la misma CSS que el real. */
function MatrizCampo() {
	return (
		<div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
			{ESTADOS.map((estado) => (
				<Columna key={estado} titulo={estado}>
					<Muestra ancho>
						<Campo
							etiqueta="Correo electrónico"
							type="email"
							autoComplete="email"
							inputMode="email"
							placeholder="nombre@correo.mx"
							ayuda={estado === "Vacío" ? "Te enviaremos la confirmación aquí." : undefined}
							defaultValue={estado === "Vacío" || estado === "Foco visible" ? undefined : estado === "Error" ? "ana@correo" : "ana.lopez@correo.mx"}
							error={estado === "Error" ? "Ingresa un correo electrónico válido." : undefined}
							disabled={estado === "Deshabilitado"}
							readOnly={estado === "Solo lectura"}
							data-demo={estado === "Foco visible" ? "foco" : undefined}
						/>
					</Muestra>
				</Columna>
			))}
		</div>
	);
}

function Variantes() {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			<Muestra ancho>
				<Campo
					etiqueta="Contraseña"
					type="password"
					autoComplete="new-password"
					revelable
					defaultValue="Quijote#29"
					ayuda="De 8 a 64 caracteres, con mayúscula, minúscula, número y símbolo."
				/>
			</Muestra>
			<Muestra ancho>
				<Campo
					etiqueta="Código postal"
					codigo
					inputMode="numeric"
					autoComplete="postal-code"
					maxLength={5}
					contador
					defaultValue="4310"
					ayuda="5 dígitos."
				/>
			</Muestra>
			<Muestra ancho>
				<Selector etiqueta="Personas" marcador="Elige cuántas personas" opciones={PERSONAS} />
			</Muestra>
			<Muestra ancho>
				<Selector etiqueta="Régimen fiscal" opciones={PERSONAS} error="Selecciona un régimen fiscal." defaultValue="" marcador="Elige un régimen" />
			</Muestra>
			<Muestra ancho>
				<AreaTexto
					etiqueta="Peticiones especiales"
					opcional
					maxLength={300}
					contador
					defaultValue="Mesa cerca de la ventana. Uno de nosotros es alérgico a los frutos secos."
					ayuda="Alergias, celebraciones o accesibilidad."
				/>
			</Muestra>
			<Muestra ancho>
				<AreaTexto etiqueta="Notas para cocina" disabled defaultValue="Sin cebolla." />
			</Muestra>
		</div>
	);
}

function Opciones() {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			<div className="flex flex-col gap-1">
				<Columna titulo="Casilla">
					<Muestra ancho>
						<Casilla etiqueta="Recibir novedades de la casa" />
					</Muestra>
					<Muestra ancho>
						<Casilla etiqueta="Acepto el aviso de privacidad" defaultChecked ayuda="Puedes leerlo en el pie de la página." />
					</Muestra>
					<Muestra ancho>
						<Casilla etiqueta="Foco visible" data-demo="foco" />
					</Muestra>
					<Muestra ancho>
						<Casilla etiqueta="Acepto los términos y condiciones" error="Debes aceptar los términos y condiciones." />
					</Muestra>
					<Muestra ancho>
						<Casilla etiqueta="Deshabilitada" disabled />
					</Muestra>
					<Muestra ancho>
						<Casilla etiqueta="Deshabilitada y marcada" disabled defaultChecked />
					</Muestra>
				</Columna>
			</div>
			<div className="flex flex-col gap-1">
				<Columna titulo="Interruptor">
					<Muestra ancho>
						<Interruptor etiqueta="Platillo disponible" ayuda="Se muestra en la carta al momento." />
					</Muestra>
					<Muestra ancho>
						<Interruptor etiqueta="Aceptar reservas en línea" defaultChecked />
					</Muestra>
					<Muestra ancho>
						<Interruptor etiqueta="Foco visible" data-demo="foco" />
					</Muestra>
					<Muestra ancho>
						<Interruptor etiqueta="Deshabilitado" disabled />
					</Muestra>
					<Muestra ancho>
						<Interruptor etiqueta="Deshabilitado y encendido" disabled defaultChecked />
					</Muestra>
				</Columna>
			</div>
		</div>
	);
}

const esquemaDemo = z.object({
	nombre: nombrePersona("Escribe tu nombre."),
	correo,
	telefono,
	codigoPostal: codigoPostal(),
	personas: z.string().min(1, { error: "Elige cuántas personas." }),
	peticiones: textoLibre(300),
	privacidad: z.literal(true, { error: "Acepta el aviso de privacidad para continuar." }),
	recordatorio: z.boolean(),
});

/** Formulario completo con `useEnvioFormulario`: enfoque del primer error, anuncio y envío protegido. */
function FormularioDemo() {
	const [resultado, setResultado] = useState("");
	const [envios, setEnvios] = useState(0);
	const { propsFormulario, errores, errorGeneral, enviando, anuncio } = useEnvioFormulario({
		esquema: esquemaDemo,
		alEnviar: async (datos) => {
			setEnvios((n) => n + 1);
			setResultado("");
			await esperar(1200);
			if (datos.correo === "falla@ejemplo.mx") throw new Error("No se pudo enviar la solicitud. Inténtalo de nuevo en unos minutos.");
			setResultado(`Solicitud enviada para ${datos.personas === "1" ? "1 persona" : `${datos.personas} personas`}.`);
		},
	});

	return (
		<form
			{...propsFormulario}
			data-prueba="formulario"
			aria-labelledby="formulario-demo-titulo"
			className="relative grid max-w-2xl gap-5 rounded-tarjeta border border-borde-sutil bg-superficie p-6 md:grid-cols-2"
		>
			<h3 id="formulario-demo-titulo" className="m-0 text-(length:--texto-titulo-interfaz) font-semibold md:col-span-2">
				Solicitud de reserva
			</h3>
			<Campo name="nombre" etiqueta="Nombre" autoComplete="given-name" error={errores.nombre} />
			<Campo name="correo" etiqueta="Correo electrónico" type="email" autoComplete="email" inputMode="email" error={errores.correo} />
			<Campo
				name="telefono"
				etiqueta="Teléfono"
				type="tel"
				autoComplete="tel-national"
				inputMode="tel"
				maxLength={14}
				ayuda="10 dígitos."
				error={errores.telefono}
			/>
			<Campo
				name="codigoPostal"
				etiqueta="Código postal"
				codigo
				inputMode="numeric"
				autoComplete="postal-code"
				maxLength={5}
				error={errores.codigoPostal}
			/>
			<Selector name="personas" etiqueta="Personas" marcador="Elige cuántas personas" opciones={PERSONAS} error={errores.personas} />
			<div className="hidden md:block" />
			<AreaTexto
				name="peticiones"
				etiqueta="Peticiones especiales"
				opcional
				maxLength={300}
				contador
				className="md:col-span-2"
				error={errores.peticiones}
			/>
			<Casilla name="privacidad" etiqueta="Acepto el aviso de privacidad" className="md:col-span-2" error={errores.privacidad} />
			<Interruptor name="recordatorio" etiqueta="Recordatorio por correo el día anterior" className="md:col-span-2" />
			<CampoTrampa />
			<AnuncioFormulario mensaje={anuncio} />
			<div className="flex flex-col items-start gap-3 md:col-span-2">
				<Boton type="submit" cargando={enviando} data-prueba="enviar">
					Enviar solicitud
				</Boton>
				{errorGeneral && (
					<div role="alert" data-prueba="error-general">
						<MensajeError>{errorGeneral}</MensajeError>
					</div>
				)}
				<p data-prueba="envios" className="m-0 text-(length:--texto-pequeno) text-texto-secundario numeros-tabulares">
					Envíos atendidos: {envios}
				</p>
				<p role="status" data-prueba="resultado-formulario" className="m-0 min-h-[1.5em] text-(length:--texto-pequeno) text-texto-secundario">
					{resultado}
				</p>
			</div>
		</form>
	);
}

/** Contenido de la sección «Campos» del catálogo. */
export function DemosCampos() {
	return (
		<div className="flex flex-col gap-10">
			<div className="flex flex-col gap-4">
				<h3 className="m-0 text-(length:--texto-titulo-interfaz) font-semibold">Campo: estados</h3>
				<MatrizCampo />
			</div>
			<div className="flex flex-col gap-4">
				<h3 className="m-0 text-(length:--texto-titulo-interfaz) font-semibold">Contraseña, código, selector y área de texto</h3>
				<Variantes />
			</div>
			<div className="flex flex-col gap-4">
				<h3 className="m-0 text-(length:--texto-titulo-interfaz) font-semibold">Casilla e interruptor</h3>
				<Opciones />
			</div>
			<div className="flex flex-col gap-4">
				<h3 className="m-0 text-(length:--texto-titulo-interfaz) font-semibold">Envío protegido</h3>
				<p className="m-0 max-w-(--ancho-lectura) text-(length:--texto-pequeno) leading-[1.5] text-texto-secundario">
					Al enviar con errores, el foco va al primer campo inválido y un lector de pantalla oye cuántos son. No se envía dos veces,
					ni antes de 3 segundos, ni con el campo trampa relleno. Con el correo «falla@ejemplo.mx» se simula un fallo del servidor.
				</p>
				<FormularioDemo />
			</div>
		</div>
	);
}
