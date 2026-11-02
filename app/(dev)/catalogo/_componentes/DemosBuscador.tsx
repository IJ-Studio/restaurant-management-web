"use client";

import { useCallback, useRef, useState } from "react";
import { Buscador, EstadoError, EstadoVacio } from "@/components/ui";
import { useBusquedaRemota, useFiltroLocal } from "@/hooks/useBusqueda";

const BASES = ["Enchiladas", "Mole", "Cecina", "Zacahuil", "Tamales", "Bocoles", "Pollo", "Sopa", "Cabrito", "Café", "Agua", "Pan"];
const DETALLES = ["huastecas", "de olla", "de Yecapixtla", "de la sierra", "de frijol", "en salsa verde", "con queso", "de temporada", "al horno", "de jamaica"];
/** 120 platillos de muestra, para que el filtrado tenga trabajo. */
const PLATILLOS = BASES.flatMap((b, i) => DETALLES.map((d, j) => ({ id: i * 100 + j, nombre: `${b} ${d}` })));
const nombreDe = (p: { nombre: string }) => p.nombre;

const CLIENTES = ["Ana López Hernández", "Luis Pérez", "Mariana Cruz del Ángel", "Jorge Hernández", "Familia Bautista", "Andrés Ángeles", "Lucía Martínez", "Ángel Reyes"];

function Rotulo({ children }: { children: string }) {
	return <code className="text-(length:--texto-pequeno) text-texto-tenue">{children}</code>;
}

function DemoFiltroLocal() {
	const [consulta, setConsulta] = useState("");
	const { filtrados, pendiente } = useFiltroLocal(PLATILLOS, consulta, nombreDe);
	const anuncio = !consulta.trim()
		? ""
		: filtrados.length
			? `${filtrados.length} ${filtrados.length === 1 ? "platillo" : "platillos"}`
			: `Sin resultados para «${consulta.trim()}»`;
	return (
		<div className="flex flex-col gap-4" data-prueba="filtro-local">
			<Buscador etiqueta="Buscar en la carta" etiquetaVisible valor={consulta} alCambiar={setConsulta} marcador="Mole, cecina, café…" ocupado={pendiente} anuncio={anuncio} />
			{filtrados.length ? (
				<>
					<p className="m-0 text-(length:--texto-pequeno) text-texto-secundario" aria-hidden="true">
						<span className="numeros-tabulares" data-prueba="cuenta-local">
							{filtrados.length}
						</span>{" "}
						de {PLATILLOS.length} platillos
					</p>
					<ul className={`m-0 flex list-none flex-col p-0 transition-opacity ${pendiente ? "opacity-60" : ""}`} data-prueba="lista-local">
						{filtrados.slice(0, 6).map((p) => (
							<li key={p.id} className="border-b border-borde-sutil py-2 last:border-b-0">
								{p.nombre}
							</li>
						))}
					</ul>
				</>
			) : (
				<EstadoVacio titulo={`Ningún platillo coincide con «${consulta.trim()}»`} descripcion="Prueba con otra palabra o quita las tildes." />
			)}
		</div>
	);
}

function DemoBusquedaRemota() {
	const [consulta, setConsulta] = useState("");
	const [cuentas, setCuentas] = useState({ peticiones: 0, canceladas: 0 });
	const latencia = useRef(0);

	// API simulada: tarda entre 0,4 y 1 s, respeta la cancelación y falla con «error».
	const buscar = useCallback(
		(q: string, senal: AbortSignal) =>
			new Promise<string[]>((resolver, rechazar) => {
				setCuentas((c) => ({ ...c, peticiones: c.peticiones + 1 }));
				latencia.current = (latencia.current + 1) % 3;
				let terminada = false;
				const espera = window.setTimeout(() => {
					terminada = true;
					if (q.toLowerCase().includes("error")) rechazar(new Error("fallo simulado"));
					else resolver(CLIENTES.filter((c) => c.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").includes(q.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, ""))));
				}, 400 + latencia.current * 300);
				senal.addEventListener("abort", () => {
					// Solo cuenta si de verdad cortó una petición en curso.
					if (terminada) return;
					window.clearTimeout(espera);
					setCuentas((c) => ({ ...c, canceladas: c.canceladas + 1 }));
					rechazar(new DOMException("cancelada", "AbortError"));
				});
			}),
		[],
	);

	const { estado, datos, anteriores } = useBusquedaRemota(consulta, buscar);
	const lista = datos ?? (estado === "buscando" || estado === "esperando" ? anteriores : null);
	const anuncio =
		estado === "lista" && datos ? (datos.length ? `${datos.length} ${datos.length === 1 ? "cliente" : "clientes"}` : `Sin clientes para «${consulta.trim()}»`) : estado === "error" ? "No se pudo buscar." : "";

	return (
		<div className="flex flex-col gap-4" data-prueba="busqueda-remota" data-estado={estado}>
			<Buscador
				etiqueta="Buscar cliente"
				etiquetaVisible
				valor={consulta}
				alCambiar={setConsulta}
				marcador="Nombre o apellido"
				ocupado={estado === "buscando" || estado === "esperando"}
				anuncio={anuncio}
				ayuda="Escribe al menos 2 letras. Se busca al dejar de escribir."
			/>
			<p className="m-0 text-(length:--texto-pequeno) text-texto-tenue numeros-tabulares" data-prueba="cuentas-remota">
				Peticiones: {cuentas.peticiones} · canceladas: {cuentas.canceladas}
			</p>
			{estado === "error" ? (
				<EstadoError titulo="No se pudo buscar" descripcion="Revisa la conexión y vuelve a escribir la búsqueda." />
			) : lista && lista.length ? (
				<ul className={`m-0 flex list-none flex-col p-0 transition-opacity ${estado === "lista" ? "" : "opacity-60"}`} data-prueba="lista-remota">
					{lista.map((c) => (
						<li key={c} className="border-b border-borde-sutil py-2 last:border-b-0">
							{c}
						</li>
					))}
				</ul>
			) : estado === "lista" ? (
				<EstadoVacio titulo={`Ningún cliente coincide con «${consulta.trim()}»`} />
			) : null}
		</div>
	);
}

/** Contenido de la sección «Buscador» del catálogo. */
export function DemosBuscador() {
	return (
		<div className="grid gap-10 lg:grid-cols-2">
			<div className="flex flex-col gap-3">
				<Rotulo>filtro local · useDeferredValue · 120 platillos</Rotulo>
				<DemoFiltroLocal />
			</div>
			<div className="flex flex-col gap-3">
				<Rotulo>búsqueda en el API · 300 ms sin teclear · AbortController</Rotulo>
				<DemoBusquedaRemota />
			</div>
		</div>
	);
}
