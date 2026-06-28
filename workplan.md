# Plan de Desarrollo — FRONTEND (Next.js) — "Restaurante El Quijote"

> Este documento es la mitad **frontend** del plan de desarrollo. Existe un documento hermano, `Plan_BACKEND_Restaurante_El_Quijote.md`, con la misma numeración de fases y el contrato de endpoints que este documento consume. Ninguna tarea de frontend debe darse por completada si el endpoint correspondiente del backend no existe o no fue probado — en caso de que el backend de una fase aún no esté listo, el frontend puede construirse contra un mock temporal **explícitamente marcado** (`// MOCK temporal — reemplazar cuando backend Fase X esté listo`), pero la fase no se cierra hasta reemplazar ese mock por la llamada real.

## Convenciones generales
- Proyecto: `restaurant-management-platform` (Next.js, App Router), desplegado en Vercel.
- Gestor de paquetes: **pnpm** (`pnpm install`, `pnpm dev`, `pnpm build`).
- Estado global: Redux (`store/`). Estado de formularios/local: hooks (`hooks/`) o estado de componente.
- Cliente HTTP: confirmar en Fase 0 si ya existe un cliente centralizado (ej. `lib/api.ts` con `fetch`/`axios` configurado con la URL del backend de Render y manejo de token); si no existe, crearlo en Fase 0 para que todas las fases lo reutilicen en vez de hacer `fetch` sueltos por todo el código.
- Estilos: Tailwind. La responsividad fina se deja para la Fase 11, pero las pantallas nuevas deben construirse con clases responsive básicas desde el inicio (`flex`, `grid`, breakpoints `sm:`/`md:`) para no acumular deuda innecesaria.
- Manejo de sesión: el token (o cookie httpOnly) se guarda según el mecanismo ya definido en Fase 1; todos los `fetch` a endpoints protegidos deben pasar por el cliente centralizado para inyectar el header `Authorization` automáticamente.
- GitFlow: rama `feature/<fase>-frontend` desde `develop`; merge a `develop` al cumplir criterios de aceptación.
- Cada tarea cierra con una prueba manual **en navegador** (flujo de usuario real), no solo revisión de código.

## Contrato de API consumido (debe coincidir con el backend)

| Fase | Endpoints que consume el frontend |
|---|---|
| 1 | `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh` |
| 2 | `GET /users`, `POST /users`, `PATCH /users/:id`, `PATCH /users/:id/deactivate` |
| 3 | `POST /orders`, `PATCH /orders/:id`, `PATCH /orders/:id/status`, `GET /orders?status=&origin=` |
| 4 | `GET /cash-register/summary`, `POST /cash-register/close`, `GET /cash-register/history` |
| 5 | `POST /reservations`, `GET /reservations`, `PATCH /reservations/:id` |
| 6 | `GET /menu/categories`, `POST /menu/categories`, `GET /menu/products`, `POST /menu/products`, `PATCH /menu/products/:id` |
| 7 | `POST /orders` (origin=en_linea), `GET /orders/me`, `GET /orders?status=&origin=` (polling cocina) |
| 8 | `POST /payments/checkout`, `GET /payments/:orderId/status` |
| 9 | `GET /inventory`, `PATCH /inventory/:id`, `POST /inventory/:id/merma`, `GET /inventory/low-stock` |
| 10 | `GET /reports/sales-daily`, `GET /reports/top-products`, `GET /reports/by-payment-method`, `GET /reports/export` |
| 11 | Mismos endpoints anteriores; se ajusta el manejo de errores y estilos responsive |

---

## Fase 0 — Diagnóstico y Preparación (Frontend)
**Duración:** 0.5 día | **Rama:** `feature/00-diagnostico-frontend`

