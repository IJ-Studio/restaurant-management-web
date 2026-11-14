"use client";

import { useId, useRef, useState } from "react";
import { ImageUp, Trash2 } from "lucide-react";
import { Boton } from "@/components/ui/Boton";
import { Imagen } from "@/components/ui/Imagen";
import { api } from "@/lib/api";
import { ACEPTA, TAMANO_MAXIMO, verificarArchivo } from "@/lib/validacion/archivos";
import { registrarError } from "@/lib/registro/registrar-error";

/**
 * Imagen de un platillo o una promoción con subida firmada (PLAN-AMPLIACION D-31; antes NP-08 y
 * NP-46, con el widget de Cloudinary y un preset de marcador que no subía).
 *
 * 1. Miniatura de la imagen actual (o el respaldo de `Imagen` si no hay).
 * 2. Al elegir un archivo: `verificarArchivo` comprueba tamaño (5 MB), extensión, tipo y firma de
 *    bytes **antes** de subir nada.
 * 3. El API firma la subida (`POST /imagenes/firma`, solo administración) para la carpeta fija de
 *    su destino; el navegador nunca ve el secreto de la nube.
 * 4. Se sube a Cloudinary con esa firma y la pantalla recibe `secure_url` y `public_id`.
 *
 * Si el API todavía no firma, lo dice con un error cálido y la imagen anterior no cambia.
 */

export interface ValorImagen {
	url: string;
	publicId: string;
}
interface Firma {
	cloudName: string;
	apiKey: string;
	timestamp: number;
	signature: string;
	folder: string;
}

const MB = TAMANO_MAXIMO.imagen / (1024 * 1024);

export function SubidaImagen({
	destino,
	valor,
	alCambiar,
	textoAlternativo,
}: {
	destino: "platillos" | "promociones" | "landing";
	valor: ValorImagen;
	alCambiar: (v: ValorImagen) => void;
	textoAlternativo: string;
}) {
	const entrada = useRef<HTMLInputElement>(null);
	const idAyuda = useId();
	const [estado, setEstado] = useState<"quieto" | "subiendo">("quieto");
	const [error, setError] = useState<string | null>(null);

	async function subir(archivo: File) {
		setError(null);
		const revision = await verificarArchivo(archivo, "imagen");
		if (!revision.valido) return setError(revision.error);
		setEstado("subiendo");
		try {
			const firma = await api.post<Firma>("/imagenes/firma", { destino });
			const datos = new FormData();
			datos.append("file", archivo);
			datos.append("api_key", firma.apiKey);
			datos.append("timestamp", String(firma.timestamp));
			datos.append("signature", firma.signature);
			datos.append("folder", firma.folder);
			const respuesta = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(firma.cloudName)}/image/upload`, { method: "POST", body: datos });
			if (!respuesta.ok) throw new Error(`Cloudinary respondió ${respuesta.status}`);
			const subida = (await respuesta.json()) as { secure_url?: string; public_id?: string };
			if (!subida.secure_url) throw new Error("Cloudinary no devolvió la dirección");
			alCambiar({ url: subida.secure_url, publicId: subida.public_id ?? "" });
		} catch (err) {
			registrarError(err, `imagen de ${destino}: subir`);
			setError("No pudimos subir la imagen. La anterior se conserva; vuelve a intentarlo en un momento.");
		} finally {
			setEstado("quieto");
			if (entrada.current) entrada.current.value = "";
		}
	}

	return (
		<fieldset className="m-0 flex min-w-0 flex-col gap-(--espacio-sm) border-0 p-0" aria-describedby={idAyuda}>
			<legend className="mb-(--espacio-xs) p-0 font-semibold text-texto-principal">Imagen</legend>
			<div className="flex flex-wrap items-end gap-(--espacio-md)">
				<div className="relative aspect-[4/3] w-48 overflow-hidden rounded-tarjeta border border-borde-sutil bg-superficie-cafe" data-prueba="miniatura-imagen">
					{valor.url ? <Imagen src={valor.url} alt={textoAlternativo} fill sizes="12rem" className="object-cover" /> : <Imagen src={null} decorativa fill sizes="12rem" className="object-cover" />}
				</div>
				<div className="flex flex-col gap-2">
					<input
						ref={entrada}
						type="file"
						accept={ACEPTA.imagen}
						className="solo-lectores"
						tabIndex={-1}
						aria-hidden="true"
						onChange={(e) => {
							const archivo = e.target.files?.[0];
							if (archivo) void subir(archivo);
						}}
					/>
					<Boton variante="secundario" tamano="compacto" icono={<ImageUp />} cargando={estado === "subiendo"} textoCargando="Subiendo…" onClick={() => entrada.current?.click()}>
						{valor.url ? "Cambiar la imagen" : "Subir una imagen"}
					</Boton>
					{valor.url && (
						<Boton variante="fantasma" tamano="compacto" icono={<Trash2 />} deshabilitado={estado === "subiendo"} onClick={() => alCambiar({ url: "", publicId: "" })}>
							Quitar la imagen
						</Boton>
					)}
				</div>
			</div>
			<p id={idAyuda} className="m-0 text-(length:--texto-pequeno) text-texto-secundario">{`JPG, PNG, WebP o AVIF de hasta ${MB} MB.`}</p>
			{error && (
				<p role="alert" className="m-0 text-(length:--texto-pequeno) text-error">
					{error}
				</p>
			)}
		</fieldset>
	);
}
