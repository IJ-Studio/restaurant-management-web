import { db } from "./lib/db";
import { backupsTable } from "./lib/schema";

async function run() {
  const all = await db.select().from(backupsTable);
  console.log("DB Backups:", all.map(b => ({ id: b.id, name: b.name, createdAt: b.createdAt })));
  process.exit(0);
}
run();
