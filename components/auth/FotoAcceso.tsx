"use client";

import { useEffect, useState } from "react";
import { Imagen } from "@/components/ui/Imagen";
import { restaurantConfig } from "@/config/restaurant.config";
import { pedirSitio } from "@/lib/publico/sitio-cliente";

/** Foto de inicio de sesión o registro: la del administrador (`/sitio`, P1.5) o la de siempre. */
export function FotoAcceso({ tipo }: { tipo: "login" | "registro" }) {
	const [src, setSrc] = useState<string>(restaurantConfig.images.fondoAcceso);
	useEffect(() => {
		let vivo = true;
		void pedirSitio().then((s) => {
			const propia = s?.[tipo];
			if (vivo && propia) setSrc(propia);
		});
		return () => {
			vivo = false;
		};
	}, [tipo]);
	return <Imagen src={src} fill decorativa className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />;
}
