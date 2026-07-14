"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, FileDown, Loader2 } from "lucide-react";

export default function CheckoutExitoPage() {
  const searchParams = useSearchParams();
  const ordenId = searchParams?.get("ordenId");

  const [factura, setFactura] = useState<any>(null);
  const [loadingFactura, setLoadingFactura] = useState(true);

  useEffect(() => {
    if (!ordenId) {
      setLoadingFactura(false);
      return;
    }

    const buscarFactura = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        // La factura puede tardar unos segundos en generarse (se dispara
        // en segundo plano justo después del pago), así que un 404 aquí
        // es normal si el cliente no pidió factura o si aún no termina.
        const res = await fetch(`${apiUrl}/facturas/${ordenId}`);
        if (res.ok) {
          setFactura(await res.json());
        }
      } catch (e) {
        console.error("Error al buscar factura:", e);
      } finally {
        setLoadingFactura(false);
      }
    };

    buscarFactura();
  }, [ordenId]);

  const descargarFactura = (tipo: "pdf" | "xml") => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    window.open(`${apiUrl}/facturas/${ordenId}/descargar?tipo=${tipo}`, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 pt-24 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
        <CheckCircle2 className="text-green-500" size={36} />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-text">¡Pago confirmado!</h1>
        <p className="text-text-sec text-sm mt-1">
          Tu pedido está en camino. Te avisaremos cuando salga a reparto.
        </p>
      </div>

      {loadingFactura ? (
        <Loader2 className="animate-spin text-brand" size={20} />
      ) : factura ? (
        <div className="flex gap-3">
          <button
            onClick={() => descargarFactura("pdf")}
            className="flex items-center gap-2 bg-surface border border-border text-text text-xs font-bold px-4 py-3 rounded-xl uppercase tracking-wider hover:bg-surface-hover transition-all"
          >
            <FileDown size={14} /> Descargar PDF
          </button>
          <button
            onClick={() => descargarFactura("xml")}
            className="flex items-center gap-2 bg-surface border border-border text-text text-xs font-bold px-4 py-3 rounded-xl uppercase tracking-wider hover:bg-surface-hover transition-all"
          >
            <FileDown size={14} /> Descargar XML
          </button>
        </div>
      ) : null}

      <Link
        href="/menu/pedido?tab=domicilio"
        className="bg-brand text-white text-xs font-bold px-6 py-3 rounded-xl uppercase tracking-wider mt-2"
      >
        Ver mis pedidos
      </Link>
    </div>
  );
}
