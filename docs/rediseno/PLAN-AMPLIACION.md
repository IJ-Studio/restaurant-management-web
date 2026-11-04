# Plan de ampliación del rediseño — El Quijote

> Único documento de plan nuevo de la web. Amplía `PLAN.md` (fases 0 a 7) con las decisiones D-22 a D-38 del usuario (2026-11-03). El detalle de cada paso va a [`BITACORA.md`](BITACORA.md); el progreso del API y de lo legal se lleva fuera de los repositorios. Ningún detalle de vulnerabilidades ni contenido de documentos privados aparece aquí.

## ESTADO ACTUAL Y SIGUIENTE PASO

| Campo | Valor |
|---|---|
| Fecha | 2026-11-03 |
| Rama activa | `feature/rediseno-web-admin` (cierre de la fase 5 y frontend de la ampliación) |
| Paquete en curso | **P0 · Cierre de la fase 5** (WebKit en curso) y **P2** (hecho en este commit) |
| Último paso completado | P2: clasificación D-38 (265 elementos), `INVENTARIO-API.md` y comprobación del menú de la landing. P1 en `44b7eae`. |
| Siguiente paso | P0 (WebKit, catálogo en dev, invisibles, bundle, audit, lint) y después P3 (D-22, D-23). |
| Bloqueos | Ninguno. 2.5 (aplicar la CSP) y NP-47 siguen sin ejecutarse por orden del usuario. |
| Avisos | Repo del API con `HEAD` dañado en la copia local (se diagnostica en P7, sin reescribir nada). |
| Decisiones del usuario pendientes | Ver § Pendientes para el usuario. |

> Este bloque se actualiza en el mismo commit que cierra cada paso.

---

## Decisiones nuevas (2026-11-03)

Sustituyen a lo anterior donde choquen (incluidas la regla 6 del PLAN, «solo UI» y «sin cambiar URL de ruta»), solo en lo que indican.

