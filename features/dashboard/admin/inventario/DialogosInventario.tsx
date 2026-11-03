"use client";

import { useState, type ReactNode } from "react";
import { Contraetiqueta } from "@/components/marca/Contraetiqueta";
import { Boton } from "@/components/ui/Boton";
import { AreaTexto, Campo, Selector } from "@/components/ui/Campo";
import { Interruptor } from "@/components/ui/Casilla";
import { Dialogo } from "@/components/ui/Dialogo";
import type { Merma, Product } from "@/hooks/useInventory";
import { formatearImporte } from "@/lib/formato/precio";

/**
 * Diálogos del inventario (PLAN 5.7). Sustituyen a `ProductModal`, `MermaModal` y `AdjustModal`
 * con los mismos cuerpos hacia `/api/inventory/*`. Validan al enviar, esperan la respuesta (antes
 * se cerraban sin saber si se había guardado) y avisan si falla.
 */

export const CATEGORIAS: Record<string, string> = {
	carnes: "Carnes",
	vegetales: "Vegetales",
	lacteos: "Lácteos",
	bebidas: "Bebidas",
	granos: "Granos",
	condimentos: "Condimentos",
	utensilios: "Utensilios",
};
export const MOTIVOS_MERMA: Record<string, string> = {
	caducidad: "Caducidad",
	accidente: "Accidente",
	calidad: "Calidad",
	coccion: "Cocción",
	otro: "Otro",
};
const UNIDADES = ["kg", "g", "l", "ml", "pza", "caja", "bolsa"];
const opciones = (o: Record<string, string>) => Object.entries(o).map(([valor, texto]) => ({ valor, texto }));
const importe = (n: number) => formatearImporte(n) ?? "—";
const num = (t: string) => (t.trim() === "" ? Number.NaN : Number(t));
const hoy = () => new Date().toISOString().split("T")[0];
const marcaDeTiempo = () => Date.now();

/** Botones del pie de un formulario de diálogo. */
export function Pie({ formulario, texto, guardando, alCancelar }: { formulario: string; texto: string; guardando: boolean; alCancelar: () => void }) {
	return (
		<>
			<Boton variante="secundario" deshabilitado={guardando} onClick={alCancelar}>
				Cancelar
			</Boton>
			<Boton type="submit" form={formulario} cargando={guardando} textoCargando="Guardando…">
				{texto}
			</Boton>
		</>
	);
}

/** Estado común: abierto, errores y «guardando», con el envío que espera la promesa. */
export function useDialogo(alGuardar: () => Promise<boolean> | null) {
	const [abierto, setAbierto] = useState(false);
	const [errores, setErrores] = useState<Record<string, string>>({});
	const [guardando, setGuardando] = useState(false);
	async function enviar(e: Record<string, string>) {
		setErrores(e);
		if (Object.keys(e).length) return;
		const promesa = alGuardar();
		if (!promesa) return;
		setGuardando(true);
		const ok = await promesa;
		setGuardando(false);
		if (ok) setAbierto(false);
	}
	return { abierto, setAbierto, errores, setErrores, guardando, enviar };
}

