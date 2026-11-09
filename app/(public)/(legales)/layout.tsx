// Layout del grupo de páginas legales y de ayuda (PLAN 4.22): el grupo no cambia ninguna URL.
export default function LayoutLegales({ children }: { children: React.ReactNode }) {
	return <div className="contenedor-pagina max-w-[52rem] pb-(--espacio-entre-secciones)">{children}</div>;
}
