# Notas pendientes (fuera del alcance del rediseño)

> El rediseño solo toca UI, UX y las medidas de seguridad aplicables desde la interfaz o la configuración del front. Lo que sigue **no se ejecuta** en las ramas `feature/rediseno-web-*`. Cada nota está pensada para ejecutarse en otra sesión.
>
> Origen: diagnóstico del 2026-10-30 (`docs/rediseno/ESTADO.md`, referencias al commit `922c05d`). Ningún valor secreto ni detalle de vulnerabilidades aparece aquí: las notas de seguridad abiertas solo dicen qué queda pendiente; su detalle técnico se guarda fuera del repositorio. La clasificación de cada nota (frontend, API, decisión del usuario u obsoleta) está en [`PLAN-AMPLIACION.md`](PLAN-AMPLIACION.md).
>
> **Prioridad:**
> - **Crítica:** explotable hoy o con impacto grave; antes de cualquier despliegue.
> - **Alta:** próximo sprint.
> - **Media:** planificar.
> - **Baja:** cuando haya ocasión.

## Índice

| ID | Tema | Categoría | Prioridad |
|---|---|---|---|
| NP-01 | Rutas internas del front con acceso a la BD: migrar al API | Seguridad del servidor / BD | **Crítica** |
| NP-02 | Gestión del secreto de firma de sesiones | Autenticación | **Crítica** |
| NP-03 | Alta de usuarios y almacenamiento de credenciales | Autenticación / BD | **Crítica** |
| NP-04 | Sesión en cookie HttpOnly emitida por el servidor | Sesiones | Alta |
| NP-05 | Autorización por propietario en pedidos, pagos y facturas | Seguridad del servidor | Alta |
| NP-06 | Validación y saneamiento en el servidor | Validación servidor | Alta |
| NP-07 | Límites de peticiones | Límites | Alta |
| NP-08 | Subidas a Cloudinary firmadas desde el API | Seguridad del servidor / infra | Alta |
| NP-09 | Claves de pasarela de pago solo en el backend | Seguridad del servidor | Alta |
| NP-10 | Respaldos de la BD fuera del front | Infraestructura | Alta |
| NP-11 | Facturación generada en el servidor | Lógica de negocio | Alta |
| NP-12 | Datos mock y `localStorage` como motor de datos | Lógica de negocio / API | Alta |
| NP-13 | Posicionamiento del contenido: cocina mexicana frente a española | Contenido | Alta |
| NP-14 | Carta de vinos: datos, endpoints y gestión | API / contenido | Alta |
| NP-15 | Mensajes genéricos de autenticación | Autenticación | Media |
| NP-16 | Recuperación de contraseña desactivada | Autenticación | Media |
| NP-17 | Endpoints inexistentes o mal apuntados desde el front | Contratos API | Media |
| NP-18 | Ajustes y "acerca de" del admin que no llegan al sitio público | Lógica de negocio | Media |
| NP-19 | `/dashboard/cliente` no existe (redirección del rol 5) | Rutas / lógica | Media |
| NP-20 | Cupones: validación en el servidor | Seguridad del servidor | Media |
| NP-21 | Conexión TLS a la BD | Base de datos | Media |
| NP-22 | Script de instalación del front | Infraestructura | Media |
| NP-23 | Cierre de sesión por inactividad | Sesiones | Media |
| NP-24 | Panel de rendimiento de BD dentro del admin del restaurante | Producto | Baja |
| NP-25 | Scripts de BD sueltos en la raíz del repo | Deuda técnica | Baja |
| NP-26 | Integración continua (lint, tipos, build y E2E en cada PR) | Infraestructura | Media |
| NP-27 | HSTS preload, cortafuegos y protección contra bots en Vercel | Infraestructura | Baja |
| NP-28 | Entorno local: pnpm global roto y disco C: lleno | Entorno | Baja |
| NP-29 | Pagos con `PaymentElement` (Apple Pay y Google Pay) | Idea | Baja |
| NP-30 | Ideas de producto para la parte pública | Idea | Baja |
| NP-31 | Sustitución de la librería de hojas de cálculo (decisión D-06) | Dependencias / seguridad | Alta |
| NP-32 | Autorización por rol en cada endpoint (complemento de D-15) | Seguridad del servidor | Alta |
| NP-33 | Calidad y metadatos de las imágenes en Cloudinary | Contenido | Media |
| NP-34 | Retirar el limpiador de service workers antiguos | Deuda técnica | Baja |
| NP-36 | Orígenes de imagen y de terceros por confirmar con datos reales | Seguridad / contenido | Media |
| NP-37 | Mesero, caja y cocina sin navegación de panel válida | Producto / navegación | Baja |
| NP-38 | Avisos críticos de dependencias transitivas de `firebase-admin` | Dependencias del servidor | Alta |
| NP-39 | `revisar:invisibles` no detecta otros caracteres de control | Herramientas / idea | Baja |
| NP-40 | `console.log` en código de servidor (cron de respaldos) | Backend / registro | Baja |
| NP-41 | La ruta de cierre de sesión no caduca las cookies si el backend no responde | Backend / sesión | Media |
| NP-42 | El menú móvil de la cabecera nueva no ofrece «Cerrar sesión» | Front / navegación | Baja |
| NP-43 | Posicionamiento y datos por confirmar con el restaurante | Producto / contenido | Alta |
| NP-44 | El API no da las cifras que pide el inicio de administración | Backend / indicadores | Media |
| NP-45 | Caja, propinas y facturas sin backend; las acciones de factura no existían | Backend / producto | Media |
| NP-46 | Carta del panel: subida de imágenes con preset de marcador y cambios que no llegan al servidor | Backend / configuración | Alta |
| NP-47 | El cierre de sesión por inactividad (`IdleLogout`) nunca se monta | Producto / seguridad | Media |

---

## NP-01 · Rutas internas del front con acceso a la BD: migrar al API

- **Estado:** pendiente de endurecer en el API o en la configuración del servidor. Clasificación y paquete en [`PLAN-AMPLIACION.md`](PLAN-AMPLIACION.md).
- **Detalle técnico:** se conserva fuera del repositorio (el repo es público).
- **Prioridad:** Crítica.

