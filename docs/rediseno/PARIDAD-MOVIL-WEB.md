# Paridad entre la app móvil y la web (D-33)

> 2026-11-03. Web: `feature/rediseno-web-admin` tras P4 y P5 (estructura fijada por D-27 a D-30). Móvil: `restaurant-management-mobile`, rama `feature/diseno-movil`, leída sin modificarla. Las dos comparten el API y la base de datos. Este documento compara; no cambia nada en la móvil.

## 1. Navegación por rol

| Rol | Web | Móvil | Diferencia |
|---|---|---|---|
| Administración | Barra lateral (≥ 1024 px) o navegación a la vista (móvil): **Servicio** (Inicio, Reservas, Carta, Promociones) y **Gestión** (Inventario: Existencias y Proveedores; Personal; Facturas). El Inicio tiene cuatro pestañas: Servicio de hoy, Caja y propinas, Nómina, Reportes. | Pestañas inferiores: Dashboard, Pedidos, Reservaciones, Menú, Perfil. | La web gestiona (carta, promociones, inventario, personal, nómina, facturas, reportes); la móvil opera (pedidos, cobros, reservaciones) y no tiene promociones, inventario, personal, nómina ni facturas. |
| Caja | Una pantalla, «Cobros»: caja propia, cuentas entregadas por cobrar y cobro. | Cobros (lista y Cobrar), Pedidos, Perfil; «Corte de caja» desde Cobros. | La móvil tiene la lista de todos los pedidos y el corte con desglose por método; la web, el corte en un diálogo. |
| Sala (mesero) | Una pantalla, «Mesas»: estado de cada mesa, tomar pedido, marcar servido. | Menú (con el pedido de la mesa), Pedidos, Reservaciones, Perfil. | La móvil parte del menú y usa un plano; la web parte de las mesas en tarjetas. |
| Cocina | Una pantalla, «Comandas»: tres columnas y existencias en un panel lateral. | Pedidos (con filtros de cocina), «Incidencias y mermas», Perfil. | La web no tiene incidencias ni mermas; la móvil no tiene existencias. |
| Cliente | Sitio público, `/profile` (desde NP-19, `/dashboard` lleva aquí). | Sin acceso (el inicio de sesión lo rechaza). | — |

## 2. Pantallas equivalentes

### Resumen del día (admin)

| Elemento | Web (Inicio) | Móvil (Dashboard) |
|---|---|---|
| Fuente | `/dashboard/admin/stats`, `/pedidos/admin/recent`, `/dashboard/admin/ventas-por-hora`, `/reservations`; en Caja y propinas, `/reportes/hoy` y `/caja/cortes` | `/dashboard/admin/stats`, `/reportes/hoy`, `/reservations/map` |
| Encabezado | «Inicio», sin saludo | Fecha, «Resumen del día» y saludo por hora |
| Indicadores | Ventas de hoy, Pedidos pendientes, Mesas ocupadas, Reservas de hoy (Servicio de hoy); Cobrado hoy, Propinas, Ticket medio, Comensales (Caja y propinas) | En cocina, Por confirmar, Listos para servir, Por cobrar, Mesas ocupadas, Propinas; cobrado, ticket y comensales en el encabezado |
| Bloques | Alertas de existencias, Pedidos recientes (tabla con filtro), Ventas de hoy por hora; por método de pago, por persona que cobró, cortes de caja | Plano de mesas, ventas por hora, cómo pagaron (con %), ventas por mesero, cobros por cajero, lo más vendido, últimos cobros, incidencias y mermas, pedidos de hoy |
| Refresco | Al abrir; Reintentar | Cada 60 s |

### Pedidos y estados

| Elemento | Web | Móvil |
|---|---|---|
| Nombres de estado | Inicio: Pendiente, En preparación, Entregado, Cancelado, Completado | Por confirmar, En cocina, Preparando, Lista para servir, Por cobrar, Pagada, Completada, Cancelada |
| Folio | Seis primeros caracteres del UUID en mayúsculas (cocina, caja) | No se muestra |
| Hora | La del API («20:15» / «08:25 p. m.») | La del API; además «hace N min» y aviso de demora a los 20 min |
| Acciones de cocina | Empezar, Marcar lista | Empezar a preparar, Marcar como lista |
| Acciones de piso | Marcar servido | Entregar en la mesa, Confirmar y enviar a cocina, Quitar platillo, Cancelar (2 min) |

### Cobro

| Elemento | Web (Caja) | Móvil (Cobrar) |
|---|---|---|
| Formas de pago | Las del API (`/pedidos/metodos-pago`) | Las del API |
| Propina | Campo en pesos | Porcentajes y «Otra propina ($)» |
| Efectivo | «Recibido» y cambio | Montos sugeridos, «Recibido ($)» y cambio |
| Cuenta separada | No | Completa, partes iguales, por platillo |
| Referencia de terminal | No | «Referencia o folio (opcional)» |
| Recibo | Notificación con el cambio | Pantalla de recibo |

### Caja

| Elemento | Web | Móvil |
|---|---|---|
| Abrir | Diálogo «Fondo inicial» | Campo «Fondo inicial ($)» |
| Abierta | Indicadores: cobrado en tu caja, propinas, efectivo esperado | Efectivo, Tarjeta, Digital, Debe haber en caja |
| Cerrar | Diálogo: efectivo contado y notas | Efectivo contado con diferencia en vivo («Cuadra», «Sobran», «Faltan») y notas |

