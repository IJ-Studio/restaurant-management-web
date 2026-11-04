"use client";

import { useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { AnuncioFormulario } from "@/components/ui/AnuncioFormulario";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { CampoTrampa } from "@/components/ui/CampoTrampa";
import { Imagen } from "@/components/ui/Imagen";
import { CargadorMarca } from "@/components/marca/CargadorMarca";
import { EncabezadoPublico } from "@/components/marca/EncabezadoPublico";
import { useLockout } from "@/hooks/useLockout";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useEnvioFormulario } from "@/hooks/useEnvioFormulario";
import { restaurantConfig } from "@/config/restaurant.config";
import { setUser } from "@/store/slices/authSlice";
import { destinoTrasLogin, esRutaInternaSegura, rutaConParametros } from "@/lib/seguridad/urls";
import { olvidarSesion } from "@/lib/sesion/sesion-cliente";
import { esquemaAcceso } from "@/lib/validacion/formularios";

/**
 * Iniciar sesión (`/login`, PLAN 4.17). La lógica no cambia: `POST /api/auth/login`, el token en
 * la cookie y en `authToken` (D-03, hasta NP-04), el usuario solo en el store (2.15), el bloqueo
 * por intentos del API y el destino validado tras entrar (2.13).
 *
 * - **Errores genéricos:** «El correo o la contraseña no coinciden», nunca si la cuenta existe
 *   (NP-15) ni el texto del servidor; los avisos de bloqueo y de demasiados intentos se conservan.
 * - `useEnvioFormulario` con el esquema de acceso, el campo trampa y `tiempoMinimoMs={0}`: con
 *   autorrelleno, una persona entra en menos de un segundo (decisión del usuario, 2026-11-01).
 *   Además impide el envío doble.
 * - `autocomplete` `email` y `current-password`; al entrar, el cargador de marca en lugar de
 *   «¡Login exitoso! Redirigiendo...» (D-20).
 */
const NO_COINCIDEN = "El correo o la contraseña no coinciden. Revísalos e inténtalo de nuevo.";
const FALLO = "No pudimos iniciar sesión. Inténtalo de nuevo en un momento.";
const ES_BLOQUEO = /Debes esperar|Demasiados intentos/;