## NP-02 · Gestión del secreto de firma de sesiones

- **Estado:** pendiente de endurecer en el API o en la configuración del servidor. Clasificación y paquete en [`PLAN-AMPLIACION.md`](PLAN-AMPLIACION.md).
- **Detalle técnico:** se conserva fuera del repositorio (el repo es público).
- **Prioridad:** Crítica.

## NP-03 · Alta de usuarios y almacenamiento de credenciales

- **Estado:** pendiente de endurecer en el API o en la configuración del servidor. Clasificación y paquete en [`PLAN-AMPLIACION.md`](PLAN-AMPLIACION.md).
- **Detalle técnico:** se conserva fuera del repositorio (el repo es público).
- **Prioridad:** Crítica.

## NP-04 · Sesión en cookie HttpOnly emitida por el servidor

- **Estado:** pendiente de endurecer en el API o en la configuración del servidor. Clasificación y paquete en [`PLAN-AMPLIACION.md`](PLAN-AMPLIACION.md).
- **Detalle técnico:** se conserva fuera del repositorio (el repo es público).
- **Prioridad:** Alta.

## NP-05 · Autorización por propietario en pedidos, pagos y facturas

- **Estado:** pendiente de endurecer en el API o en la configuración del servidor. Clasificación y paquete en [`PLAN-AMPLIACION.md`](PLAN-AMPLIACION.md).
- **Detalle técnico:** se conserva fuera del repositorio (el repo es público).
- **Prioridad:** Alta.

## NP-06 · Validación y saneamiento en el servidor

- **Estado:** pendiente de endurecer en el API o en la configuración del servidor. Clasificación y paquete en [`PLAN-AMPLIACION.md`](PLAN-AMPLIACION.md).
- **Detalle técnico:** se conserva fuera del repositorio (el repo es público).
- **Prioridad:** Alta.
- **Teléfono de la reserva (decisión del usuario, 2026-11-01):** el front solo exige que no esté vacío (`esquemaReservaContacto`); el endpoint de reservas debe aceptar los 10 dígitos de México (con o sin `+52`) y responder 400 con un mensaje claro si no.

## NP-07 · Límites de peticiones

- **Estado:** pendiente de endurecer en el API o en la configuración del servidor. Clasificación y paquete en [`PLAN-AMPLIACION.md`](PLAN-AMPLIACION.md).
- **Detalle técnico:** se conserva fuera del repositorio (el repo es público).
- **Prioridad:** Alta.

## NP-08 · Subidas a Cloudinary firmadas desde el API

- **Estado:** pendiente de endurecer en el API o en la configuración del servidor. Clasificación y paquete en [`PLAN-AMPLIACION.md`](PLAN-AMPLIACION.md).
- **Detalle técnico:** se conserva fuera del repositorio (el repo es público).
- **Prioridad:** Alta.

## NP-09 · Claves de pasarela de pago solo en el backend

- **Estado:** pendiente de endurecer en el API o en la configuración del servidor. Clasificación y paquete en [`PLAN-AMPLIACION.md`](PLAN-AMPLIACION.md).
- **Detalle técnico:** se conserva fuera del repositorio (el repo es público).
- **Prioridad:** Alta.

## NP-10 · Respaldos de la BD fuera del front

- **Estado:** pendiente de endurecer en el API o en la configuración del servidor. Clasificación y paquete en [`PLAN-AMPLIACION.md`](PLAN-AMPLIACION.md).
- **Detalle técnico:** se conserva fuera del repositorio (el repo es público).
- **Prioridad:** Alta.

## NP-11 · Facturación generada en el servidor

- **Estado:** pendiente de endurecer en el API o en la configuración del servidor. Clasificación y paquete en [`PLAN-AMPLIACION.md`](PLAN-AMPLIACION.md).
- **Detalle técnico:** se conserva fuera del repositorio (el repo es público).
- **Prioridad:** Alta.

## NP-12 · Datos mock y `localStorage` como motor de datos

- **Archivos y rutas afectados:**
  - `features/shared/services/dataService.ts`, `features/shared/data/restaurantData.ts`
  - `features/dashboard/admin/data/*Mock*`, `features/dashboard/cajero/data/cajeroMock.ts`
  - Páginas: `app/dashboard/admin/{reports,finance,finance/invoices,about,settings}/page.tsx`, `app/dashboard/{cajero,mesero,cocina}/page.tsx`, `features/dashboard/admin/components/users/AccessMatrix.tsx`
- **Problema:** seis pantallas del admin y la de caja muestran cifras inventadas como si fueran reales. Ajustes, roles y permisos, turnos, mesero y cocina guardan sus datos solo en el navegador. Los KPI de ventas de cuatro pantallas salen de cuatro fuentes distintas.
- **Riesgo:** decisiones de negocio con datos falsos; permisos manipulables desde el navegador.
- **Solución sugerida:** crear en el API los endpoints que faltan (ventas, reportes, finanzas, caja chica, cierres, propinas, facturas, ajustes, "acerca de", roles y permisos, turnos, comandas) y conectar cada pantalla. Después, eliminar `dataService.ts` y los mocks.

  Mientras tanto, el PLAN etiqueta en la UI cada cifra de ejemplo con la insignia «Datos de ejemplo».
- **Prioridad:** Alta.
- **Criterio de aceptación:** `rg "Mock|dataService" app features components` no devuelve resultados; `localStorage` solo contiene `elquijote:preferencias`.

## NP-13 · Posicionamiento del contenido: cocina mexicana frente a española

- **Archivos y rutas afectados:** `app/layout.tsx:20-26` (metadatos y palabras clave), `app/page.tsx:131`, `features/shared/data/restaurantData.ts`, contenido de `/settings` y `/about` en el API.
- **Problema:** el sitio dice «cocina mexicana de alta gama» (Huejutla de Reyes, Hidalgo), pero el encargo describe un restaurante español de alta gama con carta de vinos. El usuario decidió no cambiar contenido en el rediseño.
- **Riesgo:** mensaje de marca incoherente y SEO orientado a otra propuesta.
- **Solución sugerida:** decisión de negocio sobre el posicionamiento. Después, actualizar los textos en el API o los ajustes y los metadatos, sin tocar el diseño: los componentes ya muestran lo que llegue.
- **Prioridad:** Alta.
- **Criterio de aceptación:** los metadatos, la portada y "la casa" describen la misma propuesta que el resto de canales.

