// Se ejecuta en <head> antes de pintar para evitar el parpadeo de tema, tamaño de
// texto y movimiento. Espejo mínimo de lib/preferencias/preferencias.ts: misma clave
// y mismos valores. Si localStorage falla, se quedan los valores por defecto.
(function () {
  try {
    var r = document.documentElement;
    var p = JSON.parse(localStorage.getItem("elquijote:preferencias") || "null");
    if (!p) {
      var t = localStorage.getItem("theme");
      p = { tema: t === "light" ? "claro" : "oscuro" };
    }
    r.setAttribute("data-tema", p.tema === "claro" ? "claro" : "oscuro");
    if (p.tamanoTexto === "grande" || p.tamanoTexto === "muy-grande") r.setAttribute("data-tamano-texto", p.tamanoTexto);
    if (p.movimiento === "reducido") r.setAttribute("data-movimiento", "reducido");
  } catch (e) {}
})();
