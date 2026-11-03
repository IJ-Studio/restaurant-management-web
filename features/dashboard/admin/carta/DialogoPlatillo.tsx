"use client";

import { useState, type ReactNode } from "react";
import { ImageUp, Trash2 } from "lucide-react";
import { CldUploadButton } from "next-cloudinary";
import { Boton } from "@/components/ui/Boton";
import { AreaTexto, Campo } from "@/components/ui/Campo";
import { Casilla, Interruptor } from "@/components/ui/Casilla";
import { Dialogo } from "@/components/ui/Dialogo";
import { Imagen } from "@/components/ui/Imagen";
import { clasesBoton } from "@/components/ui/estilos-boton";
import type { MenuItem } from "@/features/shared/data/restaurantData";
import { TAMANO_MAXIMO } from "@/lib/validacion/archivos";
import { esquemaPlatillo } from "@/lib/validacion/formularios";

/**
 * Platillo nuevo o en edición (PLAN 5.9). Sustituye a `ItemModal` con la misma lógica: el mismo
 * formulario parcial de `MenuItem` y la misma subida de imagen con el widget de Cloudinary
 * (`CldUploadButton`, mismo preset). La página decide qué se guarda en el servidor.
 *
 * La subida limita en el widget los formatos (JPG, PNG, WebP, AVIF) y el tamaño (5 MB, el de
 * `TAMANO_MAXIMO.imagen`). La comprobación de la firma de bytes **antes** de abrir la subida
 * necesita un cargador propio con un preset firmado: queda en NP-46 (el preset actual,
 * `tu_upload_preset`, es un marcador y no sube).
 */

export const ETIQUETAS: Record<string, string> = {
	popular: "Popular",
	vegano: "Vegano",
	picante: "Picante",
	nuevo: "Nuevo",
	"sin-gluten": "Sin gluten",
};
const num = (t: string) => (t.trim() === "" ? Number.NaN : Number(t));

