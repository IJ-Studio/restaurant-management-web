"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Boton } from "@/components/ui/Boton";
import { AreaTexto, Campo, Selector } from "@/components/ui/Campo";
import { Contraetiqueta } from "@/components/marca/Contraetiqueta";
import { Dialogo } from "@/components/ui/Dialogo";
import {
	EGRESO_CATS,
	INGRESO_CATS,
	type CashMovement,
	type CashSession,
	type MvType,
	type PayMethod,
	type Tip,
} from "@/features/dashboard/admin/data/financeMock";
import { formatearImporte } from "@/lib/formato/precio";

/**
 * Diálogos de finanzas (PLAN 5.4). Sustituyen a `MovementModal`, `CloseSessionModal` y `TipModal`
 * con la misma lógica (la pantalla aún trabaja con datos de ejemplo en memoria): validan al enviar,
 * marcan cada campo con su error y no se cierran hasta guardar o cancelar.
 */

export const FORMAS_PAGO: { valor: PayMethod; texto: string }[] = [
	{ valor: "efectivo", texto: "Efectivo" },
	{ valor: "tarjeta", texto: "Tarjeta" },
	{ valor: "transferencia", texto: "Transferencia" },
];

const importe = (n: number) => formatearImporte(n) ?? "—";
const ahora = () => new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const hoy = () => new Date().toISOString().split("T")[0];
const numero = (texto: string) => (texto.trim() === "" ? Number.NaN : Number(texto));

function Formulario({
	id,
	alEnviar,
	children,
}: {
	id: string;
	alEnviar: () => boolean;
	children: ReactNode;
}) {
	return (
		<form
			id={id}
			noValidate
			className="flex flex-col gap-(--espacio-md)"
			onSubmit={(e: FormEvent) => {
				e.preventDefault();
				alEnviar();
			}}
		>
			{children}
		</form>
	);
}

function Pie({ formulario, texto, alCancelar }: { formulario: string; texto: string; alCancelar: () => void }) {
	return (
		<>
			<Boton variante="secundario" onClick={alCancelar}>
				Cancelar
			</Boton>
			<Boton type="submit" form={formulario}>
				{texto}
			</Boton>
		</>
	);
}

export function DialogoMovimiento({ tipo, disparador, alGuardar }: { tipo: MvType; disparador: ReactNode; alGuardar: (m: CashMovement) => void }) {
	const categorias = tipo === "ingreso" ? INGRESO_CATS : EGRESO_CATS;
	const vacio = { concepto: "", categoria: categorias[0], monto: "", forma: "efectivo" as PayMethod, responsable: "", notas: "" };
	const [abierto, setAbierto] = useState(false);
	const [f, setF] = useState(vacio);
	const [errores, setErrores] = useState<Record<string, string>>({});
	const id = `movimiento-${tipo}`;

	function enviar() {
		const e: Record<string, string> = {};
		if (!f.concepto.trim()) e.concepto = "Escribe el concepto.";
		const monto = numero(f.monto);
		if (!(monto > 0)) e.monto = "Escribe un importe mayor que cero.";
		setErrores(e);
		if (Object.keys(e).length) return false;
		alGuardar({
			id: Date.now(),
			type: tipo,
			concept: f.concepto.trim(),
			category: f.categoria,
			amount: monto,
			payMethod: f.forma,
			responsible: f.responsable.trim(),
			date: hoy(),
			time: ahora(),
			notes: f.notas.trim() || undefined,
		});
		setAbierto(false);
		setF(vacio);
		return true;
	}

	return (
		<Dialogo
			abierto={abierto}
			alCambiarAbierto={(a) => {
				setAbierto(a);
				if (!a) setErrores({});
			}}
			disparador={disparador}
			titulo={tipo === "ingreso" ? "Registrar un ingreso" : "Registrar un egreso"}
			descripcion={tipo === "ingreso" ? "Dinero que entra en la caja chica." : "Dinero que sale de la caja chica."}
			pie={<Pie formulario={id} texto="Registrar" alCancelar={() => setAbierto(false)} />}
		>
			<Formulario id={id} alEnviar={enviar}>
				<Campo etiqueta="Concepto" value={f.concepto} onChange={(e) => setF({ ...f, concepto: e.target.value })} error={errores.concepto} maxLength={120} />
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2">
					<Selector etiqueta="Categoría" opciones={categorias.map((c) => ({ valor: c, texto: c }))} value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value })} />
					<Campo etiqueta="Importe" type="number" inputMode="decimal" min={0} step="0.01" value={f.monto} onChange={(e) => setF({ ...f, monto: e.target.value })} error={errores.monto} ayuda="En pesos." />
				</div>
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2">
					<Selector etiqueta="Forma de pago" opciones={FORMAS_PAGO} value={f.forma} onChange={(e) => setF({ ...f, forma: e.target.value as PayMethod })} />
					<Campo etiqueta="Responsable" opcional value={f.responsable} onChange={(e) => setF({ ...f, responsable: e.target.value })} maxLength={80} autoComplete="off" />
				</div>
				<AreaTexto etiqueta="Notas" opcional rows={3} value={f.notas} onChange={(e) => setF({ ...f, notas: e.target.value })} maxLength={300} />
			</Formulario>
		</Dialogo>
	);
}

