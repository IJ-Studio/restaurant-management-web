import { cn } from "@/lib/utils";

/**
 * Medidor (PLAN 5.20): una barra fina que dice cuánto de un máximo se ha llenado. Es decorativo: el
 * dato tiene que ir también en texto al lado (una insignia, una cifra). El relleno es una clase de
 * token (`fill-exito`, `fill-aviso`…), sin estilos en línea.
 */
export function Medidor({ valor, maximo, relleno, className }: { valor: number; maximo: number; relleno: string; className?: string }) {
	const pct = maximo > 0 ? Math.max(0, Math.min(100, (valor / maximo) * 100)) : 0;
	return (
		<svg aria-hidden="true" viewBox="0 0 100 6" preserveAspectRatio="none" className={cn("block h-1.5 w-24 overflow-hidden rounded-full", className)}>
			<rect width="100" height="6" className="fill-borde-sutil" />
			<rect width={pct} height="6" className={relleno} />
		</svg>
	);
}
