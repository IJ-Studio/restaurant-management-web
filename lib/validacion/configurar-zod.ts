import { z } from "zod";

/**
 * Sin JIT (cierre de la fase 4). Zod v4 comprueba si puede compilar los validadores con
 * `new Function`, y la CSP lo registra como `eval`. Con `jitless` valida igual, sin compilar.
 * Es un ajuste global: todo módulo que importe zod para validar importa antes este archivo,
 * así no depende del orden en que se carguen los módulos.
 */
z.config({ jitless: true });
