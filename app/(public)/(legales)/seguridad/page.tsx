import type { Metadata } from "next";
import { PaginaLegal, SeccionLegal } from "@/components/marca/PaginaLegal";

export const metadata: Metadata = { title: "Alertas de seguridad" };

// Página de servidor dentro del grupo (legales) (PLAN 4.22); la redacción no cambia.
export default function SeguridadPage() {
  return (
    <PaginaLegal ruta="/seguridad" titulo="Alertas de seguridad" entradilla="Cómo protegerte al reservar o pedir en línea con nosotros.">
      <SeccionLegal titulo="Comunicación oficial">
        <p>
          Nunca te pediremos tu contraseña, el código completo de tu tarjeta ni transferencias
          fuera de nuestra plataforma de pago. Cualquier mensaje que lo solicite —por WhatsApp,
          redes sociales o correo— no proviene de El Quijote y debe reportarse.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Pagos en línea">
        <p>
          Los pagos con tarjeta se procesan a través de una pasarela de pagos certificada; nosotros
          no almacenamos el número completo de tu tarjeta en nuestros sistemas. Verifica siempre
          que estás en nuestro dominio oficial antes de ingresar datos de pago.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Cuenta y reservaciones">
        <p>
          Usa una contraseña única para tu cuenta y cierra sesión en equipos compartidos. Si
          detectas una reservación o pedido que no reconoces, contáctanos de inmediato para
          revisarlo.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Reportar actividad sospechosa">
        <p>
          Si recibiste una comunicación sospechosa a nombre de El Quijote, o notaste actividad
          extraña en tu cuenta, avísanos al{" "}
          <a href="tel:+527717028172">
            +52 771 702 8172
          </a>{" "}
          para investigarlo.
        </p>
      </SeccionLegal>
    </PaginaLegal>
  );
}