| ID | Decisión | Paquete |
|---|---|---|
| D-22 | **Identidad.** Restaurante de comida mexicana (Huejutla de Reyes, Hidalgo, según `config/restaurant.config.ts`). El enfoque es la comida; el vino es una bebida más, sin especialización. Se retiran «cocina española», «Bodega», carta de vinos y maridajes de PRODUCT.md, los textos de DESIGN.md (no los tokens), landing, `/about`, `/promociones`, introducciones de `/menu` y `/reservations`, login, registro, pie, páginas de sistema, metadatos y configuración. El lenguaje gráfico (lote, filete doble, contraetiqueta) se mantiene sin texto de vinos. Sin datos inventados. | P3 |
| D-23 | **Imágenes propias.** Solo la nube `dcb1tspbj` (inventario de ESTADO §8.1, sin las marcadas en NP-33) o archivos locales. Fuera el fondo `food-3955317` y cualquier referencia a Pixabay, Unsplash, pravatar, Google u otro tercero (también en mocks, `hosts-permitidos.ts` y `next.config.ts`). Cada URL con `curl -I` y recorrido sin imágenes rotas. Sin MCP de Cloudinary. | P3 |
| D-24 | **Sin datos de prueba** en administración y operación: fuera los mocks, `dataService`, los datos de `restaurantData` que hagan de motor, `settingsMock`, `reportsMock`, `financeMock`, `cajeroMock` y equivalentes, y toda cifra o gráfica inventada. Sin endpoint o sin datos: `EstadoVacio`. Se retira la insignia «Datos de ejemplo». | P5, P8 |
| D-25 | **Sin emojis** en código, textos y datos del API pintados (se sustituyen por iconos Lucide si aportan). `pnpm revisar:emojis` (pictogramas extendidos y secuencias con U+200D) entra en la definición de terminado de cada fase. | P5 |
| D-26 | **Gráficas** solo donde representen datos que la pantalla ya muestra; dibujan datos ya calculados (el cálculo vive en la capa de datos o en el API). | P5 |
| D-27 | **Administrador simplificado.** Fuera adornos, textos y títulos sin valor; pestañas redundantes unificadas. «Reportes» se integra en el Dashboard de inicio; «Nóminas» y «Caja y propinas» pasan a ser paneles del Dashboard general. | P4 |
| D-28 | **Plantilla única de panel** (encabezado, indicadores, contenido, carga, vacío y error) con jerarquía, filtros y paginación. | P4 |
| D-29 | **Navegación** sin ítems ocultos ni colapsables; subítems siempre visibles; navegación que funcione en móvil; paneles responsivos desde 360 px. | P4 |
| D-30 | **«Sistema» eliminado:** Predicción, Rendimiento de BD, Configuración (Ajustes) y Acerca del restaurante salen de la navegación; rutas, código y dependencias exclusivas, con `git rm`. Quedan sin efecto 5.12, 5.14, 5.15, 5.16, NP-18 y NP-24. | P4 |
| D-31 | **Platillos.** Miniatura actual y actualización de imagen funcionando (reutilizar cómo sube la móvil o el API; si no existe, endpoint de firma en el API y subida firmada con validación de tipo, tamaño y firma de bytes). Agotar y eliminar llegan al servidor. | P5, P7 |
| D-32 | **Backend real.** Todas las llamadas de la web funcionan contra el API real ([`INVENTARIO-API.md`](INVENTARIO-API.md)). Lo que falte se crea en el API de forma aditiva. Las rutas de `app/api` con BD directa se migran al API y se borran del front junto con `lib/db`, drizzle, `pg`, `bcrypt`, `firebase-admin` y `googleapis`, solo con el reemplazo probado. | P7, P8 |
| D-33 | **Paridad con la móvil.** Con la estructura fijada, `PARIDAD-MOVIL-WEB.md` con la matriz de diferencias y la lista de cambios que tendría que adoptar la móvil (repo de la móvil solo lectura). | P6 |
| D-34 | **Reportar un problema** desde todas las pantallas, en un `PanelLateral`: tipo, descripción y ruta automática; zod, campo trampa, sin doble envío, sin datos sensibles. Endpoint aditivo en el API; sin él, error cálido y nunca éxito fingido. | P5, P7 |
| D-35 | **Landing:** `scroll-snap-type: y proximity` y aspas del molino girando, solo con movimiento permitido (sistema y panel de accesibilidad); teclado, táctil y secciones altas sin trabas. Comprobación de que el menú de la landing no enlaza a otras rutas salvo «Ver la carta completa». | P2, P5 |
| D-36 | **Legal para México.** Páginas legales y elementos de interfaz según el documento legal público; consentimientos y enlace al aviso de privacidad en cada formulario con datos personales; lo no cubierto, pendiente de revisión legal (fuera del repo). Lo que requiera backend va al paquete del API. | P5, P7 |
| D-37 | **QR de la app de operaciones** en la interfaz del personal operativo, desde `config/app-operaciones.ts` (ruta vacía: el bloque no se muestra). Sin URL inventada. | P5 |
| D-38 | **Pendientes diagnosticados:** todos los hallazgos de ESTADO (resumen, §1–16 y anexos A–D), todas las NP, los pasos del PLAN sin ejecutar, los «no verificado» de la bitácora y las decisiones abiertas reciben etiqueta (a) frontend, (b) API o BD, (c) decisión del usuario o del restaurante, o coordinación con la móvil, o (d) obsoleto o resuelto. Se ejecutan (a) y (b) por prioridad: seguridad, accesibilidad, datos reales, rendimiento y limpieza. | P2 y siguientes |

**Se mantienen:** sin push, pull, fetch, fusiones ni rebase (salvo API-1 en el API); 2.5 sin ejecutar; NP-47 sin activar; sin `.env`; sin Lighthouse ni scripts de rendimiento; un proceso pesado a la vez; `NODE_OPTIONS=--max-old-space-size=3072` en los builds.

**Definición de terminado de cada fase (ampliada):** build, Chromium, Firefox y WebKit, catálogo, `revisar:invisibles`, `revisar:emojis`, revisión del bundle y `pnpm audit`; en cada pantalla 360, 390, 768, 1024 y 1440 px, ambos temas y texto al 125 %, axe sin violaciones, sin errores de consola, peticiones fallidas ni imágenes rotas.

---

## Paquetes de trabajo

Orden del usuario: (a) P0 y P1 · (b) P2 · (c) P3 · (d) P4 · (e) P5 · (f) P6 · (g) P7 · (h) P8 · (i) P9. Si una dependencia técnica obliga a cambiar el orden, se anota aquí.

### P0 · Cierre de la fase 5 — `feature/rediseno-web-admin`

- [ ] P0.1 WebKit en producción: públicas y recorrido.
- [ ] P0.2 Catálogo en dev en Firefox y WebKit.
- [ ] P0.3 `pnpm revisar:invisibles`, revisión del bundle, `pnpm audit` y lint global.
- [ ] P0.4 Entrada de cierre en la bitácora.
- **Aceptación:** las cuatro baterías en verde en los tres motores o cada fallo explicado; el recuento de lint y audit queda en la bitácora.

### P1 · Seguridad de la documentación

