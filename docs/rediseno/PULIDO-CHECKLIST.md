# Pulido de la UI pública · checklist (ESPECIFICACION-WEB.md, «Etiqueta Clásica de Reserva»)

Rama `chore/pulido-ui-publica`. Cada casilla se marcó tras ver la captura (Playwright como cámara, datos reales de `quijote_respaldo`). «No verificado» = no se pudo ver con datos reales.

## Mapa de vistas de la especificación → rutas reales

| Especificación | Ruta / componente real |
|---|---|
| Landing | `app/(public)/page.tsx` + `components/landing/secciones/*` |
| Carta | `/menu` (`app/menu/page.tsx`) y `/menu/categoria/[slug]` |
| `/menu/[id]` (ficha) | `/menu/producto/[id]` |
| `/pedir` | `/menu/pedido` (pestañas En mesa / A domicilio) |
| `/pago` | `/menu/pedido/checkout` y `/menu/pedido/checkout/exito` |
| Login, registro, recuperación | `/login`, `/register`, `/frm_reset` y `/reset` (`RecuperacionNoDisponible`) |
| Perfil | `/profile` |
| Reservas | `/reservations` y panel lateral de la landing |
| Privacidad, eliminación de cuenta | `(legales)` con `PaginaLegal` |
| 404 y estados | `PaginaEstado` (todas las `not-found`, `error`, sistema) |

## 0. Reglas que mandan
- [x] Solo estilos: sin cambios de lógica, rutas, API, validaciones, dependencias ni configuración.
- [x] Solo la parte pública: los primitivos compartidos con el panel (`Boton`, `Tarjeta`, `Campo`, `Pestanas`, `EstadoVacio`) no se tocaron.
- [x] Sin rutas, pasos ni secciones nuevas.
- [x] Tema claro por defecto, mecanismo intacto; tokens nuevos en ambos temas (y en `.sobre-fotografia`); sin `dark:`.
- [x] Datos reales: nada inventado (ver § 2).
- [x] Sin pruebas; solo la auditoría estática (§ 8).
- [x] Sin léxico vitivinícola en textos nuevos (D-22). Los nombres y descripciones de bebidas vienen del API y no se tocan.

## 1. Reglas de diseño
- [x] Tokens en `tokens.css` y clases en `componentes.css`; sin hexadecimales en componentes, sin tamaños < 0,75rem, sin `transition: all`.
- [x] `bg-acento` solo con `text-texto-sobre-acento` (grep = 0).
- [x] Cero cajas vacías: respaldo de `Imagen` con molino y rótulo «El Quijote»; en `/menu` las secciones sin ninguna foto ya no pintan la lámina vacía.
- [x] Estados con `al-pasar:`/`al-pulsar:` (existen) y `.zocalo-interactivo`, que cambia relleno y filete.
- [x] Áreas táctiles de 44 px (control de cantidad, renglones de carta impresa con `min-h-11`, enlaces existentes).

## 2. Datos reales
- [x] Pie de portada: dirección y horario de `restaurant.config.ts` y teléfono editable (`TelefonoSitio`). 3 columnas.
- [x] Cartela de portada: «Huejutla de Reyes · Hidalgo» (dato de la configuración). Sin «CASA FUNDADA»: no hay año de fundación real.
- [x] Sin plano de Huejutla: dirección real + «Cómo llegar» (enlace existente a Google Maps). Plano → propuesta.
- [x] Sin promociones inventadas: hoy hay 0; la sección conserva su frase honesta (estilo de marco preparado, **no verificado con datos**).
- [x] Contraetiquetas solo con datos reales: precio, sección, alérgenos e «IVA incluido» (ya existían). Sin origen ni preparación (el API no los da).
- [x] Opciones bloqueadas de reserva siguen visibles con su motivo (sin cambios en `SelectorDiaHora`).

## 3. Tokens y clases
- [x] `--color-borde-acento`, `--color-borde-acento-fuerte`, `--color-superficie-cartela` (oscuro `#191410`, claro `#F9F5EE`).
- [x] `.marco-etiqueta` / `__interior`, `.esquinas-imprenta` / `__cruz`, `.ornamento-axial`, `.rombo-acento`, `.cartela-metadato`, `.capitular-etiqueta`, `.lider-puntos`, `.zocalo-interactivo`, `.lamina-fotografia`, `.fila-tabular`, `.pie-portada-tabular`, `.control-cantidad`.
- [x] Extras: `.numero-lote`, `.texto-rotulo`, `.secciones-legales` (§ 01…), `--velo-portada-radial`, `.portada__marco`.

