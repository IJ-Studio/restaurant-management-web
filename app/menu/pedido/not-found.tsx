import { NoEncontrado } from "@/components/errores/NoEncontrado";

// «No encontrado» del pedido (D-20, PLAN 4.23).
export default function NoEncontradoPedido() {
	return <NoEncontrado salida={{ href: "/menu/pedido", texto: "Ver tu pedido" }} />;
}
