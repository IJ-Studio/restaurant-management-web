import Link from "next/link";
import { formatearPrecio } from "@/lib/formato/precio";

/**
 * Renglón de carta impresa (pulido UI pública): para los platos sin foto y la barra. Filete de
 * acento a la izquierda, nombre en Fraunces que lleva al plato, línea de puntos y precio tabular
 * a la derecha; la descripción, debajo. Mismos datos y mismo enlace que la tarjeta.
 */
export function FilaCartaImpresa({
	id,
	nombre,
	descripcion,
	precio,
	disponible = true,
	nivelTitulo = 3,
}: {
	id: string | number;
	nombre: string;
	descripcion?: string;
	precio: number | null;
	disponible?: boolean;
	nivelTitulo?: 2 | 3;
}) {
	const Titulo = `h${nivelTitulo}` as const;
	const cifra = formatearPrecio(precio);
	return (
		<article className="relative flex min-h-11 flex-col justify-center gap-1 border-s-2 border-acento py-(--espacio-xs) ps-(--espacio-md) has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-solid has-[a:focus-visible]:outline-foco">
			<div className="flex items-baseline">
				<Titulo className="m-0 min-w-0 font-titulos text-(length:--texto-titulo-interfaz) font-normal leading-[1.3]">
					<Link
						href={`/menu/producto/${id}`}
						className="text-texto-principal no-underline decoration-acento decoration-1 underline-offset-4 after:absolute after:inset-0 after:content-[''] focus-visible:outline-none al-pasar:underline"
					>
						{nombre}
					</Link>
				</Titulo>
				<span aria-hidden="true" className="lider-puntos" />
				{cifra && <span className="shrink-0 text-(length:--texto-cifra-tabla) font-medium numeros-tabulares">{cifra}</span>}
			</div>
			{(descripcion || !disponible) && (
				<p className="m-0 max-w-[60ch] text-(length:--texto-pequeno) leading-[1.5] text-texto-secundario [text-wrap:pretty]">
					{!disponible && <span className="texto-rotulo me-2 text-aviso">Agotado</span>}
					{descripcion}
				</p>
			)}
		</article>
	);
}