## 4A. Primitivas
- [x] `Imagen`: respaldo café con molino y rótulo «El Quijote» (solo en cajas ≥ 9rem).
- [x] `EtiquetaSeccion`: «Nº 01 · Anverso» + rótulo en la misma línea, filete doble, título y entradilla.
- [x] `SelloCasa`: doble anillo, anillo interior y leyenda curva con datos reales; única aparición en la landing (Reservas).
- [x] `MolinoQuieto` ya existía (no se creó).

## 4B. Landing
- [x] Portada: marco perimetral con marcas de imprenta, bloque axial centrado, cartela con rombos, filete doble, botones existentes, pie tabular.
- [x] Nosotros: capitular sobre el texto editable, emblema en marco de etiqueta, láminas I–III según las fotos reales.
- [x] Selección (Menú): «Partida 01…», lámina 4:3, sección real, precio en cartela.
- [x] Promociones: marco de etiqueta en `TarjetaPromocion` (también `/promociones`). **No verificado con datos** (0 promociones).
- [x] Reservas: banda café, marco centrado, ornamento axial, sello, horario y teléfono reales, CTA existente.
- [x] Pedir: dos etiquetas gemelas con «Modalidad I/II» y filete vertical con rombo en escritorio. Sin franja de tiempos (no hay datos).
- [x] Visítanos: «Ficha de dirección» en marco con contraetiqueta (dirección, horario, teléfono, WhatsApp) y «Cómo llegar».

## 4C. Carta y ficha
- [x] `/menu/categoria/[slug]`: con foto → contraetiquetas (`TarjetaPlato`); sin foto → carta impresa (`FilaCartaImpresa`, 2 columnas desde md, filete de acento, línea de puntos).
- [x] `/menu`: renglones de carta impresa con `.lider-puntos`, lámina de sección, «Nº 0X» y filete doble; índice y «volver arriba» intactos.
- [x] Ficha: lámina 4:5 en marco con «Registro de carta» y «Lámina Nº {id}», sección en Fraunces itálica, contraetiqueta en cartela, `.control-cantidad`. Sin subtotal (la página no lo calcula: no se añade).

## 4D. Pedido y pago
- [x] Pestañas con filete doble (ya existía en `Pestanas`).
- [x] Pedido en curso en marco de etiqueta con cartela «Nº …» real; ya enviados en tarjetas atenuadas; renglones `.fila-tabular` con miniatura de 44 px.
- [x] Indicador de pasos: números tabulares, filete doble y acento en el activo; mismos 5 pasos.
- [x] Resumen: marco, cartela del pedido, `.lider-puntos`, doble filete antes del total; nota de Stripe con candado (ya existía).
- [ ] Pedido y pago con sesión real: **no verificado en pantalla** (requieren sesión de cliente y pedido; se vio el estado sin sesión).

## 4E. Resto
- [x] Login y registro: formulario en marco, foto en marco con lámina.
- [x] Recuperación: marco de etiqueta.
- [x] Perfil: bloques en zócalo; en edición, marco de etiqueta. **No verificado con sesión.**
- [x] Reservas (`/reservations`): formulario en marco.
- [x] Legales (privacidad, eliminación de cuenta…): apartados «§ 01…».
- [x] 404 y estados: ilustración en marco de etiqueta.
- [x] Cabecera y pie: revisados sin cambios (ya siguen el sistema).
- [x] Confirmación de pago: marco, cartela y sello.

## 5. Animaciones
- [x] Solo transform/opacity en lo nuevo; zoom de lámina 1,025 al pasar (240 ms, ease-salida); pulsado de tarjeta y del control de cantidad; revelado al entrar y transición de página ya existentes; esqueletos existentes; movimiento reducido respetado vía tokens.

## 8. Auditoría estática
- [x] `text-white` sobre acento: 0 coincidencias.
- [x] `text-[9|10|11px]`: 0 coincidencias.
- [x] Capturas finales 375/768/1280 en claro y oscuro: `_entrada/reportes/ui-web-publica/despues/`.

## Propuestas (no implementadas)
- Filtro o pestañas de categoría que cambien la lógica de la carta; categorías plegables en móvil.
- Plano grabado de Huejutla (requiere geografía real).
- Franja de tiempos estimados, origen y preparación en contraetiquetas (el API no los entrega).
- Subtotal junto al control de cantidad (hoy no se calcula).
- `/menu` en móvil sigue en ~20 000 px (33 secciones × 4 platos con foto de sección): compactarlo más exigiría ocultar contenido o cambiar la estructura.
