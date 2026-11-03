import type { Metadata } from "next";
import { PaginaLegal, SeccionLegal } from "@/components/marca/PaginaLegal";

export const metadata: Metadata = { title: "Devoluciones y reemplazos" };

// Página de servidor dentro del grupo (legales) (PLAN 4.22); la redacción no cambia.
export default function DevolucionesPage() {
  return (
    <PaginaLegal ruta="/devoluciones" titulo="Devoluciones y reemplazos" entradilla="Qué hacer si un platillo llegó incorrecto, incompleto o no cumplió tus expectativas.">
      <SeccionLegal titulo="En mesa">
        <p>
          Si tu platillo no llegó como lo pediste o notas algún problema de calidad, avisa a tu
          mesero de inmediato. Lo reemplazamos sin costo o ajustamos tu cuenta en el momento —no
          hace falta esperar a pagar la cuenta para reportarlo.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Pedidos a domicilio o para llevar">
        <p>
          Si tu pedido llegó incompleto, con un producto equivocado o en mal estado, contáctanos
          dentro de las siguientes 2 horas a partir de la entrega con tu número de orden. Según el
          caso, reenviamos el platillo correcto o hacemos el reembolso correspondiente al mismo
          método de pago usado.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Qué no cubre esta política">
        <p>
          No podemos procesar devoluciones por cambios de opinión una vez que el platillo fue
          preparado y entregado correctamente, ni por alergias o restricciones alimentarias no
          informadas al momento de ordenar.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Cómo reportar un problema">
        <p>
          Llámanos al{" "}
          <a href="tel:+527717028172">
            +52 771 702 8172
          </a>{" "}
          o acércate directamente a la caja con tu ticket. Nuestro equipo resuelve la mayoría de
          los casos en el momento.
        </p>
      </SeccionLegal>
    </PaginaLegal>
  );
}
