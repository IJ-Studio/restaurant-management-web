/**
 * Fotos y contacto que administra el restaurante (P1.5, `GET /sitio`, público), pedidos una sola vez
 * en el navegador. Si falla, `null` y la página sigue con lo de la configuración.
 */
export interface SitioPublico {
	portada: { url: string; alt: string }[];
	login: string | null;
	registro: string | null;
	colorRespaldo: string | null;
	telefono: string | null;
	whatsapp: string | null;
}

let pendiente: Promise<SitioPublico | null> | null = null;

export function pedirSitio(): Promise<SitioPublico | null> {
	pendiente ??= (async () => {
		try {
			const api = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
			const r = await fetch(`${api}/sitio`, { headers: { Accept: "application/json" } });
			if (!r.ok) return null;
			const d = (await r.json()) as Partial<SitioPublico>;
			const texto = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
			return {
				portada: Array.isArray(d.portada) ? d.portada.filter((f) => texto(f?.url)).map((f) => ({ url: f.url, alt: f.alt ?? "" })) : [],
				login: texto((d.login as unknown as { url?: string } | null)?.url),
				registro: texto((d.registro as unknown as { url?: string } | null)?.url),
				colorRespaldo: texto(d.colorRespaldo),
				telefono: texto(d.telefono),
				whatsapp: texto(d.whatsapp),
			};
		} catch {
			return null;
		}
	})();
	return pendiente;
}
