"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, PenLine, Save, UserRound } from "lucide-react";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { AreaTexto, Campo } from "@/components/ui/Campo";
import { useConfirmacion } from "@/components/ui/DialogoConfirmacion";
import { Esqueleto, EsqueletoLineas, ZonaCargando } from "@/components/ui/Esqueleto";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { EncabezadoPublico } from "@/components/marca/EncabezadoPublico";
import { registrarError } from "@/lib/registro/registrar-error";
import { pedirSesion } from "@/lib/sesion/sesion-cliente";
import { esquemaPerfil } from "@/lib/validacion/formularios";

/**
 * Tu cuenta (`/profile`, PLAN 4.20). La lógica no cambia: los datos salen de la sesión, sin
 * sesión se va a `/login?redirect=/profile`, «Guardar» solo se activa si algo cambió, se pide
 * confirmación y se envía el mismo `PUT /usuarios/perfil/actualizar/{id}` con todo el formulario.
 *
 * Lo nuevo: dos bloques (datos personales y dirección) que se editan por separado con campos del
 * sistema y `autocomplete`; la confirmación es el diálogo del sistema en lugar de un banner; la
 * validación usa `esquemaPerfil` (3.1) con el error en cada campo; el resultado es una
 * notificación cálida, sin el mensaje del servidor; y esqueletos al cargar (D-20).
 */
type Perfil = {
	name: string;
	lastname: string;
	email: string;
	phone: string;
	calle: string;
	numero: string;
	colonia: string;
	ciudad: string;
	codigoPostal: string;
	indicaciones: string;
};
const VACIO: Perfil = { name: "", lastname: "", email: "", phone: "", calle: "", numero: "", colonia: "", ciudad: "", codigoPostal: "", indicaciones: "" };
const PERSONALES = ["name", "lastname", "phone"] as const;
// Sin editar, el campo se lee como texto (sin caja): se distingue a simple vista de uno editable.
const comoTexto = (editando: boolean) => (editando ? undefined : "border-transparent bg-transparent px-0");
const DIRECCION = ["calle", "numero", "colonia", "ciudad", "codigoPostal", "indicaciones"] as const;

