"use client";

import { FileText } from "lucide-react";
import InfoPageLayout, { InfoSection } from "@/components/landing/InfoPageLayout";

export default function CondicionesPage() {
  return (
    <InfoPageLayout
      title="Condiciones de uso"
      subtitle="Reglas para usar el sitio web y la plataforma de pedidos/reservas de El Quijote."
      icon={FileText}
    >
      <InfoSection title="Aceptación">
        <p>
          Al usar este sitio, hacer una reservación o realizar un pedido en línea, aceptas estas
          condiciones de uso. Si no estás de acuerdo, te pedimos no utilizar la plataforma.
        </p>
      </InfoSection>

      <InfoSection title="Uso de la cuenta">
        <p>
          Eres responsable de la información que registras y de mantener segura tu contraseña. No
          está permitido crear cuentas falsas ni usar la plataforma para fines distintos a
          reservar o pedir alimentos.
        </p>
      </InfoSection>

      <InfoSection title="Precios y disponibilidad">
        <p>
          Los precios mostrados en el menú incluyen impuestos aplicables y pueden cambiar sin
          previo aviso. La disponibilidad de platillos está sujeta a existencias del día.
        </p>
      </InfoSection>

      <InfoSection title="Reservaciones y pedidos">
        <p>
          Una reservación confirmada nos ayuda a preparar tu mesa; te pedimos llegar dentro de los
          15 minutos posteriores a tu horario reservado. Los pedidos en línea se procesan en el
          orden en que se reciben.
        </p>
      </InfoSection>

      <InfoSection title="Modificaciones">
        <p>
          Podemos actualizar estas condiciones ocasionalmente. La versión vigente siempre estará
          disponible en esta misma página.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
