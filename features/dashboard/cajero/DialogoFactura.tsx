"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo, Selector } from "@/components/ui/Campo";
import { Dialogo } from "@/components/ui/Dialogo";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { api } from "@/lib/api";
import { REGIMENES_FISCALES, USOS_CFDI } from "@/lib/facturacion/catalogos";
import { registrarError } from "@/lib/registro/registrar-error";
import { esquemaDatosFiscales } from "@/lib/validacion/formularios";
import { LIMITES_CAMPO } from "@/lib/validacion/reglas";

const VACIO = { rfc: "", razonSocial: "", usoCfdi: "G03", regimenFiscal: "", codigoPostalFiscal: "", email: "" };

/**
 * Al cerrar una cuenta en caja (también una cuenta dividida o con varios pagos), el cajero puede
 * pedir la factura con los datos fiscales del cliente. Entra a la cola y administración la emite
 * desde Facturas (`POST /solicitudes-factura`).
 */
export function DialogoFactura({ cuenta, alCerrar }: { cuenta: { id: string; table: string } | null; alCerrar: () => void }) {
	const { notificar } = useNotificaciones();
	const [datos, setDatos] = useState(VACIO);
	const [errores, setErrores] = useState<Record<string, string>>({});
	const [enviando, setEnviando] = useState(false);
	const cambiar = (campo: keyof typeof VACIO, transformar = (v: string) => v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
		setDatos((d) => ({ ...d, [campo]: transformar(e.target.value) }));

	function cerrar() {
		setDatos(VACIO);
		setErrores({});
		alCerrar();
	}

	async function pedir() {
		if (!cuenta) return;
		const r = esquemaDatosFiscales.safeParse(datos);
		if (!r.success) {
			setErrores(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
			return;
		}
		setEnviando(true);
		try {
			const { email, ...resto } = r.data;
			await api.post("/solicitudes-factura", { ordenId: cuenta.id, ...resto, ...(email ? { email } : {}) });
			notificar({ tono: "exito", titulo: "Factura solicitada", descripcion: "Administración la emite desde Facturas." });
			cerrar();
		} catch (e) {
			registrarError(e, "caja: pedir factura");
			setErrores({ general: e instanceof Error ? e.message : "No se pudo pedir la factura. Vuelve a intentarlo." });
		} finally {
			setEnviando(false);
		}
	}

	return (
		<Dialogo
			abierto={cuenta !== null}
			alCambiarAbierto={(a) => !a && cerrar()}
			cerrable={!enviando}
			titulo="¿El cliente quiere factura?"
			descripcion={cuenta ? `${cuenta.table} quedó cobrada. Si pide factura, escribe sus datos fiscales.` : undefined}
			pie={
				<>
					<Boton variante="secundario" className="min-h-12" deshabilitado={enviando} onClick={cerrar}>
						No, gracias
					</Boton>
					<Boton className="min-h-12" cargando={enviando} textoCargando="Enviando…" onClick={() => void pedir()}>
						Pedir factura
					</Boton>
				</>
			}
		>
			<div className="grid gap-(--espacio-md) sm:grid-cols-2">
				<Campo etiqueta="RFC" codigo autoComplete="off" value={datos.rfc} onChange={cambiar("rfc", (v) => v.toUpperCase())} maxLength={13} error={errores.rfc} />
				<Campo maxLength={LIMITES_CAMPO.razonSocial} etiqueta="Razón social" autoComplete="off" value={datos.razonSocial} onChange={cambiar("razonSocial")} error={errores.razonSocial} />
				<Selector etiqueta="Uso del CFDI" opciones={USOS_CFDI} value={datos.usoCfdi} onChange={cambiar("usoCfdi")} error={errores.usoCfdi} />
				<Selector etiqueta="Régimen fiscal" marcador="Elige el régimen fiscal" opciones={REGIMENES_FISCALES} value={datos.regimenFiscal} onChange={cambiar("regimenFiscal")} error={errores.regimenFiscal} />
				<Campo
					etiqueta="Código postal fiscal"
					codigo
					inputMode="numeric"
					maxLength={5}
					autoComplete="off"
					value={datos.codigoPostalFiscal}
					onChange={cambiar("codigoPostalFiscal", (v) => v.replace(/\D/g, ""))}
					error={errores.codigoPostalFiscal}
				/>
				<Campo maxLength={LIMITES_CAMPO.correo} etiqueta="Correo" opcional type="email" autoComplete="off" value={datos.email} onChange={cambiar("email")} error={errores.email} ayuda="Para enviarle la factura." />
			</div>
			{errores.general && (
				<p role="alert" className="m-0 mt-(--espacio-md) text-error">
					{errores.general}
				</p>
			)}
		</Dialogo>
	);
}
