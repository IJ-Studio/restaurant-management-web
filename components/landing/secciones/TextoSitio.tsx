"use client";

import { useEffect, useState } from "react";
import { pedirSitio, type TextosSitio } from "@/lib/publico/sitio-cliente";

/** Texto de la landing que el administrador puede cambiar (`/sitio`); mientras tanto o sin él, el de siempre. */
export function TextoSitio({ campo, porDefecto }: { campo: keyof TextosSitio; porDefecto: string }) {
	const [texto, setTexto] = useState(porDefecto);
	useEffect(() => {
		void pedirSitio().then((s) => s?.textos[campo] && setTexto(s.textos[campo]));
	}, [campo]);
	return texto;
}
