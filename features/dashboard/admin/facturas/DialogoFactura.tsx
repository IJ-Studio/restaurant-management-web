"use client";

import { useState, type ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Contraetiqueta } from "@/components/marca/Contraetiqueta";
import { Boton } from "@/components/ui/Boton";
import { AreaTexto, Campo, Selector } from "@/components/ui/Campo";
import { Dialogo } from "@/components/ui/Dialogo";
import { CFDI_USES, PAY_FORMS, type CfdiUse, type Invoice, type PayMethod } from "@/features/dashboard/admin/data/invoicesMock";
import { formatearImporte } from "@/lib/formato/precio";
import { correoBasicoOpcional, rfc as esquemaRfc } from "@/lib/validacion/campos";

/**
 * Factura nueva (PLAN 5.5). Sustituye a `InvoiceModal` con la misma lógica (datos de ejemplo en
 * memoria; el folio sale de la hora, como antes) y valida al enviar: RFC con el esquema del
 * paso 3.1, correo opcional, y cada concepto con descripción, cantidad y precio mayores que cero.
 */

const IVA = 0.16;
const importe = (n: number) => formatearImporte(n) ?? "—";
const METODOS: { valor: PayMethod; texto: string }[] = [
	{ valor: "efectivo", texto: "Efectivo" },
	{ valor: "tarjeta", texto: "Tarjeta" },
	{ valor: "transferencia", texto: "Transferencia" },
];

interface Concepto {
	clave: number;
	descripcion: string;
	cantidad: string;
	precio: string;
}
const conceptoVacio = (): Concepto => ({ clave: Date.now() + Math.random(), descripcion: "", cantidad: "1", precio: "" });
/** Id y folio de ejemplo a partir de la hora, como antes (solo al emitir, nunca al pintar). */
const marcaDeTiempo = () => Date.now();
const n = (t: string) => (t.trim() === "" ? Number.NaN : Number(t));

