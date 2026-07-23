"use client";

import { HelpCircle } from "lucide-react";
import InfoPageLayout, { InfoSection } from "@/components/landing/InfoPageLayout";

export default function AyudaPage() {
  return (
    <InfoPageLayout
      title="Ayuda"
      subtitle="Respuestas rápidas a las preguntas más comunes."
      icon={HelpCircle}
    >
      <InfoSection title="¿Cómo hago una reservación?">
        <p>
          Ve a la sección{" "}
          <a href="/reservations" className="text-[var(--color-brand)] font-semibold hover:underline">
            Reservas
          </a>
          , elige fecha, hora y número de comensales, y confirma tus datos de contacto. Recibirás
          la confirmación al instante.
        </p>
      </InfoSection>

      <InfoSection title="¿Puedo pedir para llevar o a domicilio?">
        <p>
          Sí, desde el{" "}
          <a href="/menu" className="text-[var(--color-brand)] font-semibold hover:underline">
            menú
          </a>{" "}
          puedes armar tu pedido y elegir si lo recoges en sucursal o lo quieres a domicilio.
        </p>
      </InfoSection>

      <InfoSection title="¿Cómo cambio o cancelo una reservación?">
        <p>
          Contáctanos con al menos 2 horas de anticipación al{" "}
          <a href="tel:+527717028172" className="text-[var(--color-brand)] font-semibold hover:underline">
            +52 771 702 8172
          </a>{" "}
          indicando tu nombre y horario reservado.
        </p>
      </InfoSection>

      <InfoSection title="¿Tienen opciones vegetarianas o sin gluten?">
        <p>
          Sí, varios platillos de nuestro menú están marcados como vegetarianos, veganos o sin
          gluten. Si tienes una alergia específica, avísale a tu mesero al ordenar.
        </p>
      </InfoSection>

      <InfoSection title="¿No encontraste lo que buscabas?">
        <p>
          Escríbenos por Facebook o Instagram, o llámanos directamente — con gusto te ayudamos.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
