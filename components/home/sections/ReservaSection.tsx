import React from "react";

import type { ReservaData } from "../types";

type Props = {
  reservaData: ReservaData;
  setReservaData: React.Dispatch<React.SetStateAction<ReservaData>>;
  reservaOk: boolean;
  handleReserva: (e: React.FormEvent) => void;
};

export default function ReservaSection({ reservaData, setReservaData, reservaOk, handleReserva }: Props) {
  return (
    <section id="reserva" className="py-24 px-8 lg:px-24">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-3">Mesa disponible</p>
        <h2 className="text-4xl font-black mb-4 tracking-tight">Reserva tu Mesa</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-12 leading-relaxed">
          Vive una experiencia gastronómica única. Disponible martes a domingo de 14:00 a 23:00.
        </p>

        {reservaOk ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-[2.5rem] p-12">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-2xl font-black text-green-500 mb-2">¡Reservación confirmada!</h3>
            <p className="text-gray-500">Revisa tu correo para los detalles.</p>
          </div>
        ) : (
          <form onSubmit={handleReserva} className="bg-gray-50 dark:bg-[#161616] p-8 md:p-10 rounded-[2.5rem] border border-black/5 dark:border-white/5 text-left space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest font-bold text-gray-500 block mb-2">Nombre</label>
                <input
                  required
                  value={reservaData.nombre}
                  onChange={e => setReservaData(p => ({ ...p, nombre: e.target.value }))}
                  className="w-full bg-white dark:bg-[#0f0f0f] border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors"
                  placeholder="Tu nombre completo"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest font-bold text-gray-500 block mb-2">Correo</label>
                <input
                  required type="email"
                  value={reservaData.email}
                  onChange={e => setReservaData(p => ({ ...p, email: e.target.value }))}
                  className="w-full bg-white dark:bg-[#0f0f0f] border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors"
                  placeholder="tu@correo.com"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest font-bold text-gray-500 block mb-2">Fecha</label>
                <input
                  required type="date"
                  value={reservaData.fecha}
                  onChange={e => setReservaData(p => ({ ...p, fecha: e.target.value }))}
                  className="w-full bg-white dark:bg-[#0f0f0f] border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest font-bold text-gray-500 block mb-2">Hora</label>
                <select
                  required
                  value={reservaData.hora}
                  onChange={e => setReservaData(p => ({ ...p, hora: e.target.value }))}
                  className="w-full bg-white dark:bg-[#0f0f0f] border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors appearance-none"
                >
                  <option value="">Seleccionar hora</option>
                  {['14:00', '15:00', '16:00', '19:00', '20:00', '21:00', '22:00'].map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest font-bold text-gray-500 block mb-2">Número de personas</label>
              <div className="flex gap-3">
                {['1-2', '3-4', '5-6', '7+'].map(p => (
                  <button
                    key={p} type="button"
                    onClick={() => setReservaData(prev => ({ ...prev, personas: p }))}
                    className={`flex-1 py-3 rounded-2xl text-sm font-bold border transition-all ${reservaData.personas === p ? 'bg-orange-500 text-white border-orange-500' : 'border-black/10 dark:border-white/10 hover:border-orange-500/50'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-orange-500/20 active:scale-[.98] mt-2"
            >
              Confirmar Reservación
            </button>
          </form>
        )}
      </div>
    </section>

  );
}