- [x] P1.1 Originales de ESTADO y NOTAS copiados fuera del repo, con el registro de lo retirado.
- [x] P1.2 NOTAS: NP-01 a NP-11, NP-15, NP-20 a NP-22, NP-31 y NP-32 en texto genérico. ESTADO: resumen de seguridad, §14, anexo C y los códigos de `/api` sin sesión del anexo D en texto genérico.
- [x] P1.3 PLAN y `config/seguridad/rutas-api-publicas.ts` sin detalle de lo que falta en una ruta abierta.
- **Aceptación:** `rg` de rutas sin comprobación, secretos, commits del historial con secretos, contraseñas por defecto y líneas explotables en `docs/`, `config/` y el código no devuelve detalle de vulnerabilidades abiertas.
- **Aviso al usuario:** las ramas ya publicadas conservan los documentos anteriores (ver § Pendientes para el usuario).

### P2 · Clasificación, inventario del API y menú de la landing

- [x] P2.1 Clasificación de todos los pendientes (§ Clasificación D-38).
- [x] P2.2 [`INVENTARIO-API.md`](INVENTARIO-API.md): cada llamada de la web, su ruta en el API, si la usa la móvil y qué falta.
- [x] P2.3 Comprobación del menú de la landing (D-35).
  - **Resultado:** los siete enlaces de la cabecera (`ENLACES_CABECERA`) son anclas `/#…`; ninguno lleva a otra ruta. Dentro de las secciones sí hay enlaces a otras rutas: Nosotros → `/about`, Promociones → `/promociones`, Reservas → «Abrir en su propia página» (`/reservations`) y Pedir → `/menu` y `/menu/pedido?tab=domicilio`, además de «Ver la carta completa» → `/menu`.
  - **Decisión conservadora (se ejecuta en P5.6):** se retiran los enlaces de Nosotros, Promociones y Reservas, porque la sección ya muestra ese contenido o su flujo (`ReservarEnPanel`). Se conservan las dos acciones de Pedir, que son páginas de acción (PRODUCT.md, principio 1: las acciones viven en páginas propias); si el usuario prefiere quitarlas, es una línea por botón. Las páginas `/about`, `/promociones` y `/reservations` siguen existiendo (D-08).

### P3 · Identidad e imágenes (D-22, D-23)

- [ ] P3.1 PRODUCT.md (integra el cambio del usuario en Positioning) y textos de DESIGN.md sin vinos ni cocina española.
- [ ] P3.2 Landing, `/about`, `/promociones`, introducciones de `/menu` y `/reservations`, login, registro, pie, páginas de sistema, metadatos y `restaurant.config.ts`: comida mexicana, sin «Bodega», carta de vinos ni maridajes. Ilustración `LlaveBodega` renombrada si su texto o nombre habla de bodega.
- [ ] P3.3 Fondos de login y registro con imagen propia de la nube (`image_l57jar`, comprobada con `curl -I`); fuera `food-3955317` y `meal-4840665` (nombres de banco de fotos) del código, los mocks, las pruebas y el catálogo; `hosts-permitidos.ts` y `next.config.ts` sin terceros.
- **Aceptación:** `rg -i "españ|vino|bodega|marida|sommelier|pixabay|unsplash|pravatar|googleusercontent|food-3955317|meal-4840665"` en `app components features lib config` solo devuelve el nombre del sistema de diseño en DESIGN.md o tokens; 0 imágenes rotas.

### P4 · Estructura del administrador (D-30, D-29, D-27, D-28)

- [ ] P4.1 D-30: `git rm` de Predicción, Rendimiento de BD, Ajustes y Acerca de (rutas, `features/`, pruebas, mocks y dependencias exclusivas, p. ej. `recharts` si solo lo usa Predicción).
- [ ] P4.2 D-27: Reportes integrado en el inicio; Nómina y Caja y propinas como paneles del inicio; pestañas redundantes unificadas.
- [ ] P4.3 D-29: navegación sin colapsables y usable en móvil (barra inferior o cajón con subítems visibles); 360 px sin desbordes.
- [ ] P4.4 D-28: plantilla única de panel aplicada a admin, caja, mesero y cocina.
- **Aceptación:** ninguna ruta borrada responde 200; la navegación de cada rol no tiene ítems ocultos; axe 0 y sin desbordes de 360 a 1440 px.

### P5 · Frontend de la ampliación y pendientes (a)

