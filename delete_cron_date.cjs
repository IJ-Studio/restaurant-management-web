require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
async function main() {
  await pool.query("DELETE FROM system_settings WHERE key = 'last_auto_backup_date'");
  console.log("Deleted last_auto_backup_date");
  await pool.end();
}
main();
