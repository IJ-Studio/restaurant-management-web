import { Contraetiqueta } from "@/components/marca/Contraetiqueta";
import { EtiquetaSeccion } from "@/components/marca/EtiquetaSeccion";
import { SelloCasa } from "@/components/marca/SelloCasa";
import { BotonEnlace } from "@/components/ui";
import { Muestra } from "./Muestra";

function Rotulo({ children }: { children: string }) {
	return <code className="text-(length:--texto-pequeno) text-texto-tenue">{children}</code>;
}

/** Contenido de la sección «Piezas de marca» del catálogo. */
export function DemosMarca() {
	return (
		<div className="flex flex-col gap-10">
			<div className="flex flex-col gap-3">
				<Rotulo>EtiquetaSeccion · sobre el fondo</Rotulo>
				<Muestra ancho>
					<EtiquetaSeccion
						lote={3}
						rotulo="La carta"
						titulo="Cocina de la Huasteca, a fuego lento"
						entradilla="Recetas de la sierra hidalguense con producto de temporada: zacahuil los domingos, cecina de Yecapixtla y café de altura."
						nivel={3}
					/>
				</Muestra>
			</div>

			<div className="flex flex-col gap-3">
				<Rotulo>EtiquetaSeccion centrada · banda café con el sello (una vez por página)</Rotulo>
				<Muestra ancho>
					<div className="flex flex-col items-center gap-8 rounded-tarjeta bg-superficie-cafe px-6 py-12" data-prueba="banda-reservar">
						<SelloCasa className="text-texto-principal" />
						<EtiquetaSeccion
							lote={5}
							rotulo="Reservar"
							titulo="Tu mesa te espera"
							entradilla="Reserva en línea y te confirmamos por correo en unos minutos."
							alinear="centro"
							nivel={3}
						/>
						<BotonEnlace href="#marca">Reservar mesa</BotonEnlace>
					</div>
				</Muestra>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<div className="flex flex-col gap-3">
					<Rotulo>Contraetiqueta · una columna, valor en dos líneas</Rotulo>
					<Muestra ancho>
						<Contraetiqueta
							pares={[
								{ rotulo: "Origen", valor: "Huejutla de Reyes, Hidalgo", tipo: "texto" },
								{ rotulo: "Maridaje", valor: "Tinto joven de Querétaro o agua de jamaica con un toque de chile", tipo: "texto" },
								{ rotulo: "Alérgenos", valor: "Ninguno declarado", tipo: "texto" },
								{ rotulo: "Tiempo", valor: "25 min" },
								{ rotulo: "Precio", valor: "$ 320" },
							]}
						/>
					</Muestra>
				</div>
				<div className="flex flex-col gap-3">
					<Rotulo>Contraetiqueta · dos columnas desde 768 px</Rotulo>
					<Muestra ancho>
						<Contraetiqueta
							columnas={2}
							pares={[
								{ rotulo: "Fecha", valor: "Sáb 14 nov", tipo: "texto" },
								{ rotulo: "Hora", valor: "21:00 h" },
								{ rotulo: "Personas", valor: "4" },
								{ rotulo: "Mesa", valor: "Terraza 2", tipo: "texto" },
								{ rotulo: "Anticipo", valor: "$ 400" },
								{ rotulo: "Estado", valor: "Confirmada", tipo: "texto" },
							]}
						/>
					</Muestra>
				</div>
			</div>

			<div className="flex flex-col gap-3">
				<Rotulo>filete-doble · 3rem, nunca recortado</Rotulo>
				<span aria-hidden="true" className="filete-doble" data-prueba="filete-doble" />
			</div>
		</div>
	);
}
