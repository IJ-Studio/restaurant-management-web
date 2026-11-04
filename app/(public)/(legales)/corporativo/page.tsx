import type { Metadata } from "next";
import { PaginaLegal, SeccionLegal } from "@/components/marca/PaginaLegal";

export const metadata: Metadata = { title: "Información corporativa" };

// Página de servidor dentro del grupo (legales) (PLAN 4.22); la redacción no cambia.
export default function CorporativoPage() {
  return (
    <PaginaLegal ruta="/corporativo" titulo="Información corporativa" entradilla="Datos de identidad y operación de Restaurante El Quijote.">
      <SeccionLegal titulo="Identidad del establecimiento">
        <p>
          Restaurante El Quijote opera en Plaza Hidalgo #5-1, Colonia Centro, Huejutla de Reyes,
          Hidalgo, México, C.P. 43000. Somos un negocio local de comida mexicana, en
          operación continua desde nuestra apertura en el centro de la ciudad.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Razón social y facturación">
        <p>
          Para solicitudes de factura o información fiscal, contáctanos directamente al{" "}
          <a href="tel:+527717028172">
            +52 771 702 8172
          </a>{" "}
          o acude a nuestra sucursal con tu ticket de compra. Emitimos comprobante fiscal digital
          (CFDI) para las órdenes que lo soliciten dentro de los plazos que marca la legislación
          fiscal vigente.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Gobierno corporativo">
        <p>
          La operación diaria, el control de inventario, caja y personal se administran desde
          nuestro panel interno de gestión, lo que nos permite mantener estándares consistentes de
          calidad y servicio en cada turno.
        </p>
      </SeccionLegal>

      <SeccionLegal titulo="Contacto institucional">
        <p>
          Para temas corporativos, proveedores o alianzas comerciales, escríbenos y con gusto te
          atenderemos en un plazo de 2 a 3 días hábiles.
        </p>
      </SeccionLegal>
    </PaginaLegal>
  );
}
