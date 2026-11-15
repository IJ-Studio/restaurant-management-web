// Se ejecuta en <head> antes de pintar para evitar el parpadeo de tema, tamaño de
// texto y movimiento. Espejo mínimo de lib/preferencias/preferencias.ts: misma clave,
// mismos valores y mismos colores de fondo (COLOR_FONDO_POR_TEMA). Si localStorage
// falla, se quedan los valores por defecto.
(function () {
  try {
    var r = document.documentElement;
    var p = JSON.parse(localStorage.getItem("elquijote:preferencias") || "null");
    if (!p) {
      var t = localStorage.getItem("theme");
      p = { tema: t === "dark" ? "oscuro" : "claro" };
    }
    // Claro por defecto (mismo valor que PREFERENCIAS_POR_DEFECTO); solo «oscuro» si se eligió.
    var oscuro = p.tema === "oscuro";
    r.setAttribute("data-tema", oscuro ? "oscuro" : "claro");
    if (p.tamanoTexto === "grande" || p.tamanoTexto === "muy-grande") r.setAttribute("data-tamano-texto", p.tamanoTexto);
    if (p.movimiento === "reducido") r.setAttribute("data-movimiento", "reducido");

    // El HTML sale con theme-color del tema claro (el de por defecto). En oscuro se añade
    // otra etiqueta delante, que es la que usa el navegador. No se edita la de Next: React
    // reconoce sus <meta> por los atributos y, si cambian, crea una nueva al hidratar.
    if (oscuro) {
      var barra = document.createElement("meta");
      barra.name = "theme-color";
      barra.content = "#14100C";
      var deNext = document.querySelector('meta[name="theme-color"]');
      document.head.insertBefore(barra, deNext || document.head.firstChild);
    }
  } catch (e) {}
})();
