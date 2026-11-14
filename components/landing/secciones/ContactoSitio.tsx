"use client";

import { useEffect, useState } from "react";
import { enlaceWhatsApp } from "@/lib/contacto/whatsapp";
import { pedirSitio } from "@/lib/publico/sitio-cliente";

/** Teléfono del restaurante: el que guarda el administrador (`/sitio`) o el de la configuración. */
export function TelefonoSitio({ porDefecto }: { porDefecto: string }) {
	const [tel, setTel] = useState(porDefecto);
	useEffect(() => {
		void pedirSitio().then((s) => s?.telefono && setTel(s.telefono));
	}, []);
	return (
		<a href={`tel:${tel.replace(/[^\d+]/g, "")}`} className="enlace-subrayado">
			{tel}
		</a>
	);
}

/** Enlace a WhatsApp con el número del administrador o el de la configuración; sin número, nada. */
export function WhatsAppSitio({ porDefecto, mensaje }: { porDefecto: string; mensaje: string }) {
	const [numero, setNumero] = useState(porDefecto);
	useEffect(() => {
		void pedirSitio().then((s) => s?.whatsapp && setNumero(s.whatsapp));
	}, []);
	const enlace = enlaceWhatsApp(numero, mensaje);
	if (!enlace) return <span className="text-texto-secundario">Por ahora, solo por teléfono.</span>;
	return (
		<a href={enlace} target="_blank" rel="noopener noreferrer" className="enlace-subrayado">
			Escríbenos<span className="solo-lectores"> por WhatsApp (abre en otra pestaña)</span>
		</a>
	);
}