### Tareas
1. `pnpm install`; registrar errores en `docs/diagnostico-frontend.md`.
2. Auditar `app/`, `components/`, `features/` y marcar qué pantallas usan datos mock (buscar arrays hardcodeados, `data.json` locales, etc.) vs cuáles ya consumen la API real.
3. Confirmar o crear `lib/api.ts` (o `utils/api-client.ts`) como cliente HTTP centralizado, con base URL desde variable de entorno (`NEXT_PUBLIC_API_URL`), inyección automática del token de sesión, y manejo centralizado de errores (que parseé el formato `{ statusCode, message, error }` que el backend normalizará en su Fase 11, aunque desde ahora se puede dejar preparado para ese formato).
4. Revisar `store/` (Redux): confirmar slices existentes (sesión, carrito, etc.) y cuáles faltan para las fases siguientes (pedidos, menú, inventario).
5. Confirmar variables de entorno: `NEXT_PUBLIC_API_URL`, claves públicas de la pasarela de pago (Fase 8), y cualquier otra ya usada en `.env.local`.

### Criterios de aceptación
- `docs/diagnostico-frontend.md` completo.
- Cliente HTTP centralizado existente y probado contra el endpoint de salud del backend (`GET /health`, definido en la Fase 0 del backend).

### Plan de contingencia
- Si hay múltiples formas inconsistentes de hacer `fetch` repartidas por el código, no refactorizar todo de inmediato; solo asegurar que **el código nuevo** de las fases siguientes use el cliente centralizado, y migrar el código viejo de forma incremental solo si se toca esa pantalla en una fase posterior.

---

## Fase 1 — Autenticación y Control de Acceso (Frontend)
**Duración:** 1.5 días | **Rama:** `feature/01-auth-frontend`
**Depende de:** Backend Fase 1 (`POST /auth/login`, `GET /auth/me`) ya funcional.

### Objetivo
Login que redirige correctamente al dashboard según el rol devuelto por el backend, con sesión persistente.

### Tareas
1. **`app/(auth)/login/page.tsx`:**
   - Revisar el formulario y la función de submit (probablemente en `features/shared` o `hooks/useAuth.ts`). Confirmar que llama a `POST /auth/login` vía el cliente centralizado de Fase 0.
   - Al recibir `{ accessToken, user }`, guardar el token (cookie httpOnly si el backend la setea, o `localStorage`/store de Redux según arquitectura ya definida) **antes** de redirigir — esta es la causa más común del bug reportado de "no redirige".
   - Redirigir usando `router.push()` mapeando `user.role` a:
     - `admin` → `/dashboard/admin`
     - `mesero` → `/dashboard/mesero`
     - `cajero` → `/dashboard/cajero`
     - `cocina` → `/dashboard/cocina`
     - `cliente` → `/dashboard/cliente` (o a `/menu` si el cliente no tiene dashboard propio; confirmar con el mapa de sitio).
2. **`store/` (slice de sesión):** crear/ajustar un slice `authSlice` que guarde `user` y `token`, con una acción `hydrateSession()` que se ejecute al cargar la app (ej. en un `Provider` de layout raíz) llamando a `GET /auth/me` si hay un token guardado, para que el refresh de página no expulse al usuario.
3. **`middleware.ts`:** revisar que no esté ejecutando una validación de sesión síncrona contra una cookie que aún no se ha propagado en el primer render tras login (causa típica de race condition). Si es necesario, mover la validación estricta de rutas protegidas a un Client Component que espere la hidratación del store antes de decidir redirigir a `login`.
4. **Rutas protegidas por rol:** en cada `app/dashboard/<rol>/layout.tsx`, verificar `user.role` (desde el store ya hidratado) y redirigir a `app/unauthorized` si no coincide.

### Pruebas manuales (en navegador)
- Login con un usuario de cada rol: confirmar redirección inmediata al dashboard correcto sin pasos adicionales.
- Recargar la página dentro de un dashboard: confirmar que la sesión persiste y no regresa al login.
- Intentar navegar manualmente (cambiando la URL) a `/dashboard/admin` estando logueado como `mesero`: confirmar redirección a `unauthorized`.

### Criterios de aceptación
- Los 5 roles redirigen correctamente tras login y mantienen sesión al recargar.

### Plan de contingencia
- Si el origen exacto del bug de redirección no se identifica en las primeras 3-4 horas, agregar logs temporales (`console.log`) en cada paso del flujo (respuesta del login, guardado del token, ejecución del redirect) para aislar en qué punto se rompe, en vez de seguir adivinando.

---

## Fase 2 — Gestión de Usuarios y Roles (Frontend)
**Duración:** 1 día | **Rama:** `feature/02-usuarios-frontend`
**Depende de:** Backend Fase 2.

