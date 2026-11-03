"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Circle, UserPlus } from "lucide-react";
import { AnuncioFormulario } from "@/components/ui/AnuncioFormulario";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { CampoTrampa } from "@/components/ui/CampoTrampa";
import { Casilla } from "@/components/ui/Casilla";
import { Imagen } from "@/components/ui/Imagen";
import { EncabezadoPublico } from "@/components/marca/EncabezadoPublico";
import { useEnvioFormulario } from "@/hooks/useEnvioFormulario";
import { SettingsService } from "@/features/shared/services/dataService";
import { INITIAL_SETTINGS } from "@/features/shared/data/restaurantData";
import { requisitosContrasena, tieneSecuenciaPredecible } from "@/lib/validacion/campos";
import { aPayloadRegistro, esquemaRegistro, type DatosRegistro } from "@/lib/validacion/formularios";
import { cn } from "@/lib/utils";

/**
 * Crear cuenta (`/register`, PLAN 4.18). La lógica no cambia: las reglas de siempre (ahora en
 * `esquemaRegistro`, 3.1), el contrato exacto de `POST /api/auth/register` (`aPayloadRegistro`),
 * los mismos mensajes del API ya filtrados y la vuelta al inicio de sesión a los 3 s.
 *
 * - Campo trampa (defensa principal), tiempo mínimo por defecto (1 s) y sin envío doble
 *   (`useEnvioFormulario`; decisión del usuario, 2026-11-01). Errores junto a cada campo y un
 *   anuncio para lectores.
 * - Los requisitos de la contraseña, visibles bajo el campo y con su estado en texto, en lugar
 *   del botón con ventana y la barra de colores con estilo en línea.
 * - La foto de fondo se pide con `sizes` y, como en el login, solo desde 1024 px (BITÁCORA 3.1:
 *   en `next dev` a 1440 px era el LCP y se avisaba de `loading="eager"`): con `preload`.
 */
const REQUISITOS: { clave: keyof ReturnType<typeof requisitosContrasena>; texto: string }[] = [
	{ clave: "length", texto: "Entre 8 y 64 caracteres" },
	{ clave: "uppercase", texto: "Una letra mayúscula" },
	{ clave: "lowercase", texto: "Una letra minúscula" },
	{ clave: "number", texto: "Un número" },
	{ clave: "special", texto: "Un carácter especial (! @ # $ % & , . _ -)" },
];

