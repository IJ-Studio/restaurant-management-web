import "server-only";
import { pgClient } from "@/lib/db";

export const MENU_SCHEMA = "public";

export type CategoryTableMeta = {
  tableName: string;
  keyColumn: string;
  nameColumn: string;
  iconColumn?: string;
  orderColumn?: string;
  activeColumn?: string;
  descriptionColumn?: string;
};

export async function getTableColumns(tableName: string, tableSchema = MENU_SCHEMA) {
  const res = await pgClient.query<{ column_name: string }>(
    `
      select column_name
      from information_schema.columns
      where table_schema = $1
        and table_name = $2
    `,
    [tableSchema, tableName],
  );
  return new Set(res.rows.map((r) => r.column_name));
}

function pickCategoryTable(tableName: string, cols: Set<string>): CategoryTableMeta | null {
  const keyColumn = cols.has("id") ? "id" : cols.has("categoria_id") ? "categoria_id" : null;
  const nameColumn = cols.has("nombre") ? "nombre" : cols.has("name") ? "name" : null;
  if (!keyColumn || !nameColumn) return null;

  const iconColumn = cols.has("icono") ? "icono" : cols.has("icon") ? "icon" : undefined;
  const orderColumn = cols.has("orden") ? "orden" : cols.has("order") ? "order" : undefined;
  const activeColumn = cols.has("activa") ? "activa" : cols.has("is_active") ? "is_active" : undefined;
  const descriptionColumn = cols.has("descripcion")
    ? "descripcion"
    : cols.has("description")
      ? "description"
      : undefined;

  return {
    tableName,
    keyColumn,
    nameColumn,
    iconColumn,
    orderColumn,
    activeColumn,
    descriptionColumn,
  };
}

export async function findCategoryTable(tableSchema = MENU_SCHEMA): Promise<CategoryTableMeta | null> {
  const preferredTables = ["categorias_menu", "categorias"];
  for (const tableName of preferredTables) {
    const cols = await getTableColumns(tableName, tableSchema);
    const picked = pickCategoryTable(tableName, cols);
    if (picked) return picked;
  }

  const candidatesRes = await pgClient.query<{ table_name: string }>(
    `
      select table_name
      from information_schema.tables
      where table_schema = $1
        and table_type = 'BASE TABLE'
        and table_name ilike $2
      order by table_name
    `,
    [tableSchema, "%categ%"],
  );

  for (const row of candidatesRes.rows) {
    const tableName = row.table_name;
    if (!tableName) continue;
    const cols = await getTableColumns(tableName, tableSchema);
    const picked = pickCategoryTable(tableName, cols);
    if (picked) return picked;
  }

  return null;
}