### Tareas
1. **`features/admin/users/`** (crear si no existe) **+ `app/dashboard/admin/usuarios/page.tsx`:**
   - Tabla de usuarios consumiendo `GET /users` (con paginación básica si la lista crece), reemplazando cualquier mock.
   - Formulario de alta (`POST /users`) con validación de campos (email, password, nombre, rol — usar un `<select>` con los 5 roles válidos, no texto libre).
   - Acción de edición (`PATCH /users/:id`) y de desactivación (`PATCH /users/:id/deactivate`) con confirmación (modal simple) antes de ejecutar, ya que es una acción destructiva para la operación del usuario afectado.
2. Mostrar visualmente el estado activo/inactivo (badge de color) en la tabla.

### Pruebas manuales
- Crear un usuario "cajero" desde el formulario y confirmar que aparece en la tabla sin recargar manualmente (refrescar la query tras el `POST`).
- Desactivar un usuario y confirmar el cambio visual inmediato del badge.

### Criterios de aceptación
- CRUD de usuarios completamente funcional desde la UI, sin datos mock.

### Plan de contingencia
- Si la paginación no alcanza a implementarse, mostrar la lista completa sin paginar (asumiendo que el volumen de usuarios de un solo restaurante es manejable en el MVP).

---

## Fase 3 — Gestión de Ventas / POS (Frontend)
**Duración:** 2.5 días | **Rama:** `feature/03-pos-frontend`
**Depende de:** Backend Fase 3 (`/orders`).

### Tareas
1. **Vista de mesero (`features/mesero/`, `app/dashboard/mesero/pedidos/page.tsx`):**
   - Selector de mesa (puede ser una lista simple por ahora, no necesariamente el "mapa de mesas en tiempo real" del mapa del sitio, que queda fuera del MVP estricto).
   - Catálogo de productos reales (consumiendo `GET /menu/products` de la Fase 6 — si Fase 6 backend aún no está lista, usar mock temporal marcado explícitamente) con buscador/filtro por categoría.
   - Carrito de pedido en memoria (estado de componente o slice `orderDraftSlice` en `store/`) con cálculo de subtotal en vivo.
   - Botón "Aplicar descuento" (monto o porcentaje) y botón "Confirmar pedido" que llama `POST /orders`.
2. **Vista de caja (`features/cajero/`, `app/dashboard/cajero/pedidos/page.tsx`):**
   - Lista de pedidos abiertos/confirmados consumiendo `GET /orders?status=confirmado,en_preparacion,listo`.
   - Acción de marcar pedido como pagado (transición de estado vía `PATCH /orders/:id/status`), con selección de método de pago y captura de propina (`tip_amount`) antes de cerrar.
3. Manejar el error `409` (stock insuficiente) que puede devolver el backend al confirmar un pedido: mostrar el mensaje específico del producto faltante (aunque el pulido fino de mensajes es Fase 11, este caso es crítico para la operación y debe mostrarse desde ya, aunque sea de forma básica con un `alert()` o toast simple).

### Pruebas manuales
- Como mesero, armar un pedido con 2 productos y un descuento, confirmar y verificar que el total mostrado coincide con el calculado por el backend en la respuesta.
- Como cajero, ver ese pedido en la lista, marcarlo pagado con propina, y confirmar que desaparece de la lista de pedidos abiertos.
- Forzar un pedido con cantidad mayor al stock disponible y confirmar que se muestra el mensaje de error sin romper la pantalla.

### Criterios de aceptación
- Flujo completo mesero → caja funcional con datos reales y manejo básico de error de stock.

### Plan de contingencia
- La división de cuentas (split check) queda fuera de esta fase; si se solicita, documentar como backlog post-MVP, igual que en backend.

---

## Fase 4 — Cortes de Caja (Frontend)
**Duración:** 1.5 días | **Rama:** `feature/04-corte-caja-frontend`
**Depende de:** Backend Fase 4.

### Tareas
1. **`app/dashboard/cajero/corte/page.tsx`:**
   - Vista de resumen consumiendo `GET /cash-register/summary`: desglose por método de pago, total de propinas, total esperado.
   - Campo para que el cajero ingrese `declared_cash` (efectivo contado físicamente).
   - Botón "Cerrar turno" que llama `POST /cash-register/close`, mostrando el resultado (`difference`) de forma clara (verde si coincide, rojo si hay faltante/sobrante).