export function DialogoFactura({ disparador, alEmitir }: { disparador: ReactNode; alEmitir: (f: Invoice) => void }) {
	const vacio = { cliente: "", rfc: "", correo: "", uso: "G03" as CfdiUse, metodo: "efectivo" as PayMethod, forma: PAY_FORMS[0], notas: "" };
	const [abierto, setAbierto] = useState(false);
	const [f, setF] = useState(vacio);
	const [conceptos, setConceptos] = useState<Concepto[]>(() => [conceptoVacio()]);
	const [errores, setErrores] = useState<Record<string, string>>({});

	const subtotal = conceptos.reduce((a, c) => a + (n(c.cantidad) > 0 && n(c.precio) > 0 ? n(c.cantidad) * n(c.precio) : 0), 0);
	const iva = subtotal * IVA;
	const total = subtotal + iva;
	const cambiarConcepto = (clave: number, campo: keyof Omit<Concepto, "clave">, valor: string) =>
		setConceptos((cs) => cs.map((c) => (c.clave === clave ? { ...c, [campo]: valor } : c)));

	function emitir() {
		const e: Record<string, string> = {};
		if (!f.cliente.trim()) e.cliente = "Escribe el nombre o la razón social.";
		const r = esquemaRfc.safeParse(f.rfc);
		if (!r.success) e.rfc = r.error.issues[0]?.message ?? "El RFC no tiene un formato válido.";
		const c = correoBasicoOpcional.safeParse(f.correo);
		if (!c.success) e.correo = c.error.issues[0]?.message ?? "Revisa el correo.";
		conceptos.forEach((k) => {
			if (!k.descripcion.trim()) e[`d${k.clave}`] = "Describe el concepto.";
			if (!(n(k.cantidad) > 0)) e[`c${k.clave}`] = "Mayor que cero.";
			if (!(n(k.precio) > 0)) e[`p${k.clave}`] = "Mayor que cero.";
		});
		setErrores(e);
		if (Object.keys(e).length) return;
		const marca = marcaDeTiempo();
		alEmitir({
			id: marca,
			folio: String(marca).slice(-4).padStart(4, "0"),
			series: "A",
			clientName: f.cliente.trim(),
			clientRFC: r.success ? r.data : f.rfc,
			clientEmail: c.success ? c.data : "",
			cfdiUse: f.uso,
			payMethod: f.metodo,
			payForm: f.forma,
			items: conceptos.map((k) => ({ description: k.descripcion.trim(), qty: n(k.cantidad), unitPrice: n(k.precio) })),
			subtotal,
			iva,
			total,
			status: "emitida",
			issuedAt: new Date().toISOString().split("T")[0],
			notes: f.notas.trim() || undefined,
		});
		setAbierto(false);
		setF(vacio);
		setConceptos([conceptoVacio()]);
	}

	return (
		<Dialogo
			ancho="amplio"
			abierto={abierto}
			alCambiarAbierto={(a) => {
				setAbierto(a);
				if (!a) setErrores({});
			}}
			disparador={disparador}
			titulo="Factura nueva"
			descripcion="Datos fiscales del cliente y conceptos. El IVA (16 %) se calcula solo."
			pie={
				<>
					<Boton variante="secundario" onClick={() => setAbierto(false)}>
						Cancelar
					</Boton>
					<Boton type="submit" form="factura-nueva">
						Emitir factura
					</Boton>
				</>
			}
		>
			<form
				id="factura-nueva"
				noValidate
				className="flex flex-col gap-(--espacio-lg)"
				onSubmit={(e) => {
					e.preventDefault();
					emitir();
				}}
			>
				<fieldset className="m-0 flex min-w-0 flex-col gap-(--espacio-md) border-0 p-0">
					<legend className="mb-(--espacio-sm) p-0 font-semibold text-texto-principal">Cliente</legend>
					<Campo etiqueta="Nombre o razón social" value={f.cliente} onChange={(e) => setF({ ...f, cliente: e.target.value })} error={errores.cliente} maxLength={160} autoComplete="off" />
					<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2">
						<Campo etiqueta="RFC" codigo value={f.rfc} onChange={(e) => setF({ ...f, rfc: e.target.value })} error={errores.rfc} maxLength={13} ayuda="12 o 13 caracteres." autoComplete="off" />
						<Campo etiqueta="Correo" opcional type="email" value={f.correo} onChange={(e) => setF({ ...f, correo: e.target.value })} error={errores.correo} autoComplete="off" />
					</div>
					<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-3">
						<Selector etiqueta="Uso de CFDI" opciones={Object.entries(CFDI_USES).map(([valor, texto]) => ({ valor, texto }))} value={f.uso} onChange={(e) => setF({ ...f, uso: e.target.value as CfdiUse })} />
						<Selector etiqueta="Forma de pago" opciones={PAY_FORMS.map((p) => ({ valor: p, texto: p }))} value={f.forma} onChange={(e) => setF({ ...f, forma: e.target.value })} />
						<Selector etiqueta="Método" opciones={METODOS} value={f.metodo} onChange={(e) => setF({ ...f, metodo: e.target.value as PayMethod })} />
					</div>
				</fieldset>

				<fieldset className="m-0 flex min-w-0 flex-col gap-(--espacio-md) border-0 p-0">
					<legend className="mb-(--espacio-sm) p-0 font-semibold text-texto-principal">Conceptos</legend>
					<ol className="m-0 flex list-none flex-col gap-(--espacio-md) p-0">
						{conceptos.map((k, i) => (
							<li key={k.clave} className="grid grid-cols-2 items-start gap-(--espacio-sm) border-b border-borde-sutil pb-(--espacio-md) sm:grid-cols-[minmax(0,1fr)_6rem_8rem_auto]">
								<Campo
									etiqueta={`Concepto ${i + 1}`}
									value={k.descripcion}
									onChange={(e) => cambiarConcepto(k.clave, "descripcion", e.target.value)}
									error={errores[`d${k.clave}`]}
									maxLength={160}
									className="col-span-2 sm:col-span-1"
								/>
								<Campo etiqueta="Cantidad" type="number" inputMode="numeric" min={1} value={k.cantidad} onChange={(e) => cambiarConcepto(k.clave, "cantidad", e.target.value)} error={errores[`c${k.clave}`]} />
								<Campo etiqueta="Precio" type="number" inputMode="decimal" min={0} step="0.01" value={k.precio} onChange={(e) => cambiarConcepto(k.clave, "precio", e.target.value)} error={errores[`p${k.clave}`]} />
								<div className="col-span-2 flex justify-end sm:col-span-1 sm:pt-7">
									<Boton
										variante="fantasma"
										soloIcono
										icono={<Trash2 />}
										deshabilitado={conceptos.length === 1}
										onClick={() => setConceptos((cs) => cs.filter((c) => c.clave !== k.clave))}
									>
										{`Quitar el concepto ${i + 1}`}
									</Boton>
								</div>
							</li>
						))}
					</ol>
					<Boton variante="secundario" tamano="compacto" icono={<Plus />} className="self-start" onClick={() => setConceptos((cs) => [...cs, conceptoVacio()])}>
						Añadir concepto
					</Boton>
					<Contraetiqueta
						pares={[
							{ rotulo: "Subtotal", valor: importe(subtotal) },
							{ rotulo: "IVA (16 %)", valor: importe(iva) },
							{ rotulo: "Total", valor: <strong>{importe(total)}</strong> },
						]}
					/>
				</fieldset>

				<AreaTexto etiqueta="Notas internas" opcional rows={3} value={f.notas} onChange={(e) => setF({ ...f, notas: e.target.value })} maxLength={300} />
			</form>
		</Dialogo>
	);
}