export default function PaginaAcceso() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const dispatch = useDispatch();
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl");
	const pendingAction = searchParams.get("action");
	const pendingCantidad = searchParams.get("cantidad");
	// Enlace al registro que conserva la ruta de origen solo si es interna y segura (PLAN 2.13).
	const urlRegistro = rutaConParametros("/register", {
		callbackUrl: esRutaInternaSegura(callbackUrl) ? callbackUrl : undefined,
		action: pendingAction,
		cantidad: pendingCantidad,
	});

	const lockout = useLockout({
		lockoutPatterns: ["Debes esperar", "Demasiados intentos"],
		extractSeconds: (msg) => {
			const match = msg.match(/(\d+)/);
			return match ? Number(match[1]) : null;
		},
	});

	const loginAction = async () => {
		let res: Response;
		try {
			res = await fetch("/api/auth/login", {
				cache: "no-store",
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
		} catch {
			throw new Error(FALLO);
		}
		const data = await res.json().catch(() => ({}));
		if (!res.ok) {
			const apiMessage = Array.isArray(data.message) ? data.message.join(". ") : data.message;
			const texto: string = apiMessage || data.error || "";
			// El bloqueo temporal lleva sus segundos en el texto: se pasa tal cual para que lo lea useLockout.
			if (ES_BLOQUEO.test(texto)) throw new Error(texto);
			if (res.status === 429) throw new Error("Has hecho muchos intentos seguidos. Espera un minuto e inténtalo de nuevo.");
			throw new Error(res.status === 400 || res.status === 401 || res.status === 404 ? NO_COINCIDEN : FALLO);
		}
		if (data.accessToken) {
			document.cookie = `session=${data.accessToken}; path=/; max-age=86400; samesite=strict`;
			localStorage.setItem("authToken", data.accessToken);
		}
		return data;
	};

	const { execute, loading, error, success } = useAsyncAction({
		action: loginAction,
		successMessage: "Te llevamos a tu cuenta…",
		onSuccess: (data) => {
			const roleNames: Record<number, string> = { 1: "admin", 2: "cajero", 3: "mesero", 4: "cocina", 5: "cliente" };
			const roleName = roleNames[data.user?.roleId] || "cliente";
			const sessionUser = {
				id: String(data.user.id),
				name: data.user.name || "",
				lastname: data.user.lastname || "",
				email: data.user.email,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mismo tipo que antes del rediseño
				roleName: roleName as any,
			};
			// Los datos del usuario solo viven en memoria, en el store (PLAN 2.15).
			olvidarSesion();
			dispatch(setUser(sessionUser));
			setTimeout(() => {
				// Destino validado (PLAN 2.13): un callbackUrl que no sea una ruta interna segura lleva al inicio.
				router.push(destinoTrasLogin({ rol: roleName, callbackUrl, accion: pendingAction, cantidad: pendingCantidad }));
				router.refresh();
			}, 100);
		},
		lockout: { checkLockout: lockout.checkLockout, resetLockout: lockout.resetLockout },
	});

	const { propsFormulario, errores, errorGeneral, enviando, anuncio } = useEnvioFormulario({
		esquema: esquemaAcceso,
		tiempoMinimoMs: 0,
		alEnviar: async () => {
			await execute();
		},
	});

	const bloqueado = lockout.waitSeconds !== null;
	const mensajeError = error && !bloqueado ? error : errorGeneral;

	return (
		<div className="contenedor-pagina grid items-start gap-(--espacio-2xl) pb-(--espacio-entre-secciones) lg:grid-cols-2">
			<div className="flex max-w-[30rem] flex-col">
				<EncabezadoPublico ruta="/login" titulo="Iniciar sesión" entradilla="Entra para seguir tus pedidos y tus reservas." />
				{success ? (
					<CargadorMarca tamano="amplio" texto={success} className="py-(--espacio-2xl)" />
				) : (
					<form {...propsFormulario} aria-labelledby="titulo-acceso" className="relative flex flex-col gap-(--espacio-md)">
						<h2 id="titulo-acceso" className="solo-lectores">
							Datos de acceso
						</h2>
						<CampoTrampa />
						<AnuncioFormulario mensaje={anuncio} />
						{bloqueado && (
							<Aviso tono="aviso" titulo="Espera un momento">
								{`Podrás intentarlo de nuevo en ${lockout.waitSeconds} segundos.`}
							</Aviso>
						)}
						{mensajeError && <Aviso tono="error">{mensajeError}</Aviso>}
						<Campo
							id="email"
							name="email"
							etiqueta="Correo"
							type="email"
							inputMode="email"
							autoComplete="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							error={errores.email}
						/>
						<Campo
							id="password"
							name="password"
							etiqueta="Contraseña"
							type="password"
							revelable
							autoComplete="current-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							error={errores.password}
						/>
						<p className="m-0 text-end text-(length:--texto-pequeno)">
							<Link href="/frm_reset" className="enlace-subrayado inline-flex min-h-11 items-center text-texto-secundario">
								¿Olvidaste tu contraseña?
							</Link>
						</p>
						<Boton type="submit" variante="primario" icono={<LogIn />} cargando={loading || enviando} textoCargando="Entrando…" deshabilitado={bloqueado}>
							Iniciar sesión
						</Boton>
						<p className="m-0 border-t border-borde-sutil pt-(--espacio-md) text-center text-texto-secundario">
							¿Aún no tienes cuenta?{" "}
							<Link href={urlRegistro} className="enlace-subrayado inline-flex min-h-11 items-center text-texto-principal">
								Crear una cuenta
							</Link>
						</p>
					</form>
				)}
			</div>
			<div className="relative hidden aspect-[4/5] max-h-[calc(100dvh-var(--alto-cabecera)-var(--espacio-3xl))] w-full overflow-hidden rounded-tarjeta border border-borde-sutil bg-superficie-cafe lg:mt-(--espacio-xl) lg:block">
				<Imagen
					src={restaurantConfig.images.fondoAcceso}
					fill
					decorativa
					className="object-cover"
					sizes="(min-width: 1024px) 50vw, 100vw"
				/>
			</div>
		</div>
	);
}
