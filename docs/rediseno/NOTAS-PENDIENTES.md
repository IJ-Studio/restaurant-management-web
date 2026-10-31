# Notas pendientes (fuera del alcance del rediseño)

> El rediseño solo toca UI, UX y las medidas de seguridad aplicables desde la interfaz o la configuración del front. Lo que sigue **no se ejecuta** en las ramas `feature/rediseno-web-*`. Cada nota está pensada para ejecutarse en otra sesión.
>
> Origen: diagnóstico del 2026-10-30 (`docs/rediseno/ESTADO.md`, referencias al commit `922c05d`). Ningún valor secreto aparece aquí.
>
> **Prioridad:**
> - **Crítica:** explotable hoy o con impacto grave; antes de cualquier despliegue.
> - **Alta:** próximo sprint.
> - **Media:** planificar.
> - **Baja:** cuando haya ocasión.

## Índice

| ID | Tema | Categoría | Prioridad |
|---|---|---|---|
| NP-01 | Route handlers con acceso directo a Postgres y sin autenticación | Seguridad del servidor / BD | **Crítica** |
| NP-02 | Secreto JWT comprometido y modelo de firma compartido | Autenticación | **Crítica** |
| NP-03 | Contraseñas en texto plano y contraseña por defecto | Autenticación / BD | **Crítica** |
| NP-04 | Token de sesión fuera de `localStorage`: cookie HttpOnly | Sesiones | Alta |
| NP-05 | IDOR en pedidos, pagos y facturas | Seguridad del servidor | Alta |
| NP-06 | Validación y saneamiento en el servidor | Validación servidor | Alta |
| NP-07 | Límites de peticiones (rate limiting) | Límites | Alta |
| NP-08 | Subidas a Cloudinary firmadas y preset restringido | Seguridad del servidor / infra | Alta |
| NP-09 | Claves de pasarela de pago gestionadas en el navegador | Seguridad del servidor | Alta |
| NP-10 | Respaldos y credenciales de Google en el entorno del front | Infraestructura | Alta |
| NP-11 | Facturación creada desde el cliente tras el pago | Lógica de negocio | Alta |
| NP-12 | Datos mock y `localStorage` como motor de datos | Lógica de negocio / API | Alta |
| NP-13 | Posicionamiento del contenido: cocina mexicana frente a española | Contenido | Alta |
| NP-14 | Carta de vinos: datos, endpoints y gestión | API / contenido | Alta |
| NP-15 | Mensajes que permiten enumerar usuarios | Autenticación | Media |
| NP-16 | Recuperación de contraseña desactivada | Autenticación | Media |
| NP-17 | Endpoints inexistentes o mal apuntados desde el front | Contratos API | Media |
| NP-18 | Ajustes y "acerca de" del admin que no llegan al sitio público | Lógica de negocio | Media |
| NP-19 | `/dashboard/cliente` no existe (redirección del rol 5) | Rutas / lógica | Media |
| NP-20 | Cupones activos expuestos públicamente | Seguridad del servidor | Media |
| NP-21 | Conexión a BD con `rejectUnauthorized: false` | Base de datos | Media |
| NP-22 | Script de instalación que escribe secretos y descarga de una rama temporal | Infraestructura | Media |
| NP-23 | Cierre de sesión por inactividad | Sesiones | Media |
| NP-24 | Panel de rendimiento de BD dentro del admin del restaurante | Producto | Baja |
| NP-25 | Scripts de BD sueltos en la raíz del repo | Deuda técnica | Baja |
| NP-26 | Integración continua (lint, tipos, build y E2E en cada PR) | Infraestructura | Media |
| NP-27 | HSTS preload, cortafuegos y protección contra bots en Vercel | Infraestructura | Baja |
| NP-28 | Entorno local: pnpm global roto y disco C: lleno | Entorno | Baja |
| NP-29 | Pagos con `PaymentElement` (Apple Pay y Google Pay) | Idea | Baja |
| NP-30 | Ideas de producto para la parte pública | Idea | Baja |
| NP-31 | Librería `xlsx@0.18.5` con vulnerabilidades conocidas (decisión D-06) | Dependencias / seguridad | Alta |
| NP-32 | Autorización por rol y por propietario en cada endpoint (complemento de D-15) | Seguridad del servidor | Alta |
| NP-33 | Calidad y metadatos de las imágenes en Cloudinary | Contenido | Media |
| NP-34 | Retirar el limpiador de service workers antiguos | Deuda técnica | Baja |

