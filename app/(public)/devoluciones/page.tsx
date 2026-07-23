"use client";

import { RotateCcw } from "lucide-react";
import InfoPageLayout, { InfoSection } from "@/components/landing/InfoPageLayout";

export default function DevolucionesPage() {
  return (
    <InfoPageLayout
      title="Devoluciones y reemplazos"
      subtitle="Qué hacer si un platillo llegó incorrecto, incompleto o no cumplió tus expectativas."
      icon={RotateCcw}
    >
      <InfoSection title="En mesa">
        <p>
          Si tu platillo no llegó como lo pediste o notas algún problema de calidad, avisa a tu
          mesero de inmediato. Lo reemplazamos sin costo o ajustamos tu cuenta en el momento —no
          hace falta esperar a pagar la cuenta para reportarlo.
        </p>
      </InfoSection>

      <InfoSection title="Pedidos a domicilio o para llevar">
        <p>
          Si tu pedido llegó incompleto, con un producto equivocado o en mal estado, contáctanos
          dentro de las siguientes 2 horas a partir de la entrega con tu número de orden. Según el
          caso, reenviamos el platillo correcto o hacemos el reembolso correspondiente al mismo
          método de pago usado.
        </p>
      </InfoSection>

      <InfoSection title="Qué no cubre esta política">
        <p>
          No podemos procesar devoluciones por cambios de opinión una vez que el platillo fue
          preparado y entregado correctamente, ni por alergias o restricciones alimentarias no
          informadas al momento de ordenar.
        </p>
      </InfoSection>

      <InfoSection title="Cómo reportar un problema">
        <p>
          Llámanos al{" "}
          <a href="tel:+527717028172" className="text-[var(--color-brand)] font-semibold hover:underline">
            +52 771 702 8172
          </a>{" "}
          o acércate directamente a la caja con tu ticket. Nuestro equipo resuelve la mayoría de
          los casos en el momento.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