## NP-14 · Carta de vinos: datos, endpoints y gestión

- **Archivos y rutas afectados:** API (nuevo recurso), admin (nueva gestión), landing (sección «Bodega» reservada en `DESIGN.md`).
- **Problema:** no existe ninguna vista ni CRUD de vinos; «vino» solo aparece en mocks e inventario.
- **Riesgo:** la propuesta de alta gama «con carta de vinos» no se puede mostrar.
- **Solución sugerida:**
  - Modelo `Vino` con nombre, bodega, D.O., añada, uvas, tipo, notas, maridaje, precio por copa y por botella, disponibilidad e imagen.
  - Endpoints públicos de lectura y CRUD de admin.
  - Después, una sección «Bodega» en la landing y una página de carta de vinos con la `Contraetiqueta` del sistema de diseño.
- **Prioridad:** Alta.
- **Criterio de aceptación:** el API devuelve la carta de vinos; la landing la muestra sin contenido inventado.

## NP-15 · Mensajes genéricos de autenticación

- **Estado:** pendiente de endurecer en el API o en la configuración del servidor. Clasificación y paquete en [`PLAN-AMPLIACION.md`](PLAN-AMPLIACION.md).
- **Detalle técnico:** se conserva fuera del repositorio (el repo es público).
- **Prioridad:** Media.

## NP-16 · Recuperación de contraseña desactivada

- **Archivos y rutas afectados:** `app/(auth)/reset/page.tsx`, `app/(auth)/frm_reset/page.tsx`; API.
- **Problema:** la funcionalidad está desactivada y su aviso está en inglés. El enlace del login lleva a un callejón sin salida.
- **Riesgo:** usuarios bloqueados y soporte manual.
- **Solución sugerida:** flujo en el API con token de un solo uso, caducidad corta y respuesta genérica. El rediseño solo traduce el aviso y ofrece una salida (contacto) hasta entonces.
- **Prioridad:** Media.
- **Criterio de aceptación:** un usuario puede restablecer su contraseña de principio a fin.

## NP-17 · Endpoints inexistentes o mal apuntados desde el front

- **Archivos y rutas afectados:**
  - `app/(public)/promociones/page.tsx`: llama a `/api/promociones`, que no existe.
  - `app/dashboard/admin/page.tsx`: el contador de stock usa `${API_URL}/api/inventory/products` en lugar de la ruta interna `/api/inventory/products`.
  - `components/landing/Footer.tsx:34` (`/footer`), `app/menu/producto/[id]/page.tsx:63-64` (sin valor por defecto).
  - Los 14 usos de `NEXT_PUBLIC_API_URL` sin respaldo y el respaldo `localhost:10000` incrustado en el bundle.
- **Problema:** peticiones que fallan siempre o dependen del entorno; el contador de stock marca 0 en silencio.
- **Riesgo:** pantallas vacías o con datos erróneos.
- **Solución sugerida:** acordar con el API la lista de endpoints y corregir las URLs en un cambio de lógica separado. La validación de variables en el build (fallar si falta `NEXT_PUBLIC_API_URL`) sí está en el PLAN (paso 2.16).
- **Prioridad:** Media.
- **Criterio de aceptación:** ninguna página registra 404 de endpoints propios con el backend real levantado.

## NP-18 · Ajustes y "acerca de" del admin que no llegan al sitio público

- **Archivos y rutas afectados:** `app/dashboard/admin/settings/page.tsx`, `app/dashboard/admin/about/page.tsx`, `components/providers/DesignSystemProvider.tsx` y `SettingsService` (`localStorage`).
- **Problema:** lo que edita el admin (logo, fondo del login, "acerca de", colores) se guarda en su navegador o en mocks, y la web pública lee otra fuente. Además, `DesignSystemProvider` permite cambiar los colores y las fuentes en tiempo de ejecución, lo que choca con `DESIGN.md` como fuente única.
- **Riesgo:** confusión del administrador y marca inconsistente.
- **Cambio del rediseño (PLAN 1.8, D-07):** el logo de la cabecera, el pie y la barra lateral es ahora el SVG local `components/marca/Logo.tsx`. La `Navbar` ya no lee `restaurantLogo_light`/`restaurantLogo_dark` de `SettingsService` (antes, un logo cambiado en Ajustes se veía solo en el navegador del admin). Los campos siguen en `restaurantData.ts` y en la pantalla de Ajustes, pero **no tienen efecto**; `restaurantLogo` (`logo_text_white_ktnpgg`, que no existe en la nube, NP-33) e `restaurantIco` tampoco se usan ya para pintar. Al resolver esta nota hay que decidir si el logo debe ser configurable (lo desaconseja D-07: un SVG con `currentColor` sigue al tema) y, si no, retirar esos campos.
- **Solución sugerida:** persistir los ajustes en el API. Decidir qué es configurable por el administrador (textos, imágenes, horario) y qué no (colores y tipografías, que son del sistema de diseño). El rediseño retira la sección «Apariencia» de colores y fuentes si el usuario lo aprueba (decisión D-12 del PLAN).
- **Prioridad:** Media.
- **Criterio de aceptación:** un cambio guardado en el admin se ve en la web pública en otro navegador.

## NP-19 · `/dashboard/cliente` no existe (redirección del rol 5)

- **Archivos y rutas afectados:** `app/dashboard/page.tsx:20`, `proxy.ts:9-15`, `features/dashboard/cliente/*`.
- **Problema:** el rol cliente se redirige a una ruta que da 404.
- **Riesgo:** los clientes que entran a `/dashboard` ven un error.
- **Solución sugerida:** decidir si el cliente tiene panel propio (crear la página con los componentes ya existentes) o si se le envía a `/profile`. Es un cambio de rutas, así que queda fuera del rediseño.
- **Prioridad:** Media.
- **Criterio de aceptación:** un usuario con rol 5 que visita `/dashboard` llega a una página válida.

## NP-20 · Cupones: validación en el servidor