2. **`app/dashboard/admin/cortes/page.tsx`:** vista de historial (`GET /cash-register/history`) para que el admin pueda auditar cortes pasados por cajero/fecha.

### Pruebas manuales
- Cerrar caja tras procesar pedidos de prueba de la Fase 3, confirmar que el resumen mostrado coincide con lo esperado.
- Ingresar un efectivo declarado distinto al esperado y confirmar que la diferencia se muestra correctamente.

### Criterios de aceptación
- Cierre de turno funcional y auditable desde el panel admin.

### Plan de contingencia
- Si el historial de cortes no alcanza a tener filtros avanzados, dejarlo como lista simple ordenada por fecha descendente.

---

## Fase 5 — Reservas (Frontend)
**Duración:** 1.5 días | **Rama:** `feature/05-reservas-frontend`
**Depende de:** Backend Fase 5.

### Tareas
1. **Parte pública (`app/reservas/page.tsx`, nueva ruta, o sección dentro de `app/menu`):**
   - Formulario de reserva (fecha, hora, número de personas, nombre, teléfono/email), sin requerir login, llamando `POST /reservations`.
   - Confirmación visual clara tras el envío (no solo un mensaje genérico de "éxito").
2. **Parte administrativa (`features/admin/reservas/`, `app/dashboard/admin/reservas/page.tsx`):**
   - Lista de reservas (`GET /reservations`) filtrable por fecha/estado.
   - Acciones de confirmar/cancelar/modificar (`PATCH /reservations/:id`).

### Pruebas manuales
- Crear una reserva desde la vista pública sin estar logueado, confirmar que aparece en el panel admin.
- Confirmar y luego cancelar la misma reserva desde el admin, verificando el cambio visual de estado.
- Intentar reservar en una franja ya saturada (según la regla del backend) y confirmar que se muestra un mensaje de error entendible.

### Criterios de aceptación
- Flujo de reserva pública → gestión administrativa completamente funcional.

### Plan de contingencia
- La lista de espera digital (mencionada en el mapa del sitio) queda fuera del MVP; no construir esa pantalla en esta fase.

---

## Fase 6 — Gestión de Menú (Frontend)
**Duración:** 1.5 días | **Rama:** `feature/06-menu-frontend`
**Depende de:** Backend Fase 6.

### Tareas
1. **Admin (`features/admin/menu/`, `app/dashboard/admin/menu/page.tsx`):**
   - CRUD visual de categorías y productos (`GET/POST /menu/categories`, `GET/POST/PATCH /menu/products`), con toggle de disponibilidad y campo de modificadores (texto libre o checkboxes simples, según lo que el backend exponga).
   - Reemplazar cualquier dato mock restante en esta vista.
2. **Público (`app/menu/page.tsx`):**
   - Reemplazar el mock actual por consumo real de `GET /menu/products` y `GET /menu/categories`, agrupando visualmente por categoría (entradas, platos fuertes, postres, bebidas) tal como indica el mapa del sitio.
   - Vista de detalle de producto (`app/menu/[productId]/page.tsx` o modal) con descripción, precio, modificadores y estado de disponibilidad.
   - Si un producto está marcado como agotado, mostrarlo deshabilitado visualmente (no ocultarlo, para que el cliente sepa que existe pero no está disponible).
3. Confirmar que el selector de productos del POS (Fase 3) ya esté consumiendo este mismo endpoint, eliminando cualquier mock temporal que se haya dejado marcado en esa fase.

### Pruebas manuales
- Crear un producto desde el admin y confirmar que aparece de inmediato en el menú público y en el selector del POS.
- Marcar un producto como agotado y confirmar que se ve deshabilitado en ambos lugares.

### Criterios de aceptación
- Menú 100% dinámico en todas las vistas que lo consumen (público, admin, POS).

### Plan de contingencia
- Si los modificadores estructurados (checkboxes) no alcanzan a implementarse, usar un campo de texto libre visible al cliente como solución mínima viable.

---

