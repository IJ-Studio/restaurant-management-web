import { LogIn, Phone } from "lucide-react";
import { Aviso } from "@/components/ui/Aviso";
import { BotonEnlace } from "@/components/ui/BotonEnlace";
import { EncabezadoPublico } from "@/components/marca/EncabezadoPublico";
import { restaurantConfig } from "@/config/restaurant.config";

/**
 * Recuperar la contraseña (`/frm_reset` y `/reset`, PLAN 4.19). La recuperación en línea sigue
 * desactivada (NP-16): el aviso, antes en inglés, dice lo que pasa en español y ofrece salidas
 * reales: llamar al restaurante (teléfono de `restaurant.config.ts`) o volver a iniciar sesión.
 */
export function RecuperacionNoDisponible({ ruta, titulo }: { ruta: string; titulo: string }) {
	const { contact } = restaurantConfig;
	return (
		<div className="contenedor-pagina max-w-[40rem] pb-(--espacio-entre-secciones)">
			<EncabezadoPublico ruta={ruta} titulo={titulo} />
			<div className="flex flex-col gap-(--espacio-lg)">
				<Aviso tono="info" titulo="Todavía no puedes hacerlo desde aquí" rol={null}>
					La recuperación de contraseña en línea no está disponible por ahora. Llámanos y te ayudamos a recuperar el acceso a tu cuenta.
				</Aviso>
				<div className="flex flex-col gap-3 sm:flex-row">
					<BotonEnlace href={contact.phoneHref} variante="primario" icono={<Phone />}>
						{`Llamar al ${contact.phone}`}
					</BotonEnlace>
					<BotonEnlace href="/login" variante="secundario" icono={<LogIn />}>
						Ir a iniciar sesión
					</BotonEnlace>
				</div>
			</div>
		</div>
	);
}
