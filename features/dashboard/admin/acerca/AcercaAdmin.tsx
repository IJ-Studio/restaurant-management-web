"use client";

import { useState, type ReactNode } from "react";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { EncabezadoPagina } from "@/components/paneles/EncabezadoPagina";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { AreaTexto, Campo } from "@/components/ui/Campo";
import { Interruptor } from "@/components/ui/Casilla";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Imagen } from "@/components/ui/Imagen";
import { esImagenPermitida } from "@/config/seguridad/hosts-permitidos";
import { INITIAL_ABOUT_INFO, type RestaurantInfo, type Schedule } from "@/features/dashboard/admin/data/aboutMock";

/**
 * Información del restaurante en el panel (PLAN 5.15). La pantalla nunca guardó nada: «Guardar»
 * enseñaba «guardado» sin llamar a nadie, y la vista previa imitaba una página «Nosotros» que ya no
 * existe (la de la fase 4 sale de la configuración, NP-43). Ahora lo dice: los datos son de
 * ejemplo y se editan solo en esta visita; ni botón de guardar falso ni vista previa engañosa.
 *
 * La galería admite solo fotos propias (D-18), y la de ejemplo ya no trae imágenes de Unsplash.
 */

const marcaDeTiempo = () => Date.now();
function fotoPropia(url: string) {
	try {
		return esImagenPermitida(new URL(url));
	} catch {
		return false;
	}
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
	return (
		<BloquePanel titulo={titulo} datosDeEjemplo>
			<div className="flex flex-col gap-(--espacio-md) rounded-tarjeta border border-borde-sutil bg-superficie p-(--espacio-md)">{children}</div>
		</BloquePanel>
	);
}

