require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.system_settings (
        id serial PRIMARY KEY,
        key varchar(100) NOT NULL UNIQUE,
        value jsonb NOT NULL,
        updated_at timestamp DEFAULT now()
      );
    `);
    console.log("SUCCESS: La tabla system_settings fue creada correctamente.");
  } catch (error) {
    console.error("ERROR:", error.message);
  } finally {
    await pool.end();
  }
}

main();