- [ ] P5.1 D-24 (lado front): fuera mocks, `dataService` y cifras inventadas; `EstadoVacio` donde no haya endpoint.
- [ ] P5.2 D-25: emojis fuera y `pnpm revisar:emojis`.
- [ ] P5.3 D-26: gráficas solo con datos ya calculados.
- [ ] P5.4 D-31 (front): miniatura, subida firmada con `verificarArchivo`, agotar y eliminar contra el API.
- [ ] P5.5 D-34: «Reportar un problema».
- [ ] P5.6 D-35: scroll-snap y aspas del molino con movimiento permitido.
- [ ] P5.7 D-37: bloque del QR con `config/app-operaciones.ts`.
- [ ] P5.8 D-36: legales y consentimientos según el documento legal público.
- [ ] P5.9 Pendientes (a) por prioridad: seguridad, accesibilidad, datos reales, rendimiento y limpieza.

### P6 · Paridad móvil-web (D-33)

- [ ] P6.1 `PARIDAD-MOVIL-WEB.md`: matriz de diferencias y cambios que tendría que adoptar la móvil.

### P7 · API (`restaurant-management-api`)

- [ ] P7.0 Diagnóstico de la copia local (`HEAD` dañado) sin reescribir nada.
- [ ] API-1 Autoría (rama nueva; solo los commits del autor que indicó el usuario, si es inequívoco; sin push).
- [ ] API-2 Correcciones de los documentos de entrada y pendientes (b), aditivas y compatibles con la móvil, cada una con pruebas y commit; migraciones como archivos con su reversa, sin aplicar.
- [ ] P7.x Endpoints aditivos de D-31 (firma de subida), D-34 (reportes), promociones y lo que marque `INVENTARIO-API.md`.
- **Aceptación:** pruebas del API en verde; `/ponytail-review` al cerrar cada paquete; nada contra la BD real.

### P8 · Conexión de la web con el API (D-32)

- [ ] P8.1 Cada pantalla contra el API real (sin mocks).
- [ ] P8.2 Retirada de `app/api` con BD, `lib/db`, `drizzle/`, `pg`, `drizzle-orm`, `drizzle-kit`, `bcrypt` y `googleapis`, solo con su reemplazo probado.

### P9 · Fases 6 y 7 del PLAN (solo lo comprobable sin el usuario)

- [ ] 6.1 a 6.4 (`feature/rediseno-web-pulido`).
- [ ] 7.1, 7.2, 7.4 (salvo dispositivos reales y lectores de pantalla), 7.5 y 7.6 sin abrir PR (`feature/rediseno-web-auditoria`).

---

## Pendientes para el usuario

| Tema | Qué hace falta |
|---|---|
| Ramas publicadas | Las ramas `feature/rediseno-web*` de `origin` conservan versiones anteriores de ESTADO y NOTAS. Decidir cómo tratarlas antes de publicar nada más (detalle fuera del repo). |
| 2.5 | Aprobar la aplicación de la CSP (requiere probar el pago con Stripe con claves y backend). |
| NP-47 | Cierre de sesión por inactividad: sigue sin activar. |
| NP-33 | Fotografía propia (sala, fachada, platos); la portada usa la foto generada recortada (marca de agua fuera en la entrega). |
| Datos del restaurante | Cifras de `restaurantConfig.stats`, horario, dirección, teléfono, redes e historia por confirmar. |
| Publicación del API | Historial reescrito de API-1: publicar o no lo decide el usuario. |

---

## Clasificación D-38

Leyenda: **(a)** frontend o interfaz, se ejecuta en esta tanda · **(b)** API o BD, paquete del API con compatibilidad con la móvil · **(c)** decisión del usuario, dato del restaurante o coordinación con la móvil: no se ejecuta · **(d)** obsoleto o ya resuelto (se indica por qué). La columna «Dónde» remite al paquete. «Fases 1–5» significa resuelto por el PLAN original y comprobado contra el código el 2026-11-03.

### Notas pendientes (NP)

