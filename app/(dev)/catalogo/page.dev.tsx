import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Catalogo } from "./_componentes/Catalogo";

// Solo existe en next dev (pageExtensions en next.config.js). Segunda barrera por si
// alguien la compilara en producción.
export const metadata: Metadata = {
	title: "Catálogo de componentes",
	robots: { index: false, follow: false },
};

export default function PaginaCatalogo() {
	if (process.env.NODE_ENV === "production") notFound();
	return <Catalogo />;
}
