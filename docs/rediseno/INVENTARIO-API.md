# Inventario de llamadas de la web al API (D-32)

> Generado el 2026-11-03 sobre `feature/rediseno-web-admin` (lectura del código de los tres repos, sin ejecutar nada contra el API real). Rutas del API leídas de los controladores de `restaurant-management-api/src` (sin prefijo global). «Móvil» indica si `restaurant-management-mobile/src` llama a la misma ruta. Se actualiza al conectar cada pantalla (P8 de [`PLAN-AMPLIACION.md`](PLAN-AMPLIACION.md)).
>
> Leyenda de «Qué falta»: **—** nada · **FALTA** el API no tiene la ruta (se crea de forma aditiva en P7) · **Ajuste** la ruta existe con otro método, forma o nombre · **D-30** la pantalla se elimina.

## 1. Llamadas directas al API (`NEXT_PUBLIC_API_URL`)

### Parte pública y cuenta

| Método | Ruta que llama la web | Origen en la web | Ruta en el API | Móvil | Qué falta |
|---|---|---|---|---|---|
| GET | `/users/:id` | `lib/sesion/dal.ts` (servidor) | `GET /users/:id` | sí | — |
| PUT | `/usuarios/perfil/actualizar/:id` | `app/(auth)/profile/page.tsx` | `PATCH /users/:id` | sí (`PATCH`) | **Ajuste:** la web debe usar `PATCH /users/:id` |
| GET | `/promociones` | `app/(public)/promociones/page.tsx`, `lib/publico/datos-landing.ts` | — | no | **FALTA** (lectura pública de promociones vigentes) |
| GET | `/menu/categories/with-products` | `lib/publico/datos-landing.ts`, `app/menu/categoria/[slug]/page.tsx` | igual | sí | — |
| GET | `/menu/items/:id` | `app/menu/producto/[id]/page.tsx` | igual | sí | — |
| GET | `/recommendations/combo/:id` | `app/menu/producto/[id]/page.tsx` | igual | no | — |
| GET | `/mesas` | `app/menu/producto/[id]/page.tsx` | igual | sí | — |
| POST | `/pedidos/mesa` | `app/menu/producto/[id]/page.tsx` | igual | sí | — |
| GET | `/pedidos/usuario` | `app/menu/pedido/page.tsx`, `checkout/page.tsx` | igual | no | — |
| PATCH | `/pedidos/cancelar/:id` | `app/menu/pedido/page.tsx` | igual | sí | — |
| DELETE | `/pedidos/item/:id` | `app/menu/pedido/page.tsx` | igual | sí | — |
| POST | `/pedidos/confirmar/:id` | `app/menu/pedido/page.tsx` | igual | sí | — |
| GET, POST | `/direcciones` | `checkout/page.tsx` | igual | no | — |
| GET, POST | `/metodos-pago` | `checkout/page.tsx` | igual (la móvil usa `/pedidos/metodos-pago`) | no | — |
| POST | `/metodos-pago/setup-intent` | `checkout/page.tsx` | igual | no | — |
| POST | `/pagos/crear-intento` | `checkout/page.tsx` | igual | no | — |
| POST | `/facturas` | `checkout/page.tsx` | igual | no | — |
| GET | `/facturas/:ordenId`, `/facturas/:ordenId/descargar` | `checkout/exito/page.tsx` | igual | no | — |
| GET | `/reservations/availability`, `/reservations/map` | `features/reservations/services/reservations.service.ts` | igual | `map`: sí | — |
| POST, GET | `/reservations` | idem | igual | sí | — |
| PATCH | `/reservations/:id` | idem | igual | no | — |
| GET | `/reservations/:id/no-show-risk` | idem | igual | no | — |

### Administración

| Método | Ruta que llama la web | Origen en la web | Ruta en el API | Móvil | Qué falta |
|---|---|---|---|---|---|
| GET | `/dashboard/admin/stats` | `features/dashboard/admin/inicio/InicioAdmin.tsx` | igual | sí | Cifras de NP-44 (aditivo) |
| GET | `/dashboard/admin/ventas-por-hora` | idem | igual | no | — |
| GET | `/pedidos/admin/recent` | idem | igual | sí | — |
| GET | `/api/inventory/products` (vía `pedirPanel`, con la base del API) | idem | — | no | **Ajuste:** apunta a una ruta interna con la base del API (NP-17); el API solo tiene `GET /inventario/productos` |
| GET, POST, PATCH, DELETE | `/payroll`, `/payroll/:id` | `features/dashboard/admin/nomina/Nomina.tsx` | igual | no | — |
| GET | `/reports/customer-segments` | `features/dashboard/admin/reportes/Reportes.tsx` | igual | no | — |
| GET | `/export` | `features/dashboard/admin/reportes/DialogoExportar.tsx` | igual | no | — |
| GET, POST, PATCH | `/users`, `/users/:id` | `features/dashboard/admin/usuarios/UsuariosAdmin.tsx` | igual | `PATCH`: sí | — |
| GET | `/promociones/admin` | `features/dashboard/admin/promociones/PromocionesAdmin.tsx` | — | no | **FALTA** |
| POST, PATCH, DELETE | `/promociones`, `/promociones/:id` | idem | — | no | **FALTA** |
| GET | `/platillos/export.json`, `/platillos/export/dishes/excel`, `/platillos/template.csv` | `features/dashboard/admin/carta/useCartaAdmin.ts` | igual | no | — |
| POST | `/platillos` | idem | — | no | **FALTA** (alta) |
| PATCH | `/platillos/:id` | idem | — | no | **FALTA** (edición, disponibilidad; D-31) |
| DELETE | `/platillos/:id` | (hoy solo local) | — | no | **FALTA** (D-31) |
| POST | `/platillos/import.json`, `/platillos/import.csv`, `/import/platillos/excel` | `features/dashboard/admin/carta/importacion.ts` | igual | no | — |
| — | Firma de subida de imágenes | (hoy preset de marcador) | — | — | **FALTA** (D-31) |
| GET, POST, DELETE | `/backups`, `/backups/:id` | `features/dashboard/admin/ajustes/AjustesAdmin.tsx` | igual | no | **D-30** |
| GET | `/db-metrics/*` (8 rutas) | `features/dashboard/admin/salud/SaludSistema.tsx` | igual | no | **D-30** |
| POST | `/db-metrics/vacuum-manual` | idem | — | no | **D-30** |
| GET | `/inventory/predictive/:id`, `/inventory/predictive/ranking` | `features/dashboard/admin/prediccion/Prediccion.tsx` | igual | no | **D-30** |