- **Estado:** pendiente de endurecer en el API o en la configuración del servidor. Clasificación y paquete en [`PLAN-AMPLIACION.md`](PLAN-AMPLIACION.md).
- **Detalle técnico:** se conserva fuera del repositorio (el repo es público).
- **Prioridad:** Media.

## NP-21 · Conexión TLS a la BD

- **Estado:** pendiente de endurecer en el API o en la configuración del servidor. Clasificación y paquete en [`PLAN-AMPLIACION.md`](PLAN-AMPLIACION.md).
- **Detalle técnico:** se conserva fuera del repositorio (el repo es público).
- **Prioridad:** Media.

## NP-22 · Script de instalación del front

- **Estado:** pendiente de endurecer en el API o en la configuración del servidor. Clasificación y paquete en [`PLAN-AMPLIACION.md`](PLAN-AMPLIACION.md).
- **Detalle técnico:** se conserva fuera del repositorio (el repo es público).
- **Prioridad:** Media.

## NP-23 · Cierre de sesión por inactividad

- **Archivos y rutas afectados:** `components/IdleLogout.tsx` (sin montar; llama a `/api/logout`, que no existe).
- **Problema:** no hay caducidad por inactividad, algo relevante en los equipos compartidos de caja y cocina.
- **Riesgo:** sesiones abiertas en equipos compartidos.
- **Solución sugerida:** definir la política de sesión en el API (caducidad del token y renovación) y, si se aprueba, montar un aviso de inactividad en los paneles que llame al cierre de sesión único del PLAN (paso 2.14).
- **Prioridad:** Media.
- **Criterio de aceptación:** tras N minutos sin actividad en un panel, la sesión se cierra y se limpia todo el estado.

## NP-24 · Panel de rendimiento de BD dentro del admin del restaurante

- **Archivos y rutas afectados:** `app/dashboard/admin/db-performance/page.tsx`, endpoints `/db-metrics/*`.
- **Problema:** es una pantalla de DBA (8 bloques técnicos, sondeo cada 10 s) en el panel de la gerencia.
- **Riesgo:** ruido para el usuario y carga innecesaria del API.
- **Solución sugerida:** decisión de producto: moverla a una herramienta interna de sistemas. El rediseño (PLAN 5.x) la reduce visualmente a un semáforo de «salud del sistema» con el detalle desplegable, sin cambiar los datos.
- **Prioridad:** Baja.
- **Criterio de aceptación:** la gerencia no ve métricas técnicas en su navegación principal.

## NP-25 · Scripts de BD sueltos en la raíz del repo

- **Archivos y rutas afectados:** `check_backups.ts`, `delete_cron_date.cjs`, `setup_settings.ts`, `setup_settings.js`, `setup_settings.cjs`.
- **Problema:** son scripts con acceso a la BD y logs de datos dentro del repo del front.
- **Riesgo:** bajo; ensucian el repo y llevan dependencias de servidor.
- **Solución sugerida:** pasarlos al repo del backend como migraciones o scripts de mantenimiento y borrarlos de aquí (junto con NP-01).
- **Prioridad:** Baja.
- **Criterio de aceptación:** la raíz del front no contiene scripts de BD.

## NP-26 · Integración continua (lint, tipos, build y E2E en cada PR)

- **Archivos y rutas afectados:** `.github/workflows/` (nuevo).
- **Problema:** no hay CI: nada impide que se fusione código que rompe el build o las pruebas.
- **Riesgo:** regresiones silenciosas.
- **Solución sugerida:** un workflow con `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm build` (con variables públicas de prueba), `pnpm test:e2e` (Chromium) y `pnpm audit --audit-level=high`. Las capturas, como artefacto y no en git.
- **Prioridad:** Media.
- **Criterio de aceptación:** cada PR muestra el estado de los cinco pasos y no se puede fusionar en rojo.

## NP-27 · HSTS preload, cortafuegos y protección contra bots en Vercel

- **Archivos y rutas afectados:** configuración del dominio y del proyecto en Vercel.
- **Problema:** HSTS se envía con `preload`, pero no consta que el dominio esté en la lista ni que todos los subdominios usen HTTPS. No hay reglas de cortafuegos.
- **Riesgo:** bajo.
- **Solución sugerida:** comprobar los subdominios antes de solicitar el preload; activar las reglas de cortafuegos y bots de Vercel para `/login`, `/register` y la API.
- **Prioridad:** Baja.
- **Criterio de aceptación:** securityheaders.com califica A+ al dominio de producción; hay reglas de cortafuegos activas.

## NP-28 · Entorno local: pnpm global roto y disco C: lleno

- **Archivos y rutas afectados:** equipo de desarrollo.
- **Problema:** el ejecutable global de pnpm falla (se usó `npx pnpm@9`) y la unidad `C:` tiene unos 0,5 GB libres, lo que hizo fallar varias ejecuciones de Lighthouse.
- **Riesgo:** fallos intermitentes en build y pruebas.
- **Solución sugerida:** reinstalar pnpm con `corepack enable` y fijar `packageManager` en `package.json` (cambio de configuración que se propone en el PLAN 0.1); liberar espacio en `C:` o mover `TEMP` y la caché de pnpm a `D:`.
- **Prioridad:** Baja.
- **Criterio de aceptación:** `pnpm -v` funciona; hay al menos 10 GB libres en la unidad del sistema.

## NP-29 · Pagos con `PaymentElement` (Apple Pay y Google Pay)

- **Archivos y rutas afectados:** `app/menu/pedido/checkout/page.tsx`.
- **Problema:** se usa `CardElement`, el componente antiguo, sin monederos ni métodos locales.
- **Riesgo:** pérdida de conversión en móvil.
- **Solución sugerida:** migrar a `PaymentElement` con Payment Intents (cambio de integración con Stripe y el API).
- **Prioridad:** Baja (idea).
- **Criterio de aceptación:** Apple Pay y Google Pay disponibles en los dispositivos compatibles.

## NP-30 · Ideas de producto para la parte pública

