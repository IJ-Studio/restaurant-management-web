import { POR_CONFIRMAR } from "@/config/legal";

/**
 * Un dato legal del proveedor (D-36): su valor o, si aún no lo dio el restaurante, «Dato por
 * confirmar» en cursiva. Nunca un valor inventado.
 */
export function DatoLegal({ valor }: { valor: string }) {
	return valor.trim() ? <>{valor}</> : <em data-dato-pendiente="">{POR_CONFIRMAR}</em>;
}