| NP | Tema | Etiqueta | Dónde / motivo |
|---|---|---|---|
| NP-01 | Rutas internas con BD | b | D-32 · P7, P8 |
| NP-02 | Secreto de firma | c | La rotación la hace el usuario (tarea manual); el front deja de depender del secreto compartido con D-32 (b) |
| NP-03 | Alta de usuarios y credenciales | b | P7; la UI quita el campo de contraseña cuando el API lo permita (P8) |
| NP-04 | Sesión en cookie HttpOnly | c | Cambia lo que ve la móvil (token Bearer): requiere coordinación; opción BFF propuesta en P8 |
| NP-05 | Autorización por propietario | b | P7; el front envía el token (P8) |
| NP-06 | Validación en el servidor | b | P7 |
| NP-07 | Límites de peticiones | b | P7, solo con límites compatibles con la móvil |
| NP-08 | Subidas firmadas | b | D-31 · P7 |
| NP-09 | Claves de pasarela | d | Campos retirados en 5.14 y pantalla eliminada por D-30 |
| NP-10 | Respaldos fuera del front | b | D-32 · P7, P8 |
| NP-11 | Facturación en el servidor | b | P7 (webhook) |
| NP-12 | Mocks y `localStorage` como motor | d | Sustituida por D-24 (se ejecuta en P5 y P8) |
| NP-13 | Posicionamiento | d | Resuelta por D-22 |
| NP-14 | Carta de vinos | d | Cancelada por D-22 y D-30 |
| NP-15 | Mensajes genéricos de autenticación | b | Front ya genérico (fase 4, se verifica en P5.9); el API, en P7 |
| NP-16 | Recuperación de contraseña | c | Requiere envío de correo y decisión de producto |
| NP-17 | Endpoints mal apuntados | a | P5.9 y `INVENTARIO-API.md` |
| NP-18 | Ajustes y «acerca de» | d | Cancelada por D-30 |
| NP-19 | `/dashboard/cliente` | a | P5.9: el rol cliente va a `/profile` (decisión conservadora) |
| NP-20 | Cupones | b | P7; la ruta interna desaparece en P8 |
| NP-21 | TLS a la BD | b | Desaparece con D-32 (P8) |
| NP-22 | Script de instalación | a | P5.9: solo variables públicas |
| NP-23 | Inactividad | c | Igual que NP-47: sin activar por orden del usuario |
| NP-24 | Rendimiento de BD | d | Cancelada por D-30 |
| NP-25 | Scripts de BD en la raíz | a | P8 (se retiran con D-32, versionados) |
| NP-26 | Integración continua | c | Toca GitHub (acciones y protección de ramas): decisión del usuario |
| NP-27 | HSTS preload y cortafuegos | c | Configuración de Vercel y dominio |
| NP-28 | Entorno local | c | Equipo del usuario |
| NP-29 | `PaymentElement` | c | Cambio de integración con Stripe; necesita claves |
| NP-30 | Ideas de producto | c | Historias de usuario; la de maridajes, (d) por D-22 |
| NP-31 | Librería de hojas de cálculo | c | Decisión D-06 vigente; alternativa: parseo en el API |
| NP-32 | Autorización por rol | b | P7 |
| NP-33 | Calidad de imágenes | c | Material del restaurante |
| NP-34 | Limpiador de service workers | c | Se retira tras un plazo prudente |
| NP-35 | Código huérfano | a | P5.9 (limpieza) |
| NP-36 | Orígenes de imagen | a | P3.3; Supabase queda hasta confirmar con datos reales (c) |
| NP-37 | Navegación de mesero, caja y cocina | a | P4.3 (se recortan las entradas a rutas inexistentes) |
| NP-38 | `firebase-admin` | d | Resuelta el 2026-11-03 |
| NP-39 | Caracteres de control | a | P5.9 |
| NP-40 | `console.log` de servidor | b | Desaparece con D-32 |
| NP-41 | Cookies del cierre de sesión | d | Resuelta el 2026-11-03 |
| NP-42 | «Cerrar sesión» en el menú móvil | d | Resuelta en 4.1 |
| NP-43 | Posicionamiento y datos | d | Cancelada por D-22; los datos por confirmar pasan a § Pendientes para el usuario |
| NP-44 | Cifras del inicio | b | P7 (aditivo a `/dashboard/admin/stats`) |
| NP-45 | Caja, propinas y facturas | b | P7 (la móvil ya usa `/caja/*`) |
| NP-46 | Imágenes y cambios de la carta | d | Sustituida por D-31 (se ejecuta en P5.4 y P7) |
| NP-47 | `IdleLogout` | c | Sin activar por orden del usuario |

### Pasos del PLAN sin ejecutar y decisiones abiertas

| Paso | Etiqueta | Motivo |
|---|---|---|
| 2.5 Aplicar la CSP | c | Pendiente de aprobación |
| 5.12, 5.14, 5.15, 5.16 | d | Sin efecto por D-30 |
| 6.1 a 6.4 | a | P9 |
| 7.1, 7.2 (sin lectores de pantalla), 7.4 (sin dispositivos reales), 7.5 | a | P9 |
| 7.3 Lighthouse | c | Lo lanza el usuario |
| 7.6 Documentación | a | P9, sin abrir el PR (requiere push) |
| Decisión NP-43 | d | D-22 |
| Decisión NP-46 | d | D-31 |
| Decisión NP-47 | c | Sin activar |

### «No verificado» de la bitácora

