import { NoEncontrado } from "@/components/errores/NoEncontrado";

// «No encontrado» de las reservas (D-20, PLAN 4.23).
export default function NoEncontradoReservas() {
	return <NoEncontrado salida={{ href: "/reservations", texto: "Reservar mesa" }} />;
}
