import type { Metadata } from "next";
import { PaginaLegal, SeccionLegal } from "@/components/marca/PaginaLegal";

export const metadata: Metadata = { title: "Aviso de privacidad" };

// Página de servidor dentro del grupo (legales) (PLAN 4.22); la redacción no cambia.
export default function PrivacidadPage() {
  return (
    <PaginaLegal ruta="/privacidad" titulo="Aviso de privacidad" entradilla="Cómo tratamos tus datos personales, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.">
      <SeccionLegal titulo="Responsable">
        <p>
          Restaurante El Quijote, con domicilio en Plaza Hidalgo #5-1, Colonia Centro, Huejutla de
          Reyes, Hidalgo, México, es responsable del tratamiento de tus datos personales.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Datos que recabamos">
        <p>
          Para reservar una mesa o realizar un pedido recabamos nombre, teléfono y, en su caso,
          correo electrónico. Para pagos en línea, la información de tu tarjeta es procesada
          directamente por nuestra pasarela de pagos certificada, no por nosotros.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Uso de tus datos">
        <p>
          Usamos tus datos para confirmar reservaciones, procesar pedidos, dar seguimiento a
          aclaraciones y, si nos autorizas, enviarte promociones. No vendemos ni compartimos tus
          datos con terceros ajenos a la operación del restaurante.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Derechos ARCO">
        <p>
          Puedes solicitar acceder, rectificar, cancelar u oponerte al uso de tus datos personales
          (derechos ARCO) escribiéndonos o llamando al{" "}
          <a href="tel:+527717028172">
            +52 771 702 8172
          </a>
          .
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Cambios a este aviso">
        <p>
          Cualquier actualización a este aviso de privacidad se publicará en esta misma página.
        </p>
      </SeccionLegal>
    </PaginaLegal>
  );
}
