"use client";

import { useEffect, useState } from "react";
import { Plus, Save } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { PlantillaPanel } from "@/components/paneles/PlantillaPanel";
import { Boton } from "@/components/ui/Boton";
import { AreaTexto, Campo } from "@/components/ui/Campo";
import { EstadoError } from "@/components/ui/EstadoError";
import { useNotificaciones } from "@/components/ui/Notificacion";
import { SubidaImagen } from "@/features/dashboard/admin/comun/SubidaImagen";
import { useCarga } from "@/hooks/useCarga";
import { api, APIError } from "@/lib/api";
import { pedirPanel } from "@/lib/paneles/api-panel";
import { registrarError } from "@/lib/registro/registrar-error";

/**
 * Sitio web (P1.5): imágenes de la portada (hasta 5, en carrusel), de inicio de sesión y de registro,
 * el color que se ve mientras cargan, y el teléfono y WhatsApp del restaurante.
 * `GET /sitio` y `PUT /sitio` (solo admin); las imágenes suben firmadas a la carpeta `landing`.
 */
interface ImagenSitio {
	url: string;
	publicId: string;
	alt: string;
}
interface Sitio {
	portada: ImagenSitio[];
	login: ImagenSitio | null;
	registro: ImagenSitio | null;
	colorRespaldo: string;
	telefono: string | null;
	whatsapp: string | null;
	textos?: { titulo: string | null; subtitulo: string | null; nosotros: string | null };
}
type CampoTexto = "titulo" | "subtitulo" | "nosotros";
const VACIA: ImagenSitio = { url: "", publicId: "", alt: "" };
const MAX_PORTADA = 5;

function EditorImagen({ titulo, valor, alCambiar, alQuitar }: { titulo: string; valor: ImagenSitio; alCambiar: (v: ImagenSitio) => void; alQuitar?: () => void }) {
	return (
		<div className="flex flex-col gap-(--espacio-sm) rounded-tarjeta border border-borde-sutil p-(--espacio-md)">
			<SubidaImagen destino="landing" valor={valor} alCambiar={(v) => alCambiar({ ...valor, ...v })} textoAlternativo={valor.alt || titulo} />
			<Campo etiqueta={`Descripción de la imagen (${titulo.toLowerCase()})`} value={valor.alt} onChange={(e) => alCambiar({ ...valor, alt: e.target.value })} maxLength={150} ayuda="Para lectores de pantalla: qué se ve en la foto." />
			{alQuitar && (
				<Boton variante="fantasma" tamano="compacto" onClick={alQuitar}>
					{`Quitar ${titulo.toLowerCase()}`}
				</Boton>
			)}
		</div>
	);
}