---

## NP-01 · Route handlers con acceso directo a Postgres y sin autenticación

- **Archivos y rutas afectados:**
  - `app/api/admin/users/route.ts` (GET, POST), `app/api/admin/users/[id]/route.ts` (PUT, DELETE)
  - `app/api/backups/route.ts` (GET, POST, DELETE), `app/api/cron/backups/route.ts`, `app/api/settings/route.ts` (GET, POST)
  - `app/api/inventory/{products,products/adjust,orders,suppliers,mermas}/route.ts`, `app/api/mesas/route.ts`, `app/api/public/{combos,cupones}/route.ts`, `app/api/menu/categories/route.ts`
  - `lib/db.ts`, `lib/schema.ts`, `lib/public.schema.ts`, `drizzle/`
- **Problema:** el repo del front contiene una segunda API que lee y escribe en PostgreSQL con `DATABASE_URL`. `proxy.ts:68` deja pasar todo `/api/*`, y varios handlers no comprueban sesión ni rol:
  - cualquiera puede crear o editar usuarios con cualquier rol, incluido administrador;
  - cualquiera puede leer los salarios y direcciones del personal;
  - cualquiera puede lanzar o borrar respaldos de la BD y modificar ajustes e inventario.

  Además, las respuestas 500 devuelven el texto SQL.
- **Riesgo:** toma de control total de la aplicación y fuga de datos personales y de la BD.
- **Solución sugerida:**
  1. Llevar cada endpoint al API externo (NestJS), con autenticación y autorización por rol.
  2. Cambiar el front para consumir el API.
  3. Borrar `app/api/*` con BD, `lib/db.ts`, `lib/schema.ts`, `lib/public.schema.ts`, `drizzle/` y las dependencias `pg`, `drizzle-orm`, `drizzle-kit`, `bcrypt`, `firebase-admin` y `googleapis`.
  4. Quitar `DATABASE_URL` del entorno del front.

  Mientras tanto, el PLAN (paso 2.10, decisión D-15) exige en `proxy.ts` un token válido en todo `/api/*`, salvo una lista documentada de rutas públicas, y rol admin en `/api/admin/**` y `/api/backups/**`. Es una barrera optimista: no sustituye a la autorización dentro de cada handler (NP-32).
- **Prioridad:** Crítica.
- **Criterio de aceptación:**
  - `rg "lib/db|drizzle-orm|from \"pg\"" app components features lib` no devuelve resultados.
  - Ninguna ruta bajo `/api` del front toca la BD.
  - Todas las operaciones del admin funcionan contra el API externo con un token válido y devuelven 401/403 sin él.
  - Ningún error devuelve SQL.

## NP-02 · Secreto JWT comprometido y modelo de firma compartido

- **Archivos y rutas afectados:** `proxy.ts:20-23`, `lib/session.ts:18-22`, `scripts/setup-windows.ps1:136,170`; historial de git (commits `43d3192` y `71ac470`).
- **Problema:** `proxy.ts` trae como respaldo de `JWT_SECRET` una cadena hexadecimal real de 64 caracteres (`****`), presente en el historial. Además:
  - `lib/session.ts` usa otro respaldo predecible distinto, así que, si falta la variable, cada archivo valida con una clave diferente;
  - el front guarda el mismo secreto HMAC (HS256) con el que el backend firma los tokens.
- **Riesgo:** quien conozca el secreto, o acceda al entorno del front, puede emitir tokens de administrador válidos para el API.
- **Solución sugerida:**
  1. **Rotar** `JWT_SECRET` en todos los entornos y tratar el anterior como comprometido.
  2. Pasar a firma asimétrica (RS256 o EdDSA con JWKS publicado por el API), para que el front solo tenga la clave pública, o que el front no verifique y delegue en `GET /auth/me`.
  3. Valorar purgar el valor del historial (`git filter-repo`) si el repo pudiera hacerse público.

  La eliminación del respaldo en el código, para fallar cerrado, sí está en el PLAN (paso 2.9).
