import { NextResponse } from "next/server";
import { pgClient } from "@/lib/db";
import { findCategoryTable, MENU_SCHEMA } from "../_meta";

function qid(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

export async function GET() {
  try {
    const meta = await findCategoryTable();
    if (!meta) {
      return NextResponse.json(
        { error: "No se encontró tabla de categorías (categorias_menu/categorias)." },
        { status: 404 },
      );
    }

    const cols = [
      `${qid(meta.keyColumn)} as id`,
      `${qid(meta.nameColumn)} as name`,
      meta.iconColumn ? `${qid(meta.iconColumn)} as icon` : null,
      meta.orderColumn ? `${qid(meta.orderColumn)} as "order"` : null,
      meta.activeColumn ? `${qid(meta.activeColumn)} as active` : null,
      meta.descriptionColumn ? `${qid(meta.descriptionColumn)} as description` : null,
    ].filter(Boolean);

    const orderSql = meta.orderColumn
      ? `order by ${qid(meta.orderColumn)} nulls last, ${qid(meta.keyColumn)} asc`
      : `order by ${qid(meta.keyColumn)} asc`;

    const res = await pgClient.query(
      `
        select ${cols.join(", ")}
        from ${qid(MENU_SCHEMA)}.${qid(meta.tableName)}
        ${orderSql}
      `,
    );

    return NextResponse.json(res.rows);
  } catch (e: any) {
    console.error("Menu categories GET error:", e);
    return NextResponse.json({ error: e?.message ?? "error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const meta = await findCategoryTable();
    if (!meta) {
      return NextResponse.json(
        { error: "No se encontró tabla de categorías (categorias_menu/categorias)." },
        { status: 404 },
      );
    }

    const body = await req.json().catch(() => null);
    const rawName = typeof body?.name === "string" ? body.name.trim() : "";
    const rawIcon = typeof body?.icon === "string" ? body.icon.trim() : "";

    if (!rawName) {
      return NextResponse.json({ error: "Falta name" }, { status: 400 });
    }

    const insertColumns: string[] = [meta.nameColumn];
    const insertValues: unknown[] = [rawName];
    if (meta.iconColumn) {
      insertColumns.push(meta.iconColumn);
      insertValues.push(rawIcon || "🍽️");
    }
    if (meta.activeColumn) {
      insertColumns.push(meta.activeColumn);
      insertValues.push(true);
    }
    if (meta.orderColumn) {
      const orderFromBody =
        typeof body?.order === "number" && Number.isFinite(body.order) ? Math.floor(body.order) : null;
      if (orderFromBody != null) {
        insertColumns.push(meta.orderColumn);
        insertValues.push(orderFromBody);
      } else {
        const maxRes = await pgClient.query<{ max: number | null }>(
          `
            select max(${qid(meta.orderColumn)})::int as max
            from ${qid(MENU_SCHEMA)}.${qid(meta.tableName)}
          `,
        );
        const nextOrder = (maxRes.rows?.[0]?.max ?? 0) + 1;
        insertColumns.push(meta.orderColumn);
        insertValues.push(nextOrder);
      }
    }

    const placeholders = insertColumns.map((_, idx) => `$${idx + 1}`).join(", ");
    const returningCols = [
      `${qid(meta.keyColumn)} as id`,
      `${qid(meta.nameColumn)} as name`,
      meta.iconColumn ? `${qid(meta.iconColumn)} as icon` : null,
      meta.orderColumn ? `${qid(meta.orderColumn)} as "order"` : null,
      meta.activeColumn ? `${qid(meta.activeColumn)} as active` : null,
      meta.descriptionColumn ? `${qid(meta.descriptionColumn)} as description` : null,
    ].filter(Boolean);

    const res = await pgClient.query(
      `
        insert into ${qid(MENU_SCHEMA)}.${qid(meta.tableName)}
        (${insertColumns.map(qid).join(", ")})
        values (${placeholders})
        returning ${returningCols.join(", ")}
      `,
      insertValues,
    );

    return NextResponse.json(res.rows?.[0] ?? null);
  } catch (e: any) {
    console.error("Menu categories POST error:", e);
    return NextResponse.json({ error: e?.message ?? "error" }, { status: 500 });
  }
}

