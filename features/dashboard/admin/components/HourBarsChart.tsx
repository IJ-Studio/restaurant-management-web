"use client";

import { useEffect, useState, useCallback } from "react";

/* ---------- helper de autenticación (mismo de otros componentes) ---------- */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)session=([^;]+)/);
  if (match) return match[1];
  return localStorage.getItem("authToken");
}

/* ---------- etiquetas de horas (opcional, puedes mantener las originales) ---------- */
const HOUR_LABELS = [
  "12a", "1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a",
  "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p",
];

export function HourBarsChart() {
  const [hourData, setHourData] = useState<number[]>(Array(24).fill(0));
  const [todaySales, setTodaySales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";

  const fetchHourData = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const res = await fetch(`${API_URL}/dashboard/admin/ventas-por-hora`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!res.ok) throw new Error("Error al obtener ventas por hora");
      const data = await res.json();
      setHourData(data.ventas);
      setTodaySales(data.totalDia);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchHourData();
  }, [fetchHourData]);

  const max = Math.max(...hourData, 1); // evitar división por 0
  const cur = new Date().getHours(); // hora actual (0-23)
  const fmt = (n: number) => n.toLocaleString("es-MX", { minimumFractionDigits: 2 });

  if (loading) {
    return (
      <div className="bg-surface rounded-2xl border border-border p-4 pb-3 shadow-sm flex items-center justify-center h-[120px]">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface rounded-2xl border border-border p-4 pb-3 shadow-sm flex items-center justify-center h-[120px] text-red-500 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-4 pb-3 shadow-sm">
      <div className="flex justify-between items-start mb-2.5">
        <div>
          <h3 className="font-display font-black text-sm text-text m-0">Ventas por hora</h3>
          <p className="text-[11px] text-text-muted m-0">Hoy</p>
        </div>
        <span className="font-display text-base font-black text-brand">
          ${fmt(todaySales)}
        </span>
      </div>

      <div className="flex items-end gap-[3px] h-[72px]">
        {hourData.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-[3px]">
            <div className="w-full flex-1 flex items-end">
              <div
                className={`w-full rounded-t-sm min-h-[3px] transition-[height] duration-400 ${
                  i === cur ? "bg-brand" : "bg-brand/35"
                }`}
                style={{ height: `${(v / max) * 100}%` }}
              />
            </div>
            {i % 2 === 0 && (
              <span className="text-[8px] text-text-muted font-bold">{HOUR_LABELS[i]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
