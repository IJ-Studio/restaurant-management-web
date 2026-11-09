"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquareWarning } from "lucide-react";
import { AnuncioFormulario } from "@/components/ui/AnuncioFormulario";
import { Aviso } from "@/components/ui/Aviso";
import { Boton } from "@/components/ui/Boton";
import { AreaTexto, Selector } from "@/components/ui/Campo";
import { CampoTrampa } from "@/components/ui/CampoTrampa";
import { PanelLateral } from "@/components/ui/Dialogo";
import { useEnvioFormulario } from "@/hooks/useEnvioFormulario";
import { api } from "@/lib/api";
import { esquemaReporte, TIPOS_REPORTE, type DatosReporte } from "@/lib/validacion/formularios";

/**
 * «Reportar un problema» (PLAN-AMPLIACION D-34), en el pie del sitio y en la barra de los paneles.
 *
 * Un `PanelLateral` con el tipo y la descripción; la ruta de la pantalla se añade sola y se
 * muestra. Validación con `esquemaReporte` (zod), campo trampa, tiempo mínimo y bloqueo del envío
 * doble (`useEnvioFormulario`). No pide nombre, correo ni ningún dato personal, y avisa de no
 * escribir contraseñas ni datos de tarjeta.
 *
 * Envía `POST /reportes-problemas` (`{ tipo, descripcion, ruta }`). Si el API aún no lo tiene o
 * falla, lo dice con calidez y conserva lo escrito: nunca finge que se envió.
 */
export function ReportarProblema({ variante = "enlace" }: { variante?: "enlace" | "icono" }) {
	const ruta = usePathname() || "/";
	const [abierto, setAbierto] = useState(false);
	const [enviado, setEnviado] = useState(false);
	const { propsFormulario, errores, errorGeneral, enviando, anuncio } = useEnvioFormulario({
		esquema: esquemaReporte,
		alEnviar: async (datos: DatosReporte) => {
			try {
				await api.post("/reportes-problemas", { ...datos, ruta });
			} catch {
				throw new Error("No pudimos enviar tu reporte. Lo que escribiste sigue aquí: vuelve a intentarlo en un momento.");
			}
			setEnviado(true);
		},
	});

	const disparador =
		variante === "icono" ? (
			<Boton variante="fantasma" soloIcono icono={<MessageSquareWarning />} data-prueba="abrir-reporte">
				Reportar un problema
			</Boton>
		) : (
			<button type="button" className="enlace-subrayado inline-flex min-h-11 items-center text-start" data-prueba="abrir-reporte">
				Reportar un problema
			</button>
		);

	return (
		<PanelLateral
			abierto={abierto}
			alCambiarAbierto={(a) => {
				setAbierto(a);
				if (!a) setEnviado(false);
			}}
			disparador={disparador}
			titulo="Reportar un problema"
			descripcion="Cuéntanos qué pasó en esta pantalla y lo revisamos."
		>
			{enviado ? (
				<div className="flex flex-col gap-(--espacio-md)">
					<Aviso tono="exito" titulo="Gracias, ya nos llegó tu reporte.">
						Lo revisaremos lo antes posible.
					</Aviso>
					<Boton variante="secundario" className="self-start" onClick={() => setAbierto(false)}>
						Cerrar
					</Boton>
				</div>
			) : (
				<form {...propsFormulario} aria-label="Reportar un problema" className="relative flex flex-col gap-(--espacio-md)">
					<CampoTrampa />
					<AnuncioFormulario mensaje={anuncio} />
					{errorGeneral && <Aviso tono="error">{errorGeneral}</Aviso>}
					<Selector etiqueta="¿Qué pasó?" name="tipo" opciones={[{ valor: "", texto: "Elige una opción" }, ...TIPOS_REPORTE.map((t) => ({ valor: t.valor, texto: t.texto }))]} defaultValue="" error={errores.tipo} />
					<AreaTexto
						etiqueta="Descripción"
						name="descripcion"
						rows={5}
						maxLength={1000}
						contador
						error={errores.descripcion}
						ayuda="Qué intentabas hacer y qué viste. No escribas contraseñas, datos de tarjeta ni datos personales."
					/>
					<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">
						{"Pantalla: "}
						<span className="font-semibold text-texto-principal [overflow-wrap:anywhere]">{ruta}</span>
					</p>
					<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario">
						Solo guardamos el tipo, la descripción y la pantalla para revisar el problema. Consulta el{" "}
						<Link href="/privacidad" className="enlace-subrayado">
							aviso de privacidad
						</Link>
						.
					</p>
					<Boton type="submit" cargando={enviando} textoCargando="Enviando…" className="self-start">
						Enviar el reporte
					</Boton>
				</form>
			)}
		</PanelLateral>
	);
}
