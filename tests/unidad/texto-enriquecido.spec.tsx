import { test, expect } from "@playwright/test";
import { renderToStaticMarkup } from "react-dom/server";
import { textoEnriquecido } from "../../lib/texto/texto-enriquecido";

// Texto enriquecido del API convertido a React con lista blanca (PLAN 2.12). Sin navegador.
const html = (entrada: string) => renderToStaticMarkup(<>{textoEnriquecido(entrada)}</>);

test.describe("texto enriquecido", () => {
	test("el título por defecto conserva el salto y el resaltado, sin atributos", () => {
		const salida = html("SABORES QUE <br /> <span class='text-transparent bg-clip-text uppercase'>Trascienden</span>");
		expect(salida).toBe('SABORES QUE <br/> <em class="resaltado">Trascienden</em>');
	});

	test("las cargas maliciosas se muestran como texto o se descartan", () => {
		const cargas = [
			'<img src=x onerror=alert(1)>Imagen',
			"<script>alert(1)</script>Script",
			'<a href="javascript:alert(1)">Enlace</a>',
			'<span onclick="alert(1)" style="color:red">Clic</span>',
			"<svg onload=alert(1)><text>SVG</text></svg>Fin",
			'<em onmouseover="alert(1)">Énfasis</em> y <strong class="x">fuerte</strong>',
			"<iframe src=//ejemplo.org></iframe><style>body{display:none}</style>Marco",
		];
		const salida = cargas.map(html).join(" | ");
		expect(salida).toBe(
			'Imagen | Script | Enlace | <em class="resaltado">Clic</em> | Fin | <em>Énfasis</em> y <strong>fuerte</strong> | Marco',
		);
		for (const prohibido of ["<img", "<script", "<a ", "href", "onerror", "onclick", "onload", "onmouseover", "style", "<svg", "<iframe", "javascript:"])
			expect(salida).not.toContain(prohibido);
	});

	test("el texto plano se escapa", () => {
		expect(html("1 < 2 & 3 > 2")).toBe("1 &lt; 2 &amp; 3 &gt; 2");
	});
});