- **Prioridad:** Crítica.
- **Criterio de aceptación:**
  - El secreto antiguo ya no valida tokens en ningún entorno.
  - El front no contiene ningún secreto de firma; si se mantiene la verificación en el front, usa solo la clave pública.

## NP-03 · Contraseñas en texto plano y contraseña por defecto

- **Archivos y rutas afectados:** `app/api/admin/users/route.ts:80,90`; `app/dashboard/admin/users/page.tsx:397`.
- **Problema:** el alta de usuarios desde el admin guarda la contraseña en texto plano y, si no se indica, usa una contraseña por defecto (`1234****`). Además, el administrador escribe la contraseña del nuevo usuario.
- **Riesgo:** compromiso masivo de cuentas si se filtra la BD; cuentas con contraseña conocida.
- **Solución sugerida:**
  - Hash con argon2id o bcrypt en el API.
  - Alta por invitación: correo con enlace de un solo uso para que el usuario fije su contraseña.
  - Forzar el cambio de las contraseñas existentes.
  - La política de contraseñas del admin debe igualar a la del registro.
- **Prioridad:** Crítica.
- **Criterio de aceptación:** ninguna contraseña se almacena en claro; no existe contraseña por defecto; el formulario del admin ya no pide contraseña (el ajuste de UI se hará después de este cambio).

## NP-04 · Token de sesión fuera de `localStorage`: cookie HttpOnly

- **Archivos y rutas afectados:**
  - `app/(auth)/login/page.tsx:72-73,106`, `lib/api.ts:42`, `providers/AuthProvider.tsx:28`
  - `features/reservations/services/reservations.service.ts:16`, `app/dashboard/admin/page.tsx:16`, `app/menu/pedido/page.tsx:76`
  - `features/dashboard/admin/utils/menuUtils.ts:109`, `components/admin/Importpreviewmodal.tsx:471`
  - `app/api/auth/{login,logout}/route.ts`
- **Problema:** el JWT se guarda en `localStorage.authToken` y en una cookie `session` creada desde JavaScript (sin `HttpOnly` ni `Secure`). Cualquier XSS puede leerlo.
- **Riesgo:** robo de sesión, incluida la de administrador.
- **Solución sugerida (elegir una):**
  - **(a)** El API emite `Set-Cookie: session=…; HttpOnly; Secure; SameSite=Lax; Path=/` y el front llama con `credentials: "include"`. Requiere CORS con credenciales y protección CSRF (token de doble envío o `SameSite=Strict` en las mutaciones).
  - **(b)** BFF en Next: `/api/auth/login` fija la cookie HttpOnly y un route handler reenvía al API añadiendo `Authorization`.

  En los dos casos se eliminan `localStorage.authToken`, `localStorage.user` y la cookie escrita por JS.
- **Prioridad:** Alta.
- **Criterio de aceptación:**
  - `document.cookie` no contiene el token.
  - `localStorage` solo contiene `elquijote:preferencias`.
  - La prueba E2E de almacenamiento (PLAN 0.6) deja de tener la excepción `authToken`.

## NP-05 · IDOR en pedidos, pagos y facturas

- **Archivos y rutas afectados:** `app/menu/producto/[id]/page.tsx:195-199`, `app/menu/pedido/checkout/page.tsx`, `app/menu/pedido/checkout/exito/page.tsx:27,44`. Endpoints del API: `POST /pedidos/mesa`, `/metodos-pago/setup-intent`, `/metodos-pago`, `/pagos/crear-intento`, `GET /facturas/:id`, `GET /facturas/:id/descargar`.
- **Problema:** el front envía `usuarioId` u `ordenId` en el cuerpo o la URL sin `Authorization`. Si el API confía en ellos, se puede actuar en nombre de otro usuario o descargar facturas ajenas, que contienen datos fiscales.
- **Riesgo:** suplantación y fuga de datos fiscales.
- **Solución sugerida:** el API obtiene el usuario del token y autoriza por propietario; ignora `usuarioId` en el cuerpo. El front envía las credenciales (depende de NP-04).
- **Prioridad:** Alta.
- **Criterio de aceptación:** las peticiones con `usuarioId` u `ordenId` ajenos devuelven 403; sin token devuelven 401.

