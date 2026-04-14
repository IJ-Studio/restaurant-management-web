import { db } from "./lib/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS public.system_settings (
        id serial PRIMARY KEY,
        key varchar(100) NOT NULL UNIQUE,
        value jsonb NOT NULL,
        updated_at timestamp DEFAULT now()
      );
    `);
    console.log("SUCCESS: La tabla system_settings fue creada correctamente.");
  } catch (error) {
    console.error("ERROR:", error);
  }
  process.exit(0);
}

main();
