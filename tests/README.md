# Pruebas E2E

Playwright, solo como dependencia de desarrollo.

## Navegadores en D:

El disco C: es pequeño; los navegadores se instalan fuera de él:

```bash
export PLAYWRIGHT_BROWSERS_PATH='D:\playwright-browsers'
pnpm exec playwright install chromium firefox webkit
```

Define la misma variable al ejecutar `pnpm test:e2e`.

## Ejecución

```bash
pnpm test:e2e        # todos los proyectos
pnpm test:e2e:ui     # modo interactivo
E2E_EDGE=1 pnpm test:e2e --project=edge   # Edge, opcional en local
```

El servidor de pruebas se construye y arranca en el puerto 3100.
