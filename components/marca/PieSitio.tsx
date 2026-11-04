import Link from "next/link";
import type { ReactNode } from "react";
import { Clock, Facebook, Instagram, MapPin, Phone } from "lucide-react";
import { restaurantConfig } from "@/config/restaurant.config";
import { PanelAccesibilidad } from "@/components/accesibilidad/PanelAccesibilidad";
import { Logo } from "@/components/marca/Logo";
import { cn } from "@/lib/utils";
import { DATOS_LEGALES } from "@/config/legal";
import { DatoLegal } from "./DatoLegal";
import { ReportarProblema } from "./ReportarProblema";

/**
 * Pie del sitio público (DESIGN.md § Navigation, D-09). De servidor, sin JavaScript.
 *
 * Contacto, horario, enlaces de la casa y de ayuda, redes con nombre accesible y, en la última
 * fila, los legales y el **acceso del personal**: un enlace discreto en `--texto-tenue` y
 * `--texto-pequeno`, la única puerta del personal en la parte pública.
 *
 * Los datos salen de `config/restaurant.config.ts`. Los textos se reescribieron con D-17 (PLAN 4.1):
 * una línea de identidad sin datos inventados y el aviso de derechos sin el año ni la razón social
 * de una plantilla ajena. `DistanceToRestaurant` no se incluye: lo decide la fase 4.
 */
const CASA = [
	{ nombre: "Conoce la casa", href: "/about" },
	{ nombre: "Información corporativa", href: "/corporativo" },
];
const AYUDA = [
	{ nombre: "Cancelaciones y reembolsos", href: "/devoluciones" },
	{ nombre: "Gestionar reservaciones", href: "/reservations" },
	{ nombre: "Alertas de seguridad", href: "/seguridad" },
	{ nombre: "Ayuda", href: "/ayuda" },
];
const LEGALES = [
	{ nombre: "Términos y condiciones", href: "/condiciones" },
	{ nombre: "Aviso de privacidad", href: "/privacidad" },
	{ nombre: "Cookies", href: "/cookies" },
];

const CLASE_ENLACE =
	"enlace-subrayado inline-flex min-h-11 items-center rounded-control text-texto-secundario al-pasar:text-texto-principal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco";
const CLASE_RUBRO = "m-0 mb-2 font-texto text-(length:--texto-etiqueta) font-semibold uppercase leading-[1.2] tracking-[0.16em] text-texto-secundario";

function Columna({ titulo, enlaces, extra }: { titulo: string; enlaces: { nombre: string; href: string }[]; extra?: ReactNode }) {
	return (
		<div>
			<h2 className={CLASE_RUBRO}>{titulo}</h2>
			<ul className="m-0 flex list-none flex-col p-0">
				{enlaces.map((e) => (
					<li key={e.href}>
						<Link href={e.href} className={CLASE_ENLACE}>
							{e.nombre}
						</Link>
					</li>
				))}
				{extra && <li className="text-texto-secundario">{extra}</li>}
			</ul>
		</div>
	);
}