### Sala

| Elemento | Web | Móvil |
|---|---|---|
| Elegir mesa | Tarjetas con estado (Libre, Ocupada, Plato listo) | Plano con estado (libre, ocupada, reservada, por cobrar) |
| Comensales | Campo numérico 1–50 | Stepper 1–50 |
| Platos | Lista por categoría con +/− | Desde el Menú, con +/− (1–99) |
| Notas | No | Nota por platillo (200) y nota general (500) |
| Envío | `POST /pedidos/mesa` y `POST /pedidos/confirmar/:id` | `POST /pedidos/mesa` |

### Reservaciones

| Elemento | Web (admin y público) | Móvil |
|---|---|---|
| Alta | Asistente de 4 pasos con plano de mesas (público) | Formulario con canal (teléfono o en persona) |
| Teléfono | Solo no vacío (NP-06) | 8–20 caracteres |
| Antelación | Fecha y hora futuras | Al menos 1 hora |
| Consentimiento | Casilla del aviso de privacidad (D-36) | No |

### Perfil

| Elemento | Web | Móvil |
|---|---|---|
| Datos | Nombre, apellidos, teléfono (`PATCH /users/:id`, +52) y dirección (`/direcciones`) | Nombre, apellido, teléfono (`PATCH /users/:id`, +52) |
| Contraseña | No (recuperación desactivada, NP-16) | Cambiar contraseña (`PATCH /users/:id/password`) |

### Formatos

| Dato | Web | Móvil |
|---|---|---|
| Dinero | `$ 1,234.50` (con espacio) | `$1,234.50` |
| Hora | 24 h en paneles («20:15») | 12 h («08:25 p. m.») |
| Mesa | «Mesa 4» (del API) | «Mesa B01» del API; en el plano solo «B01» |

## 3. Cambios que tendría que adoptar la móvil

Propuestas para otra sesión, sin tocar el repo de la móvil:

1. **Reportar un problema** (D-34): el mismo `POST /reportes-problemas` desde Perfil, para que los reportes de las dos apps lleguen al mismo sitio.
2. **Consentimientos y avisos** (D-36): enlazar el aviso de privacidad del personal desde Perfil (lo exige el documento legal para la ficha de la app) y registrar el consentimiento cuando el API lo ofrezca.
3. **Nombres de estado**: adoptar una sola tabla de nombres para web y móvil (la de la móvil es más completa; la web la toma en el resumen del Inicio).
4. **Formato de dinero**: acordar uno (con o sin espacio tras el signo).
5. **Imágenes de platillos**: la subida firmada del API (`POST /imagenes/firma`, D-31) sirve también si la móvil llega a editar la carta.
6. **Existencias en cocina**: cuando el API dé `minStock`, la móvil puede mostrar las existencias bajas como la web.

## 4. Cambios de la web inspirados en la móvil (pendientes, etiqueta (a) o (b))

- Cuenta separada, referencia de terminal y propina por porcentaje en el cobro de caja.
- Notas por platillo y nota general al tomar el pedido en sala.
- Incidencias y mermas en el panel de cocina (`/cocina/incidencias`, `/inventario/mermas`).
- Aviso de demora en cocina a los 20 minutos.
- Cambio de contraseña en `/profile` con `PATCH /users/:id/password`.

## 5. Estado al 13-nov (Fase 2 del plan de entrega)

Hecho en la móvil (PRs #464–#474, pendientes de aprobación) para igualar a la web:

| Sección (admin) | Web | Móvil ahora |
|---|---|---|
| Reservaciones | Cambiar estado, cancelar con motivo, WhatsApp y correo | Igual (#465, #473); al reservar se elige mesa (#466) |
| Carta | Alta, edición, imagen, importar, agotar | Agotar y corregir precio (#467); alta, imágenes e importación siguen en la web (formularios largos) |
| Personal | Alta, edición, rol, activar/desactivar | Igual (#469); `GET /users?incluirInactivos=true` (API #148) |
| Nómina | Periodo Desde/Hasta, empleados, sumar/restar | Igual (#470) |
| Facturas | Bandeja de solicitudes, emitir, rechazar; historial y descarga | Bandeja, emitir y rechazar (#474); historial y descarga en la web |
| Cocina | Existencias bajas | Igual (#468) |
| Estilo | Tokens de `styles/tokens.css` | Generados desde la web, tema claro (#471) |

Hecho en la web: correo en reservaciones (#21), importar carta con vista previa y filtros
«Deshabilitados» y «Sin imagen» (#18), personal inactivo visible (#19), checkout con sesión (#20),
índice fijo en la carta y menú de categorías en la del admin (#23, #24).

Después, la web adoptó lo de la sección 4 (13-nov, #26–#39): cuentas en servicio y cobro por
adelantado, cuenta dividida en partes iguales, referencia de terminal y propina por porcentaje, notas
por platillo y generales en sala y cocina, incidencias de cocina, cancelar un pedido en sus primeros
2 minutos, reservaciones de hoy para el mesero, el admin atiende pedidos desde Inicio, corte con
diferencia en vivo, tiempo real con el flujo de eventos del API y los mismos textos de acciones
(«Empezar a preparar», «Marcar como lista», «Entregar en la mesa»).

Sigue pendiente: en la móvil, inventario/proveedores, promociones y reportes (se usan desde la web);
cuenta dividida por platillo en la web (la móvil la tiene).
