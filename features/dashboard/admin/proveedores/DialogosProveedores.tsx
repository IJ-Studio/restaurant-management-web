"use client";

import { useState, type ReactNode } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Contraetiqueta } from "@/components/marca/Contraetiqueta";
import { Boton } from "@/components/ui/Boton";
import { AreaTexto, Campo, Selector } from "@/components/ui/Campo";
import { Interruptor } from "@/components/ui/Casilla";
import { Dialogo } from "@/components/ui/Dialogo";
import { Pie, useDialogo } from "@/features/dashboard/admin/inventario/DialogosInventario";
import type { OrderItem, OrderStatus, Product, PurchaseOrder, Supplier } from "@/hooks/useInventory";
import { contar } from "@/lib/formato/plural";
import { formatearImporte } from "@/lib/formato/precio";
import { correoBasicoOpcional } from "@/lib/validacion/campos";

/**
 * Diálogos de proveedores y órdenes de compra (PLAN 5.8). Sustituyen a `SupplierModal` y
 * `OrderModal`, hacia el API (`/inventario/admin/proveedores` y `/ordenes`).
 */

export const ESTADOS_ORDEN: Record<OrderStatus, string> = {
	borrador: "Borrador",
	enviada: "Enviada",
	confirmada: "Confirmada",
	en_camino: "En camino",
	recibida: "Recibida",
	cancelada: "Cancelada",
};
const FLUJO: OrderStatus[] = ["borrador", "enviada", "confirmada", "en_camino", "recibida"];
const TERMINOS = ["Contado", "Crédito 7 días", "Crédito 15 días", "Crédito 30 días", "Crédito 60 días"];
const importe = (n: number) => formatearImporte(n) ?? "—";
const num = (t: string) => (t.trim() === "" ? Number.NaN : Number(t));
const marcaDeTiempo = () => Date.now();
const igual = (a: string, b: string) => a.toLowerCase().trim() === b.toLowerCase().trim();

export function DialogoProveedor({ proveedor, disparador, alGuardar }: { proveedor?: Supplier; disparador: ReactNode; alGuardar: (s: Supplier) => Promise<boolean> }) {
	const inicial = () => ({
		name: proveedor?.name ?? "",
		contact: proveedor?.contact ?? "",
		email: proveedor?.email ?? "",
		phone: proveedor?.phone ?? "",
		category: proveedor?.category ?? "",
		website: proveedor?.website ?? "",
		paymentTerms: proveedor?.paymentTerms ?? "Contado",
		deliveryDays: String(proveedor?.deliveryDays ?? 1),
		products: proveedor?.products ?? [],
		notes: proveedor?.notes ?? "",
		active: proveedor?.active ?? true,
	});
	const [f, setF] = useState(inicial);
	const [nuevoProducto, setNuevoProducto] = useState("");
	const id = proveedor ? `proveedor-${proveedor.id}` : "proveedor-nuevo";
	const d = useDialogo(() =>
		alGuardar({
			...(proveedor ?? {}),
			id: proveedor?.id ?? 0,
			name: f.name.trim(),
			contact: f.contact.trim(),
			email: f.email.trim(),
			phone: f.phone.trim(),
			category: f.category.trim(),
			website: f.website.trim() || undefined,
			paymentTerms: f.paymentTerms,
			deliveryDays: num(f.deliveryDays),
			products: f.products,
			notes: f.notes.trim() || undefined,
			active: f.active,
		}),
	);

	function anadirProducto() {
		const p = nuevoProducto.trim();
		if (p && !f.products.some((x) => igual(x, p))) setF({ ...f, products: [...f.products, p] });
		setNuevoProducto("");
	}

	return (
		<Dialogo
			ancho="amplio"
			abierto={d.abierto}
			alCambiarAbierto={(a) => {
				d.setAbierto(a);
				if (a) {
					setF(inicial());
					setNuevoProducto("");
				} else d.setErrores({});
			}}
			cerrable={!d.guardando}
			disparador={disparador}
			titulo={proveedor ? `Editar ${proveedor.name}` : "Proveedor nuevo"}
			pie={<Pie formulario={id} texto={proveedor ? "Guardar cambios" : "Añadir proveedor"} guardando={d.guardando} alCancelar={() => d.setAbierto(false)} />}
		>
			<form
				id={id}
				noValidate
				className="flex flex-col gap-(--espacio-md)"
				onSubmit={(ev) => {
					ev.preventDefault();
					const e: Record<string, string> = {};
					if (!f.name.trim()) e.name = "Escribe el nombre del proveedor.";
					const correo = correoBasicoOpcional.safeParse(f.email);
					if (!correo.success) e.email = correo.error.issues[0]?.message ?? "Revisa el correo.";
					if (!(num(f.deliveryDays) >= 0)) e.deliveryDays = "Escribe un número de días igual o mayor que cero.";
					void d.enviar(e);
				}}
			>
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2">
					<Campo etiqueta="Nombre" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={d.errores.name} maxLength={120} autoComplete="off" />
					<Campo etiqueta="Persona de contacto" opcional value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} maxLength={120} autoComplete="off" />
					<Campo etiqueta="Correo" opcional type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={d.errores.email} autoComplete="off" />
					<Campo etiqueta="Teléfono" opcional type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} maxLength={20} autoComplete="off" />
					<Campo etiqueta="Categoría" opcional value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} maxLength={60} ayuda="Carnes, verduras, bebidas…" />
					<Campo etiqueta="Sitio web" opcional type="url" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} maxLength={200} autoComplete="off" />
					<Selector etiqueta="Términos de pago" opciones={TERMINOS.map((t) => ({ valor: t, texto: t }))} value={f.paymentTerms} onChange={(e) => setF({ ...f, paymentTerms: e.target.value })} />
					<Campo etiqueta="Días de entrega" type="number" inputMode="numeric" min={0} value={f.deliveryDays} onChange={(e) => setF({ ...f, deliveryDays: e.target.value })} error={d.errores.deliveryDays} />
				</div>
				<fieldset className="m-0 flex min-w-0 flex-col gap-(--espacio-sm) border-0 p-0">
					<legend className="mb-(--espacio-xs) p-0 font-semibold text-texto-principal">Productos que suministra</legend>
					<div className="flex flex-wrap items-end gap-2">
						<Campo
							etiqueta="Producto"
							value={nuevoProducto}
							onChange={(e) => setNuevoProducto(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									anadirProducto();
								}
							}}
							ayuda="Con el mismo nombre que en el inventario, para poder pedirlo."
							maxLength={120}
							autoComplete="off"
							className="min-w-48 flex-1"
						/>
						<Boton variante="secundario" icono={<Plus />} onClick={anadirProducto} className="mb-7">
							Añadir
						</Boton>
					</div>
					{f.products.length > 0 && (
						<ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Productos añadidos">
							{f.products.map((p) => (
								<li key={p} className="flex items-center gap-1 rounded-control border border-borde-sutil bg-superficie py-0.5 ps-3 text-(length:--texto-pequeno)">
									{p}
									<Boton variante="fantasma" tamano="compacto" soloIcono icono={<X />} onClick={() => setF({ ...f, products: f.products.filter((x) => x !== p) })}>
										{`Quitar ${p}`}
									</Boton>
								</li>
							))}
						</ul>
					)}
				</fieldset>
				<AreaTexto etiqueta="Notas" opcional rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} maxLength={300} />
				<Interruptor etiqueta="Proveedor activo" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} ayuda="Solo a los activos se les pueden hacer pedidos." />
			</form>
		</Dialogo>
	);
}

