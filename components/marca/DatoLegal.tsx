import { POR_CONFIRMAR } from "@/config/legal";

/**
 * Un dato legal del proveedor (D-36): su valor o, si aún no lo dio el restaurante, «Dato por
 * confirmar» en cursiva. Nunca un valor inventado. Con `correo`, el valor se enlaza con `mailto:`.
 */
export function DatoLegal({ valor, correo = false }: { valor: string; correo?: boolean }) {
	const limpio = valor.trim();
	if (!limpio) return <em data-dato-pendiente="">{POR_CONFIRMAR}</em>;
	return correo ? <a href={`mailto:${limpio}`}>{limpio}</a> : <>{limpio}</>;
}
