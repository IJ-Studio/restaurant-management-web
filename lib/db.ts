import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no está configurada en el .env");
}

const globalForPg = globalThis as unknown as {
  pool: pg.Pool | undefined;
};

const pool = globalForPg.pool ?? new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

if (process.env.NODE_ENV !== "production") {
  globalForPg.pool = pool;
}

export const db = drizzle(pool);
export const pgClient = pool;

// Emulador local de Vercel Cron
if (process.env.NODE_ENV !== "production") {
  const globalLocalCron = globalThis as unknown as { cronStarted: boolean };
  if (!globalLocalCron.cronStarted) {
    globalLocalCron.cronStarted = true;
    console.log("CRON: Emulador local iniciado (revisando cada 15 segundos para pruebas)");
    setInterval(() => {
      fetch('http://localhost:3000/api/cron/backups', {
        headers: { 'x-forwarded-proto': 'http', 'host': 'localhost:3000' }
      }).catch((e) => console.error("Error Cron Local:", e.message));
    }, 15000);
  }
}
