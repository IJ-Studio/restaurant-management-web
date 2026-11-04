"use client";

import { Banknote, Receipt } from "lucide-react";
import { BloquePanel } from "@/components/paneles/BloquePanel";
import { INDICADOR_PROTAGONISTA, REJILLA_INDICADORES } from "@/components/paneles/rejilla";
import { EstadoError } from "@/components/ui/EstadoError";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Indicador } from "@/components/ui/Indicador";
import { Insignia } from "@/components/ui/Insignia";
import { Tabla, type ColumnaTabla } from "@/components/ui/Tabla";
import { useCarga } from "@/hooks/useCarga";
import { formatearImporte } from "@/lib/formato/precio";
import { pedirPanel } from "@/lib/paneles/api-panel";

/**
 * Caja y propinas, panel del Inicio (PLAN-AMPLIACION D-24 y D-27). Solo datos del API:
 * - `GET /reportes/hoy`: lo cobrado hoy, las propinas, el ticket medio, los comensales y el reparto
 *   por método de pago y por cajero. El API ya hace las cuentas; aquí solo se pintan.
 * - `GET /caja/cortes`: los cortes de caja recientes de todo el personal.
 * Sustituye a la pantalla de «Finanzas», que trabajaba con datos de ejemplo en memoria.
 */

interface ResumenHoy {
	ventas: { cobrado: number; propinas: number; pagos: number; ordenesPagadas: number; ticketPromedio: number; comensales: number };
	porMetodo: { metodo: string; total: number; pagos: number }[];
	porCajero: { nombre: string; total: number; pagos: number }[];
}
interface Corte {
	id: number;
	cajero: string | null;
	fechaApertura: string;
	fechaCierre: string | null;
	totalVentas: string | number | null;
	propinas: string | number | null;
	diferencia: string | number | null;
	estatus: string | null;
}

const entero = new Intl.NumberFormat("es-MX");
const importe = (n: unknown) => formatearImporte(Number(n) || 0) ?? "—";
const hora = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });
const fechaHora = (v: string | null) => (v ? hora.format(new Date(v)) : "—");

const columnasMetodo: ColumnaTabla<ResumenHoy["porMetodo"][number]>[] = [
	{ clave: "metodo", titulo: "Método", principal: true, celda: (m) => m.metodo },
	{ clave: "pagos", titulo: "Pagos", numerica: true, celda: (m) => entero.format(m.pagos) },
	{ clave: "total", titulo: "Total", numerica: true, celda: (m) => importe(m.total) },
];
const columnasCajero: ColumnaTabla<ResumenHoy["porCajero"][number]>[] = [
	{ clave: "cajero", titulo: "Cobró", principal: true, celda: (c) => c.nombre },
	{ clave: "pagos", titulo: "Pagos", numerica: true, celda: (c) => entero.format(c.pagos) },
	{ clave: "total", titulo: "Total", numerica: true, celda: (c) => importe(c.total) },
];
const columnasCorte: ColumnaTabla<Corte>[] = [
	{ clave: "cajero", titulo: "Cajero", principal: true, celda: (c) => c.cajero ?? "Sin nombre" },
	{ clave: "apertura", titulo: "Apertura", celda: (c) => fechaHora(c.fechaApertura) },
	{ clave: "cierre", titulo: "Cierre", celda: (c) => fechaHora(c.fechaCierre) },
	{ clave: "ventas", titulo: "Ventas", numerica: true, celda: (c) => importe(c.totalVentas) },
	{ clave: "propinas", titulo: "Propinas", numerica: true, celda: (c) => importe(c.propinas) },
	{ clave: "diferencia", titulo: "Diferencia", numerica: true, celda: (c) => (c.diferencia == null ? "—" : importe(c.diferencia)) },
	{
		clave: "estado",
		titulo: "Estado",
		celda: (c) => (c.estatus === "abierto" ? <Insignia tono="exito">Abierta</Insignia> : <Insignia tono="neutro">Cerrada</Insignia>),
	},
];