- **Archivos y rutas afectados:** producto y contenido.
- **Ideas:**
  - Maridajes sugeridos en cada plato, enlazados a la carta de vinos (depende de NP-14).
  - Versión en inglés.
  - Fotografía profesional de sala, cocina y bodega, sustituyendo las imágenes rotas o de banco.
  - Menú degustación con reserva directa.
  - Lista de espera cuando no hay disponibilidad.
- **Prioridad:** Baja.
- **Criterio de aceptación:** cada idea se convierte en una historia de usuario antes de ejecutarse.

## NP-31 · Sustitución de la librería de hojas de cálculo (decisión D-06)

- **Estado:** pendiente de endurecer en el API o en la configuración del servidor. Clasificación y paquete en [`PLAN-AMPLIACION.md`](PLAN-AMPLIACION.md).
- **Detalle técnico:** se conserva fuera del repositorio (el repo es público).
- **Prioridad:** Alta.

## NP-32 · Autorización por rol en cada endpoint (complemento de D-15)

- **Estado:** pendiente de endurecer en el API o en la configuración del servidor. Clasificación y paquete en [`PLAN-AMPLIACION.md`](PLAN-AMPLIACION.md).
- **Detalle técnico:** se conserva fuera del repositorio (el repo es público).
- **Prioridad:** Alta.

## NP-33 · Calidad y metadatos de las imágenes en Cloudinary

- **Archivos y rutas afectados:** la nube `dcb1tspbj` (carpetas `ElQuijote/hero`, `ElQuijote/menu`, `ElQuijote/Logo`, `ElQuijote/Ico`) y `features/shared/data/restaurantData.ts`.
- **Problema** (verificación de solo lectura del 2026-10-31, ver ESTADO §8.1):
  1. Las imágenes de portada son **generadas por IA** y la principal (`Gemini_Generated_Image_2mv3…`) conserva la **marca de agua de Gemini**. Además, mide 1584×672, poco para pantallas retina a sangre.
  2. **`logo_text_white_ktnpgg` no existe** en la nube.
  3. Las 37 fotos de la carta **no tienen `alt` ni pie** en sus metadatos y tienen encuadres muy distintos (de 696×1507 a 1507×696).
  4. `hamburguesa_fgqz5m` trae **franjas negras** incrustadas.
  5. `mystery-box_dwkh0i` muestra **figuras de anime**, fuera del tono de alta gama.
  6. Varias fotos son de platos ajenos a la propuesta española (tex-mex, molcajete, hamburguesa).
  7. No hay fotografías de bodega ni de vinos.
  8. Quedan en la raíz de la nube los recursos de muestra de Cloudinary (`samples/*`, `cld-sample*`, `main-sample`).
- **Riesgo:** imagen de marca poco creíble para alta gama; accesibilidad dependiente del nombre del plato.
- **Solución sugerida:**
  - Sesión de fotografía profesional (sala, platos, bodega) con encuadre 4:5 para platos y 16:9 o 3:2 de al menos 2880 px para portada.
  - `alt` y pie en los metadatos contextuales de cada recurso.
  - Retirar las imágenes generadas, las de muestra y las ajenas a la carta (lo decide el negocio; el rediseño no borra nada).
  - Corregir `restaurantData.ts` para que no apunte a recursos inexistentes.

  Mientras tanto, el rediseño recorta en la entrega la marca de agua (PLAN 4.3), usa recortes uniformes con `g_auto` y toma el `alt` del nombre del plato.
- **Prioridad:** Media.
- **Criterio de aceptación:** ninguna imagen pública muestra marcas de agua ni franjas; todas las imágenes de contenido tienen `alt` significativo; la portada mide al menos 2880 px de ancho.

## NP-34 · Retirar el limpiador de service workers antiguos

- **Archivos y rutas afectados:** `components/pwa/RetirarServiceWorker.tsx` (lo crea el PLAN 2.7).
- **Problema:** al eliminar el service worker (decisión D-11), hay que desregistrar los que ya estén instalados en navegadores de usuarios. El componente de limpieza solo es necesario durante un tiempo.
- **Riesgo:** bajo: código residual.
- **Solución sugerida:** retirarlo cuando las métricas o un tiempo prudente (por ejemplo, 90 días tras el despliegue) indiquen que ya no quedan instalaciones.
- **Prioridad:** Baja.
- **Criterio de aceptación:** el componente se elimina y la prueba de almacenamiento sigue sin service workers registrados.

## NP-35 · Código huérfano que el rediseño no borra todavía

- **Archivos y rutas afectados:**
  - `components/landing/{AboutSection,CategoriesSection,MenuSection,ReservationSection}.tsx`
  - `config/navigation/{admin,cajero,cocina}.nav.ts` (más `tipos.ts`)
  - `features/dashboard/admin/data/{usersMock,suppliersMock}.tsx`
  - `features/dashboard/cliente/*`, `components/IdleLogout.tsx`, `styles/loading.css`, `types/index.ts`
  - `check_backups.ts` y `setup_settings.ts` (scripts en la raíz)
- **Problema:** un grafo de importaciones desde `app/` y `proxy.ts` (paso 1.2) los marca sin uso, pero el PLAN no los incluye en el borrado: algunos los reutilizan pasos posteriores (3.13 navegación por rol, fase 4 landing, NP-19 y NP-23) y otros son scripts de operación.
- **Riesgo:** bajo: peso muerto y confusión.
- **Solución sugerida:** revisarlos al cerrar cada fase y borrar (están versionados) lo que ningún paso reutilice. `components/ui/Button.tsx` y `types/ui.ts` se borraron en el 3.2 (2026-11-01). Las imágenes de este código muerto (`AboutSection` con `next/image` sin `sizes`, `CategoriesSection`, `features/dashboard/cliente/*` con fotos de Unsplash) no se adaptaron en el 1.9 porque no se pintan en ninguna ruta.
- **Prioridad:** Baja.
- **Criterio de aceptación:** el grafo de importaciones solo marca como huérfano lo que está documentado como excepción.

## NP-36 · Orígenes de imagen y de terceros por confirmar con datos reales

