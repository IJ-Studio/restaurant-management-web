"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingDown,
  TrendingUp,
  Plus,
  X,
  FileText,
  Lock,
  CheckCircle2,
  Clock,
} from "lucide-react";

import {
  type CashMovement,
  type CashSession,
  type Tip,
  type MvType,
  MOCK_MOVEMENTS,
  MOCK_SESSIONS,
  MOCK_TIPS,
  PAY_CFG,
  PAY_ICONS,
} from "@/features/dashboard/admin/data/financeMock";

import { MovementModal } from "@/features/dashboard/admin/components/MovementModal";
import { CloseSessionModal } from "@/features/dashboard/admin/components/CloseSessionModal";
import { TipModal } from "@/features/dashboard/admin/components/TipModal";

const fmt = (n: number) =>
  n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function FinancePage() {
  const router = useRouter();
  const [movements, setMovements] = useState<CashMovement[]>(MOCK_MOVEMENTS);
  const [sessions, setSessions] = useState<CashSession[]>(MOCK_SESSIONS);
  const [tips, setTips] = useState<Tip[]>(MOCK_TIPS);
  const [tab, setTab] = useState<"caja" | "cierre" | "propinas">("caja");
  const [mvModal, setMvModal] = useState<MvType | null>(null);
  const [closeModal, setCloseModal] = useState<CashSession | null>(null);
  const [tipModal, setTipModal] = useState(false);
  const [dateFilter, setDateFilter] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const todayMvs = movements.filter((m) => m.date === today);
  const todayIn = todayMvs
    .filter((m) => m.type === "ingreso")
    .reduce((s, m) => s + m.amount, 0);
  const todayOut = todayMvs
    .filter((m) => m.type === "egreso")
    .reduce((s, m) => s + m.amount, 0);
  const openSession = sessions.find((s) => s.status === "abierta");

  const displayMvs = (
    dateFilter ? movements.filter((m) => m.date === dateFilter) : movements
  ).sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));

  const tipsByWaiter = useMemo(() => {
    const map: Record<string, { total: number; count: number; pending: number }> = {};
    tips.forEach((t) => {
      if (!map[t.waiter]) map[t.waiter] = { total: 0, count: 0, pending: 0 };
      map[t.waiter].total += t.amount;
      map[t.waiter].count++;
      if (!t.distributed) map[t.waiter].pending += t.amount;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [tips]);

  const pendingTips = tips
    .filter((t) => !t.distributed)
    .reduce((s, t) => s + t.amount, 0);

  function closeSession(counted: number, closedBy: string) {
    if (!openSession) return;
    setSessions((ss) =>
      ss.map((s) =>
        s.id !== openSession.id
          ? s
          : {
            ...s,
            status: "cerrada",
            closedAt: new Date().toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            countedBalance: counted,
            difference: counted - s.expectedBalance,
            closedBy,
          }
      )
    );
  }

  function markDistributed(waiterId: string) {
    setTips((ts) =>
      ts.map((t) =>
        t.waiter === waiterId && !t.distributed ? { ...t, distributed: true } : t
      )
    );
  }

  return (
    <main className="p-8 md:p-10 min-w-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-black text-3xl tracking-tight leading-none mb-1.5 text-text m-0">
            Finanzas & Caja
          </h1>
          <p className="text-sm text-text-muted m-0">
            Control de caja chica, cierres y distribución de propinas
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => router.push("/dashboard/admin/finance/invoices")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold border border-border cursor-pointer bg-surface text-text-sec hover:bg-surface-alt transition-colors"
          >
            <FileText size={15} /> Facturas
          </button>
          {tab === "caja" && (
            <>
              <button
                onClick={() => setMvModal("egreso")}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold border border-red-200 cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <TrendingDown size={15} /> Egreso
              </button>
              <button
                onClick={() => setMvModal("ingreso")}
                className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-[13px] font-bold border-none cursor-pointer bg-emerald-600 text-white shadow-[0_4px_12px_rgba(5,150,105,0.25)] hover:-translate-y-px transition-all"
              >
                <TrendingUp size={15} /> Ingreso
              </button>
            </>
          )}
          {tab === "propinas" && (
            <button
              onClick={() => setTipModal(true)}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-[13px] font-bold border-none cursor-pointer bg-brand text-white shadow-[0_4px_12px_rgba(232,93,4,0.28)] hover:-translate-y-px transition-all"
            >
              <Plus size={15} /> Registrar propina
            </button>
          )}
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {[
          { l: "Ingresos hoy", v: `$${fmt(todayIn)}`, colorClass: "bg-emerald-600 text-emerald-600", count: openSession ? `Caja ${openSession.status}` : "Sin sesión activa" },
          { l: "Egresos hoy", v: `$${fmt(todayOut)}`, colorClass: "bg-red-600 text-red-600", count: `${todayMvs.filter((m) => m.type === "egreso").length} movimientos` },
          { l: "Balance hoy", v: `$${fmt(todayIn - todayOut)}`, colorClass: "bg-brand text-brand", count: "neto del día" },
          { l: "Propinas pend.", v: `$${fmt(pendingTips)}`, colorClass: "bg-amber-600 text-amber-600", count: "por distribuir" },
        ].map((s) => {
          const [bg, textColor] = s.colorClass.split(" ");
          return (
            <div key={s.l} className="bg-surface rounded-[20px] border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-6 h-1 rounded-full mb-3.5 opacity-90 ${bg}`} />
              <p className={`font-display text-[26px] font-black m-0 mb-1 leading-none ${textColor}`}>
                {s.v}
              </p>
              <p className="text-xs font-bold text-text m-0 mb-0.5">{s.l}</p>
              <p className="text-[11px] text-text-muted m-0">{s.count}</p>
            </div>
          );
        })}
      </div>

      {/* Open session banner */}
      {openSession && tab === "caja" && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-emerald-50 rounded-[14px] border border-emerald-300 mb-6 gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-[0_0_0_4px_#a7f3d0]" />
            <p className="text-[13px] font-bold text-emerald-700 m-0">
              Caja abierta desde las {openSession.openedAt} · Saldo apertura: ${fmt(openSession.openingBalance)}
            </p>
          </div>
          <button
            onClick={() => setCloseModal(openSession)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border-none cursor-pointer bg-emerald-600 text-white shadow-[0_2px_8px_rgba(5,150,105,0.25)] hover:-translate-y-px transition-all shrink-0"
          >
            <Lock size={12} /> Cerrar caja
          </button>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-border mb-6 overflow-x-auto no-scrollbar">
        {[
          { k: "caja", l: "💵 Caja chica", count: movements.length },
          { k: "cierre", l: "🔒 Cierres", count: sessions.length },
          { k: "propinas", l: "💰 Propinas", count: tips.length },
        ].map((t) => {
          const active = tab === t.k;
          return (
            <button
              key={t.k}
              onClick={() => setTab(t.k as any)}
              className={`flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-bold border-none cursor-pointer bg-transparent border-b-2 mb-[-1px] whitespace-nowrap transition-colors ${active ? "border-brand text-brand" : "border-transparent text-text-muted hover:text-text-sec"
                }`}
            >
              {t.l}
              <span
                className={`px-[7px] py-[1px] rounded-full text-[10px] font-extrabold transition-colors ${active ? "bg-brand/10 text-brand" : "bg-surface-alt text-text-muted"
                  }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── TAB CAJA CHICA ── */}
      {tab === "caja" && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2 text-xs text-text-sec">
              <label className="font-bold">Filtrar por fecha:</label>
              <div className="relative">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-auto px-2.5 py-1.5 text-xs bg-surface border border-border rounded-lg outline-none font-body text-text"
                />
                {dateFilter && (
                  <button
                    onClick={() => setDateFilter("")}
                    className="absolute right-[-24px] top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-text-muted hover:text-text-sec flex"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {displayMvs.map((m) => {
              const isIn = m.type === "ingreso";
              const pc = PAY_CFG[m.payMethod];
              return (
                <div
                  key={m.id}
                  className="bg-surface rounded-2xl border border-border p-3.5 flex flex-col sm:flex-row sm:items-center gap-3.5 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div
                    className={`w-11 h-11 shrink-0 rounded-[14px] flex items-center justify-center ${isIn ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                      }`}
                  >
                    {isIn ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-text m-0 mb-0.5 truncate group-hover:text-brand transition-colors">
                      {m.concept}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-text-sec">
                      <span className="font-bold">{m.category}</span>
                      <span>•</span>
                      <span>{m.responsible}</span>
                      <span>•</span>
                      <span>{m.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 mt-1 sm:mt-0">
                    <div
                      className={`flex items-center gap-1.5 px-2 py-1 bg-surface-alt border border-border rounded-lg text-xs font-bold ${pc.textClass}`}
                    >
                      {PAY_ICONS[m.payMethod]}
                      {pc.label}
                    </div>
                    <span
                      className={`font-display text-lg font-black w-24 text-right ${isIn ? "text-emerald-600" : "text-text"
                        }`}
                    >
                      {isIn ? "+" : "-"}${fmt(m.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
            {displayMvs.length === 0 && (
              <div className="text-center py-10 text-[13px] font-bold text-text-muted bg-surface/50 rounded-2xl border border-dashed border-border">
                No hay movimientos para la fecha seleccionada.
              </div>
            )}
          </div>
        </>
      )}

      {/* ── TAB CIERRE ── */}
      {tab === "cierre" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="bg-surface border border-border rounded-2xl p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-black text-text m-0 mb-0.5">
                    {s.date}
                  </h3>
                  <div className="flex gap-2 text-xs text-text-sec">
                    <span>Apertura {s.openedAt}</span>
                    {s.closedAt && <span>• Cierre {s.closedAt}</span>}
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 border ${s.status === "abierta"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-surface-alt text-text-sec border-border"
                    }`}
                >
                  {s.status === "abierta" ? <Clock size={11} /> : <CheckCircle2 size={11} />}
                  {s.status}
                </div>
              </div>
              <div className="flex flex-col gap-2 mb-4 bg-surface-alt p-3.5 rounded-xl border border-border">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-sec font-bold">Apertura</span>
                  <span className="font-mono text-text">${fmt(s.openingBalance)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-sec font-bold">Movimientos ({s.movements})</span>
                  <span className="font-mono text-text">${fmt(s.expectedBalance - s.openingBalance)}</span>
                </div>
                {s.status === "cerrada" && (
                  <>
                    <div className="border-t border-border my-1" />
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-text">Físico</span>
                      <span className="font-mono text-sm font-bold text-text">${fmt(s.countedBalance!)}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-auto border-t border-border pt-3.5 flex justify-between items-center">
                {s.status === "abierta" ? (
                  <>
                    <span className="text-xs font-extrabold text-text">Esperado</span>
                    <span className="font-display text-[22px] font-black text-brand leading-none">
                      ${fmt(s.expectedBalance)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-text-sec flex flex-col">
                      Diferencia
                      {s.difference !== 0 && (
                        <span className={`text-[10px] font-extrabold uppercase mt-0.5 ${s.difference! > 0 ? "text-blue-600" : "text-red-500"}`}>
                          {s.difference! > 0 ? "Sobra" : "Falta"}
                        </span>
                      )}
                    </span>
                    <span className={`font-display text-[22px] font-black leading-none ${s.difference === 0 ? "text-emerald-600" : s.difference! > 0 ? "text-blue-600" : "text-red-600"
                      }`}
                    >
                      {s.difference! > 0 ? "+" : ""}${fmt(s.difference!)}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB PROPINAS ── */}
      {tab === "propinas" && (
        <div className="bg-surface rounded-[24px] border border-border overflow-hidden shadow-sm">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_80px] gap-0 bg-surface-alt px-5 py-3.5 border-b border-border text-[10px] font-bold text-text-muted tracking-widest uppercase">
            <span>Mesero / Staff</span>
            <span>Total Recabado</span>
            <span>Pendiente a liquidar</span>
            <span className="text-right">Acción</span>
          </div>
          <div className="flex flex-col">
            {tipsByWaiter.map(([waiter, stats]) => (
              <div
                key={waiter}
                className="grid grid-cols-[1.5fr_1fr_1fr_80px] gap-4 px-5 py-4 border-b border-border items-center hover:bg-surface-alt transition-colors last:border-none group"
              >
                <div>
                  <p className="text-sm font-bold text-text m-0 mb-0.5 truncate group-hover:text-brand transition-colors">
                    {waiter}
                  </p>
                  <p className="text-[11px] text-text-sec m-0">
                    {stats.count} registros
                  </p>
                </div>
                <div className="text-sm font-bold text-text">
                  ${fmt(stats.total)}
                </div>
                <div>
                  {stats.pending > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-600 font-bold text-[11px] rounded-lg">
                      ${fmt(stats.pending)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold text-[11px] rounded-lg">
                      Liquidado
                    </span>
                  )}
                </div>
                <div className="text-right">
                  {stats.pending > 0 && (
                    <button
                      onClick={() => markDistributed(waiter)}
                      className="px-3 py-1.5 bg-brand text-white text-[11px] font-bold rounded-lg border-none cursor-pointer shadow-[0_2px_8px_rgba(232,93,4,0.3)] hover:-translate-y-px transition-all"
                    >
                      Liquidar
                    </button>
                  )}
                </div>
              </div>
            ))}
            {tipsByWaiter.length === 0 && (
              <div className="p-10 text-center text-sm font-bold text-text-muted">
                No hay propinas registradas.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {mvModal && (
        <MovementModal
          type={mvModal}
          onClose={() => setMvModal(null)}
          onSave={(m) => setMovements([m, ...movements])}
        />
      )}
      {closeModal && (
        <CloseSessionModal
          session={closeModal}
          onClose={() => setCloseModal(null)}
          onConfirm={closeSession}
        />
      )}
      {tipModal && (
        <TipModal
          onClose={() => setTipModal(false)}
          onSave={(t) => setTips([t, ...tips])}
        />
      )}
    </main>
  );
}
