"use client";

import { useEffect, useState } from "react";
import "@/lib/validacion/configurar-zod";
import { z } from "zod";
import { ArrowLeft, Check } from "lucide-react";
import { AnuncioFormulario } from "@/components/ui/AnuncioFormulario";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { AreaTexto, Campo } from "@/components/ui/Campo";
import { CampoTrampa } from "@/components/ui/CampoTrampa";
import { CargadorMarca } from "@/components/marca/CargadorMarca";
import { Contraetiqueta } from "@/components/marca/Contraetiqueta";
import { createReservation } from "@/features/reservations/services/reservations.service";
import { useEnvioFormulario } from "@/hooks/useEnvioFormulario";
import { useReservationAvailability } from "@/hooks/useReservationAvailability";
import { registrarError } from "@/lib/registro/registrar-error";
import { pedirSesion } from "@/lib/sesion/sesion-cliente";
import { crearEsquemaReservaHorario, esquemaReservaContacto, esquemaReservaMesa } from "@/lib/validacion/formularios";
import { cn } from "@/lib/utils";
import TableMap from "./TableMap";

/**
 * Formulario de reserva (PLAN 4.16): el mismo flujo de cuatro pasos (contacto, cuándo, mesa en el
 * plano y confirmación), la misma sesión que rellena el contacto y el **mismo payload** de
 * `createReservation`. Lo usan `/reservations` y el panel lateral de la landing (D-19).
 *
 * - Validación por paso con los esquemas del 3.1, con los mismos mensajes, ahora junto a cada campo.
 * - Envío con `useEnvioFormulario`: campo trampa (defensa principal), tiempo mínimo de 1 s y sin
 *   envío doble (decisión del usuario, 2026-11-01). El teléfono se queda como hoy: su validación
 *   real es del servidor (NP-06).
 * - Sin textos de proceso ni el mensaje del servidor en los errores (D-20).
 */
interface Props {
	onSuccess?: () => void;
}

const PASOS = ["Contacto", "Cuándo", "Mesa", "Confirmar"] as const;
const erroresDe = (r: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) =>
	r.success ? {} : Object.fromEntries((r.error?.issues ?? []).map((i) => [String(i.path[0]), i.message]));
const fechaLegible = (fecha: string, hora: string) => {
	const d = new Date(`${fecha}T${hora}`);
	return Number.isNaN(d.getTime())
		? `${fecha} ${hora}`
		: new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
};