| Grupo | Etiqueta | Motivo |
|---|---|---|
| Firefox y WebKit de los pasos de las fases 3 a 5 | a | P0 |
| Backend real (subidas, importación, exportación, reservar, pedir, guardar perfil) | b | P7 y P8 |
| Pago con Stripe, 3-D Secure y `CardElement` real | c | Requiere claves de prueba y backend |
| Lectores de pantalla y dispositivos reales (tableta, móvil, monitor) | c | Los hace el usuario |
| Lighthouse y CLS de fuentes en Lighthouse | c | Lo lanza el usuario |
| Geolocalización y búsqueda por voz con permisos reales | c | Dispositivo real |
| Colores forzados | a | P9 (7.2) |
| Clientes externos de `/api/public/*` y `/api/mesas` | c | Coordinación con la móvil (la móvil no los usa: ver INVENTARIO-API) |
| zod fuera del bundle de login y registro | a | P0.3 (revisión del bundle) |
| Entorno de despliegue | c | Acceso del usuario a Vercel |

### ESTADO: resumen ejecutivo y §1–16

| Ref. | Hallazgo | Etiqueta | Dónde / motivo |
|---|---|---|---|
| R-Seguridad | Hallazgos de seguridad | b | Lo del front, fases 2–5 (d); el resto, P7 y P8 |
| R-Producto | Copy y carta de vinos; landing con solo la portada; reserva simulada | d | D-22 y fase 4 |
| R-Datos | Mocks como datos reales | d | Sustituido por D-24 (P5.1, P8) |
| R-Diseño, R-Componentes | Paleta, tipografía, duplicados | d | Fases 1, 3 y 5.20 |
| R-Accesibilidad | Atributos de formularios, `alert()`, barra lateral | d | Fases 3–5 (se reverifica con axe en P0 y P9) |
| R-Rendimiento | Lighthouse móvil bajo | c | Medición del usuario (7.3) |
| R-Calidad | Sin ESLint ni pruebas | d | Fase 0; el lint global restante es (a) en P0.3 |
| §1 | Next con avisos, proxy parcial, `middleware.ts.bk`, alias de `@/store` | d | 2.1, 2.10 y 1.x |
| §2 | Scripts de BD en la raíz | a | NP-25 (P8) |
| §2 | `workplan.md` y `requisitos funcionales.md` en la raíz | c | Documentos del usuario: no se borran sin su decisión |
| §2 | `providers/` y `components/providers/` duplicados | a | P5.9 (limpieza) |
| §2 | Hooks sin uso (`useTheme`, `useFetch`) | a | P5.9 (NP-35) |
| §2 | `utils/supabase`, `tailwind.config.js`, `store.ts` | d | Fase 1 |
| §3 | Páginas cliente innecesarias | a | P5.9 (se revisan las que queden) |
| §3 | `loading`, `error` y `not-found` solo en la raíz; layout del panel para todos | d | D-21 y 5.1 |
| §3 | `predictive/page copy.tsx`; 6 peticiones de la landing | d | 1.x y fase 4 |
| §3 | `/dashboard/cliente` | a | NP-19 |
| §4 | Botón, navegación, sidebar, KPI, contenedor, modal, tema duplicados | d | Fase 3 y 5.20 |
| §4 | Dos fuentes de sesión (`AuthProvider` y Redux) | a | P5.9 |
| §4 | Archivos de más de 300 líneas que mezclan datos y UI | a | P5 (al tocar cada pantalla) |
| §4 | Código muerto | a | NP-35 |
| §5, §6 | Estilos, `dark:`, tokens, paleta, fuentes | d | Fases 1 y 5.20 |
| §7 | SVG a mano | d | Solo quedan los de `components/ui/graficas` y la marca (5.20) |
| §8.1–8.10 | Fondo de login, logos, fachada, `f_auto`, `remotePatterns`, dimensiones, `alt`, emoji en tarjetas | d | 1.8, 1.9, fase 4; el fondo pasa a imagen propia en P3.3 (a) |
| §8.10 | Preset de subida de marcador | b | D-31 |
| §8.1 | Calidad del material en Cloudinary | c | NP-33 |
| §9 | Accesibilidad de formularios, `alert()`, doble envío, `callbackUrl`, reserva simulada | d | Fases 2–5 (se reverifica en P5.9) |
| §9 | Recuperación de contraseña | c | NP-16 |
| §9 | Importación con librería con avisos | c | NP-31 |
| §9 | Enumeración por mensajes del API | b | NP-15 |
| §9 | Regla de nombre con apóstrofo o guion | a | P5.9 (verificar `lib/validacion`) |
| §10 | `/api/auth/me` 2 o 3 veces por carga | a | P5.9 (2.15 deduplica; se mide en el recorrido) |
| §10 | 404 de logos, `/footer`, URL relativas | d | 1.8, 2.16, fase 4 |
| §10 | `/promociones` sin endpoint en el API | b | INVENTARIO-API (promociones) |
| §11 | Lint global | a | P0.3 |
| §12 | Líneas base de Lighthouse | c | 7.3 |
| §13 | Inicio, reportes, finanzas, caja, mesero y cocina con datos de ejemplo o locales | b | D-24 y NP-44/45 (P7, P8) |
| §13 | Rendimiento de BD, ajustes, acerca de, predicción | d | D-30 |
| §13 | Inventario con rutas internas | b | D-32 |
| §13 | Ventas del día en cuatro sitios | a | D-26 (P5.3) |
| §13 | Sidebar sin drawer, botones sin `Link` | d | 5.1; D-29 la rehace (P4.3) |
| §14 | 21 áreas de seguridad | b | Lo del front, (d) por la fase 2; lo del API, P7 y P8; CSP aplicada (c, 2.5); token en cookie (c, NP-04); caché de rutas privadas y source maps se reverifican en P0.3 (a) |
| §15 | Posicionamiento y vinos | d | D-22 |
| §16 | Reestructurar carpetas | d | Hecho de forma incremental en las fases 1–5 |

