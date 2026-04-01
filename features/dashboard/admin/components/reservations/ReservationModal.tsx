"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, Users, User, Phone, Mail, CheckCircle, AlertCircle } from "lucide-react";
import type { Reservation, DiningTable } from "@/features/shared/data/restaurantData";
import { ReservationService } from "@/features/shared/services/dataService";

interface ReservationModalProps {
  reservation: Reservation | null;
  tables: DiningTable[];
  onClose: () => void;
  onSave: (res: Reservation) => void;
}

export function ReservationModal({ reservation, tables, onClose, onSave }: ReservationModalProps) {
  const isEdit = !!reservation;
  const [formData, setFormData] = useState<Reservation>(
    reservation || {
      id: `RES-${Date.now()}`,
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "19:00",
      guests: 2,
      status: "pendiente",
      createdAt: new Date().toISOString(),
    }
  );

  const [availabilityMsg, setAvailabilityMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === "guests" ? parseInt(value) || 0 : value 
    }));
  };

  const handleCheckAvailability = () => {
    if (!formData.tableId) {
      setAvailabilityMsg("Selecciona una mesa para verificar.");
      return;
    }
    const isAvailable = ReservationService.checkAvailability(formData.date, formData.startTime, formData.tableId);
    setAvailabilityMsg(isAvailable ? "Mesa disponible para este horario." : "La mesa está ocupada por otra reserva.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="p-6 border-b border-border flex items-center justify-between bg-surface-alt/30">
          <div>
            <h2 className="text-xl font-black text-text-sec flex items-center gap-2">
              <Calendar size={24} className="text-brand"/> 
              {isEdit ? "Editar Reserva" : "Nueva Reserva"}
            </h2>
            <p className="text-xs font-bold text-text-muted mt-1 uppercase tracking-wider">Gestión Administrativa</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface rounded-full transition-colors">
            <X size={20} className="text-text-muted" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6 overflow-y-auto max-h-[70vh]">
          {/* Cliente Info */}
          <section className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[11px] font-black text-text-muted uppercase mb-2 block">Nombre del Cliente</label>
              <div className="relative group">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" />
                <input
                  required
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold text-text-sec focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 transition-all"
                  placeholder="Ej: Laura Martínez"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-black text-text-muted uppercase mb-2 block">Teléfono</label>
              <div className="relative group">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" />
                <input
                  required
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold text-text-sec focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-black text-text-muted uppercase mb-2 block">Correo</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" />
                <input
                  required
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold text-text-sec focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 transition-all"
                />
              </div>
            </div>
          </section>

          {/* Fecha y Hora */}
          <section className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-black text-text-muted uppercase mb-2 block">Fecha</label>
              <div className="relative group">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm font-black text-brand focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-black text-text-muted uppercase mb-2 block">Hora de Llegada</label>
              <div className="relative group">
                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" />
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold text-text-sec focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/5 transition-all"
                />
              </div>
            </div>
          </section>

          {/* Comensales y Mesa */}
          <section className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-black text-text-muted uppercase mb-2 block">Nº de Personas</label>
              <div className="relative group">
                <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" />
                <input
                  type="number"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-xl text-sm font-black text-text-sec focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-black text-text-muted uppercase mb-2 block">Mesa Asignada</label>
              <select
                name="tableId"
                value={formData.tableId || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-black text-text-sec focus:outline-none appearance-none"
              >
                <option value="">(Sin asignar)</option>
                {tables.map(t => (
                   <option key={t.id} value={t.id}>{t.name} (Cap: {t.capacity})</option>
                ))}
              </select>
            </div>
          </section>

          {formData.tableId && (
            <div className="p-4 bg-brand/5 rounded-2xl border border-brand/10 flex items-center justify-between">
              <span className={`text-[11px] font-black flex items-center gap-1.5 ${availabilityMsg?.includes("disponible") ? 'text-emerald-600' : 'text-amber-600'}`}>
                {availabilityMsg ? (
                  availabilityMsg.includes("disponible") ? <CheckCircle size={14}/> : <AlertCircle size={14}/>
                ) : <Clock size={14}/>}
                {availabilityMsg || "Verifica la disponibilidad..."}
              </span>
              <button 
                type="button"
                onClick={handleCheckAvailability}
                className="text-[10px] font-black uppercase text-brand hover:underline"
              >
                Checar →
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-black text-text-muted uppercase mb-2 block">Estado</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm font-bold focus:outline-none"
              >
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>
        </form>

        <footer className="p-6 bg-surface border-t border-border flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 rounded-2xl text-sm font-bold text-text-muted hover:bg-border transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="px-8 py-3 rounded-2xl bg-brand text-white text-sm font-black shadow-lg shadow-brand/20 hover:-translate-y-0.5 transition-all">
            Guardar Reserva
          </button>
        </footer>
      </div>
    </div>
  );
}
