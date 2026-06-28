# Diagnóstico de Frontend — Restaurante El Quijote

Este documento detalla los hallazgos iniciales del diagnóstico de dependencias y la auditoría de datos mock en el frontend, en cumplimiento con la Fase 0 del plan de desarrollo.

## 1. Estado de la Instalación de Dependencias

Se ejecutó `pnpm install` con el siguiente resultado:
- **Estado**: Exitoso (instalación completada).
- **Advertencias críticas**:
  - `Ignoring broken lockfile`: El archivo `pnpm-lock.yaml` actual está roto o tiene formato inválido (lockfile null). `pnpm` lo ignoró y generó una resolución en memoria.
  - `Unmet peer dependencies`:
    - `cloudinary-react@1.8.1` requiere `react@"^16.3.3 || ^17.0.0 || ^18.0.0"`, pero se encontró `react@19.2.1` en el espacio de trabajo. Esto puede causar warnings de renderizado en React 19.
  - Deprecaciones en subdependencias de desarrollo (`@esbuild-kit/core-utils`, `@esbuild-kit/esm-loader`, `glob@10.5.0`, `node-domexception`).

---

## 2. Auditoría de Datos Mock

Se identificaron los siguientes archivos con datos estáticos de simulación (mock data):
- **Caja & Cajero**:
  - `features/dashboard/cajero/data/cajeroMock.ts`: Contiene la lista mock de tickets (`MOCK_TICKETS`) y estadísticas de pago.
- **Admin**:
  - `features/dashboard/admin/data/usersMock.tsx`: Contiene `MOCK_USERS` y los roles estáticos.
  - `features/dashboard/admin/data/menuMock.tsx`: Datos estáticos para el menú de administración.
  - `features/dashboard/admin/data/mockData.ts`: Contiene pedidos recientes, alertas de stock bajo y datos de tablas.
  - `features/dashboard/admin/data/financeMock.tsx`, `invoicesMock.tsx`, `reportsMock.tsx`, `settingsMock.tsx`, `suppliersMock.tsx`: Contienen datos de prueba para las pantallas de facturas, inventarios y ajustes.
- **Cocina & Clientes**:
  - `features/dashboard/cocina/data/cocinaMock.ts`: Mock de órdenes en preparación.
  - `features/dashboard/cliente/data/clienteMock.ts`: Pedidos mock y preferencias.
- **General**:
  - `features/shared/data/restaurantData.ts`: Contiene configuraciones iniciales de marca e imágenes.

---

## 3. Estado de la Integración del Backend

- La URL base de la API está configurada mediante la variable de entorno `NEXT_PUBLIC_API_URL` en `.env`.
- Por defecto, apunta a `http://localhost:10000` en desarrollo.
- Actualmente, la lógica de autenticación en `app/(auth)/login/page.tsx` utiliza llamadas directas a `/api/auth/login` (un proxy local que reenvía a `${BACKEND_URL}/auth/sign-in`).
