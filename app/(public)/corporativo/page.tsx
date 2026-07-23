"use client";

import { Building2 } from "lucide-react";
import InfoPageLayout, { InfoSection } from "@/components/landing/InfoPageLayout";

export default function CorporativoPage() {
  return (
    <InfoPageLayout
      title="Información corporativa"
      subtitle="Datos de identidad y operación de Restaurante El Quijote."
      icon={Building2}
    >
      <InfoSection title="Identidad del establecimiento">
        <p>
          Restaurante El Quijote opera en Plaza Hidalgo #5-1, Colonia Centro, Huejutla de Reyes,
          Hidalgo, México, C.P. 43000. Somos un negocio local dedicado a la gastronomía
          internacional con inspiración española, en operación continua desde nuestra apertura en
          el centro de la ciudad.
        </p>
      </InfoSection>

      <InfoSection title="Razón social y facturación">
        <p>
          Para solicitudes de factura o información fiscal, contáctanos directamente al{" "}
          <a href="tel:+527717028172" className="text-[var(--color-brand)] font-semibold hover:underline">
            +52 771 702 8172
          </a>{" "}
          o acude a nuestra sucursal con tu ticket de compra. Emitimos comprobante fiscal digital
          (CFDI) para las órdenes que lo soliciten dentro de los plazos que marca la legislación
          fiscal vigente.
        </p>
      </InfoSection>

      <InfoSection title="Gobierno corporativo">
        <p>
          La operación diaria, el control de inventario, caja y personal se administran desde
          nuestro panel interno de gestión, lo que nos permite mantener estándares consistentes de
          calidad y servicio en cada turno.
        </p>
      </InfoSection>

      <InfoSection title="Contacto institucional">
        <p>
          Para temas corporativos, proveedores o alianzas comerciales, escríbenos y con gusto te
          atenderemos en un plazo de 2 a 3 días hábiles.
        </p>
      </InfoSection>
    </InfoPageLayout>
  );
}