## NP-06 · Validación y saneamiento en el servidor

- **Archivos y rutas afectados:** todos los endpoints del API que reciben datos de registro, login, perfil, reserva, checkout (RFC, CP, dirección), CRUD del admin (platos, promociones, inventario, usuarios, ajustes, "acerca de") e importación CSV/JSON/XLSX. Afectan especialmente a los campos `heroTitle` y `about.description`, que hoy se pintan como HTML (`components/landing/Hero.tsx:96`, `components/landing/AboutSection.tsx:65`).
- **Problema:** la validación del front es solo una ayuda de UX. Si el API acepta HTML o datos sin validar, se almacenan XSS y datos inválidos.
- **Riesgo:** XSS almacenado en la portada pública y corrupción de datos.
- **Solución sugerida:**
  - Esquemas de validación en el API (class-validator o zod), con límites de longitud iguales a los del front.
  - Los campos de texto enriquecido pasan a ser texto plano o campos estructurados.
  - El HTML que llegue se rechaza o se sanea en el servidor.
  - Idealmente, compartir los esquemas front-API en un paquete común.

  El front deja de interpretar HTML en el paso 2.12 del PLAN.
- **Prioridad:** Alta.
- **Criterio de aceptación:** enviar `<script>` o atributos `on*` en cualquier campo devuelve 400 o se guarda escapado; cada endpoint documenta su esquema.

## NP-07 · Límites de peticiones (rate limiting)

- **Archivos y rutas afectados:** API: `/auth/sign-in`, `/auth/register`, reservas, búsquedas, creación de pedidos y pagos; route handlers mientras existan (NP-01).
- **Problema:** no hay límites de peticiones. El front solo aplica un bloqueo visual tras varios intentos (`useLockout`).
- **Riesgo:** fuerza bruta de credenciales, abuso de reservas y pedidos, y costes de Stripe y Cloudinary.
- **Solución sugerida:** limitación por IP y por cuenta en el API (por ejemplo `@nestjs/throttler`), respuestas 429 con `Retry-After` y, si hace falta, el cortafuegos de Vercel (NP-27).
- **Prioridad:** Alta.
- **Criterio de aceptación:** más de N intentos de login por minuto devuelven 429; el front ya muestra un mensaje genérico ante 429.

## NP-08 · Subidas a Cloudinary firmadas y preset restringido

- **Archivos y rutas afectados:** `features/dashboard/admin/components/ItemModal.tsx:173`, `features/dashboard/admin/components/PromoModal.tsx:197`; configuración de la cuenta de Cloudinary.
- **Problema:** `CldUploadButton` usa el preset placeholder `tu_upload_preset`, sin firmar, así que hoy la subida no funciona. Con un preset sin firmar real, cualquiera que conozca la nube pública podría subir archivos.
- **Riesgo:** abuso del almacenamiento y alojamiento de contenido ajeno.
- **Solución sugerida:**
  - El API expone un endpoint de firma (`signatureEndpoint`) que exige rol admin.
  - Preset firmado con `allowed_formats` (jpg, png, webp, avif), tamaño máximo, carpeta fija y moderación.

  El front ya valida tipo, tamaño y firma de bytes antes de subir (PLAN 5.x).
- **Prioridad:** Alta.
- **Criterio de aceptación:** una subida sin firma válida es rechazada por Cloudinary; solo el rol admin obtiene firmas.

## NP-09 · Claves de pasarela de pago gestionadas en el navegador