export default function PaginaCuenta() {
	const router = useRouter();
	const { confirmar, dialogo } = useConfirmacion();
	const { notificar } = useNotificaciones();
	const [originales, setOriginales] = useState<Perfil | null>(null);
	const [formData, setFormData] = useState<Perfil>(VACIO);
	const [editandoPersonal, setEditandoPersonal] = useState(false);
	const [editandoDireccion, setEditandoDireccion] = useState(false);
	const [loading, setLoading] = useState(true);
	const [falloCarga, setFalloCarga] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errores, setErrores] = useState<Record<string, string>>({});

	useEffect(() => {
		(async () => {
			try {
				const sessionRes = await pedirSesion();
				if (!sessionRes.ok) return router.push("/login?redirect=/profile");
				const sessionData = await sessionRes.json();
				const u = sessionData?.user || sessionData;
				if (!u) return router.push("/login?redirect=/profile");
				const info: Perfil = {
					name: u.name || "",
					lastname: u.lastname || "",
					email: u.email || "",
					phone: u.phone || "",
					calle: u.direccion?.calle || "",
					numero: u.direccion?.numero || "",
					colonia: u.direccion?.colonia || "",
					ciudad: u.direccion?.ciudad || "",
					codigoPostal: u.direccion?.codigoPostal || "",
					indicaciones: u.direccion?.indicaciones || "",
				};
				setFormData(info);
				setOriginales(info);
			} catch (error) {
				registrarError(error, "cuenta: carga");
				setFalloCarga(true);
			} finally {
				setLoading(false);
			}
		})();
	}, [router]);

	const hayCambios = !!originales && (Object.keys(formData) as (keyof Perfil)[]).some((k) => formData[k] !== originales[k]);
	const cambiar = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};
	const restaurar = (campos: readonly (keyof Perfil)[]) => {
		if (!originales) return;
		setFormData((prev) => ({ ...prev, ...Object.fromEntries(campos.map((c) => [c, originales[c]])) }));
		setErrores({});
	};

	const guardar = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!hayCambios || isSubmitting) return;
		const r = esquemaPerfil.safeParse(formData);
		if (!r.success) {
			setErrores(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
			return;
		}
		setErrores({});
		const ok = await confirmar({
			titulo: "¿Guardar los cambios de tu cuenta?",
			descripcion: "Usaremos estos datos en tus próximos pedidos y reservas.",
			textoConfirmar: "Guardar cambios",
			textoCancelar: "Seguir editando",
		});
		if (!ok) return;
		setIsSubmitting(true);
		try {
			const apiUrl = process.env.NEXT_PUBLIC_API_URL;
			const token = localStorage.getItem("authToken");
			const sessionRes = await fetch("/api/auth/me", { cache: "no-store" });
			const sessionData = await sessionRes.json();
			const activeUser = sessionData?.user || sessionData;
			const res = await fetch(`${apiUrl}/usuarios/perfil/actualizar/${activeUser.id}`, {
				cache: "no-store",
				method: "PUT",
				headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
				body: JSON.stringify(formData),
			});
			if (!res.ok) throw new Error(`perfil ${res.status}`);
			notificar({ tono: "exito", titulo: "Tu cuenta está al día", descripcion: "Guardamos los cambios." });
			setOriginales(formData);
			setEditandoPersonal(false);
			setEditandoDireccion(false);
		} catch (error) {
			registrarError(error, "cuenta: guardar");
			notificar({ tono: "error", titulo: "No pudimos guardar los cambios", descripcion: "Inténtalo de nuevo en un momento." });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="contenedor-pagina max-w-[48rem] pb-(--espacio-entre-secciones)">
			{dialogo}
			<EncabezadoPublico
				ruta="/profile"
				titulo="Tu cuenta"
				entradilla="Tus datos de contacto y tu dirección para los pedidos a domicilio."
				acciones={
					!loading && !falloCarga ? (
						<Boton type="submit" form="formulario-cuenta" variante="primario" icono={<Save />} deshabilitado={!hayCambios} cargando={isSubmitting} textoCargando="Guardando…">
							Guardar cambios
						</Boton>
					) : undefined
				}
			/>
			{loading ? (
				<ZonaCargando cargando texto="Preparando tu cuenta…">
					<div className="flex flex-col gap-4 rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-lg)">
						<Esqueleto sobre="superficie" className="h-6 w-1/3" />
						<EsqueletoLineas sobre="superficie" lineas={4} />
					</div>
				</ZonaCargando>
			) : falloCarga ? (
				<Aviso tono="error" titulo="No pudimos traer tu cuenta">
					Vuelve a cargar la página en un momento.
				</Aviso>
			) : (
				<form id="formulario-cuenta" onSubmit={guardar} noValidate className="flex flex-col gap-(--espacio-xl)">
					<Bloque
						titulo="Datos personales"
						icono={<UserRound />}
						editando={editandoPersonal}
						alEditar={() => setEditandoPersonal(true)}
						alCancelar={() => {
							restaurar(PERSONALES);
							setEditandoPersonal(false);
						}}
					>
						<div className="grid gap-(--espacio-md) sm:grid-cols-2">
							<Campo name="name" etiqueta="Nombre" autoComplete="given-name" value={formData.name} onChange={cambiar} readOnly={!editandoPersonal} classNameControl={comoTexto(editandoPersonal)} error={errores.name} />
							<Campo name="lastname" etiqueta="Apellidos" autoComplete="family-name" value={formData.lastname} onChange={cambiar} readOnly={!editandoPersonal} classNameControl={comoTexto(editandoPersonal)} error={errores.lastname} />
							<Campo name="email" etiqueta="Correo" type="email" value={formData.email} readOnly classNameControl={comoTexto(false)} ayuda="Es tu identidad en la cuenta; no se puede cambiar aquí." className="sm:col-span-2" />
							<Campo name="phone" etiqueta="Teléfono" type="tel" inputMode="tel" autoComplete="tel" value={formData.phone} onChange={cambiar} readOnly={!editandoPersonal} classNameControl={comoTexto(editandoPersonal)} error={errores.phone} />
						</div>
					</Bloque>
					<Bloque
						titulo="Dirección de entrega"
						icono={<MapPin />}
						editando={editandoDireccion}
						alEditar={() => setEditandoDireccion(true)}
						alCancelar={() => {
							restaurar(DIRECCION);
							setEditandoDireccion(false);
						}}
					>
						<div className="grid gap-(--espacio-md) sm:grid-cols-2">
							<Campo name="calle" etiqueta="Calle" opcional autoComplete="address-line1" value={formData.calle} onChange={cambiar} readOnly={!editandoDireccion} classNameControl={comoTexto(editandoDireccion)} error={errores.calle} />
							<Campo name="numero" etiqueta="Número" opcional autoComplete="address-line2" value={formData.numero} onChange={cambiar} readOnly={!editandoDireccion} classNameControl={comoTexto(editandoDireccion)} error={errores.numero} />
							<Campo name="colonia" etiqueta="Colonia" opcional autoComplete="address-level3" value={formData.colonia} onChange={cambiar} readOnly={!editandoDireccion} classNameControl={comoTexto(editandoDireccion)} error={errores.colonia} />
							<Campo
								name="codigoPostal"
								etiqueta="Código postal"
								opcional
								codigo
								inputMode="numeric"
								maxLength={5}
								autoComplete="postal-code"
								value={formData.codigoPostal}
								onChange={cambiar}
								readOnly={!editandoDireccion} classNameControl={comoTexto(editandoDireccion)}
								error={errores.codigoPostal}
							/>
							<Campo name="ciudad" etiqueta="Ciudad" opcional autoComplete="address-level2" value={formData.ciudad} onChange={cambiar} readOnly={!editandoDireccion} classNameControl={comoTexto(editandoDireccion)} error={errores.ciudad} className="sm:col-span-2" />
							<AreaTexto
								name="indicaciones"
								etiqueta="Indicaciones de entrega"
								opcional
								rows={3}
								value={formData.indicaciones}
								onChange={cambiar}
								readOnly={!editandoDireccion}
								error={errores.indicaciones}
								className="sm:col-span-2"
							/>
						</div>
					</Bloque>
				</form>
			)}
		</div>
	);
}

function Bloque({
	titulo,
	icono,
	editando,
	alEditar,
	alCancelar,
	children,
}: {
	titulo: string;
	icono: React.ReactNode;
	editando: boolean;
	alEditar: () => void;
	alCancelar: () => void;
	children: React.ReactNode;
}) {
	return (
		<section aria-label={titulo} className="flex flex-col gap-(--espacio-lg) rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-lg) sm:p-(--espacio-xl)">
			<header className="flex flex-wrap items-center justify-between gap-3">
				<h2 className="m-0 flex items-center gap-2 font-texto text-(length:--texto-titulo-interfaz) font-semibold [&_svg]:size-5 [&_svg]:stroke-[1.5] [&_svg]:text-acento">
					<span aria-hidden="true">{icono}</span>
					{titulo}
				</h2>
				{editando ? (
					<Boton variante="fantasma" tamano="compacto" onClick={alCancelar}>
						Cancelar
					</Boton>
				) : (
					<Boton variante="secundario" tamano="compacto" icono={<PenLine />} onClick={alEditar}>
						{`Editar ${titulo.toLowerCase()}`}
					</Boton>
				)}
			</header>
			{children}
		</section>
	);
}