export function AcercaAdmin() {
	const [info, setInfo] = useState<RestaurantInfo>(INITIAL_ABOUT_INFO);
	const [nuevaCaracteristica, setNuevaCaracteristica] = useState("");
	const [foto, setFoto] = useState({ url: "", pie: "" });
	const [errorFoto, setErrorFoto] = useState<string | null>(null);

	const cambiar = <K extends keyof RestaurantInfo>(k: K, v: RestaurantInfo[K]) => setInfo((i) => ({ ...i, [k]: v }));
	const cambiarHorario = (n: number, k: keyof Schedule, v: string | boolean) => setInfo((i) => ({ ...i, schedule: i.schedule.map((s, j) => (j === n ? { ...s, [k]: v } : s)) }));

	function anadirCaracteristica() {
		const texto = nuevaCaracteristica.trim();
		if (!texto) return;
		setInfo((i) => ({ ...i, features: [...i.features, { id: marcaDeTiempo(), icon: "", text: texto }] }));
		setNuevaCaracteristica("");
	}

	function anadirFoto() {
		if (!fotoPropia(foto.url.trim())) {
			setErrorFoto("Usa una foto propia, de la nube de Cloudinary de la casa.");
			return;
		}
		setErrorFoto(null);
		setInfo((i) => ({ ...i, gallery: [...i.gallery, { id: marcaDeTiempo(), url: foto.url.trim(), caption: foto.pie.trim(), order: i.gallery.length + 1 }] }));
		setFoto({ url: "", pie: "" });
	}

	return (
		<div className="mx-auto flex w-full max-w-(--ancho-amplio) flex-col gap-(--espacio-xl) px-(--margen-pagina) py-(--espacio-xl) lg:py-(--espacio-2xl)">
			<EncabezadoPagina antetitulo="Sistema" titulo="Acerca del restaurante" descripcion="Identidad, contacto, horario, lo que ofrece la casa y su galería." />
			<Aviso tono="info" rol={null} titulo="Pantalla con datos de ejemplo.">
				Los cambios se ven en esta visita, pero no se guardan: la página «Nosotros» de la web toma sus datos de la configuración del sitio.
			</Aviso>

			<Seccion titulo="Identidad">
				<div className="grid grid-cols-1 gap-(--espacio-md) md:grid-cols-2">
					<Campo etiqueta="Nombre" value={info.name} onChange={(e) => cambiar("name", e.target.value)} maxLength={80} />
					<Campo etiqueta="Lema" value={info.slogan} onChange={(e) => cambiar("slogan", e.target.value)} maxLength={120} />
					<Campo etiqueta="Razón social" value={info.razonSocial} onChange={(e) => cambiar("razonSocial", e.target.value)} maxLength={160} />
					<Campo etiqueta="RFC" codigo value={info.rfc} onChange={(e) => cambiar("rfc", e.target.value.toUpperCase())} maxLength={13} />
				</div>
				<AreaTexto etiqueta="Descripción corta" rows={3} value={info.description} onChange={(e) => cambiar("description", e.target.value)} maxLength={400} contador />
				<AreaTexto etiqueta="Historia" rows={5} value={info.history} onChange={(e) => cambiar("history", e.target.value)} maxLength={1200} contador />
			</Seccion>

			<Seccion titulo="Contacto">
				<div className="grid grid-cols-1 gap-(--espacio-md) md:grid-cols-2">
					<Campo etiqueta="Teléfono" type="tel" value={info.phone} onChange={(e) => cambiar("phone", e.target.value)} maxLength={20} />
					<Campo etiqueta="Correo" type="email" value={info.email} onChange={(e) => cambiar("email", e.target.value)} />
					<Campo etiqueta="Sitio web" value={info.website} onChange={(e) => cambiar("website", e.target.value)} maxLength={120} />
					<Campo etiqueta="Dirección" value={info.address} onChange={(e) => cambiar("address", e.target.value)} maxLength={200} />
					<Campo etiqueta="Instagram" value={info.instagram} onChange={(e) => cambiar("instagram", e.target.value)} maxLength={60} />
					<Campo etiqueta="Facebook" value={info.facebook} onChange={(e) => cambiar("facebook", e.target.value)} maxLength={80} />
				</div>
			</Seccion>

			<Seccion titulo="Horario">
				<ul className="m-0 flex list-none flex-col p-0">
					{info.schedule.map((s, n) => (
						<li key={s.day} className="grid grid-cols-1 items-end gap-(--espacio-sm) border-b border-borde-sutil py-(--espacio-sm) last:border-b-0 sm:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1fr)_auto]">
							<span className="font-semibold text-texto-principal sm:pb-3">{s.day}</span>
							<Campo etiqueta={`Abre el ${s.day.toLowerCase()}`} type="time" value={s.open} disabled={s.closed} onChange={(e) => cambiarHorario(n, "open", e.target.value)} />
							<Campo etiqueta={`Cierra el ${s.day.toLowerCase()}`} type="time" value={s.close} disabled={s.closed} onChange={(e) => cambiarHorario(n, "close", e.target.value)} />
							<Interruptor etiqueta="Cerrado" checked={s.closed} onChange={(e) => cambiarHorario(n, "closed", e.target.checked)} className="sm:pb-2" />
						</li>
					))}
				</ul>
			</Seccion>

			<Seccion titulo="Lo que ofrece la casa">
				{info.features.length > 0 && (
					<ul className="m-0 flex list-none flex-col p-0" aria-label="Lo que ofrece la casa">
						{info.features.map((f) => (
							<li key={f.id} className="flex items-center justify-between gap-3 border-b border-borde-sutil py-2 last:border-b-0">
								<span className="text-texto-principal">{f.text}</span>
								<Boton variante="fantasma" tamano="compacto" soloIcono icono={<Trash2 />} onClick={() => setInfo((i) => ({ ...i, features: i.features.filter((x) => x.id !== f.id) }))}>
									{`Quitar «${f.text}»`}
								</Boton>
							</li>
						))}
					</ul>
				)}
				<div className="flex flex-wrap items-end gap-3">
					<Campo
						etiqueta="Nueva característica"
						value={nuevaCaracteristica}
						onChange={(e) => setNuevaCaracteristica(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								anadirCaracteristica();
							}
						}}
						maxLength={80}
						className="min-w-56 flex-1"
					/>
					<Boton variante="secundario" icono={<Plus />} onClick={anadirCaracteristica}>
						Añadir
					</Boton>
				</div>
			</Seccion>

			<Seccion titulo="Galería">
				{info.gallery.length === 0 ? (
					<EstadoVacio icono={<ImagePlus />} titulo="Sin fotos todavía" descripcion="Añade fotos propias de la sala, la cocina o los platos." />
				) : (
					<ul className="m-0 grid list-none grid-cols-1 gap-(--espacio-md) p-0 sm:grid-cols-2 lg:grid-cols-3" aria-label="Fotos de la galería">
						{info.gallery.map((g) => (
							<li key={g.id} className="flex flex-col gap-2">
								<div className="relative aspect-[4/3] overflow-hidden rounded-tarjeta border border-borde-sutil">
									<Imagen src={g.url} alt={g.caption || "Foto de la galería"} fill sizes="(min-width: 1024px) 20rem, 100vw" className="object-cover" />
								</div>
								<div className="flex items-center justify-between gap-2">
									<span className="text-(length:--texto-pequeno) text-texto-secundario">{g.caption || "Sin pie de foto"}</span>
									<Boton variante="fantasma" tamano="compacto" soloIcono icono={<Trash2 />} onClick={() => setInfo((i) => ({ ...i, gallery: i.gallery.filter((x) => x.id !== g.id) }))}>
										{`Quitar la foto ${g.caption || g.id}`}
									</Boton>
								</div>
							</li>
						))}
					</ul>
				)}
				<div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]">
					<Campo etiqueta="Dirección de la foto" type="url" value={foto.url} onChange={(e) => setFoto({ ...foto, url: e.target.value })} error={errorFoto} ayuda="De la nube de Cloudinary de la casa." autoComplete="off" />
					<Campo etiqueta="Pie de foto" opcional value={foto.pie} onChange={(e) => setFoto({ ...foto, pie: e.target.value })} maxLength={80} />
					<Boton variante="secundario" icono={<Plus />} onClick={anadirFoto} className="md:mb-7">
						Añadir foto
					</Boton>
				</div>
			</Seccion>
		</div>
	);
}