export function DialogoPlatillo({
	platillo,
	categoria,
	disparador,
	alGuardar,
}: {
	platillo?: MenuItem;
	categoria: string;
	disparador: ReactNode;
	alGuardar: (datos: Partial<MenuItem>) => void;
}) {
	const inicial = () => ({
		name: platillo?.name ?? "",
		description: platillo?.description ?? "",
		price: platillo ? String(platillo.price) : "",
		prepTime: String(platillo?.prepTime ?? 10),
		calories: String(platillo?.calories ?? 0),
		available: platillo?.available ?? true,
		tags: platillo?.tags ?? ([] as string[]),
		imageUrl: platillo?.imageUrl ?? "",
		imagePublicId: platillo?.imagePublicId ?? "",
	});
	const [abierto, setAbierto] = useState(false);
	const [f, setF] = useState(inicial);
	const [errores, setErrores] = useState<Record<string, string>>({});
	const id = platillo ? `platillo-${platillo.id}` : `platillo-nuevo-${categoria}`;

	function guardar() {
		const e: Record<string, string> = {};
		// Nombre y descripción con el esquema del paso 3.1 (saneados); los números, con mensajes propios
		// para el campo vacío, que el esquema daría por «negativo».
		const texto = esquemaPlatillo.safeParse({ name: f.name, description: f.description });
		if (!texto.success) for (const i of texto.error.issues) e[String(i.path[0])] ??= i.message;
		if (!(num(f.price) >= 0)) e.price = "Escribe un precio igual o mayor que cero.";
		if (!(num(f.prepTime) >= 0)) e.prepTime = "Escribe los minutos, igual o mayor que cero.";
		if (!(num(f.calories) >= 0)) e.calories = "Escribe un número igual o mayor que cero.";
		setErrores(e);
		if (Object.keys(e).length) return;
		alGuardar({
			...(platillo ? { id: platillo.id } : {}),
			name: texto.success ? texto.data.name : f.name.trim(),
			description: texto.success ? (texto.data.description ?? "") : f.description.trim(),
			price: num(f.price),
			prepTime: num(f.prepTime),
			calories: num(f.calories),
			available: f.available,
			tags: f.tags,
			imageUrl: f.imageUrl,
			imagePublicId: f.imagePublicId,
		});
		setAbierto(false);
	}

	return (
		<Dialogo
			ancho="amplio"
			abierto={abierto}
			alCambiarAbierto={(a) => {
				setAbierto(a);
				if (a) setF(inicial());
				else setErrores({});
			}}
			disparador={disparador}
			titulo={platillo ? `Editar ${platillo.name}` : "Platillo nuevo"}
			descripcion={`En la categoría «${categoria}».`}
			pie={
				<>
					<Boton variante="secundario" onClick={() => setAbierto(false)}>
						Cancelar
					</Boton>
					<Boton type="submit" form={id}>
						{platillo ? "Guardar cambios" : "Añadir platillo"}
					</Boton>
				</>
			}
		>
			<form
				id={id}
				noValidate
				className="flex flex-col gap-(--espacio-md)"
				onSubmit={(ev) => {
					ev.preventDefault();
					guardar();
				}}
			>
				<Campo etiqueta="Nombre" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={errores.name} maxLength={120} autoComplete="off" />
				<AreaTexto etiqueta="Descripción" opcional rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} maxLength={300} contador />
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-3">
					<Campo etiqueta="Precio" type="number" inputMode="decimal" min={0} step="0.01" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} error={errores.price} ayuda="En pesos." />
					<Campo etiqueta="Preparación" type="number" inputMode="numeric" min={0} value={f.prepTime} onChange={(e) => setF({ ...f, prepTime: e.target.value })} error={errores.prepTime} ayuda="En minutos." />
					<Campo etiqueta="Calorías" type="number" inputMode="numeric" min={0} value={f.calories} onChange={(e) => setF({ ...f, calories: e.target.value })} error={errores.calories} />
				</div>

				<fieldset className="m-0 flex min-w-0 flex-col gap-(--espacio-sm) border-0 p-0">
					<legend className="mb-(--espacio-xs) p-0 font-semibold text-texto-principal">Imagen</legend>
					{f.imageUrl ? (
						<div className="flex flex-wrap items-end gap-(--espacio-md)">
							<div className="relative aspect-[4/3] w-48 overflow-hidden rounded-tarjeta border border-borde-sutil">
								<Imagen src={f.imageUrl} alt={`Foto de ${f.name || "el platillo"}`} fill sizes="12rem" className="object-cover" />
							</div>
							<Boton variante="secundario" tamano="compacto" icono={<Trash2 />} onClick={() => setF({ ...f, imageUrl: "", imagePublicId: "" })}>
								Quitar la imagen
							</Boton>
						</div>
					) : (
						<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">Sin imagen. JPG, PNG, WebP o AVIF de hasta {TAMANO_MAXIMO.imagen / (1024 * 1024)} MB.</p>
					)}
					<CldUploadButton
						uploadPreset="tu_upload_preset"
						options={{ maxFiles: 1, clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "avif"], maxFileSize: TAMANO_MAXIMO.imagen, sources: ["local"] }}
						onSuccess={(resultado) => {
							const info = resultado?.info;
							if (info && typeof info === "object" && "secure_url" in info) {
								setF((x) => ({ ...x, imageUrl: String(info.secure_url), imagePublicId: String(info.public_id ?? "") }));
							}
						}}
						className={clasesBoton({ variante: "secundario", tamano: "compacto", className: "self-start" })}
					>
						<ImageUp aria-hidden="true" />
						{f.imageUrl ? "Cambiar la imagen" : "Subir una imagen"}
					</CldUploadButton>
				</fieldset>

				<fieldset className="m-0 flex min-w-0 flex-col gap-(--espacio-sm) border-0 p-0">
					<legend className="mb-(--espacio-xs) p-0 font-semibold text-texto-principal">Etiquetas</legend>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
						{Object.entries(ETIQUETAS).map(([clave, texto]) => (
							<Casilla
								key={clave}
								etiqueta={texto}
								checked={f.tags.includes(clave)}
								onChange={(e) => setF({ ...f, tags: e.target.checked ? [...f.tags, clave] : f.tags.filter((t) => t !== clave) })}
							/>
						))}
					</div>
				</fieldset>
				<Interruptor etiqueta="Disponible en la carta" checked={f.available} onChange={(e) => setF({ ...f, available: e.target.checked })} />
			</form>
		</Dialogo>
	);
}