- **Archivos y rutas afectados:** `features/dashboard/admin/components/settings/GatewayModal.tsx:49-56`, `features/dashboard/admin/data/settingsMock.tsx:29`.
- **Problema:** el admin tiene un formulario para escribir la API key y la secret key de las pasarelas.
- **Riesgo:** exposición de claves secretas de pago.
- **Solución sugerida:** las claves se gestionan solo en el backend (variables de entorno o gestor de secretos). La UI muestra el estado («Conectada · termina en 4F2A») que devuelve el API y no tiene campos de secreto. El ajuste de UI se hace cuando exista el endpoint.
- **Prioridad:** Alta.
- **Criterio de aceptación:** ningún formulario del front acepta claves secretas; el bundle no contiene marcadores con forma de clave (`sk_live_`).

## NP-10 · Respaldos y credenciales de Google en el entorno del front

- **Archivos y rutas afectados:** `app/api/backups/route.ts`, `app/api/cron/backups/route.ts`, `vercel.json` (cron diario), variables `GOOGLE_PRIVATE_KEY`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_DRIVE_FOLDER_ID` y `DATABASE_URL`; `app/api/backups/route.ts:95` (log de `GaxiosError`).
- **Problema:**
  - El front hace volcados de la BD y los sube a Google Drive con credenciales de cuenta de servicio.
  - El log de error puede incluir cabeceras `Authorization`.
  - `app/api/cron/backups/route.ts` no verifica `CRON_SECRET`: el comentario de la línea 6 lo menciona, pero el código no lo comprueba, así que cualquiera puede invocar el cron. Por eso es la única excepción temporal de la lista de rutas públicas de D-15 (PLAN 2.10).
  - `lib/db.ts:39` llama a `http://localhost:3000/api/cron/backups` desde el propio módulo de base de datos.
- **Riesgo:** exfiltración de la BD completa y de credenciales.
- **Solución sugerida:** mover los respaldos a la infraestructura del backend (job programado del API o del proveedor de BD), con las credenciales fuera del proyecto del front. Registrar solo `err.message`.
- **Prioridad:** Alta.
- **Criterio de aceptación:** el proyecto de Vercel del front no tiene variables de servidor de BD ni de Google; `vercel.json` no programa respaldos.

## NP-11 · Facturación creada desde el cliente tras el pago

- **Archivos y rutas afectados:** `app/menu/pedido/checkout/page.tsx`, `app/menu/pedido/checkout/exito/page.tsx`.
- **Problema:** la factura (CFDI) se solicita desde el navegador después del pago. Si el usuario cierra la pestaña, la factura no se genera; además depende de datos enviados por el cliente.
- **Riesgo:** inconsistencias fiscales y manipulación.
- **Solución sugerida:** generar la factura en el API a partir del webhook de Stripe (`payment_intent.succeeded`), con los datos fiscales ya guardados en el pedido.
- **Prioridad:** Alta.
- **Criterio de aceptación:** cada pago confirmado produce su factura aunque el cliente no vuelva a la página de éxito.

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

## NP-15 · Mensajes que permiten enumerar usuarios

- **Archivos y rutas afectados:** API `/auth/sign-in`, `/auth/register` y recuperación; el front muestra `data.message` tal cual en `app/(auth)/login/page.tsx` y `app/(auth)/register/page.tsx`.
- **Problema:** si el API responde «correo ya registrado» o «usuario no existe», se puede saber qué correos tienen cuenta.
- **Riesgo:** enumeración de cuentas y phishing dirigido.
- **Solución sugerida:** respuestas genéricas en el API («Correo o contraseña incorrectos»; en el registro, «Si el correo es válido, te enviaremos un enlace»).

  El front pasa a mensajes genéricos propios y deja de mostrar `data.message` (PLAN 4.x).
- **Prioridad:** Media.
- **Criterio de aceptación:** las respuestas del API no difieren entre un correo existente y uno inexistente, ni en texto ni en código.

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

## NP-20 · Cupones activos expuestos públicamente