### ESTADO: anexos A–D

Comprobación de vigencia contra el código del 2026-11-03 (192 hallazgos; 99 resueltos, 39 abiertos, 22 parciales y 32 que necesitaban ejecución). Los resueltos llevan **(d) fases 1–5**: A§1 (SDK de Cloudinary sobrantes, Next, `autoprefixer`, secreto de respaldo, `middleware.ts.bk`, `@/store`), A§2 (`tailwind.config.js`, `loading.css`, `ButtonProps`, `types/ui.ts`, `utils/supabase`, `config/navigation`), A§3 (menú por rol, componentes de cliente, proxy de páginas y de `/api`, peticiones de la landing), A§4 (botones, `ConditionalNavbar`, `AdminSidebar`, componentes muertos, modales gigantes, `ThemeToggle`, `next-themes`, página predictiva duplicada, hooks sin uso), A§5–A§7 (estilos en línea, `text-[Npx]`, `cn`, tokens rotos, `dark:`, hex, colores de estado, `bg-white`, fuentes), A§8 y D§8 (`/logo.svg`), A§9 y B§9 (HTML interpretado), B§1 (`CldImage`, fachada, galería, `alt`, dimensiones, emoji, rutas locales, nube, `remotePatterns`, pravatar, AVIF/WebP), B§2 (validación, campo trampa, etiquetas, `callbackUrl`, doble envío, aviso en inglés, reserva simulada, tamaño de importación, claves de pasarela), B§3 (saludo fijo, `KpiCard`, rendimiento de BD, sidebar móvil, nombre sin token), B§8 (parámetros sin codificar, pedido automático, enlaces de redes, `window.open`), B§11 (cierre de sesión), B§12 (Permissions-Policy, COOP/CORP, `X-Powered-By`, caché de rutas privadas), B§13 (registro del login), B§14 (Firebase y Supabase), cupones públicos, C§1.3 (clientes Supabase), C§2 (clave publicable, `.env`, `sk_live`), C§3 (source maps), C§4 (`localStorage.user`, service worker), C§6 (fuentes, terceros, script en línea), C§7 (HTML del API), D§2 (configuración de ESLint, `useFetch` del pie), D§4 (pruebas), D§5 (build sin `.env`, variable de la nube), D§6 (`/api` sin token), D§8 (URL relativas, `undefined`, registro de `notFound`, `/api/promociones`, `AbortError`).

Abiertos, parciales y por comprobar:

