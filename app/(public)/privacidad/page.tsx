"use client";

import { Lock } from "lucide-react";
import InfoPageLayout, { InfoSection } from "@/components/landing/InfoPageLayout";

export default function PrivacidadPage() {
  return (
    <InfoPageLayout
      title="Aviso de privacidad"
      subtitle="Cómo tratamos tus datos personales, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares."
      icon={Lock}
    >
      <InfoSection title="Responsable">
        <p>
          Restaurante El Quijote, con domicilio en Plaza Hidalgo #5-1, Colonia Centro, Huejutla de
          Reyes, Hidalgo, México, es responsable del tratamiento de tus datos personales.
        </p>
      </InfoSection>

      <InfoSection title="Datos que recabamos">
        <p>
          Para reservar una mesa o realizar un pedido recabamos nombre, teléfono y, en su caso,
          correo electrónico. Para pagos en línea, la información de tu tarjeta es procesada
          directamente por nuestra pasarela de pagos certificada, no por nosotros.
        </p>
      </InfoSection>

      <InfoSection title="Uso de tus datos">
        <p>
          Usamos tus datos para confirmar reservaciones, procesar pedidos, dar seguimiento a
          aclaraciones y, si nos autorizas, enviarte promociones. No vendemos ni compartimos tus
          datos con terceros ajenos a la operación del restaurante.
        </p>
      </InfoSection>

      <InfoSection title="Derechos ARCO">
        <p>
          Puedes solicitar acceder, rectificar, cancelar u oponerte al uso de tus datos personales
          (derechos ARCO) escribiéndonos o llamando al{" "}
          <a href="tel:+527717028172" className="text-[var(--color-brand)] font-semibold hover:underline">
            +52 771 702 8172
          </a>
          .
        </p>
      </InfoSection>

      <InfoSection title="Cambios a este aviso">
        <p>
          Cualquier actualización a este aviso de privacidad se publicará en esta misma página.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