- **Archivos y rutas afectados:** `app/api/public/cupones/route.ts`.
- **Problema:** el endpoint público lista los cupones activos con sus códigos.
- **Riesgo:** uso indebido de descuentos.
- **Solución sugerida:** el API valida un cupón concreto (`POST /cupones/validar`) sin listar códigos; el listado público solo muestra promociones sin código.
- **Prioridad:** Media.
- **Criterio de aceptación:** no existe ningún endpoint público que devuelva códigos de cupón.

## NP-21 · Conexión a BD con `rejectUnauthorized: false`

- **Archivos y rutas afectados:** `lib/db.ts`.
- **Problema:** la conexión TLS a Postgres no valida el certificado.
- **Riesgo:** intermediario en la conexión a la BD.
- **Solución sugerida:** validar con la CA del proveedor. Desaparece al resolver NP-01.
- **Prioridad:** Media.
- **Criterio de aceptación:** las conexiones a BD validan el certificado, o el front ya no conecta a la BD.

## NP-22 · Script de instalación que escribe secretos y descarga de una rama temporal

- **Archivos y rutas afectados:** `scripts/setup-windows.ps1`.
- **Problema:** el instalador escribe `DATABASE_URL` y `JWT_SECRET` en el `.env` del front y descarga de una rama `claude/...` de GitHub.
- **Riesgo:** propagación de secretos de servidor y dependencia de una rama efímera.
- **Solución sugerida:** que el instalador del front solo pida variables públicas (`NEXT_PUBLIC_API_URL`, nube de Cloudinary, clave publicable de Stripe) y use la rama `main` o una etiqueta.
- **Prioridad:** Media.
- **Criterio de aceptación:** el script no maneja secretos de servidor.

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

## NP-31 · Librería `xlsx@0.18.5` con vulnerabilidades conocidas

- **Archivos y rutas afectados:** `package.json`, `components/admin/Importpreviewmodal.tsx:467-488`, `app/dashboard/admin/menu/page.tsx:147-178`.
- **Problema:** la importación de la carta (CSV, JSON y XLSX) se parsea en el navegador con `xlsx@0.18.5`, la última versión publicada en npm. Tiene **prototype pollution (CVE-2023-30533)** y **ReDoS (CVE-2024-22363)**. El usuario decidió (D-06) no cambiarla durante el rediseño.
- **Riesgo:** un archivo manipulado podría contaminar prototipos o bloquear la pestaña del administrador.
- **Solución sugerida:** elegir una opción.
  - **(a)** Instalar SheetJS 0.20.x desde el tarball oficial (`https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`), fijado con integridad en el lockfile, y cargarlo con `import()` solo al importar.
  - **(b)** Mover el parseo al API (recomendado a medio plazo): el front solo sube el archivo validado.

  Mientras tanto, el PLAN (paso 5.9) valida tamaño (≤ 2 MB), extensión, tipo MIME y firma de bytes antes de entregar el archivo a `xlsx`.
- **Prioridad:** Alta.
- **Criterio de aceptación:** `pnpm audit` no muestra avisos de `xlsx`; la importación de los archivos de ejemplo funciona igual.

## NP-32 · Autorización por rol y por propietario en cada endpoint

- **Archivos y rutas afectados:** todos los route handlers de `app/api` mientras existan (NP-01) y los endpoints del API externo.
- **Problema:** la decisión D-15 hace que el proxy exija un token válido en `/api/*` (salvo la lista pública documentada) y rol admin en `/api/admin/**` y `/api/backups/**`. Pero el proxy es una comprobación optimista: no decide qué rol puede hacer cada operación (por ejemplo, ¿cocina puede ajustar inventario?) ni comprueba la propiedad de los recursos.
- **Riesgo:** un usuario autenticado con un rol bajo podría usar operaciones que no le corresponden.
- **Solución sugerida:**
  - Una matriz de permisos rol × operación definida en el API.
  - Comprobación en cada handler o controlador (guards de NestJS).
  - Pruebas de autorización por endpoint.
  - Al migrar (NP-01), retirar del proxy las reglas que dupliquen esa lógica.
- **Prioridad:** Alta.
- **Criterio de aceptación:** cada endpoint documenta qué roles admite; las pruebas cubren al menos un caso permitido y uno denegado por rol.

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
