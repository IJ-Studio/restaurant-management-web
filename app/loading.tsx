import { CargadorMarca } from "@/components/marca/CargadorMarca";

// Carga de la raíz (PLAN 4.23, D-20): el cargador de marca, con el texto solo para lectores.
export default function Cargando() {
	return <CargadorMarca pagina tamano="amplio" texto="Un momento, por favor…" />;
}
