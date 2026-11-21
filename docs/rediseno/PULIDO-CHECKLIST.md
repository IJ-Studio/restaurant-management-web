# Pulido de la UI pública · checklist (ESPECIFICACION-WEB.md, «Etiqueta Clásica de Reserva»)

Rama `chore/pulido-ui-publica`. Segunda pasada (16-nov): cada casilla se cierra con evidencia, una línea de código (`archivo:línea`) o una captura de `_entrada/reportes/ui-web-publica/despues/` (`<ruta>-<tema>-<ancho>.png`). «No verificado» = no se pudo ver.

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
- [x] Solo estilos. Revisado el diff completo contra `developer` (37 archivos). Corregido: `loading="eager"` en `FotoAcceso` no era estilo y descargaba la foto en móvil, donde no se ve (revertido, `edc1024`). La lógica nueva que queda es de presentación y la permite la especificación (§ 4C: índice con sección activa y «volver arriba», `app/menu/page.tsx:191`, `components/carta/VolverArriba.tsx`). `data-testid`/`data-prueba` intactos.
- [x] Solo la parte pública. Corregido: `Imagen` y `PaginaEstado` se comparten con el panel (`features/dashboard/admin/comun/SubidaImagen.tsx:87`, `app/dashboard/not-found.tsx`, `app/dashboard/error.tsx`); el rótulo del respaldo y el marco de la ilustración ya no llegan allí (`styles/componentes.css:242` y `:887`, `905a0f1`). `EncabezadoPublico`, `EtiquetaSeccion`, `SelloCasa` y `.contenedor-pagina` no se usan en el panel (grep). Panel en pantalla: **no verificado** (sin cuenta de personal en local).
- [x] Sin rutas, pasos ni secciones nuevas. Los `template.tsx` de `app/menu`, `app/(auth)` y `app/(public)/(legales)` solo envuelven la transición de página (§ 5), no son rutas.
- [x] Tema claro por defecto (`lib/preferencias/preferencias.ts:24`, sin tocar); tokens nuevos en los dos temas y en `.sobre-fotografia` (`styles/tokens.css:9`, `:106`, `:144`); sin `dark:` (grep = 0).
- [x] Datos reales: ver § 2.
- [x] Sin pruebas; solo la auditoría estática (§ 8).
- [x] D-22: «vino», «bodega», «cava», «maridaje», «añada» en las líneas añadidas del diff: 0. Los nombres y descripciones de bebidas del API («Vino tinto con…») no se tocan.

## 1. Reglas de diseño
- [x] Sin hexadecimales en componentes públicos, sin `transition: all`, sin `bg-white`/`text-white` (grep = 0 en `app/menu`, `app/(public)`, `app/(auth)`, `components/{landing,carta,marca,auth}`); sin tamaños < 0,75rem (grep `text-[0.x rem]` y `font-size` = 0).
- [x] `bg-acento` solo con `text-texto-sobre-acento` (grep 8.1 = 0).
- [x] Cero cajas vacías: respaldo con molino y rótulo (`components/ui/Imagen.tsx:71`); `/menu` sin lámina en secciones sin foto (`app/menu/page.tsx`, `foto &&`); ficha sin foto en 3:2 por debajo de lg (`app/menu/producto/[id]/page.tsx:423`; captura `_menu_producto_9-claro-375.png`). Las cajas lisas de las capturas anteriores de `/menu` eran imágenes diferidas sin cargar (la cámara ahora desplaza antes).
- [x] Estados `al-pasar:`/`al-pulsar:` (`styles/globals.css:8`, `:18`) y `.zocalo-interactivo` cambia relleno y filete (`styles/componentes.css:198`) solo donde la tarjeta enlaza (carta) o la especificación lo pide (láminas de Nosotros); las tarjetas sin enlace quedan quietas (`baafec2`).
- [x] Áreas táctiles de 44 px: control de cantidad (`styles/componentes.css:307`, `2.75rem`), renglones con `min-h-11` (`components/carta/FilaCartaImpresa.tsx:27`), «volver arriba» `size-11`.
- [x] Contraste AA calculado con los tokens (fórmula WCAG): texto principal, secundario, tenue, acento y aviso sobre `--color-superficie-cartela` y `--color-superficie-cafe` ≥ 4,5:1 en los dos temas (mínimo 4,51: acento claro sobre café). Los filetes `--color-borde-acento(-fuerte)` son decorativos (como `--color-borde-sutil`); el control de cantidad usa `--color-borde-control` (≥ 3,12:1).

