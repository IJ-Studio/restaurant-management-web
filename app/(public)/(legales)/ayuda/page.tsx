import type { Metadata } from "next";
import { PaginaLegal, SeccionLegal } from "@/components/marca/PaginaLegal";

export const metadata: Metadata = { title: "Ayuda" };

// Página de servidor dentro del grupo (legales) (PLAN 4.22); la redacción no cambia.
export default function AyudaPage() {
  return (
    <PaginaLegal ruta="/ayuda" titulo="Ayuda" entradilla="Respuestas rápidas a las preguntas más comunes.">
      <SeccionLegal titulo="¿Cómo hago una reservación?">
        <p>
          Ve a la sección{" "}
          <a href="/reservations">
            Reservas
          </a>
          , elige fecha, hora y número de comensales, y confirma tus datos de contacto. Recibirás
          la confirmación al instante.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="¿Puedo pedir para llevar o a domicilio?">
        <p>
          Sí, desde el{" "}
          <a href="/menu">
            menú
          </a>{" "}
          puedes armar tu pedido y elegir si lo recoges en sucursal o lo quieres a domicilio.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="¿Cómo cambio o cancelo una reservación?">
        <p>
          Contáctanos con al menos 2 horas de anticipación al{" "}
          <a href="tel:+527717028172">
            +52 771 702 8172
          </a>{" "}
          indicando tu nombre y horario reservado.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="¿Tienen opciones vegetarianas o sin gluten?">
        <p>
          Sí, varios platillos de nuestro menú están marcados como vegetarianos, veganos o sin
          gluten. Si tienes una alergia específica, avísale a tu mesero al ordenar.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="¿No encontraste lo que buscabas?">
        <p>
          Escríbenos por Facebook o Instagram, o llámanos directamente — con gusto te ayudamos.
        </p>
      </SeccionLegal>
    </PaginaLegal>
  );
}
