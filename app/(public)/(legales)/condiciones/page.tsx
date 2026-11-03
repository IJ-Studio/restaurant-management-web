import type { Metadata } from "next";
import { PaginaLegal, SeccionLegal } from "@/components/marca/PaginaLegal";

export const metadata: Metadata = { title: "Condiciones de uso" };

// Página de servidor dentro del grupo (legales) (PLAN 4.22); la redacción no cambia.
export default function CondicionesPage() {
  return (
    <PaginaLegal ruta="/condiciones" titulo="Condiciones de uso" entradilla="Reglas para usar el sitio web y la plataforma de pedidos/reservas de El Quijote.">
      <SeccionLegal titulo="Aceptación">
        <p>
          Al usar este sitio, hacer una reservación o realizar un pedido en línea, aceptas estas
          condiciones de uso. Si no estás de acuerdo, te pedimos no utilizar la plataforma.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Uso de la cuenta">
        <p>
          Eres responsable de la información que registras y de mantener segura tu contraseña. No
          está permitido crear cuentas falsas ni usar la plataforma para fines distintos a
          reservar o pedir alimentos.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Precios y disponibilidad">
        <p>
          Los precios mostrados en el menú incluyen impuestos aplicables y pueden cambiar sin
          previo aviso. La disponibilidad de platillos está sujeta a existencias del día.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Reservaciones y pedidos">
        <p>
          Una reservación confirmada nos ayuda a preparar tu mesa; te pedimos llegar dentro de los
          15 minutos posteriores a tu horario reservado. Los pedidos en línea se procesan en el
          orden en que se reciben.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Modificaciones">
        <p>
          Podemos actualizar estas condiciones ocasionalmente. La versión vigente siempre estará
          disponible en esta misma página.
        </p>
      </SeccionLegal>
    </PaginaLegal>
  );
}