export function DialogoProducto({ producto, disparador, alGuardar }: { producto?: Product; disparador: ReactNode; alGuardar: (p: Product) => Promise<boolean> }) {
	const inicial = () => ({
		name: producto?.name ?? "",
		sku: producto?.sku ?? "",
		category: String(producto?.category ?? "vegetales"),
		unit: String(producto?.unit ?? "kg"),
		stock: String(producto?.stock ?? 0),
		minStock: String(producto?.minStock ?? 0),
		maxStock: String(producto?.maxStock ?? 100),
		costPerUnit: String(producto?.costPerUnit ?? 0),
		supplier: producto?.supplier ?? "",
		active: producto?.active ?? true,
	});
	const [f, setF] = useState(inicial);
	const id = producto ? `producto-${producto.id}` : "producto-nuevo";
	const valores = { stock: num(f.stock), minStock: num(f.minStock), maxStock: num(f.maxStock), costPerUnit: num(f.costPerUnit) };
	const d = useDialogo(() =>
		alGuardar({
			...(producto ?? { id: 0, lastUpdated: "" }),
			id: producto?.id ?? 0,
			name: f.name.trim(),
			sku: f.sku.trim(),
			category: f.category,
			unit: f.unit,
			...valores,
			supplier: f.supplier.trim(),
			active: f.active,
			lastUpdated: hoy(),
		}),
	);

	function validar() {
		const e: Record<string, string> = {};
		if (!f.name.trim()) e.name = "Escribe el nombre del producto.";
		for (const [clave, texto] of [
			["stock", "Las existencias"],
			["minStock", "El mínimo"],
			["maxStock", "El máximo"],
			["costPerUnit", "El costo"],
		] as const)
			if (!(valores[clave] >= 0)) e[clave] = `${texto} tiene que ser un número igual o mayor que cero.`;
		if (!e.minStock && !e.maxStock && valores.minStock > valores.maxStock) e.maxStock = "Tiene que ser igual o mayor que el mínimo.";
		return e;
	}

	return (
		<Dialogo
			ancho="amplio"
			abierto={d.abierto}
			alCambiarAbierto={(a) => {
				d.setAbierto(a);
				if (a) setF(inicial());
				else d.setErrores({});
			}}
			cerrable={!d.guardando}
			disparador={disparador}
			titulo={producto ? `Editar ${producto.name}` : "Producto nuevo"}
			pie={<Pie formulario={id} texto={producto ? "Guardar cambios" : "Añadir producto"} guardando={d.guardando} alCancelar={() => d.setAbierto(false)} />}
		>
			<form
				id={id}
				noValidate
				className="flex flex-col gap-(--espacio-md)"
				onSubmit={(ev) => {
					ev.preventDefault();
					void d.enviar(validar());
				}}
			>
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
					<Campo etiqueta="Nombre" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={d.errores.name} maxLength={120} autoComplete="off" />
					<Campo etiqueta="SKU" opcional codigo value={f.sku} onChange={(e) => setF({ ...f, sku: e.target.value })} maxLength={40} autoComplete="off" />
				</div>
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2">
					<Selector etiqueta="Categoría" opciones={opciones(CATEGORIAS)} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} />
					<Selector etiqueta="Unidad" opciones={UNIDADES.map((u) => ({ valor: u, texto: u }))} value={f.unit} onChange={(e) => setF({ ...f, unit: e.target.value })} />
				</div>
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-3">
					<Campo etiqueta="Existencias" type="number" inputMode="decimal" min={0} value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} error={d.errores.stock} />
					<Campo etiqueta="Mínimo" type="number" inputMode="decimal" min={0} value={f.minStock} onChange={(e) => setF({ ...f, minStock: e.target.value })} error={d.errores.minStock} />
					<Campo etiqueta="Máximo" type="number" inputMode="decimal" min={0} value={f.maxStock} onChange={(e) => setF({ ...f, maxStock: e.target.value })} error={d.errores.maxStock} />
				</div>
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2">
					<Campo etiqueta="Costo por unidad" type="number" inputMode="decimal" min={0} step="0.01" value={f.costPerUnit} onChange={(e) => setF({ ...f, costPerUnit: e.target.value })} error={d.errores.costPerUnit} ayuda="En pesos." />
					<Campo etiqueta="Proveedor" opcional value={f.supplier} onChange={(e) => setF({ ...f, supplier: e.target.value })} maxLength={120} autoComplete="off" />
				</div>
				<Interruptor etiqueta="Producto activo" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} />
			</form>
		</Dialogo>
	);
}