## 2. Datos reales
- [x] Pie de portada: dirección de `restaurant.config.ts` hasta la colonia, `hours.display` y `TelefonoSitio` (`components/landing/secciones/Portada.tsx:75`).
- [x] Cartela «Huejutla de Reyes · Hidalgo» y leyenda del sello (`SelloCasa.tsx:10`): dato de `config/restaurant.config.ts:20` («Huejutla de Reyes, Hidalgo»). Sin «CASA FUNDADA».
- [x] Sin plano: dirección real + «Cómo llegar» con el enlace existente.
- [x] Sin promociones inventadas: hoy hay 0 en `quijote_respaldo`. Verificado con una promoción **temporal** solo en la BD local (borrada al terminar): captura `_promociones-claro-1280.png`.
- [x] Contraetiquetas: precio, sección, alérgenos, «IVA incluido» (ya existían). Sin origen ni preparación.
- [x] «Pedido Nº …»: el id real (`app/menu/pedido/checkout/page.tsx:337`); en el pedido en curso, una sola vez y en su cartela (`3180156`).
- [x] Opciones bloqueadas de reserva sin cambios (`SelectorDiaHora` no se tocó).

## 3. Tokens y clases
- [x] `--color-borde-acento`, `--color-borde-acento-fuerte`, `--color-superficie-cartela` (`styles/tokens.css:9`, `:13`, `:106`).
- [x] Clases en `styles/componentes.css`: `.marco-etiqueta` :69, `.esquinas-imprenta` :84, `.ornamento-axial` :131, `.rombo-acento` :148, `.cartela-metadato` :158, `.capitular-etiqueta` :176, `.lider-puntos` :188, `.zocalo-interactivo` :198, `.lamina-fotografia` :216, `.fila-tabular` :273, `.pie-portada-tabular` :285, `.control-cantidad` :307.
- [x] Extras: `.numero-lote`, `.texto-rotulo`, `.secciones-legales` :252, `--velo-portada-radial`, `.portada__marco`.

## 4A. Primitivas
- [x] `Imagen`: respaldo café con molino y rótulo «El Quijote» solo dentro de `.lamina-fotografia` y en cajas ≥ 9rem.
- [x] `EtiquetaSeccion`: «Nº 01 · Anverso» + rótulo (`components/marca/EtiquetaSeccion.tsx:46`), filete doble, `h2` Fraunces con −0,015em.
- [x] `SelloCasa`: doble anillo y leyenda curva; única aparición en la landing (Reservas).
- [x] `MolinoQuieto` ya existía.

## 4B. Landing (capturas `_-{claro,oscuro}-{375,768,1280}.png`)
- [x] Portada: marco y marcas de imprenta, cartela con rombos, filete doble, botones existentes, pie tabular con horario en dos líneas parejas.
- [x] Nosotros: capitular, emblema en marco con «El Quijote» en una línea (antes se partía a 768), láminas I–III; de sm a lg, cartela sobre el nombre.
- [x] Selección: «Partida 01…», lámina 4:3, sección real, precio en cartela (`MenuLanding.tsx:47`).
- [x] Promociones: marco de etiqueta (`PromocionesLanding.tsx:24`), verificado con la promoción temporal local.
- [x] Reservas: banda café, marco, ornamento, sello, horario y teléfono reales, CTA existente.
- [x] Pedir: «Modalidad I/II» y filete vertical con rombo (`Pedir.tsx:36`, `:53`).
- [x] Visítanos: «Ficha de dirección» (`Visitanos.tsx:36`) y «Cómo llegar».