interface Articulo extends OrderItem {
	clave: number;
	cantidadTexto: string;
}
const articuloVacio = (): Articulo => ({ clave: Math.random(), productName: "", quantity: 1, cantidadTexto: "1", unit: "kg", unitCost: 0 });

export function DialogoOrden({
	orden,
	proveedores,
	productos,
	proveedorInicial,
	disparador,
	alGuardar,
}: {
	orden?: PurchaseOrder;
	proveedores: Supplier[];
	productos: Product[];
	proveedorInicial?: number;
	disparador: ReactNode;
	alGuardar: (o: PurchaseOrder) => Promise<boolean>;
}) {
	const activos = proveedores.filter((s) => s.active || s.id === orden?.supplierId);
	const inicial = () => ({
		proveedor: String(orden?.supplierId ?? proveedorInicial ?? activos[0]?.id ?? ""),
		estado: orden?.status ?? ("borrador" as OrderStatus),
		notas: orden?.notes ?? "",
		articulos: orden?.items.map((i) => ({ ...i, clave: Math.random(), cantidadTexto: String(i.quantity) })) ?? [articuloVacio()],
	});
	const [f, setF] = useState(inicial);
	const proveedor = proveedores.find((s) => String(s.id) === f.proveedor);
	const disponibles = proveedor ? productos.filter((p) => proveedor.products.some((sp) => igual(sp, p.name))) : [];
	const total = f.articulos.reduce((a, i) => a + (num(i.cantidadTexto) > 0 ? num(i.cantidadTexto) * i.unitCost : 0), 0);
	const id = orden ? `orden-${orden.id}` : "orden-nueva";
	const estados = orden?.status === "cancelada" ? [...FLUJO, "cancelada" as const] : FLUJO;

	const d = useDialogo(() => {
		const marca = marcaDeTiempo();
		return alGuardar({
			...(orden ?? {}),
			id: orden?.id ?? 0,
			folio: orden?.folio ?? `OC-${new Date(marca).getFullYear()}-${String(marca).slice(-3)}`,
			supplierId: Number(f.proveedor),
			supplierName: proveedor?.name ?? "",
			status: f.estado,
			items: f.articulos.map((i) => ({ productName: i.productName, quantity: num(i.cantidadTexto), unit: i.unit, unitCost: i.unitCost })),
			total,
			createdAt: orden?.createdAt ?? new Date(marca).toISOString().split("T")[0],
			notes: f.notas,
		});
	});

	function cambiarArticulo(clave: number, cambios: Partial<Articulo>) {
		setF((x) => ({ ...x, articulos: x.articulos.map((i) => (i.clave === clave ? { ...i, ...cambios } : i)) }));
	}
	function elegirProducto(clave: number, nombre: string) {
		const p = productos.find((x) => igual(x.name, nombre));
		cambiarArticulo(clave, p ? { productName: p.name, unitCost: p.costPerUnit, unit: p.unit || "pza" } : { productName: nombre });
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
			titulo={orden ? `Orden ${orden.folio}` : "Orden de compra nueva"}
			pie={<Pie formulario={id} texto={orden ? "Guardar cambios" : "Crear orden"} guardando={d.guardando} alCancelar={() => d.setAbierto(false)} />}
		>
			<form
				id={id}
				noValidate
				className="flex flex-col gap-(--espacio-lg)"
				onSubmit={(ev) => {
					ev.preventDefault();
					const e: Record<string, string> = {};
					if (!proveedor) e.proveedor = "Elige el proveedor.";
					f.articulos.forEach((i) => {
						if (!i.productName) e[`p${i.clave}`] = "Elige el producto.";
						if (!(num(i.cantidadTexto) > 0)) e[`c${i.clave}`] = "Mayor que cero.";
					});
					void d.enviar(e);
				}}
			>
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-2">
					<Selector
						etiqueta="Proveedor"
						opciones={activos.map((s) => ({ valor: String(s.id), texto: s.name }))}
						marcador={activos.length ? undefined : "No hay proveedores activos"}
						value={f.proveedor}
						onChange={(e) => setF({ ...f, proveedor: e.target.value, articulos: [articuloVacio()] })}
						error={d.errores.proveedor}
						ayuda={proveedor ? `Entrega en ${contar(proveedor.deliveryDays, "día")}; ${proveedor.paymentTerms.toLowerCase()}.` : undefined}
					/>
					{orden && <Selector etiqueta="Estado" opciones={estados.map((s) => ({ valor: s, texto: ESTADOS_ORDEN[s] }))} value={f.estado} onChange={(e) => setF({ ...f, estado: e.target.value as OrderStatus })} />}
				</div>

				<fieldset className="m-0 flex min-w-0 flex-col gap-(--espacio-md) border-0 p-0">
					<legend className="mb-(--espacio-sm) p-0 font-semibold text-texto-principal">Artículos</legend>
					{proveedor && disponibles.length === 0 && (
						<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">
							Este proveedor no tiene productos del inventario asociados. Añádelos al editar el proveedor.
						</p>
					)}
					<ol className="m-0 flex list-none flex-col gap-(--espacio-md) p-0">
						{f.articulos.map((i, n) => (
							<li key={i.clave} className="grid grid-cols-2 items-start gap-(--espacio-sm) border-b border-borde-sutil pb-(--espacio-md) sm:grid-cols-[minmax(0,1fr)_6rem_8rem_auto]">
								<Selector
									etiqueta={`Artículo ${n + 1}`}
									marcador="Elige un producto"
									opciones={disponibles.map((p) => ({ valor: p.name, texto: p.name }))}
									value={i.productName}
									onChange={(e) => elegirProducto(i.clave, e.target.value)}
									error={d.errores[`p${i.clave}`]}
									className="col-span-2 sm:col-span-1"
								/>
								<Campo etiqueta="Cantidad" type="number" inputMode="decimal" min={0} value={i.cantidadTexto} onChange={(e) => cambiarArticulo(i.clave, { cantidadTexto: e.target.value })} error={d.errores[`c${i.clave}`]} />
								<div className="flex flex-col gap-1 pt-1">
									<span className="font-texto text-(length:--texto-pequeno) font-medium text-texto-principal">Costo</span>
									<span className="numeros-tabulares text-texto-secundario">{i.productName ? `${importe(i.unitCost)} / ${i.unit}` : "—"}</span>
								</div>
								<div className="col-span-2 flex justify-end sm:col-span-1 sm:pt-7">
									<Boton
										variante="fantasma"
										soloIcono
										icono={<Trash2 />}
										deshabilitado={f.articulos.length === 1}
										onClick={() => setF({ ...f, articulos: f.articulos.filter((x) => x.clave !== i.clave) })}
									>
										{`Quitar el artículo ${n + 1}`}
									</Boton>
								</div>
							</li>
						))}
					</ol>
					<Boton variante="secundario" tamano="compacto" icono={<Plus />} className="self-start" onClick={() => setF({ ...f, articulos: [...f.articulos, articuloVacio()] })}>
						Añadir artículo
					</Boton>
					<div aria-live="polite">
						<Contraetiqueta pares={[{ rotulo: "Total", valor: <strong>{importe(total)}</strong> }]} />
					</div>
				</fieldset>
				<AreaTexto etiqueta="Notas" opcional rows={2} value={f.notas} onChange={(e) => setF({ ...f, notas: e.target.value })} maxLength={300} />
			</form>
		</Dialogo>
	);
}