export function PieSitio({ anio = new Date().getFullYear() }: { anio?: number }) {
	const { name, contact, hours } = restaurantConfig;
	return (
		<footer className="border-t border-borde-sutil bg-fondo pb-[env(safe-area-inset-bottom,0px)] text-(length:--texto-pequeno) leading-[1.5]">
			<div className="contenedor-pagina grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
				<div className="flex flex-col gap-4">
					<Link
						href="/"
						className="inline-flex min-h-11 w-fit items-center rounded-control text-texto-principal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco"
					>
						<Logo className="h-10 w-auto" />
					</Link>
					<p className="m-0 max-w-[32ch] font-titulos text-(length:--texto-titulo-3) leading-[1.25] text-texto-principal [text-wrap:balance]">
						Comida mexicana en el centro de Huejutla de Reyes.
					</p>
					<h2 className="solo-lectores">Contacto</h2>
					<address className="flex flex-col gap-2 not-italic text-texto-secundario [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.5]">
						<p className="m-0 flex gap-2">
							<MapPin aria-hidden="true" />
							<span>{contact.address}</span>
						</p>
						<p className="m-0 flex gap-2">
							<Clock aria-hidden="true" />
							<span>{hours.display}</span>
						</p>
						<p className="m-0 flex items-center gap-2">
							<Phone aria-hidden="true" className="!mt-0" />
							<a href={contact.phoneHref} className={CLASE_ENLACE}>
								{contact.phone}
							</a>
						</p>
					</address>
					<ul className="m-0 flex list-none gap-2 p-0" aria-label="Redes sociales">
						{[
							{ nombre: "Facebook", href: contact.facebook, icono: <Facebook aria-hidden="true" /> },
							{ nombre: "Instagram", href: contact.instagram, icono: <Instagram aria-hidden="true" /> },
						].map((r) => (
							<li key={r.nombre}>
								<a
									href={r.href}
									target="_blank"
									rel="noopener noreferrer"
									className="area-tactil-minima rounded-control text-texto-secundario al-pasar:bg-superficie-cafe al-pasar:text-texto-principal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foco [&_svg]:size-5 [&_svg]:stroke-[1.5]"
								>
									{r.icono}
									<span className="solo-lectores">{`${r.nombre} de ${name} (abre en otra pestaña)`}</span>
								</a>
							</li>
						))}
					</ul>
				</div>
				<Columna titulo="Nosotros" enlaces={CASA} />
				<Columna titulo="Ayuda" enlaces={AYUDA} extra={<ReportarProblema />} />
			</div>

			{/* Datos del proveedor (D-36, Art. 76 BIS LFPC): de `config/legal.ts`; los que faltan, «Dato por confirmar». */}
			<div className="border-t border-borde-sutil">
				<p className="contenedor-pagina m-0 py-4 text-(length:--texto-pequeno) leading-[1.6] text-texto-tenue" data-prueba="datos-proveedor">
					{"Razón social: "}
					<DatoLegal valor={DATOS_LEGALES.razonSocial} />
					{" · RFC: "}
					<DatoLegal valor={DATOS_LEGALES.rfc} />
					{" · Domicilio fiscal: "}
					<DatoLegal valor={DATOS_LEGALES.domicilioFiscal} />
					{` · Teléfono: ${contact.phone} · Correo: `}
					<DatoLegal valor={DATOS_LEGALES.correoContacto} />
					{" · Atención al cliente: "}
					<DatoLegal valor={DATOS_LEGALES.horarioAtencion} />
				</p>
			</div>

			{/* Última fila: legales y el acceso del personal, discreto. */}
			<div className="border-t border-borde-sutil">
				<div className="contenedor-pagina flex flex-col gap-x-6 gap-y-1 py-4 text-texto-tenue md:flex-row md:flex-wrap md:items-center">
					<p className="m-0 md:me-auto">
						© {anio} {name}. Todos los derechos reservados.
					</p>
					<ul className="m-0 flex list-none flex-wrap gap-x-6 p-0">
						{LEGALES.map((e) => (
							<li key={e.href}>
								<Link href={e.href} className={cn(CLASE_ENLACE, "text-texto-tenue")}>
									{e.nombre}
								</Link>
							</li>
						))}
						<li>
							{/* Acceso a las opciones también desde el pie (DESIGN.md § PanelAccesibilidad). */}
							<PanelAccesibilidad conTexto className="-ms-3 text-texto-tenue al-pasar:text-texto-principal" />
						</li>
						<li>
							<Link href="/login" className={cn(CLASE_ENLACE, "text-texto-tenue")} data-prueba="acceso-personal">
								Acceso del personal
							</Link>
						</li>
					</ul>
				</div>
			</div>
		</footer>
	);
}