## Fase 7 — Pedidos en Línea (Frontend)
**Duración:** 2 días | **Rama:** `feature/07-pedidos-online-frontend`
**Depende de:** Backend Fase 7.

### Tareas
1. **Carrito de cliente (`store/cartSlice.ts`, `features/cliente/`):**
   - Agregar/quitar productos desde `app/menu`, persistido en el store mientras dura la sesión de navegación.
   - Vista de carrito/checkout (`app/checkout/page.tsx` o similar) con resumen antes de pagar (el pago en sí se conecta en Fase 8; aquí se prepara la estructura del pedido y se llama `POST /orders` con `origin='en_linea'`).
2. **Historial del cliente (`app/dashboard/cliente/pedidos/page.tsx`):** consumiendo `GET /orders/me`, con estado visual del pedido (pendiente, en preparación, listo, pagado).
3. **Vista de cocina (`app/dashboard/cocina/page.tsx`):**
   - Listado de pedidos entrantes (mesa + en línea) vía polling simple (`setInterval` + `GET /orders?status=confirmado&...` cada 5-10s, según lo definido en backend) si no hay tiempo para Realtime.
   - Acciones de cambio de estado (recibido → en preparación → listo) vía `PATCH /orders/:id/status`.

### Pruebas manuales
- Armar un carrito desde `app/menu` como cliente, ir a checkout y generar el pedido (sin pago todavía, eso se prueba en Fase 8).
- Confirmar que el pedido aparece en la vista de cocina dentro de la ventana de polling configurada.
- Cambiar el estado del pedido desde cocina y confirmar que el cliente lo ve actualizado en su historial (al refrescar o vía el mismo polling si el historial también lo implementa).

### Criterios de aceptación
- Flujo cliente → cocina funcional con actualización de estado visible para ambos lados.

### Plan de contingencia
- El polling con intervalo fijo es la solución aceptada si Realtime no se logra integrar; documentar el intervalo elegido para no sobrecargar el backend innecesariamente.

---

## Fase 8 — Integración de Pagos (Frontend)
**Duración:** 1.5 días | **Rama:** `feature/08-pagos-frontend`
**Depende de:** Backend Fase 8.

### Tareas
1. En el checkout de la Fase 7 (`app/checkout/page.tsx`), agregar botón "Pagar" que llama `POST /payments/checkout` y redirige al usuario a la URL devuelta por la pasarela (MercadoPago, según prioridad acordada).
2. **Páginas de retorno** (`app/checkout/success/page.tsx`, `app/checkout/failure/page.tsx` o las rutas que la pasarela requiera como `back_urls`): tras el regreso, llamar `GET /payments/:orderId/status` para confirmar el estado real antes de mostrar "pago exitoso" (no confiar solo en el parámetro de la URL de retorno, que puede ser manipulado o no reflejar el estado real si el webhook aún no procesó).
3. Mostrar claramente al cliente el estado final: pagado, pendiente de confirmación, o fallido, con la opción de reintentar si falló.

### Pruebas manuales
- Completar un pago de prueba en sandbox de MercadoPago de extremo a extremo desde el checkout y confirmar que la página de éxito muestra el estado correcto tras verificar contra el backend.
- Simular un pago fallido/cancelado y confirmar que el cliente puede reintentar sin perder su pedido.

### Criterios de aceptación
- Flujo de pago en línea completo y verificado contra el backend (no solo contra el parámetro de retorno de la URL).

### Plan de contingencia
- Si el retorno automático de la pasarela falla, dejar visible un botón "Verificar estado de mi pago" que vuelva a llamar `GET /payments/:orderId/status` manualmente.

---

## Fase 9 — Inventario y Mermas (Frontend)
**Duración:** 1.5 días | **Rama:** `feature/09-inventario-frontend`
**Depende de:** Backend Fase 9.

### Tareas
1. **`app/dashboard/admin/inventario/page.tsx`:**
   - Tabla de inventario (`GET /inventory`) con indicador visual (badge/color) cuando un producto está en bajo stock.
   - Formulario de ajuste manual (`PATCH /inventory/:id`) y de registro de merma (`POST /inventory/:id/merma`), ambos exigiendo un motivo antes de enviar.
