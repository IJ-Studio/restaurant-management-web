"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePreferencias } from "@/components/providers/PreferenciasProvider";
import { medirMuestra, type MedidaContraste } from "./contraste";

const formato = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

function Cifra({ valor, minimo, nombre }: { valor: number; minimo: number; nombre: string }) {
	const cumple = valor >= minimo;
	return (
		<span className={cumple ? "text-texto-secundario" : "font-semibold text-error"}>
			{nombre} {formato.format(valor)}:1 {cumple ? "AA" : `< ${minimo}:1`}
		</span>
	);
}

/** Una muestra del catálogo con su contraste medido en el tema y tamaño actuales. */
export function Muestra({ children, ancho = false }: { children: ReactNode; ancho?: boolean }) {
	const caja = useRef<HTMLDivElement>(null);
	const { preferencias } = usePreferencias();
	const [medida, setMedida] = useState<MedidaContraste | null>(null);

	useEffect(() => {
		// Espera a que terminen las transiciones de color del cambio de tema.
		const espera = window.setTimeout(() => caja.current && setMedida(medirMuestra(caja.current)), 400);
		return () => window.clearTimeout(espera);
	}, [preferencias.tema, preferencias.tamanoTexto]);

	return (
		<div className={ancho ? "flex w-full flex-col gap-2" : "flex flex-col items-start gap-2"}>
			<div ref={caja} data-muestra className={ancho ? "w-full" : undefined}>
				{children}
			</div>
			<p className="m-0 flex flex-col text-(length:--texto-pequeno) leading-[1.4] numeros-tabulares" data-lectura-contraste>
				{!medida ? (
					<span className="text-texto-tenue">Midiendo…</span>
				) : medida.exento ? (
					<span className="text-texto-tenue">Inactivo: exento (WCAG 1.4.3)</span>
				) : (
					<>
						{medida.texto !== null && <Cifra valor={medida.texto} minimo={4.5} nombre="Texto" />}
						{medida.borde !== null && <Cifra valor={medida.borde} minimo={3} nombre="No texto" />}
					</>
				)}
			</p>
		</div>
	);
}
