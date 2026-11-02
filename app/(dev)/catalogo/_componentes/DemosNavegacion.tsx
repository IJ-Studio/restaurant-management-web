import { BotonVolver, MigasDePan } from "@/components/ui";
import { Muestra } from "./Muestra";

function Rotulo({ children }: { children: string }) {
	return <code className="text-(length:--texto-pequeno) text-texto-tenue">{children}</code>;
}

/** Contenido de la sección «Migas de pan y Volver» del catálogo. */
export function DemosNavegacion() {
	return (
		<div className="flex flex-col gap-8">
			<div className="flex flex-col gap-4">
				<h3 className="m-0 text-(length:--texto-titulo-interfaz) font-semibold">MigasDePan</h3>
				{[
					{ ruta: "/reservations", actual: undefined, nota: "/reservations" },
					{ ruta: "/menu/categoria/entradas", actual: "Entradas", nota: "/menu/categoria/[slug] · nombre de la categoría" },
					{ ruta: "/menu/pedido/checkout", actual: undefined, nota: "/menu/pedido/checkout · dos migas intermedias" },
					{ ruta: "/menu/producto/42", actual: "Enchiladas huastecas con cecina y frijoles de la olla", nota: "nombre largo: pasa de línea" },
				].map(({ ruta, actual, nota }) => (
					<div key={ruta} className="flex flex-col gap-1">
						<Rotulo>{nota}</Rotulo>
						<Muestra ancho>
							<MigasDePan ruta={ruta} actual={actual} />
						</Muestra>
					</div>
				))}
			</div>

			<div className="flex flex-col gap-4">
				<h3 className="m-0 text-(length:--texto-titulo-interfaz) font-semibold">BotonVolver</h3>
				<p className="m-0 max-w-(--ancho-lectura) text-(length:--texto-pequeno) text-texto-secundario">
					Es un enlace a la sección de origen. Si se llegó desde el propio sitio, usa el historial y vuelve exactamente a donde
					se estaba. Aquí, como el catálogo no está en el mapa de rutas, el origen se pasa a mano: el principio del catálogo.
				</p>
				<Muestra>
					<BotonVolver origen={{ nombre: "Catálogo", href: "/catalogo#boton", volver: "Volver al principio del catálogo" }} />
				</Muestra>
			</div>
		</div>
	);
}
