import { useState } from "react";

interface ReservationData {
  nombre: string;
  email: string;
  fecha: string;
  hora: string;
  personas: string;
}

export default function ReservationSection() {
  const [form, setForm] = useState<ReservationData>({ nombre: '', email: '', fecha: '', hora: '', personas: '' });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simular envío a API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSuccess(true);
    setLoading(false);
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <section id="reserva" className="py-24 px-8 lg:px-24">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs uppercase tracking-widest text-[var(--color-brand)] font-bold mb-3">Mesa disponible</p>
        <h2 className="text-4xl font-black mb-4 tracking-tight">Reserva tu Mesa</h2>
        <p className="text-[var(--color-text-sec)] mb-12 leading-relaxed">
          Vive una experiencia gastronómica única. Disponible martes a domingo de 14:00 a 23:00.
        </p>
        {success ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-[2.5rem] p-12">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-2xl font-black text-green-500 mb-2">¡Reservación confirmada!</h3>
            <p className="text-[var(--color-text-sec)]">Revisa tu correo para los detalles.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[var(--color-surface-alt)] p-8 md:p-10 rounded-[2.5rem] border border-[var(--color-border)] text-left space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest font-bold text-[var(--color-text-sec)] block mb-2">Nombre</label>
                <input required value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-4 py-3 text-sm outline-none focus:border-[var(--color-brand)] transition-colors" placeholder="Tu nombre completo" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest font-bold text-[var(--color-text-sec)] block mb-2">Correo</label>
                <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-4 py-3 text-sm outline-none focus:border-[var(--color-brand)] transition-colors" placeholder="tu@correo.com" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest font-bold text-[var(--color-text-sec)] block mb-2">Fecha</label>
                <input required type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-4 py-3 text-sm outline-none focus:border-[var(--color-brand)] transition-colors" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest font-bold text-[var(--color-text-sec)] block mb-2">Hora</label>
                <select required value={form.hora} onChange={e => setForm(p => ({ ...p, hora: e.target.value }))} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-4 py-3 text-sm outline-none focus:border-[var(--color-brand)] transition-colors">
                  <option value="">Seleccionar hora</option>
                  {['14:00','15:00','16:00','19:00','20:00','21:00','22:00'].map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest font-bold text-[var(--color-text-sec)] block mb-2">Número de personas</label>
              <div className="flex gap-3">
                {['1-2','3-4','5-6','7+'].map(p => (
                  <button key={p} type="button" onClick={() => setForm(prev => ({ ...prev, personas: p }))} className={`flex-1 py-3 rounded-2xl text-sm font-bold border transition-all ${form.personas === p ? 'bg-[var(--color-brand)] text-white border-[var(--color-brand)]' : 'border-[var(--color-border)] hover:border-[var(--color-brand)]/50'}`}>{p}</button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-2">
              {loading ? "Procesando..." : "Confirmar Reservación"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}