- **Archivos y rutas afectados:** `config/seguridad/hosts-permitidos.ts` (PLAN 1.9), `components/ui/Imagen.tsx`, y las `<img>` del admin que pintan URL pegadas a mano: `GallerySection.tsx`, `AboutPreviewModal.tsx`, `ItemModal.tsx`, `PromoModal.tsx`, `app/dashboard/admin/{menu,promociones}/page.tsx` y `components/landing/PromosSection.tsx`.
- **Problema:**
  1. **Supabase Storage** (`mdygrtdebtmuhmirnbxz.supabase.co`) se conserva como origen de imagen con **toda la ruta** (`/**`), como ya permitía `next.config`, porque según el código de `SmartImage` las fotos de platos y categorías que envía el API viven ahí. **No verificado** con datos reales (sin backend en las pruebas): ni que siga en uso ni bajo qué ruta (`/storage/v1/object/public/…` u otra).
  2. **Widget de subida de Cloudinary** (`CldUploadButton`): los orígenes `api.cloudinary.com` (conexión) y `upload-widget.cloudinary.com` (marco) se anotaron por la documentación del widget; **no verificados** en el navegador. Se confirman en la fase 2 al activar la CSP (2.3–2.5) con la consola abierta en el admin.
  3. Las `<img>` del admin y de `PromosSection` siguen siendo `<img>` normales: aceptan cualquier host que pegue el administrador (la galería de «acerca de» usa fotos de Unsplash en los datos de ejemplo y `GallerySection` sustituye las rotas por una de Unsplash, ocultando el error). Cuando las fases 4 y 5 las pasen a `Imagen`, **un host no listado mostrará el respaldo en lugar de la foto**.
  4. Una vista previa del admin construye un fondo con la URL pegada; se sustituye por `Imagen` al rehacer la pantalla.
- **Riesgo:** una lista corta puede dejar sin foto contenido real; una lista larga amplía lo que la CSP deberá permitir.
- **Solución sugerida:** decidir si toda imagen de contenido se sube a Cloudinary (la subida del admin ya va allí) y, si es así, retirar Supabase de la lista cuando el API deje de devolver esas URL; validar en el API que las URL de imagen sean de la nube de la casa. Al rehacer el admin (fase 5, 5.14), sustituir la vista previa de `LandscapeSection` por `Imagen`.
- **Prioridad:** Media.
- **Criterio de aceptación:** con datos reales, 0 imágenes con respaldo en la carta y la portada, y la lista de `hosts-permitidos.ts` coincide con los orígenes que aparecen en la base de datos.

## NP-37 · El mesero no tiene navegación de panel configurada

- **Archivos y rutas afectados:** `config/navigation/` (hay `admin`, `cajero` y `cocina`, pero no `mesero`), `config/navigation/por-rol.ts` y `app/dashboard/mesero/`.
- **Problema:** `navegacionDeRol` devuelve una lista vacía para el mesero (y para el comensal), así que su panel no tendría barra lateral ni drawer. Las entradas de su menú son una decisión de producto: no se inventan.
- **Riesgo:** al montar el layout de paneles (5.1), la pantalla del mesero quedaría sin navegación entre sus vistas.
- **Solución sugerida:** definir con el usuario qué vistas tiene el mesero (mesas, comandas, llamadas…) y crear `config/navigation/mesero.nav.ts` con el mismo formato; si solo tiene una vista, confirmar que no necesita navegación.
- **Prioridad:** Baja.
- **Criterio de aceptación:** `navegacionDeRol(ROLES.MESERO)` devuelve sus secciones, o hay una decisión escrita de que no las necesita.
- **Ampliación (5.1, 2026-11-03):**
  - **Caja y cocina tienen el mismo problema.** `cajero.nav.ts` y `cocina.nav.ts` apuntan a rutas que no existen (`/dashboard/cajero/report`, `/methods`; `/dashboard/cocina/stats`, `/history`, `/settings`). Sus consultas (`?filter=`, `?view=`) tampoco las lee ninguna página.
  - **Qué hace hoy el layout:** solo pinta navegación al admin (`MarcoPanel`). Caja, cocina y sala son una sola pantalla con barra superior: nombre del panel, accesibilidad y cuenta con «Cerrar sesión». Esas configuraciones solo se ven en el catálogo.
  - **Para cerrar la nota:** decidir con el usuario si esas vistas se crean (sería backend o producto) o si se recortan las configuraciones.

## NP-38 · Avisos críticos de dependencias transitivas de `firebase-admin`

- **Archivos y rutas afectados:** `package.json` (`firebase-admin@13.6.0`), que lo usa el servidor.
- **Problema:** tras actualizar Next en el paso 2.1, `pnpm audit` sigue dando 3 avisos críticos, todos por dependencias transitivas de `firebase-admin`:
  - `fast-xml-parser@4.5.3` (corregido en 4.5.4), vía `@google-cloud/storage`;
  - `protobufjs@7.5.4` (corregido en 7.5.5), vía `@google-cloud/firestore` → `google-gax` → `@grpc/proto-loader`;
  - `websocket-driver@0.7.4` (corregido en 0.7.5), vía `@firebase/database` → `faye-websocket`.
- **Por qué no se hace en el rediseño:** `firebase-admin` es una dependencia de servidor. El PLAN no incluye su actualización y el alcance es solo el front.
- **Riesgo:** ejecución de código y corrupción de mensajes en el servidor si esas rutas de código se alcanzan con datos de un atacante.
- **Solución sugerida:** actualizar `firebase-admin` a una versión que arrastre las dependencias corregidas, o fijarlas con `pnpm.overrides`, y comprobar el servidor (respaldos, almacenamiento) tras el cambio.
- **Prioridad:** Alta.
- **Criterio de aceptación:** `pnpm audit` sin avisos críticos.
- **Resuelta (2026-11-03, excepción autorizada por el usuario):** ningún archivo importa `firebase-admin` (solo dos comentarios de `/reset` y `/frm_reset` citan un `lib/firebaseConfig` que no existe), así que se retira. `pnpm audit` pasa de 3 críticas / 45 altas / 31 moderadas / 6 bajas a **0 / 19 / 13 / 0**.

## NP-39 · `revisar:invisibles` no detecta otros caracteres de control

