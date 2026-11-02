import { test, expect } from "@playwright/test";
import { renderToStaticMarkup } from "react-dom/server";
import { ErrorGlobal } from "../../components/errores/ErrorGlobal";

// Límite de error de la raíz (PLAN 2.17): sin mensaje ni pila; solo el digest. Sin navegador.
test("global-error no muestra el mensaje ni la pila, solo el digest", () => {
	const error = Object.assign(new Error("detalle-interno: SELECT * FROM usuarios"), { digest: "1234567890" });
	const html = renderToStaticMarkup(<ErrorGlobal error={error} reset={() => {}} />);
	expect(html).toContain("Algo salió mal");
	expect(html).toContain("1234567890");
	expect(html).toContain('href="/"');
	expect(html).not.toContain("detalle-interno");
	expect(html).not.toContain("SELECT");
	expect(html).not.toContain("<pre");
	expect(html).not.toContain(error.stack?.split("\n")[1]?.trim() ?? "sin-pila");
});
