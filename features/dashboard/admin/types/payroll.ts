export interface PayrollEntry {
  id: string;
  role: string; // Puesto tal como se registra en la nómina (ej. "Chef 1", "Gerente")
  name: string;
  weeklyPay: number;
  active: boolean;
  department?: string | null;
}
