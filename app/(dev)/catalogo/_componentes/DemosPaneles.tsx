"use client";

import { Plus } from "lucide-react";
import { navegacionDeRol } from "@/config/navigation/por-rol";
import { ROLES } from "@/config/roles.config";
import { BarraSuperiorPanel } from "@/components/paneles/BarraSuperiorPanel";
import { EncabezadoPagina } from "@/components/paneles/EncabezadoPagina";
import { NavegacionPanel } from "@/components/paneles/NavegacionPanel";
import { Boton } from "@/components/ui";

function Rotulo({ children }: { children: string }) {
	// Las rutas largas no tienen espacios: se cortan en cualquier punto antes que desbordar.
	return <code className="text-(length:--texto-pequeno) text-texto-tenue [overflow-wrap:anywhere]">{children}</code>;
}

const RUTA_ADMIN = "/dashboard/admin/inventory/suppliers";

/** Contenido de la sección «Navegación de los paneles» del catálogo. */
export function DemosPaneles() {
	return (
		<div className="flex flex-col gap-10">
			<div className="flex flex-col gap-3">
				<Rotulo>{`Administración · ruta actual ${RUTA_ADMIN} · barra lateral desde 1024 px, drawer por debajo`}</Rotulo>
				<div className="overflow-hidden rounded-tarjeta border border-borde-sutil" data-prueba="panel-admin">
					<div className="grid lg:grid-cols-[16rem_minmax(0,1fr)]">
						<aside aria-label="Barra lateral" className="hidden border-e border-borde-sutil bg-superficie p-4 lg:block">
							<NavegacionPanel
								secciones={navegacionDeRol(ROLES.ADMIN)}
								etiqueta="Navegación del panel de administración"
								rutaActual={RUTA_ADMIN}
							/>
						</aside>
						<div className="flex min-w-0 flex-col">
							<BarraSuperiorPanel
								nombrePanel="Administración"
								secciones={navegacionDeRol(ROLES.ADMIN)}
								usuario={{ nombre: "Laura Méndez", rol: "Administradora" }}
								rutaActual={RUTA_ADMIN}
							/>
							<div className="flex flex-col gap-6 p-6">
								<EncabezadoPagina
									antetitulo="Inventario"
									titulo="Proveedores"
									descripcion="Datos de contacto y órdenes de compra de cada proveedor."
									acciones={
										<>
											<Boton variante="secundario">Exportar</Boton>
											<Boton icono={<Plus />}>Añadir proveedor</Boton>
										</>
									}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="flex flex-col gap-3">
				<Rotulo>Caja · ruta actual /dashboard/cajero?filter=pending · la consulta decide la entrada activa</Rotulo>
				<div className="max-w-72 rounded-tarjeta border border-borde-sutil bg-superficie p-4" data-prueba="panel-caja">
					<NavegacionPanel
						secciones={navegacionDeRol(ROLES.CAJERO)}
						etiqueta="Navegación del panel de caja"
						rutaActual="/dashboard/cajero?filter=pending"
					/>
				</div>
			</div>
		</div>
	);
}