function Hoy() {
	const [carga, recargar] = useCarga(() => pedirPanel<ResumenHoy>("/reportes/hoy"), "inicio admin: caja de hoy");
	const v = carga.estado === "listo" ? carga.datos.ventas : null;
	const comun = { estado: carga.estado, alReintentar: recargar } as const;
	const error = <EstadoError titulo="No pudimos traer la caja de hoy" descripcion="Vuelve a intentarlo en un momento." alReintentar={recargar} />;
	const vacio = (titulo: string) => <EstadoVacio icono={<Banknote />} titulo={titulo} descripcion="Aparecerán aquí con el primer cobro del día." />;
	const estadoTabla = carga.estado === "cargando" ? "cargando" : "listo";
	return (
		<>
			<div className={REJILLA_INDICADORES}>
				<Indicador {...comun} rotulo="Cobrado hoy" valor={v ? importe(v.cobrado) : undefined} detalle={v ? `${entero.format(v.pagos)} pagos` : undefined} className={INDICADOR_PROTAGONISTA} />
				<Indicador {...comun} rotulo="Propinas" valor={v ? importe(v.propinas) : undefined} />
				<Indicador {...comun} rotulo="Ticket medio" valor={v ? importe(v.ticketPromedio) : undefined} detalle={v ? `${entero.format(v.ordenesPagadas)} cuentas pagadas` : undefined} />
				<Indicador {...comun} rotulo="Comensales" valor={v ? entero.format(v.comensales) : undefined} />
			</div>
			<div className="grid grid-cols-1 items-start gap-(--espacio-xl) xl:grid-cols-2">
				<BloquePanel titulo="Por método de pago">
					<Tabla
						leyenda="Cobros de hoy por método de pago"
						columnas={columnasMetodo}
						filas={carga.estado === "listo" ? carga.datos.porMetodo : []}
						claveFila={(m) => m.metodo}
						estado={estadoTabla}
						error={carga.estado === "error" ? error : undefined}
						vacio={vacio("Todavía no hay cobros hoy")}
					/>
				</BloquePanel>
				<BloquePanel titulo="Por persona que cobró">
					<Tabla
						leyenda="Cobros de hoy por persona"
						columnas={columnasCajero}
						filas={carga.estado === "listo" ? carga.datos.porCajero : []}
						claveFila={(c) => c.nombre}
						estado={estadoTabla}
						error={carga.estado === "error" ? error : undefined}
						vacio={vacio("Todavía no hay cobros hoy")}
					/>
				</BloquePanel>
			</div>
		</>
	);
}

function Cortes() {
	const [carga, recargar] = useCarga(() => pedirPanel<Corte[]>("/caja/cortes"), "inicio admin: cortes de caja");
	return (
		<BloquePanel titulo="Cortes de caja" descripcion="Los veinte más recientes, de todo el personal.">
			<Tabla
				leyenda="Cortes de caja recientes"
				columnas={columnasCorte}
				filas={carga.estado === "listo" && Array.isArray(carga.datos) ? carga.datos : []}
				claveFila={(c) => c.id}
				estado={carga.estado === "cargando" ? "cargando" : "listo"}
				tablaDesde="lg"
				error={carga.estado === "error" ? <EstadoError titulo="No pudimos traer los cortes" descripcion="Vuelve a intentarlo en un momento." alReintentar={recargar} /> : undefined}
				vacio={<EstadoVacio icono={<Receipt />} titulo="Aún no hay cortes de caja" descripcion="Cada apertura y cierre de caja quedará registrado aquí." />}
			/>
		</BloquePanel>
	);
}

export function PanelCaja() {
	return (
		<div className="flex flex-col gap-(--espacio-xl)">
			<Hoy />
			<Cortes />
		</div>
	);
}