export default function ReservationForm({ onSuccess }: Props) {
	const today = new Date().toISOString().split("T")[0];
	const [step, setStep] = useState(1);
	const [isLogged, setIsLogged] = useState(false);
	const [checkingSession, setCheckingSession] = useState(true);
	const [selectedTableId, setSelectedTableId] = useState<number | undefined>(undefined);
	const [formData, setFormData] = useState({
		clienteNombre: "",
		clienteTelefono: "",
		clienteEmail: "",
		fecha: today,
		hora: "13:00",
		numComensales: 2,
		peticionesEspeciales: "",
		ocasion: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	// Con sesión, el contacto llega rellenado desde la cuenta.
	useEffect(() => {
		(async () => {
			try {
				const res = await pedirSesion();
				if (res.ok) {
					const data = await res.json();
					if (data?.user) {
						setFormData((prev) => ({
							...prev,
							clienteNombre: `${data.user.name || ""} ${data.user.lastname || ""}`.trim(),
							clienteEmail: data.user.email || "",
							clienteTelefono: data.user.phone || "",
						}));
						setIsLogged(true);
						setStep(1);
					}
				}
			} catch (err) {
				registrarError(err, "reserva: sesión");
			} finally {
				setCheckingSession(false);
			}
		})();
	}, []);

	const { loading: availabilityLoading } = useReservationAvailability(formData.fecha, formData.hora, formData.numComensales);
	const targetFechaHora = `${formData.fecha}T${formData.hora}`;

	const validateStep = (paso: number) => {
		const nuevos =
			paso === 1
				? erroresDe(esquemaReservaContacto.safeParse(formData))
				: paso === 2
					? erroresDe(crearEsquemaReservaHorario().safeParse(formData))
					: paso === 3
						? Object.fromEntries(Object.entries(erroresDe(esquemaReservaMesa.safeParse({ mesaId: selectedTableId }))).map(([, v]) => ["mesa", v]))
						: {};
		setErrors(nuevos);
		return Object.keys(nuevos).length === 0;
	};
	const nextStep = () => {
		if (validateStep(step)) setStep(step + 1);
	};
	const prevStep = () => {
		setErrors({});
		setStep(step - 1);
	};

	// El envío final lee el estado del asistente; el hook aporta el campo trampa, el tiempo mínimo y el bloqueo del envío doble.
	const { propsFormulario, errorGeneral, enviando, anuncio } = useEnvioFormulario({
		esquema: z.object({}),
		obtenerDatos: () => ({}),
		mensajeError: "No pudimos confirmar tu reserva. Inténtalo de nuevo en un momento o llámanos.",
		alEnviar: async () => {
			if (!validateStep(3)) return;
			try {
				const res = await createReservation({
					clienteNombre: formData.clienteNombre,
					clienteTelefono: formData.clienteTelefono,
					clienteEmail: formData.clienteEmail,
					fechaHora: new Date(`${formData.fecha}T${formData.hora}:00`).toISOString(),
					numComensales: Number(formData.numComensales),
					mesaId: selectedTableId,
					peticionesEspeciales: formData.peticionesEspeciales,
					ocasion: formData.ocasion,
				});
				setSuccessMessage(res.mensaje || "Tu reserva quedó confirmada.");
				onSuccess?.();
				setSelectedTableId(undefined);
				setStep(1);
			} catch (err) {
				registrarError(err, "reserva: crear");
				// Sin el mensaje del servidor: el hook muestra su texto cálido.
				throw new Error("No pudimos confirmar tu reserva. Inténtalo de nuevo en un momento o llámanos.");
			}
		},
	});

	if (checkingSession) return <CargadorMarca texto="Preparando tu reserva…" className="py-12" />;

	if (successMessage)
		return (
			<div className="flex flex-col items-center gap-(--espacio-md) py-(--espacio-xl) text-center" role="status">
				<span aria-hidden="true" className="filete-doble" />
				<h2 className="m-0 font-titulos text-(length:--texto-titulo-2) font-normal">Mesa reservada</h2>
				<p className="m-0 max-w-[40ch] text-texto-secundario [text-wrap:pretty]">{successMessage}</p>
				<Boton variante="secundario" onClick={() => setSuccessMessage(null)}>
					Hacer otra reserva
				</Boton>
			</div>
		);

	const cambiar = (campo: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, [campo]: e.target.value });
	const botones = (siguiente: React.ReactNode) => (
		<div className="flex flex-col-reverse gap-3 border-t border-borde-sutil pt-(--espacio-lg) sm:flex-row sm:justify-between">
			{step > 1 ? (
				<Boton variante="secundario" icono={<ArrowLeft />} onClick={prevStep} deshabilitado={enviando}>
					Atrás
				</Boton>
			) : (
				<span />
			)}
			{siguiente}
		</div>
	);

	return (
		<form {...propsFormulario} className="relative flex flex-col gap-(--espacio-lg)" aria-labelledby="reserva-paso-titulo">
			<CampoTrampa />
			<AnuncioFormulario mensaje={anuncio} />
			<ol aria-label="Pasos de la reserva" className="m-0 grid list-none grid-cols-4 gap-1 p-0">
				{PASOS.map((nombre, i) => {
					const n = i + 1;
					return (
						<li key={nombre} aria-current={step === n ? "step" : undefined} className="relative flex min-w-0 flex-col gap-2 overflow-hidden">
							<span aria-hidden="true" className={cn("h-0.5 w-full", step >= n ? "bg-acento" : "bg-borde-sutil")} />
							<span className={cn("flex items-center gap-1 text-(length:--texto-etiqueta) font-semibold uppercase tracking-[0.12em]", step === n ? "text-texto-principal" : "text-texto-tenue")}>
								{step > n && <Check aria-hidden="true" className="size-3.5 stroke-[1.5]" />}
								<span className="max-sm:solo-lectores">{nombre}</span>
							</span>
						</li>
					);
				})}
			</ol>

			{step === 1 && (
				<div className="flex flex-col gap-(--espacio-md)">
					<TituloPaso texto={isLogged ? "Confirma tus datos" : "¿A nombre de quién?"} ayuda={isLogged ? "Los tomamos de tu cuenta; cámbialos si hace falta." : "O inicia sesión y los rellenamos por ti."} />
					<Campo etiqueta="Nombre completo" autoComplete="name" value={formData.clienteNombre} onChange={cambiar("clienteNombre")} error={errors.clienteNombre} />
					<Campo etiqueta="Teléfono" type="tel" inputMode="tel" autoComplete="tel" value={formData.clienteTelefono} onChange={cambiar("clienteTelefono")} error={errors.clienteTelefono} />
					<Campo etiqueta="Correo" type="email" inputMode="email" autoComplete="email" value={formData.clienteEmail} onChange={cambiar("clienteEmail")} error={errors.clienteEmail} />
					{botones(
						<Boton variante="primario" onClick={nextStep}>
							Continuar
						</Boton>,
					)}
				</div>
			)}

			{step === 2 && (
				<div className="flex flex-col gap-(--espacio-md)">
					<TituloPaso texto="¿Cuándo nos visitas?" ayuda={isLogged && formData.clienteNombre ? `${formData.clienteNombre.split(" ")[0]}, elige día, hora y cuántos seréis.` : "Elige día, hora y cuántos seréis."} />
					<div className="grid gap-(--espacio-md) sm:grid-cols-2">
						<Campo etiqueta="Fecha" type="date" min={today} value={formData.fecha} onChange={cambiar("fecha")} error={errors.fecha} />
						<Campo etiqueta="Hora" type="time" value={formData.hora} onChange={cambiar("hora")} error={errors.hora} />
					</div>
					<Campo
						etiqueta="Comensales"
						type="number"
						inputMode="numeric"
						min={1}
						value={formData.numComensales}
						onChange={(e) => setFormData({ ...formData, numComensales: parseInt(e.target.value) || 1 })}
						error={errors.numComensales}
					/>
					<Campo etiqueta="Ocasión" opcional ayuda="Aniversario, cumpleaños, comida de trabajo…" value={formData.ocasion} onChange={cambiar("ocasion")} error={errors.ocasion} />
					<AreaTexto etiqueta="Peticiones especiales" opcional ayuda="Silla para niños, alergias…" rows={3} value={formData.peticionesEspeciales} onChange={cambiar("peticionesEspeciales")} error={errors.peticionesEspeciales} />
					{botones(
						<Boton variante="primario" onClick={nextStep}>
							Ver mesas libres
						</Boton>,
					)}
				</div>
			)}

			{step === 3 && (
				<div className="flex flex-col gap-(--espacio-md)">
					<TituloPaso texto="Elige tu mesa" ayuda={`Mesas libres para ${fechaLegible(formData.fecha, formData.hora)}.`} />
					<TableMap selectedTableId={selectedTableId} onSelectTable={setSelectedTableId} fechaHora={targetFechaHora} />
					{errors.mesa && <Aviso tono="error">{errors.mesa}</Aviso>}
					{botones(
						<Boton variante="primario" onClick={nextStep} deshabilitado={!selectedTableId || availabilityLoading}>
							Continuar
						</Boton>,
					)}
				</div>
			)}

			{step === 4 && (
				<div className="flex flex-col gap-(--espacio-md)">
					<TituloPaso texto="Revisa tu reserva" ayuda="Si todo está bien, confírmala." />
					<Contraetiqueta
						pares={[
							{ rotulo: "A nombre de", valor: formData.clienteNombre, tipo: "texto" },
							{ rotulo: "Teléfono", valor: formData.clienteTelefono },
							{ rotulo: "Cuándo", valor: fechaLegible(formData.fecha, formData.hora), tipo: "texto" },
							{ rotulo: "Comensales", valor: String(formData.numComensales) },
							{ rotulo: "Mesa", valor: String(selectedTableId ?? "") },
							...(formData.ocasion ? [{ rotulo: "Ocasión", valor: formData.ocasion, tipo: "texto" as const }] : []),
							...(formData.peticionesEspeciales ? [{ rotulo: "Peticiones", valor: formData.peticionesEspeciales, tipo: "texto" as const }] : []),
						]}
					/>
					{errorGeneral && <Aviso tono="error">{errorGeneral}</Aviso>}
					{botones(
						<Boton type="submit" variante="primario" cargando={enviando} textoCargando="Confirmando…">
							Confirmar reserva
						</Boton>,
					)}
				</div>
			)}
		</form>
	);
}

function TituloPaso({ texto, ayuda }: { texto: string; ayuda?: string }) {
	return (
		<div className="flex flex-col gap-1">
			<h2 id="reserva-paso-titulo" className="m-0 font-titulos text-(length:--texto-titulo-2) font-normal leading-[1.15]">
				{texto}
			</h2>
			{ayuda && <p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">{ayuda}</p>}
		</div>
	);
}
