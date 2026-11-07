const entero = new Intl.NumberFormat("es-MX");

/** «1 registro», «3 registros»: la cifra con su sustantivo concordado (PLAN 5.7). */
export function contar(n: number, singular: string, plural = `${singular}s`): string {
	return `${entero.format(n)} ${n === 1 ? singular : plural}`;
}
