"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback, useMemo, useState, type CSSProperties } from "react";
import { MOLINO } from "@/components/marca/trazados";
import { resolverOrigen } from "@/lib/imagen/origen";
import { cargadorConRecorte } from "@/lib/imagen/cargador-cloudinary";
import { cn } from "@/lib/utils";

type PropsBase = Omit<ImageProps, "src" | "alt" | "loader" | "sizes" | "onError"> & {
	/** Ruta local, public ID o URL de Cloudinary, o URL https de un host permitido. */
	src: string | null | undefined;
	/** Obligatorio: el ancho que ocupa en cada pantalla, para no descargar de más. */
	sizes: string;
	/** Recorte de Cloudinary aplicado en la entrega, antes del ancho (solo imágenes de la nube). */
	recorte?: string;
};

export type ImagenProps = PropsBase &
	({ alt: string; decorativa?: false } | { /** Sin significado propio: `alt=""`. */ decorativa: true; alt?: never });

/**
 * `next/image` con el cargador de Cloudinary y un respaldo que sí existe (DESIGN.md § Components).
 * Si el origen no es válido o la imagen no carga, pinta en la misma caja un panel café con el
 * molino, que conserva el `alt`: nunca una caja vacía ni el icono de imagen rota.
 */
export function Imagen({ src, alt, decorativa = false, className, style, fill, width, height, recorte, ...resto }: ImagenProps) {
	const origen = useMemo(() => resolverOrigen(src), [src]);
	// Se guarda qué origen falló: si cambia el src, se vuelve a intentar sin efectos.
	const [fallido, setFallido] = useState<string | null>(null);
	const texto = decorativa ? "" : (alt ?? "");
	const srcValido = origen?.src ?? null;

	// El error se escucha en el propio <img> y no con onError de next/image: con onError,
	// next/image reasigna img.src al montar y en cada render, y Firefox aborta la descarga en curso.
	const vigilarError = useCallback(
		(img: HTMLImageElement | null) => {
			if (!img) return;
			const marcar = () => setFallido(srcValido);
			// Falló antes de hidratar: el evento ya pasó.
			if (img.complete && img.naturalWidth === 0 && img.currentSrc) marcar();
			img.addEventListener("error", marcar);
			return () => img.removeEventListener("error", marcar);
		},
		[srcValido],
	);

	if (process.env.NODE_ENV !== "production" && !decorativa && !texto.trim()) {
		console.warn("Imagen sin alt: describe la imagen o márcala como decorativa.", src);
	}

	if (!origen || fallido === origen.src) {
		const caja: CSSProperties = fill ? { ...style } : { width, height, ...style };
		return (
			<span
				data-respaldo-imagen=""
				role={decorativa ? undefined : "img"}
				aria-label={decorativa ? undefined : texto}
				aria-hidden={decorativa || undefined}
				className={cn(
					"flex items-center justify-center overflow-hidden bg-superficie-cafe text-borde-control",
					fill && "absolute inset-0 size-full",
					className,
				)}
				style={caja}
			>
				<svg viewBox={MOLINO.viewBox} aria-hidden="true" focusable="false" className="h-1/3 max-h-16 min-h-5 w-auto">
					<path d={MOLINO.d} fill="currentColor" />
				</svg>
			</span>
		);
	}

	return (
		<Image
			{...resto}
			src={origen.src}
			loader={origen.loader && recorte ? cargadorConRecorte(recorte) : origen.loader}
			alt={texto}
			fill={fill}
			width={width}
			height={height}
			className={className}
			style={style}
			ref={vigilarError}
		/>
	);
}