## 2. Rutas internas de la web (`app/api`)

| Ruta interna | Métodos | Usa la BD directamente | Llamada desde | Equivalente en el API | Móvil | Qué falta |
|---|---|---|---|---|---|---|
| `/api/auth/login` | POST | no (reenvía) | login | `POST /auth/sign-in` | sí | — (se conserva como capa de sesión) |
| `/api/auth/register` | POST | no | registro | `POST /auth/sign-up` | no | — |
| `/api/auth/logout` | POST | no | cierre de sesión | `POST /auth/sign-out` | sí | — |
| `/api/auth/me` | GET | no | sesión del cliente, perfil | `GET /users/:id` | sí | — |
| `/api/menu/categories` | GET | no | `app/menu/page.tsx` | `GET /menu/categories/with-products` | sí | Llamar al API directamente |
| `/api/admin/users`, `/api/admin/users/[id]` | GET, POST, PUT, DELETE | sí | ninguna pantalla | `/users`, `/users/:id` (`PATCH`, `DELETE`) | no | Borrar (la pantalla ya usa el API) |
| `/api/backups` | GET, POST, DELETE | sí | ninguna (la pantalla usa el API) | `/backups` | no | Borrar (D-30, D-32) |
| `/api/cron/backups` | GET | sí | cron de `vercel.json` | — | no | **FALTA:** respaldo programado en el API |
| `/api/inventory/products` | GET, POST, PUT, DELETE | sí | `hooks/useInventory.tsx`, inicio | `GET /inventario/productos` | sí (GET) | **FALTA:** alta, edición y borrado |
| `/api/inventory/products/adjust` | POST | sí | `useInventory` | — | no | **FALTA** |
| `/api/inventory/mermas` | GET, POST | sí | `useInventory` | `/inventario/mermas` | sí | — |
| `/api/inventory/suppliers` | GET, POST, PUT, DELETE | sí | `useInventory` | — | no | **FALTA** |
| `/api/inventory/orders` | GET, POST, PUT, DELETE | sí | `useInventory` | — | no | **FALTA** |
| `/api/settings` | GET, POST | sí | ninguna | — | no | Borrar (D-30) |
| `/api/mesas` | GET | sí | ninguna | `GET /mesas` | sí | Borrar |
| `/api/public/combos`, `/api/public/cupones` | GET | sí | ninguna | — | no | Borrar; cupones: validación en el API (NP-20) |
| `/api/logout` | — | — | `components/IdleLogout.tsx` (sin montar) | — | — | No existe (NP-47) |

## 3. Rutas del API que usa la móvil y no la web

`GET /caja/actual`, `POST /caja/abrir`, `POST /caja/cerrar`, `POST /cocina/incidencias`, `GET /inventario/productos`, `GET, POST /inventario/mermas`, `GET /reportes/hoy`, `GET /pedidos/:id`, `PATCH /pedidos/:id/estatus`, `POST /pedidos/:id/cobrar`, `GET /pedidos/metodos-pago`, `PATCH /users/:id/password`.

Son candidatas a reutilizarse en la web: caja (`/caja/*`, D-24 y NP-45), cocina y sala (`/pedidos/:id/estatus`), y el resumen del día (`/reportes/hoy`).

## 4. Resumen de lo que falta en el API (aditivo, P7)

1. Promociones: lectura pública de vigentes y CRUD de administración.
2. Platillos: `POST`, `PATCH` y `DELETE /platillos/:id` y firma de subida de imágenes (D-31).
3. Inventario: alta, edición, borrado y ajuste de productos; proveedores; órdenes de compra.
4. Respaldo programado (sustituye a la ruta interna de cron).
5. Reportes de problemas (D-34).
6. Cifras del inicio (NP-44) y caja, propinas y facturas del administrador (NP-45), reutilizando `/caja/*` y `/reportes/hoy` donde sirvan.
7. En la web: perfil a `PATCH /users/:id`, inicio de inventario a la ruta del API, carta pública directa al API.