export function DialogoMerma({ productos, disparador, alGuardar }: { productos: Product[]; disparador: ReactNode; alGuardar: (m: Merma) => Promise<boolean> }) {
	const inicial = () => ({ productId: String(productos[0]?.id ?? ""), cantidad: "", motivo: "caducidad", justificacion: "", reporta: "" });
	const [f, setF] = useState(inicial);
	const producto = productos.find((p) => String(p.id) === f.productId);
	const cantidad = num(f.cantidad);
	const coste = producto && cantidad > 0 ? cantidad * producto.costPerUnit : 0;
	const d = useDialogo(() => {
		if (!producto) return null;
		const marca = marcaDeTiempo();
		return alGuardar({
			id: marca,
			productId: producto.id,
			productName: producto.name,
			quantity: cantidad,
			unit: producto.unit,
			reason: f.motivo,
			justification: f.justificacion.trim(),
			reportedBy: f.reporta.trim(),
			date: hoy(),
			cost: coste,
		});
	});

	return (
		<Dialogo
			abierto={d.abierto}
			alCambiarAbierto={(a) => {
				d.setAbierto(a);
				if (a) setF(inicial());
				else d.setErrores({});
			}}
			cerrable={!d.guardando}
			disparador={disparador}
			titulo="Registrar una merma"
			descripcion="Producto perdido o que no se puede usar. Se resta de las existencias."
			pie={<Pie formulario="merma-nueva" texto="Registrar merma" guardando={d.guardando} alCancelar={() => d.setAbierto(false)} />}
		>
			<form
				id="merma-nueva"
				noValidate
				className="flex flex-col gap-(--espacio-md)"
				onSubmit={(ev) => {
					ev.preventDefault();
					const e: Record<string, string> = {};
					if (!producto) e.producto = "Elige el producto.";
					if (!(cantidad > 0)) e.cantidad = "Escribe una cantidad mayor que cero.";
					if (!f.justificacion.trim()) e.justificacion = "Explica qué pasó.";
					void d.enviar(e);
				}}
			>
				<Selector
					etiqueta="Producto"
					opciones={productos.map((p) => ({ valor: String(p.id), texto: p.name }))}
					value={f.productId}
					onChange={(e) => setF({ ...f, productId: e.target.value })}
					error={d.errores.producto}
				/>
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2">
					<Campo
						etiqueta="Cantidad"
						type="number"
						inputMode="decimal"
						min={0}
						step="0.1"
						value={f.cantidad}
						onChange={(e) => setF({ ...f, cantidad: e.target.value })}
						error={d.errores.cantidad}
						ayuda={producto ? `En ${producto.unit}.` : undefined}
					/>
					<Selector etiqueta="Motivo" opciones={opciones(MOTIVOS_MERMA)} value={f.motivo} onChange={(e) => setF({ ...f, motivo: e.target.value })} />
				</div>
				<AreaTexto etiqueta="Qué pasó" rows={3} value={f.justificacion} onChange={(e) => setF({ ...f, justificacion: e.target.value })} error={d.errores.justificacion} maxLength={300} />
				<Campo etiqueta="Reportado por" opcional value={f.reporta} onChange={(e) => setF({ ...f, reporta: e.target.value })} maxLength={80} autoComplete="off" />
				<p aria-live="polite" className="m-0 text-texto-principal">
					<span className="text-texto-secundario">Pérdida estimada: </span>
					<span className="font-semibold numeros-tabulares">{importe(coste)}</span>
				</p>
			</form>
		</Dialogo>
	);
}

export function DialogoAjuste({ producto, disparador, alGuardar }: { producto: Product; disparador: ReactNode; alGuardar: (id: number, existencias: number) => Promise<boolean> }) {
	const [modo, setModo] = useState<"sumar" | "fijar">("sumar");
	const [cantidad, setCantidad] = useState("");
	const valor = num(cantidad);
	const nuevo = Number.isFinite(valor) ? (modo === "sumar" ? producto.stock + valor : valor) : producto.stock;
	const d = useDialogo(() => alGuardar(producto.id, nuevo));
	const id = `ajuste-${producto.id}`;

	return (
		<Dialogo
			abierto={d.abierto}
			alCambiarAbierto={(a) => {
				d.setAbierto(a);
				if (a) {
					setModo("sumar");
					setCantidad("");
				} else d.setErrores({});
			}}
			cerrable={!d.guardando}
			disparador={disparador}
			titulo={`Ajustar las existencias de ${producto.name}`}
			pie={<Pie formulario={id} texto="Ajustar" guardando={d.guardando} alCancelar={() => d.setAbierto(false)} />}
		>
			<form
				id={id}
				noValidate
				className="flex flex-col gap-(--espacio-md)"
				onSubmit={(ev) => {
					ev.preventDefault();
					const e: Record<string, string> = {};
					if (!Number.isFinite(valor)) e.cantidad = "Escribe una cantidad.";
					else if (nuevo < 0) e.cantidad = "Las existencias no pueden quedar por debajo de cero.";
					void d.enviar(e);
				}}
			>
				<Selector
					etiqueta="Cómo ajustar"
					opciones={[
						{ valor: "sumar", texto: "Sumar o restar a lo que hay" },
						{ valor: "fijar", texto: "Fijar la cantidad exacta" },
					]}
					value={modo}
					onChange={(e) => setModo(e.target.value as "sumar" | "fijar")}
				/>
				<Campo
					etiqueta={modo === "sumar" ? "Cantidad" : "Nueva cantidad"}
					type="number"
					inputMode="decimal"
					step="0.1"
					value={cantidad}
					onChange={(e) => setCantidad(e.target.value)}
					error={d.errores.cantidad}
					ayuda={modo === "sumar" ? `En ${producto.unit}; con signo menos para restar.` : `En ${producto.unit}.`}
				/>
				<div aria-live="polite">
					<Contraetiqueta
						pares={[
							{ rotulo: "Ahora", valor: `${producto.stock} ${producto.unit}` },
							{ rotulo: "Quedará", valor: `${nuevo} ${producto.unit}` },
						]}
					/>
				</div>
			</form>
		</Dialogo>
	);
}