export default function PaginaRegistro() {
	const router = useRouter();
	const [password, setPassword] = useState("");
	const [creada, setCreada] = useState(false);
	const [ajustes, setAjustes] = useState<ReturnType<typeof SettingsService.getSettings> | null>(null);
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- lectura única de los ajustes guardados
		setAjustes(SettingsService.getSettings());
	}, []);

	const { propsFormulario, errores, errorGeneral, enviando, anuncio } = useEnvioFormulario({
		esquema: esquemaRegistro,
		alEnviar: async (datos: DatosRegistro) => {
			let res: Response;
			try {
				res = await fetch("/api/auth/register", {
					cache: "no-store",
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(aPayloadRegistro(datos)),
				});
			} catch {
				throw new Error("No pudimos crear tu cuenta. Inténtalo de nuevo en un momento.");
			}
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				// Nest responde { message, error, statusCode }; en validación, `message` es una lista técnica en inglés.
				const texto = Array.isArray(data.message)
					? "Revisa los datos del formulario e inténtalo de nuevo."
					: res.status >= 500
						? "No pudimos completar el registro. Inténtalo de nuevo en unos minutos."
						: data.message;
				throw new Error(texto || "No pudimos crear tu cuenta. Inténtalo de nuevo.");
			}
			setCreada(true);
			setTimeout(() => router.push("/login"), 3000);
		},
	});

	const requisitos = requisitosContrasena(password);
	const secuencia = password.length > 0 && tieneSecuenciaPredecible(password);

	return (
		<div className="contenedor-pagina grid items-start gap-(--espacio-2xl) pb-(--espacio-entre-secciones) lg:grid-cols-2">
			<div className="flex max-w-[34rem] flex-col">
				<EncabezadoPublico ruta="/register" titulo="Crea tu cuenta" entradilla="Para pedir desde la carta, pagar en línea y tener tus reservas a mano." />
				{creada ? (
					<Aviso tono="exito" titulo="Tu cuenta está creada">
						Revisa tu correo y confirma tu cuenta antes de iniciar sesión. Te llevamos al inicio de sesión en unos segundos.
					</Aviso>
				) : (
					<form {...propsFormulario} aria-labelledby="titulo-registro" className="relative flex flex-col gap-(--espacio-md)">
						<h2 id="titulo-registro" className="solo-lectores">
							Datos de la cuenta
						</h2>
						<CampoTrampa />
						<AnuncioFormulario mensaje={anuncio} />
						{errorGeneral && <Aviso tono="error">{errorGeneral}</Aviso>}
						<div className="grid gap-(--espacio-md) sm:grid-cols-2">
							<Campo id="nombre" name="nombre" etiqueta="Nombre" autoComplete="given-name" maxLength={50} error={errores.nombre} />
							<Campo id="apellido" name="apellido" etiqueta="Apellido" autoComplete="family-name" maxLength={50} error={errores.apellido} />
						</div>
						<Campo id="correo" name="correo" etiqueta="Correo" type="email" inputMode="email" autoComplete="email" error={errores.correo} />
						<input type="hidden" name="lada" value="+52" />
						<Campo
							id="telefono"
							name="telefono"
							etiqueta="Teléfono"
							type="tel"
							inputMode="numeric"
							autoComplete="tel-national"
							maxLength={10}
							ayuda="10 dígitos; la lada es +52."
							error={errores.telefono}
						/>
						<div className="flex flex-col gap-(--espacio-sm)">
							<Campo
								id="password"
								name="password"
								etiqueta="Contraseña"
								type="password"
								revelable
								autoComplete="new-password"
								maxLength={64}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								aria-describedby="requisitos-contrasena"
								error={errores.password}
							/>
							<ul id="requisitos-contrasena" aria-label="Requisitos de la contraseña" className="m-0 grid list-none gap-1 p-0 text-(length:--texto-pequeno) sm:grid-cols-2">
								{REQUISITOS.map((r) => {
									const ok = requisitos[r.clave];
									return (
										<li key={r.clave} className={cn("flex items-start gap-2 [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.5]", ok ? "text-texto-principal" : "text-texto-secundario")}>
											{ok ? <Check aria-hidden="true" className="text-exito" /> : <Circle aria-hidden="true" />}
											<span>
												{r.texto}
												<span className="solo-lectores">{ok ? " (cumplido)" : " (pendiente)"}</span>
											</span>
										</li>
									);
								})}
							</ul>
							{secuencia && <p className="m-0 text-(length:--texto-pequeno) text-error">La contraseña contiene secuencias predecibles.</p>}
						</div>
						<Casilla
							id="terms"
							name="agreed"
							etiqueta={
								<>
									Acepto las{" "}
									<Link href="/condiciones" className="enlace-subrayado">
										condiciones de uso
									</Link>{" "}
									y el{" "}
									<Link href="/privacidad" className="enlace-subrayado">
										aviso de privacidad
									</Link>
								</>
							}
							error={errores.agreed}
						/>
						<Boton type="submit" variante="primario" icono={<UserPlus />} cargando={enviando} textoCargando="Creando tu cuenta…">
							Crear cuenta
						</Boton>
						<p className="m-0 border-t border-borde-sutil pt-(--espacio-md) text-center text-texto-secundario">
							¿Ya tienes cuenta?{" "}
							<Link href="/login" className="enlace-subrayado inline-flex min-h-11 items-center text-texto-principal">
								Inicia sesión
							</Link>
						</p>
					</form>
				)}
			</div>
			<div className="relative hidden aspect-[4/5] max-h-[calc(100dvh-var(--alto-cabecera)-var(--espacio-3xl))] w-full overflow-hidden rounded-tarjeta border border-borde-sutil bg-superficie-cafe lg:mt-(--espacio-xl) lg:block">
				<Imagen
					src={ajustes?.registerBgImageUrl || INITIAL_SETTINGS.registerBgImageUrl}
					fill
					decorativa
					preload
					className="object-cover"
					sizes="(min-width: 1024px) 50vw, 100vw"
				/>
			</div>
		</div>
	);
}