2. Mostrar un contador o sección destacada de "Productos con bajo stock" (`GET /inventory/low-stock`) visible al entrar al dashboard admin, no solo dentro de la pantalla de inventario (para que sea una alerta proactiva).

### Pruebas manuales
- Registrar una merma desde la UI y confirmar que el stock se actualiza visualmente sin recargar la página.
- Bajar el stock de un producto por debajo del umbral y confirmar que aparece en la alerta destacada del dashboard.

### Criterios de aceptación
- Gestión de inventario y mermas funcional con alertas visibles de bajo stock.

### Plan de contingencia
- Si la alerta destacada en el dashboard general no alcanza a implementarse, dejarla únicamente dentro de la pantalla de inventario como mínimo viable.

---

## Fase 10 — Reportes Básicos (Frontend)
**Duración:** 1 día | **Rama:** `feature/10-reportes-frontend`
**Depende de:** Backend Fase 10.

### Tareas
1. **`app/dashboard/admin/reportes/page.tsx`:**
   - Selector de rango de fechas.
   - Tarjetas/resúmenes de ventas diarias (`GET /reports/sales-daily`), tabla de productos más vendidos (`GET /reports/top-products`), gráfico simple o tabla de ingresos por método de pago (`GET /reports/by-payment-method`) — un gráfico de barras básico es suficiente, sin necesidad de una librería pesada si no está ya instalada.
   - Botón de exportación que descargue el archivo desde `GET /reports/export?...`.

### Pruebas manuales
- Generar el reporte del día con datos reales de pruebas anteriores y confirmar que los números coinciden con lo visto en caja/pedidos.
- Exportar y descargar el archivo, confirmar que se abre correctamente.

### Criterios de aceptación
- Panel de reportes funcional con datos reales y exportación operativa.

### Plan de contingencia
- Si la visualización gráfica no alcanza a pulirse, una tabla simple de números es aceptable para el MVP; el gráfico es una mejora visual, no un bloqueador funcional.

---

## Fase 11 — Pulido Final: Responsividad y Mensajes de Error (Frontend)
**Duración:** 1 día | **Rama:** `feature/11-pulido-frontend`
**Depende de:** Backend Fase 11 (formato normalizado de errores).

### Tareas
1. Ajustar con Tailwind las vistas operativas críticas para uso en tablet/móvil, en este orden de prioridad: POS (mesero/cajero) → cocina → admin (menú, inventario, reportes) → público.
2. Centralizar el manejo de errores en el cliente HTTP de Fase 0 para leer el formato normalizado `{ statusCode, message, error }` que el backend expone desde su Fase 11, mostrando `message` en un componente de notificación consistente (toast) en toda la app, reemplazando `alert()`s temporales usados en fases anteriores (ej. el de stock insuficiente de la Fase 3).
3. Revisar `app/error`, `app/not-found`, `app/unauthorized`, `app/forbidden`, `app/maintenance` para que tengan contenido coherente y un botón de regreso/navegación, en vez de pantallas rotas o en blanco.

### Pruebas manuales
- Probar en una pantalla de ~768px (tablet) los flujos de POS, caja y cocina, confirmando que ningún elemento se corta o se sobrepone.
- Provocar al menos un error real en login, pedido, pago y reserva, confirmando que el mensaje mostrado es específico y no un texto genérico.

### Criterios de aceptación
- Usabilidad funcional en tablet para las pantallas operativas críticas, y mensajes de error específicos y consistentes en los 4 flujos clave.

### Plan de contingencia
- Si el tiempo se agota, priorizar exclusivamente POS, caja y cocina (uso típico en tablet/celular) sobre las pantallas administrativas de escritorio.

---

## Nota de sincronización final

Al cerrar cada fase, antes de hacer merge a `develop`, confirmar explícitamente que:
1. El endpoint correspondiente en `Plan_BACKEND_Restaurante_El_Quijote.md` está mergeado a `develop` y desplegado/probado en el entorno de desarrollo.
2. Ningún mock temporal marcado como `// MOCK temporal` quedó sin reemplazar.
3. La nomenclatura de campos (`status`, `origin`, `tip_amount`, etc.) coincide exactamente entre ambos documentos; cualquier cambio de contrato debe actualizarse en ambos archivos en el mismo commit/PR.