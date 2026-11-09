import { MarcoSitio } from "@/components/marca/MarcoSitio";

// Cabecera y pie públicos renderizados en el servidor (PLAN 4.1).
export default function Layout({ children }: { children: React.ReactNode }) {
	return <MarcoSitio>{children}</MarcoSitio>;
}
