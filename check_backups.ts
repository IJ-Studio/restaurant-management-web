import { db } from "./lib/db";
import { backups } from "@/lib/public.schema";

async function run() {
  const all = await db.select().from(backups);
  console.log("DB Backups:", all.map(b => ({ id: b.id, name: b.name, createdAt: b.createdAt })));
  process.exit(0);
}
run();
