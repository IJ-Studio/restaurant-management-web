import { CabeceraSitio } from "@/components/marca/cabecera/CabeceraSitio";
import { MenuCuenta } from "@/components/marca/cabecera/islas";
import { PieSitio } from "@/components/marca/PieSitio";

function Rotulo({ children }: { children: string }) {
	return <code className="text-(length:--texto-pequeno) text-texto-tenue">{children}</code>;
}

/** Contenido de la sección «Cabecera y pie» del catálogo. */
export function DemosSitio() {
	return (
		<div className="flex flex-col gap-10">
			<div className="flex flex-col gap-3">
				<Rotulo>CabeceraSitio · con sesión · aquí sin fijar (en el sitio va fija arriba)</Rotulo>
				<div className="overflow-hidden rounded-tarjeta border border-borde-sutil" data-prueba="cabecera">
					<CabeceraSitio fija={false} usuario={{ nombre: "Ana López", correo: "ana.lopez@correo.mx" }} />
				</div>
				<p className="m-0 max-w-(--ancho-lectura) text-(length:--texto-pequeno) text-texto-secundario">
					Desde 1024 px, las secciones de la landing; por debajo, en el menú. «Reservar» se ve siempre. Sin sesión, la cuenta es un
					enlace a «Iniciar sesión»:
				</p>
				<div data-prueba="cuenta-sin-sesion">
					<MenuCuenta usuario={null} />
				</div>
			</div>

			<div className="flex flex-col gap-3">
				<Rotulo>PieSitio · el acceso del personal, discreto, en la última fila</Rotulo>
				<div className="overflow-hidden rounded-tarjeta border border-borde-sutil" data-prueba="pie">
					<PieSitio anio={2026} />
				</div>
			</div>
		</div>
	);
}
