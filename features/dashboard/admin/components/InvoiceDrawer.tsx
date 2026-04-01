"use client";

import { X, Download, Send, Printer, CheckCircle2, XCircle } from "lucide-react";
import { type Invoice, type InvStatus, STATUS_CFG, CFDI_USES, PAY_CFG } from "../data/invoicesMock";

const fmt = (n: number) =>
  n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function InvoiceDrawer({
  inv,
  onClose,
  onStatusChange,
}: {
  inv: Invoice;
  onClose: () => void;
  onStatusChange: (id: number, s: InvStatus) => void;
}) {
  const sc = STATUS_CFG[inv.status];

  return (
    <div
      className="fixed inset-0 z-[90] flex bg-[#1a1208]/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex-1" />
      <div
        className="w-[440px] max-w-full bg-surface h-full overflow-y-auto shadow-[-8px_0_40px_rgba(26,18,8,0.12)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-border bg-surface-alt">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[10px] font-bold text-text-muted tracking-widest uppercase mb-1">
                Factura
              </p>
              <h2 className="font-display font-black text-2xl text-text m-0 mb-0.5">
                {inv.series}
                {inv.folio}
              </h2>
              <p className="text-xs text-text-muted m-0">{inv.issuedAt}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-surface border border-border rounded-lg cursor-pointer flex text-text-sec hover:bg-border transition-colors"
            >
              <X size={15} />
            </button>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${sc.colorClass} ${sc.bgClass}`}
          >
            {sc.icon} {sc.label}
          </span>
        </div>

        <div className="flex-1 p-6 flex flex-col gap-5">
          <div>
            <p className="text-[10px] font-bold text-text-muted tracking-widest uppercase mb-2.5">
              Cliente
            </p>
            <div className="bg-surface-alt rounded-xl p-3.5 border border-border">
              <p className="text-sm font-bold text-text mb-1 m-0">{inv.clientName}</p>
              <p className="text-xs text-text-sec font-mono font-bold m-0 mb-0.5">
                RFC: {inv.clientRFC}
              </p>
              {inv.clientEmail && (
                <p className="text-xs text-text-sec m-0">{inv.clientEmail}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { l: "Uso CFDI", v: CFDI_USES[inv.cfdiUse] },
              { l: "Forma pago", v: inv.payForm },
              { l: "Método", v: PAY_CFG[inv.payMethod].label },
              { l: "Referencia", v: inv.orderRef || "—" },
            ].map((r) => (
              <div key={r.l} className="px-3 py-2 bg-surface-alt rounded-xl border border-border">
                <p className="text-[9px] font-bold text-text-muted m-0 mb-1 tracking-widest uppercase">
                  {r.l}
                </p>
                <p className="text-xs font-bold text-text m-0">{r.v}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] font-bold text-text-muted tracking-widest uppercase mb-2.5">
              Conceptos
            </p>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-surface-alt border-b border-border">
                    {["Descripción", "Cant.", "P.Unit", "Importe"].map((h) => (
                      <th
                        key={h}
                        className={`px-3 py-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ${
                          h === "Descripción" ? "text-left" : "text-right"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inv.items.map((item, i) => (
                    <tr
                      key={i}
                      className="border-b border-border last:border-none"
                    >
                      <td className="px-3 py-2.5 text-[13px] text-text">
                        {item.description}
                      </td>
                      <td className="px-3 py-2.5 text-[13px] text-text-sec text-right">
                        {item.qty}
                      </td>
                      <td className="px-3 py-2.5 text-[13px] text-text-sec text-right">
                        ${fmt(item.unitPrice)}
                      </td>
                      <td className="px-3 py-2.5 text-[13px] font-bold text-text text-right">
                        ${fmt(item.qty * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-surface-alt rounded-xl p-4 flex flex-col gap-1 border border-border">
            {[
              { l: "Subtotal", v: `$${fmt(inv.subtotal)}` },
              { l: "IVA (16%)", v: `$${fmt(inv.iva)}` },
            ].map((r) => (
              <div key={r.l} className="flex justify-between">
                <span className="text-xs text-text-sec font-semibold">{r.l}</span>
                <span className="text-xs text-text-sec font-semibold">{r.v}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 mt-1 flex justify-between items-center">
              <span className="text-[15px] font-extrabold text-text">Total</span>
              <span className="font-display text-[22px] font-black text-brand leading-none">
                ${fmt(inv.total)}
              </span>
            </div>
          </div>

          {inv.notes && (
            <div className="px-3 py-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-600">
              <strong className="font-extrabold">Nota:</strong> {inv.notes}
            </div>
          )}

          {inv.status !== "cancelada" && (
            <div className="flex flex-col gap-2 mt-2">
              <p className="text-[10px] font-bold text-text-muted tracking-widest uppercase m-0 mb-1">
                Acciones
              </p>
              <div className="flex gap-2">
                {[
                  { icon: <Download size={13} />, l: "PDF" },
                  { icon: <Send size={13} />, l: "Enviar" },
                  { icon: <Printer size={13} />, l: "Imprimir" },
                ].map((a) => (
                  <button
                    key={a.l}
                    className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold border border-border bg-surface text-text-sec cursor-pointer hover:bg-surface-alt transition-colors"
                  >
                    {a.icon}
                    {a.l}
                  </button>
                ))}
              </div>
              {inv.status === "emitida" && (
                <button
                  onClick={() => {
                    onStatusChange(inv.id, "pagada");
                    onClose();
                  }}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-[13px] font-bold border-none cursor-pointer bg-emerald-600 text-white shadow-[0_4px_12px_rgba(5,150,105,0.25)] hover:-translate-y-px transition-all"
                >
                  <CheckCircle2 size={14} /> Marcar como pagada
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm("¿Seguro que deseas cancelar esta factura?")) {
                    onStatusChange(inv.id, "cancelada");
                    onClose();
                  }
                }}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold border border-red-200 cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 transition-colors mt-2"
              >
                <XCircle size={12} /> Cancelar factura
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
