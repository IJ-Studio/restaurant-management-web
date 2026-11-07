"use client";

import { Mic, MicOff } from "lucide-react";
import { Boton } from "@/components/ui/Boton";
import { useDictado } from "@/hooks/useDictado";

/**
 * Botón de búsqueda por voz junto a un `Buscador` (PLAN 4.10). Solo aparece si el navegador
 * admite el dictado. `aria-pressed` dice si está escuchando; el aviso (sin micrófono, sin
 * permiso…) se anuncia con `role="status"`.
 */
export function BotonDictado({ alDictar }: { alDictar: (texto: string) => void }) {
	const { disponible, escuchando, aviso, alternar } = useDictado(alDictar);
	if (!disponible) return null;
	return (
		<div className="flex flex-col items-start gap-1">
			<Boton variante="fantasma" soloIcono icono={escuchando ? <MicOff /> : <Mic />} aria-pressed={escuchando} onClick={alternar} data-prueba="dictado">
				{escuchando ? "Dejar de escuchar" : "Buscar por voz"}
			</Boton>
			<p role="status" className="m-0 text-(length:--texto-pequeno) text-texto-secundario empty:hidden">
				{escuchando ? "Te escuchamos…" : (aviso ?? "")}
			</p>
		</div>
	);
}
