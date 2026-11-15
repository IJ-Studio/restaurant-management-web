/** Catálogos del SAT (CFDI 4.0) que acepta el API al pedir una factura. */
export const USOS_CFDI = [
	{ valor: "G01", texto: "G01 · Adquisición de mercancías" },
	{ valor: "G03", texto: "G03 · Gastos en general" },
	{ valor: "S01", texto: "S01 · Sin efectos fiscales" },
];

export const REGIMENES_FISCALES = [
	{ valor: "601", texto: "601 · General de Ley Personas Morales" },
	{ valor: "603", texto: "603 · Personas Morales con Fines no Lucrativos" },
	{ valor: "605", texto: "605 · Sueldos y Salarios" },
	{ valor: "606", texto: "606 · Arrendamiento" },
	{ valor: "612", texto: "612 · Personas Físicas con Actividades Empresariales" },
	{ valor: "616", texto: "616 · Sin obligaciones fiscales" },
	{ valor: "621", texto: "621 · Incorporación Fiscal" },
	{ valor: "626", texto: "626 · Régimen Simplificado de Confianza" },
];