## 4C. Carta y ficha
- [x] `/menu/categoria/[slug]`: con foto → `TarjetaPlato`; sin foto → `FilaCartaImpresa` (`app/menu/categoria/[slug]/page.tsx:186`).
- [x] `/menu`: carta impresa con `.lider-puntos`, lámina, «Nº 0X», filete doble; índice y «volver arriba» (`app/menu/page.tsx:299`).
- [x] Ficha: lámina 4:5 con «Registro de carta» (`app/menu/producto/[id]/page.tsx:427`), contraetiqueta en cartela, `.control-cantidad` (`:506`). Capturas `_menu_producto_76-*` (con foto) y `_menu_producto_9-*` (sin foto).

## 4D. Pedido y pago (con sesión de prueba local)
- [x] Pestañas con filete doble (`Pestanas`, sin tocar).
- [x] Pedido en curso en marco con su identificador en cartela; renglones `.fila-tabular` con miniatura de 44 px (`app/menu/pedido/page.tsx:427`, `:459`). Nombre del plato sin truncar. Captura `_menu_pedido_domicilio-{claro,oscuro}-375.png`.
- [x] Pasos numerados tabulares con filete doble en el activo (`checkout/page.tsx:322`).
- [x] Resumen: marco, cartela «Pedido Nº», `.lider-puntos`, doble filete antes del total (`:443`), nota de Stripe con candado (`:405`, ya existía). Captura `_menu_pedido_checkout-claro-375.png`.
- [ ] Pedido en mesa con sesión: **no verificado** (exige elegir mesa y abrir comanda; no se creó para no tocar la operación de sala).
- [ ] Confirmación de pago (`/checkout/exito`) con datos: **no verificado** (exige un pago de Stripe).

## 4E. Resto
- [x] Login y registro: formulario en marco, foto en marco con lámina.
- [x] Recuperación: marco de etiqueta (`RecuperacionNoDisponible.tsx:17`). Captura `_frm_reset-*`.
- [x] Perfil con sesión: bloques en tarjeta quieta (`app/(auth)/profile/page.tsx:291`). Captura `_profile-claro-375.png`. Modo edición: no abierto en captura.
- [x] Reservas (`/reservations`): formulario en marco.
- [x] Legales: «§ 01…» y viñetas en acento. Captura `_privacidad-*`.
- [x] 404 y estados: ilustración en marco (solo en la parte pública).
- [x] Cabecera y pie: sin cambios.

## 5. Animaciones (revisadas con emil-design-eng)
- [x] Solo transform/opacity (y las propiedades `scale`/`translate` de Tailwind v4, que son transformaciones).
- [x] Pulsado de la tarjeta y entrada de «volver arriba» ahora sí transicionan (antes saltaban: `transform` no cubre `scale`/`translate`), `74a8a95`.
- [x] Movimiento reducido (sistema o panel): sin zoom de foto ni pulsado de tarjeta; transición de página con «movimiento completo».
- [x] Hover solo con `@media (hover: hover)`.

## 8. Auditoría estática
- [x] 8.1 `text-white` sobre acento: 0.
- [x] 8.2 `text-[9|10|11px]`: 0.
- [x] 8.3 Capturas 375/768/1280 en claro y oscuro: las 96 revisadas en hojas de contacto por ruta; las rutas cambiadas, recapturadas.

## Propuestas (no implementadas)
- Carta móvil con categorías plegables (`<details>` por sección y el índice abriendo la suya): exige estado en JS para que el índice abra la sección y para tenerlas abiertas en escritorio, y depende de la apertura automática de `<details>` al buscar en la página, que no es igual en todos los navegadores. No se logra limpiamente solo con estilos: queda como propuesta (ver BITACORA, bloque 4).
- Filtro o pestañas de categoría con lógica; plano de Huejutla; tiempos, origen y preparación; subtotal junto a la cantidad.
- Foto de acceso: prioridad de carga solo en escritorio (hoy diferida; en escritorio vuelve el aviso de LCP de Next).