- **Archivos y rutas afectados:** `scripts/revisar-caracteres-invisibles.mjs`.
- **Problema:** el script busca controles bidireccionales, caracteres de ancho cero y el BOM fuera de sitio, pero no los demás caracteres de control C0 (U+0000 a U+001F, salvo tabulador y saltos de línea). En el paso 2.3, la herramienta de escritura convirtió un `\b` de una expresión regular en un carácter de retroceso literal (U+0008), y solo se descubrió porque falló una prueba.
- **Por qué no se hace ahora:** ampliar el script no está en el PLAN (es una idea).
- **Solución sugerida:** añadir al script los caracteres C0 y U+007F a U+009F, informando solo de archivo y línea, como hoy.
- **Prioridad:** Baja.
- **Criterio de aceptación:** un archivo con U+0008 hace fallar `pnpm revisar:invisibles`.

## NP-40 · `console.log` en código de servidor (cron de respaldos)

- **Archivos y rutas afectados:** `app/api/cron/backups/route.ts:105` y `lib/db.ts:37`.
- **Problema:** el paso 2.8 pide que `rg "console\.log" app components features hooks lib` no encuentre nada, pero estos dos están en código de servidor que el rediseño no toca (NP-01). Escriben mensajes fijos («CRON: …»), sin datos personales. `compiler.removeConsole` no los elimina del build de servidor con Turbopack (comprobado en el 2.8).
- **Riesgo:** bajo; ruido en los registros del servidor.
- **Solución sugerida:** al revisar el backend (NP-10), sustituirlos por el registro del servidor o eliminarlos.
- **Prioridad:** Baja.
- **Criterio de aceptación:** `rg "console\.log" app lib` sin resultados.

## NP-41 · La ruta de cierre de sesión no caduca las cookies si el backend no responde

- **Archivos y rutas afectados:** `app/api/auth/logout/route.ts`.
- **Problema:** la ruta llama a `${NEXT_PUBLIC_API_URL}/auth/sign-out` y solo después caduca `session` y `access_token`. Si esa llamada lanza (backend caído o sin red), el `catch` devuelve 500 **sin** caducar las cookies. Visto en el código en el 2.14; la respuesta 500 sin backend no se comprobó en el navegador.
- **Mitigación en el front (2.14):** `lib/sesion/cerrar-sesion.ts` caduca también `session` y `access_token` desde el cliente y borra el resto aunque la ruta falle. Si alguna vez se emite una cookie HttpOnly (NP-04), el cliente ya no podrá caducarla y dependerá solo de esta ruta.
- **Riesgo:** medio cuando exista la cookie HttpOnly: la sesión seguiría viva en el navegador tras «Cerrar sesión» con el backend caído.
- **Solución sugerida:** caducar las cookies en todas las salidas de la ruta (también en el `catch`), y que la invalidación en el backend no condicione la limpieza local.
- **Prioridad:** Media.
- **Criterio de aceptación:** con el backend apagado, `POST /api/auth/logout` responde con `Set-Cookie` que caduca `session` y `access_token`.
- **Resuelta (2026-11-03, excepción autorizada por el usuario):** la ruta caduca las dos cookies en todas sus salidas, también en el `catch`. La prueba de `proteccion.spec.ts` lo comprueba sin backend real. **No verificado** con el backend encendido (la salida correcta no cambia de lógica).

## NP-42 · El menú móvil de la cabecera nueva no ofrece «Cerrar sesión»

- **Archivos y rutas afectados:** `components/marca/cabecera/islas.tsx` (`MenuMovil`).
- **Problema:** por debajo de 640 px la cuenta va dentro de `MenuMovil`, que muestra «Sesión de …» y «Tu cuenta», pero no «Cerrar sesión». El 2.14 solo conecta el cierre único a `MenuCuenta` (y a `BarraSuperiorPanel`), como dice el PLAN; añadirlo al menú móvil sería ampliar el paso.
- **Riesgo:** bajo mientras `CabeceraSitio` no esté en el sitio real (fase 4): en móvil, cerrar sesión exigiría ir a «Tu cuenta».
- **Solución sugerida:** al montar la cabecera en el sitio (4.x), añadir en `MenuMovil` un botón «Cerrar sesión» con `useCerrarSesion`, con el mismo estilo de acción destructiva que `MenuCuenta`.
- **Prioridad:** Baja.
- **Criterio de aceptación:** a 360 px, con sesión, el menú móvil ofrece «Cerrar sesión» y la prueba de `almacenamiento.spec.ts` pasa también desde ahí.
- **Resuelta en el PLAN 4.1 (2026-11-03).**

## NP-43 · Posicionamiento y datos por confirmar con el restaurante (D-17)

- **Archivos y rutas afectados:** `config/restaurant.config.ts` (`tagline`, `description`, `stats`), `app/layout.tsx` (metadatos), `features/shared/data/restaurantData.ts`, los textos de la landing y de `/about`, y el contenido de `/about` y `/settings` en el API.
- **Problema:**
  1. **Contradicción de posicionamiento.** D-17 pide describir el restaurante como lo define PRODUCT.md, «cocina española de alta gama con carta de vinos», pero el código dice «cocina mexicana de alta gama» (metadatos y portada), `restaurant.config.ts` dice «Cocina nacional e internacional» y la ubicación es Huejutla de Reyes, Hidalgo. Continúa NP-13. Además, la copia de trabajo de `PRODUCT.md` tiene un cambio sin confirmar (no hecho por el agente) que quita «según el encargo del rediseño: cocina española» de su apartado Positioning; el agente no lo toca ni lo versiona.
  2. **Datos que el sitio muestra y que nadie ha confirmado:** «16+ años», «80+ platillos» y «4.9★» (`restaurantConfig.stats`), el horario «Lunes a Domingo · 1:00 PM – 11:00 PM», la dirección, el teléfono y las redes. Salen de `restaurant.config.ts`, así que el rediseño los usa tal cual, pero son afirmaciones factuales.
  3. **Carta de vinos:** PRODUCT.md la cita, pero no hay datos ni vista (NP-14). Los textos nuevos la mencionan sin afirmar referencias, bodegas ni número de etiquetas.
  4. **Fotos propias de la casa (D-18):** no hay fotos de sala, fachada ni bodega. Las de la portada son generadas por IA (NP-33), y las dos de fondo de login y registro (`food-3955317_1280_zstvf7`, `meal-4840665_1280_azmrqq`) tienen nombres de Pixabay, así que parecen de banco. No se verificó su origen. Por eso «Nosotros» no presenta como «la casa» ninguna foto. Su galería son fotos de platos que envía el API, y la fachada de Google de `/about` se retira en el 4.21.