export function DialogoCerrarCaja({ sesion, disparador, alCerrar }: { sesion: CashSession; disparador: ReactNode; alCerrar: (contado: number, por: string) => void }) {
	const [abierto, setAbierto] = useState(false);
	const [contado, setContado] = useState("");
	const [por, setPor] = useState("");
	const [errores, setErrores] = useState<Record<string, string>>({});
	const valor = numero(contado);
	const diferencia = Number.isFinite(valor) ? valor - sesion.expectedBalance : null;
	const id = "cerrar-caja";

	function enviar() {
		const e: Record<string, string> = {};
		if (!(valor >= 0)) e.contado = "Escribe el efectivo que hay en la caja.";
		if (!por.trim()) e.por = "Escribe quién hace el cierre.";
		setErrores(e);
		if (Object.keys(e).length) return false;
		alCerrar(valor, por.trim());
		setAbierto(false);
		return true;
	}

	const resultado =
		diferencia === null ? "—" : diferencia === 0 ? "Cuadra exacto" : diferencia > 0 ? `Sobran ${importe(diferencia)}` : `Faltan ${importe(-diferencia)}`;

	return (
		<Dialogo
			abierto={abierto}
			alCambiarAbierto={(a) => {
				setAbierto(a);
				if (!a) setErrores({});
			}}
			disparador={disparador}
			titulo="Cerrar la caja"
			descripcion="Cuenta el efectivo y compáralo con lo esperado. Una vez cerrada, la caja no se vuelve a abrir desde aquí."
			pie={<Pie formulario={id} texto="Cerrar caja" alCancelar={() => setAbierto(false)} />}
		>
			<Formulario id={id} alEnviar={enviar}>
				<Contraetiqueta
					pares={[
						{ rotulo: "Saldo de apertura", valor: importe(sesion.openingBalance) },
						{ rotulo: "Esperado en caja", valor: importe(sesion.expectedBalance) },
					]}
				/>
				<Campo etiqueta="Efectivo contado" type="number" inputMode="decimal" min={0} step="0.01" value={contado} onChange={(e) => setContado(e.target.value)} error={errores.contado} />
				<p aria-live="polite" className="m-0 text-(length:--texto-cuerpo) text-texto-principal">
					<span className="text-texto-secundario">Diferencia: </span>
					<span className="font-semibold numeros-tabulares">{resultado}</span>
				</p>
				<Campo etiqueta="Cierre hecho por" value={por} onChange={(e) => setPor(e.target.value)} error={errores.por} maxLength={80} autoComplete="off" />
			</Formulario>
		</Dialogo>
	);
}

export function DialogoPropina({ disparador, alGuardar }: { disparador: ReactNode; alGuardar: (t: Tip) => void }) {
	const vacio = { mesero: "", referencia: "", monto: "", forma: "efectivo" as PayMethod };
	const [abierto, setAbierto] = useState(false);
	const [f, setF] = useState(vacio);
	const [errores, setErrores] = useState<Record<string, string>>({});
	const id = "registrar-propina";

	function enviar() {
		const e: Record<string, string> = {};
		if (!f.mesero.trim()) e.mesero = "Escribe el nombre del mesero.";
		const monto = numero(f.monto);
		if (!(monto > 0)) e.monto = "Escribe un importe mayor que cero.";
		setErrores(e);
		if (Object.keys(e).length) return false;
		alGuardar({ id: Date.now(), waiter: f.mesero.trim(), tableRef: f.referencia.trim(), amount: monto, payMethod: f.forma, date: hoy(), distributed: false });
		setAbierto(false);
		setF(vacio);
		return true;
	}

	return (
		<Dialogo
			abierto={abierto}
			alCambiarAbierto={(a) => {
				setAbierto(a);
				if (!a) setErrores({});
			}}
			disparador={disparador}
			titulo="Registrar una propina"
			pie={<Pie formulario={id} texto="Registrar" alCancelar={() => setAbierto(false)} />}
		>
			<Formulario id={id} alEnviar={enviar}>
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2">
					<Campo etiqueta="Mesero" value={f.mesero} onChange={(e) => setF({ ...f, mesero: e.target.value })} error={errores.mesero} maxLength={80} autoComplete="off" />
					<Campo etiqueta="Mesa o referencia" opcional value={f.referencia} onChange={(e) => setF({ ...f, referencia: e.target.value })} maxLength={40} />
				</div>
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2">
					<Campo etiqueta="Importe" type="number" inputMode="decimal" min={0} step="0.01" value={f.monto} onChange={(e) => setF({ ...f, monto: e.target.value })} error={errores.monto} ayuda="En pesos." />
					<Selector etiqueta="Forma de pago" opciones={FORMAS_PAGO} value={f.forma} onChange={(e) => setF({ ...f, forma: e.target.value as PayMethod })} />
				</div>
			</Formulario>
		</Dialogo>
	);
}