export function SitioAdmin() {
	const [carga, recargar] = useCarga(() => pedirPanel<Sitio>("/sitio"), "sitio: cargar");
	const [f, setF] = useState<Sitio | null>(null);
	const [guardando, setGuardando] = useState(false);
	const [errores, setErrores] = useState<string[]>([]);
	const { notificar } = useNotificaciones();

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- copia editable de lo que llegó del API
		if (carga.estado === "listo" && carga.datos) setF(carga.datos);
	}, [carga]);

	function cambiarTexto(campo: CampoTexto, valor: string) {
		setF((prev) => (prev ? { ...prev, textos: { titulo: null, subtitulo: null, nosotros: null, ...prev.textos, [campo]: valor } } : prev));
	}

	async function guardar() {
		if (!f) return;
		const conImagen = (i: ImagenSitio | null) => (i && i.url ? { ...i, alt: i.alt.trim() || "Fotografía de El Quijote" } : null);
		const cuerpo = {
			portada: f.portada.map(conImagen).filter(Boolean),
			login: conImagen(f.login),
			registro: conImagen(f.registro),
			colorRespaldo: f.colorRespaldo,
			telefono: (f.telefono ?? "").trim(),
			whatsapp: (f.whatsapp ?? "").trim() || null,
			textos: {
				titulo: f.textos?.titulo?.trim() || null,
				subtitulo: f.textos?.subtitulo?.trim() || null,
				nosotros: f.textos?.nosotros?.trim() || null,
			},
		};
		setGuardando(true);
		setErrores([]);
		try {
			setF(await api.put<Sitio>("/sitio", cuerpo));
			notificar({ tono: "exito", titulo: "Sitio web guardado", descripcion: "La portada y los datos de contacto ya se ven en la página." });
		} catch (e) {
			registrarError(e, "sitio: guardar");
			// Los mensajes de validación del API traen la ruta del campo («portada.0.…»): se muestra solo el texto.
			const detalles = e instanceof APIError ? e.details.map((d) => d.replace(/^[\w.]+\./, "")) : [];
			setErrores(detalles.length ? detalles : ["No se pudo guardar. Vuelve a intentarlo en un momento."]);
		} finally {
			setGuardando(false);
		}
	}

	if (carga.estado === "error") return <EstadoError titulo="No pudimos traer la configuración del sitio" descripcion="Vuelve a intentarlo en un momento." alReintentar={recargar} />;
	if (!f) return null;

	return (
		<PlantillaPanel
			titulo="Sitio web"
			descripcion="Fotos de la portada, del inicio de sesión y del registro, y los datos de contacto."
			acciones={
				<Boton icono={<Save />} cargando={guardando} textoCargando="Guardando…" className="min-h-12" onClick={() => void guardar()}>
					Guardar cambios
				</Boton>
			}
		>
			{errores.length > 0 && (
				<ul role="alert" className="m-0 flex list-none flex-col gap-1 rounded-tarjeta border border-error p-(--espacio-md) text-error">
					{errores.map((e) => (
						<li key={e}>{e}</li>
					))}
				</ul>
			)}
			<BloquePanel titulo="Portada" descripcion={`Hasta ${MAX_PORTADA} fotos; con más de una, pasan solas. Sin fotos se usa la de siempre.`}>
				<div className="grid grid-cols-1 gap-(--espacio-md) lg:grid-cols-2">
					{f.portada.map((img, i) => (
						<EditorImagen
							key={i}
							titulo={`Foto ${i + 1} de la portada`}
							valor={img}
							alCambiar={(v) => setF({ ...f, portada: f.portada.map((x, j) => (j === i ? v : x)) })}
							alQuitar={() => setF({ ...f, portada: f.portada.filter((_, j) => j !== i) })}
						/>
					))}
				</div>
				{f.portada.length < MAX_PORTADA && (
					<Boton variante="secundario" icono={<Plus />} onClick={() => setF({ ...f, portada: [...f.portada, { ...VACIA }] })}>
						Añadir foto a la portada
					</Boton>
				)}
			</BloquePanel>
			<BloquePanel titulo="Inicio de sesión y registro" descripcion="Sin foto se usa la de siempre.">
				<div className="grid grid-cols-1 gap-(--espacio-md) lg:grid-cols-2">
					<EditorImagen titulo="Foto del inicio de sesión" valor={f.login ?? VACIA} alCambiar={(v) => setF({ ...f, login: v })} />
					<EditorImagen titulo="Foto del registro" valor={f.registro ?? VACIA} alCambiar={(v) => setF({ ...f, registro: v })} />
				</div>
			</BloquePanel>
			<BloquePanel titulo="Textos de la página" descripcion="Vacío = el texto de siempre.">
				<div className="grid grid-cols-1 gap-(--espacio-md)">
					<Campo etiqueta="Titular de la portada" opcional value={f.textos?.titulo ?? ""} onChange={(e) => cambiarTexto("titulo", e.target.value)} maxLength={80} />
					<Campo etiqueta="Entradilla de la portada" opcional value={f.textos?.subtitulo ?? ""} onChange={(e) => cambiarTexto("subtitulo", e.target.value)} maxLength={200} />
					<AreaTexto etiqueta="Párrafo de «Nosotros»" opcional value={f.textos?.nosotros ?? ""} onChange={(e) => cambiarTexto("nosotros", e.target.value)} maxLength={600} rows={4} />
				</div>
			</BloquePanel>
			<BloquePanel titulo="Color y contacto">
				<div className="grid grid-cols-1 gap-(--espacio-md) sm:grid-cols-3">
					<Campo etiqueta="Color mientras carga la foto" type="color" value={f.colorRespaldo} onChange={(e) => setF({ ...f, colorRespaldo: e.target.value })} ayuda="Se ve si la foto tarda o no carga." />
					<Campo etiqueta="Teléfono" type="tel" value={f.telefono ?? ""} onChange={(e) => setF({ ...f, telefono: e.target.value })} maxLength={20} ayuda="Con lada, p. ej. +52 771 702 8172." />
					<Campo etiqueta="WhatsApp" opcional type="tel" value={f.whatsapp ?? ""} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} maxLength={20} ayuda="El número que atiende WhatsApp." />
				</div>
			</BloquePanel>
		</PlantillaPanel>
	);
}
