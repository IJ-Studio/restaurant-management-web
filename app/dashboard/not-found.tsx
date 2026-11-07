import { NoEncontrado } from "@/components/errores/NoEncontrado";

// «No encontrado» del segmento (PLAN 2.17): se muestra cuando una página del segmento llama a notFound().
export default function NoEncontradoPanel() {
	return <NoEncontrado salida={{ href: "/dashboard", texto: "Ir al panel" }} />;
}
