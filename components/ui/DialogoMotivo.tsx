"use client";

import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { Dialogo } from "@/components/ui/Dialogo";

/**
 * Diálogo que pide un motivo antes de una acción que lo exige el API (cancelar un pedido o una
 * reserva, Prioridad 3.3). El botón de confirmar valida que haya al menos 3 caracteres; el texto se
 * manda tal cual y el API lo normaliza.
 */
export function DialogoMotivo({
	abierto,
	alCambiarAbierto,
	titulo,
	descripcion,
	textoConfirmar,
	textoCancelar = "Volver",
	etiqueta = "Motivo",
	ayuda,
	alConfirmar,
}: {
	abierto: boolean;
	alCambiarAbierto: (abierto: boolean) => void;
	titulo: string;
	descripcion?: string;
	textoConfirmar: string;
	textoCancelar?: string;
	etiqueta?: string;
	ayuda?: string;
	alConfirmar: (motivo: string) => Promise<boolean>;
}) {
	const [motivo, setMotivo] = useState("");
	const [error, setError] = useState<string | undefined>();
	const [enviando, setEnviando] = useState(false);

	async function confirmar() {
		if (motivo.trim().length < 3) {
			setError("Escribe el motivo (al menos 3 letras).");
			return;
		}
		setEnviando(true);
		const ok = await alConfirmar(motivo.trim());
		setEnviando(false);
		if (ok) alCambiarAbierto(false);
	}

	return (
		<Dialogo
			abierto={abierto}
			alCambiarAbierto={(a) => {
				alCambiarAbierto(a);
				if (a) {
					setMotivo("");
					setError(undefined);
				}
			}}
			cerrable={!enviando}
			titulo={titulo}
			descripcion={descripcion}
			pie={
				<>
					<Boton variante="secundario" deshabilitado={enviando} onClick={() => alCambiarAbierto(false)}>
						{textoCancelar}
					</Boton>
					<Boton variante="peligro" type="submit" form="dialogo-motivo" cargando={enviando} textoCargando="Enviando…">
						{textoConfirmar}
					</Boton>
				</>
			}
		>
			<form
				id="dialogo-motivo"
				noValidate
				onSubmit={(e) => {
					e.preventDefault();
					void confirmar();
				}}
			>
				<Campo
					etiqueta={etiqueta}
					value={motivo}
					onChange={(e) => {
						setMotivo(e.target.value);
						if (error) setError(undefined);
					}}
					error={error}
					ayuda={ayuda}
					maxLength={300}
					autoComplete="off"
				/>
			</form>
		</Dialogo>
	);
}