- **Cómo se redacta mientras tanto (D-17):** los textos nuevos hablan de cocina española de alta gama y carta de vinos sin dar cifras, años, nombres ni premios que no estén en la configuración o en el API, y sin afirmar el origen del producto.
- **Solución sugerida:** que el restaurante confirme su propuesta (española, mexicana o mixta) y cada dato de la lista; después, ajustar `restaurant.config.ts` y los textos del API.
- **Prioridad:** Alta.
- **Criterio de aceptación:** los metadatos, la portada, «Nosotros» y la configuración describen la misma propuesta, y cada cifra mostrada está confirmada por el restaurante.

## NP-44 · El API no da las cifras que pide el inicio de administración

- **Archivos y rutas afectados:** `features/dashboard/admin/inicio/InicioAdmin.tsx` (PLAN 5.2) y el endpoint `GET /dashboard/admin/stats`.
- **Problema:** el PLAN 5.2 pide ventas de hoy frente al mismo día de la semana anterior, cubiertos, ocupación y ticket medio. `/dashboard/admin/stats` solo devuelve `totalVentas`, `pedidosPendientes`, `pedidosEnPreparacion`, `mesasOcupadas`, `mesasLibres` y `totalMesas`.
- **Qué se hizo (sin inventar datos):**
  - **Indicadores:** ventas de hoy (sin comparación), pedidos pendientes, mesas ocupadas y reservas de hoy. Las reservas se cuentan con el endpoint de reservas que ya existía y su filtro de fechas, sin las canceladas ni las no presentadas.
  - **El componente ya está listo:** `Indicador` muestra la comparación en cuanto haya un dato (`comparacion={{ cambio, referencia: "frente al martes pasado" }}`).
- **Solución sugerida:**
  - **Backend:** añadir a `/dashboard/admin/stats` las ventas del mismo día de la semana anterior, los cubiertos del día y el número de tickets cobrados (para el ticket medio).
  - **Front:** pintar la comparación y sustituir un indicador por el ticket medio.
- **Prioridad:** Media.
- **Criterio de aceptación:** el inicio muestra la comparación semanal y el ticket medio con datos del API.

## NP-45 · Caja, propinas y facturas sin backend; las acciones de factura no existían

- **Archivos y rutas afectados:** `/dashboard/admin/finance` y `/dashboard/admin/finance/invoices` (`features/dashboard/admin/finanzas/`, `features/dashboard/admin/facturas/`, `financeMock` e `invoicesMock`).
- **Problema:**
  - Las dos pantallas trabajan con datos de ejemplo en memoria: lo registrado se pierde al recargar y las facturas no se timbran.
  - En el detalle de factura, los botones «PDF», «Enviar» e «Imprimir» no tenían ninguna acción. Se retiraron en 5.5 para no prometer lo que no hace.
- **Mientras tanto:** las pantallas lo avisan («Pantalla con datos de ejemplo») y llevan la insignia D-13.
- **Solución sugerida:** endpoints de caja chica, cierres, propinas y facturación con un PAC, y con ellos la descarga del PDF y XML y el envío por correo. Es backend y una decisión de producto.
- **Prioridad:** Media.
- **Criterio de aceptación:** las pantallas leen y escriben en el API, y el detalle de factura descarga y envía el CFDI.

## NP-46 · Carta del panel: subida de imágenes con preset de marcador y cambios que no llegan al servidor

- **Archivos y rutas afectados:** `features/dashboard/admin/carta/DialogoPlatillo.tsx` (antes `ItemModal`) y `useCartaAdmin.ts` (antes, la página `/dashboard/admin/menu`).
- **Problema:**
  1. **El widget de Cloudinary usa `uploadPreset="tu_upload_preset"`**, que es un marcador: la subida no puede funcionar tal cual. En 5.9 se limitan en el widget los formatos (JPG, PNG, WebP, AVIF) y el tamaño (5 MB). La comprobación de la **firma de bytes antes de abrir la subida**, que pide el PLAN, necesita un cargador propio, y con él un preset firmado o un endpoint del backend que firme (NP-08). No se inventa un preset.
  2. **«Agotar» u «Ofrecer» y «Eliminar» solo cambian el estado local** (`MenuService`, almacenamiento del navegador), como antes del rediseño. No hay `PATCH` ni `DELETE` al API: al recargar desde la BD, el cambio se pierde.
- **Solución sugerida:** que el backend firme las subidas (o dé el preset correcto); con eso, un cargador propio que pase `verificarArchivo(archivo, "imagen")` antes de subir. Para la disponibilidad y el borrado, conectar los `PATCH` y `DELETE` de `/platillos/:id`. Es un cambio de lógica y de backend, fuera del alcance.
- **Prioridad:** Alta.
- **Criterio de aceptación:** una imagen sube a `dcb1tspbj` con la firma comprobada antes, y disponibilidad y borrado persisten tras recargar.

## NP-47 · El cierre de sesión por inactividad (`IdleLogout`) nunca se monta

- **Archivos y rutas afectados:** `components/IdleLogout.tsx`; los layouts que podrían montarlo (`app/dashboard/layout.tsx` y el de la parte pública).
- **Problema:** el componente cierra la sesión tras 15 minutos sin actividad, pero ningún archivo lo importa, ni antes del rediseño (`3775918`) ni ahora. Al limpiar los componentes sin uso en 5.20 se conservó, porque es una función de seguridad y activarla es una decisión de producto.
- **Solución sugerida:** decidir si se activa y dónde (¿solo en los paneles?, ¿también para clientes?) y con qué aviso previo. Después, montarlo en el layout que toque y pasarlo al lenguaje del sitio (`CargadorMarca` o una notificación «Cerramos tu sesión por inactividad»).
- **Prioridad:** Media.
- **Criterio de aceptación:** la sesión del panel se cierra a los 15 minutos de inactividad, con aviso, o hay una decisión escrita de no hacerlo.