| Ref. | Hallazgo | Etiqueta | Dónde |
|---|---|---|---|
| A§1, C§2.1 | Dependencias y variables de servidor en el front | b | D-32 (P8) |
| A§1 | Rotación del secreto | c | NP-02 |
| A§1, B§12 | CSP en modo informe | c | 2.5 |
| A§2 | `providers/` duplicado; scripts y documentos en la raíz; `skills-lock.json` | a / c | P5.9; los documentos del usuario y `skills-lock.json` no se tocan (c) |
| A§3, C§1 | Rutas internas con BD; dos fuentes de verdad | b | D-32 |
| A§3 | Redirección del rol cliente | a | NP-19 |
| A§4 | `IdleLogout` | c | NP-47 |
| A§4 | Tema en dos sitios (`useTheme` sin uso) | a | P5.9 |
| A§4 | `AuthProvider` y `authSlice` | a | P5.9 |
| A§4, B§3, C§4 | Datos de negocio en el navegador (`dataService`, `restaurantData`) | a | D-24 (P5.1) |
| A§4 | Archivos grandes que mezclan datos y UI | a | P5 |
| A§4 | Proveedores que inyectan tokens desde el navegador | d | `DesignSystemProvider` retirado en 5.14 y pantalla eliminada por D-30 (se verifica en P4.1) |
| A§5 | Utilidades `@layer` y tokens duplicados | d | `globals.css` reescrito (1.4, 5.20); se reverifica en P9 |
| A§7 | Selector de fuentes | d | Apariencia retirada (5.14) y D-30 |
| A§8 | Dos sistemas de gráficas (`recharts` y propio) | a | D-26 y D-30 (P4.1, P5.3) |
| A§8, B§1.2 | Logo SVG con `f_auto` y logo inexistente en `restaurantData` | a | D-24 (P5.1): fuera esos campos |
| A§9 | TODO y `console.log` en código de servidor | b | D-32 |
| A§9 | Copy | d | D-22 |
| B§1.1 | Fondo de login | a | D-23 (P3.3) |
| B§1.1 | Imagen de portada de 2 MB | c | NP-33 (se entrega optimizada con `f_auto,q_auto` y ancho por `sizes`) |
| B§1.1 | Galería que oculta errores; fondo con URL sin escapar | d | Galería y vista previa de «acerca de» eliminadas con D-30; se verifica en P4.1 |
| B§1.2 | Referencia local rota `/images/menu/guacamole.jpg` | a | D-24 (P5.1) |
| B§1.3, B§10 | Preset de subida | b | D-31 |
| B§1.5 | Estado HTTP de URL externas | a | D-23 (P3.3, `curl -I`) |
| B§2 | Atributos ARIA de formularios | a | P5.9 (axe y revisión) |
| B§2 | Enumeración en login y registro | b | NP-15 |
| B§2 | Nombres con apóstrofo o guion | a | P5.9 |
| B§2 | Perfil sin `<form>`; checkout sin `autocomplete` | a | P5.9 |
| B§2 | `CardElement` | c | NP-29 |
| B§2, C§1.2 | El admin escribe la contraseña del alta | b | NP-03 |
| B§2, B§14 | Librería de hojas de cálculo | c | NP-31 |
| B§3 | Stock del inicio con ruta errónea; KPI a cero si falla | a | NP-17 (P5.9) |
| B§3 | Reportes, finanzas, facturas y caja con mocks | a + b | D-24 (P5.1) y NP-44/45 (P7) |
| B§3 | «Acerca de» y ajustes con mocks | d | D-30 |
| B§3 | Inventario y proveedores con rutas internas | b | D-32 |
| B§3 | Sondeo de rendimiento de BD | d | D-30 |
| B§3 | Juicio de UX: saturación y jerarquía | a | D-27 y D-28 (P4) |
| B§8 | `usuarioId` y `ordenId` sin token | b | NP-05 |
| B§11 | Token en cookie escrita por JS y en `localStorage` | c | NP-04 |
| B§11 | Secreto compartido front–API | c | NP-02 |
| B§11 | Atributos de las cookies del cierre | a | P5.9 (verificar) |
| B§13 | Registros de respaldos; errores de BD en las respuestas | b | D-32 |
| B§13 | `console.error` en componentes cliente | a | P5.9 (registro centralizado) |
| B§14 | `drizzle-orm` y `googleapis` con avisos | b | D-32 |
| B§14 | `pnpm audit` y `next-cloudinary` | a | P0.3 |
| C§1.2 | Comprobación propia de sesión en los handlers | b | D-32 |
| C§1.2 | Archivo de introspección de esquema sin uso (`app/api/menu/_meta.ts`) | a | P5.9 (borrar, versionado) |
| C§1.3 | Emulador de cron, scripts de BD, esquema Drizzle | b | D-32 |
| C§2.1 | Respaldo `localhost:10000` en rutas internas | b | D-32 |
| C§2.3 | Bundle sin secretos | a | P0.3 |
| C§5 | Caché de las rutas internas | b | D-32 |
| C§7 | `innerHTML` y similares | a | P5.9 (verificar) |
| D§1 | pnpm global | c | NP-28 |
| D§2 | Lint global y reglas de hooks | a | P0.3 |
| D§7 | Lighthouse, contraste e iconos del pie | c / a | Lighthouse (c); contraste y nombres accesibles con axe en P0 y P9 (a) |
| D§8 | `/api/auth/me` repetido | a | P5.9 |

### Recuento por etiqueta

265 elementos clasificados (2026-11-03): **(a) 51 · (b) 37 · (c) 38 · (d) 139** (40 en las tablas y los 99 hallazgos resueltos de los anexos). Cuenta la primera etiqueta de cada fila; las filas con dos etiquetas reparten su trabajo entre paquetes como indica su columna «Dónde».
