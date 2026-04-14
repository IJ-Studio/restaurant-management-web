import { NextRequest, NextResponse } from "next/server";
import { db, pgClient } from "@/lib/db";
import { backups as backupsTable } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

// helper to generate a real database dump
async function generateDatabaseDump() {
  try {
    const now = new Date();
    const tablesRes = await pgClient.query<{
      table_name: string;
    }>(
      `
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_type = 'BASE TABLE'
      order by table_name
      `,
    );

    const tableNames = tablesRes.rows
      .map((r) => r.table_name)
      .filter((t) => t && t !== "drizzle_migrations");

    const tables: Record<string, unknown[]> = {};
    const rowCounts: Record<string, number> = {};

    for (const t of tableNames) {
      const q = `select * from "${t.replace(/"/g, '""')}"`;
      const r = await pgClient.query(q);
      tables[t] = r.rows;
      rowCounts[t] = r.rowCount ?? r.rows.length;
    }

    const dump = {
      timestamp: now.toISOString(),
      tables,
      metadata: {
        tableCount: tableNames.length,
        rowCounts,
        totalRows: Object.values(rowCounts).reduce((s, n) => s + n, 0),
      },
    };

    return JSON.stringify(
      dump,
      (_k, v) => {
        if (typeof v === "bigint") return v.toString();
        if (v instanceof Date) return v.toISOString();
        // pg can return Buffer for bytea
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof Buffer !== "undefined" && (Buffer as any).isBuffer?.(v)) {
          return (v as Buffer).toString("base64");
        }
        return v;
      },
      2,
    );
  } catch (err) {
    console.error("Error generating dump", err);
    return `Error generating dump: ${err}`;
  }
}

// helper to upload a buffer to Google Drive using service account
// (install googleapis and set GOOGLE_CREDENTIALS env with JSON)
async function uploadToDrive(name: string, buffer: Buffer) {
  try {
    const { google } = await import("googleapis");

    // Use individual env vars instead of full JSON
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
      },
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    const drive = google.drive({ version: "v3", auth });

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const res = await drive.files.create({
      requestBody: {
        name,
        parents: folderId ? [folderId] : undefined, // Upload to specific folder if set
      },
      media: { mimeType: "application/json", body: buffer },
    });
    return `https://drive.google.com/file/d/${res.data.id}/view`;
  } catch (err) {
    console.error("Drive upload failed", err);
    return null;
  }
}

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(backupsTable)
      .orderBy(desc(backupsTable.createdAt));
    // rows already camel-case; just ensure dates are strings
    const mapped = rows.map((r) => ({
      id: r.id,
      name: r.name,
      sizeBytes: r.sizeBytes,
      driveFileId: r.driveFileId || null,
      driveUrl: r.driveUrl || null,
      type: r.type,
      status: r.status,
      errorMessage: r.errorMessage || null,
      tables: (r.tables as unknown) || null,
      rowCount: r.rowCount ?? 0,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    }));
    return NextResponse.json(mapped);
  } catch (err) {
    console.error("Error fetching backups", err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const now = new Date();

    const requestedTypeRaw = typeof body?.type === "string" ? body.type.trim().toLowerCase() : "";
    const requestedNameRaw = typeof body?.name === "string" ? body.name.trim() : "";

    const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, "");
    const inferredType =
      requestedTypeRaw === "auto" || requestedNameRaw.startsWith("backup_auto_") ? "auto" : "manual";

    const backupName =
      requestedNameRaw.length > 0
        ? requestedNameRaw
        : inferredType === "auto"
          ? `backup_auto_${dateStamp}`
          : `backup_manual_${dateStamp}`;

    // Generate real database dump
    const dumpContent = await generateDatabaseDump();
    const dumpBuffer = Buffer.from(dumpContent);
    const dumpSize = dumpBuffer.length;
    let parsedMeta: { tables?: Record<string, unknown[]>; metadata?: { totalRows?: number } } | null = null;
    try {
      parsedMeta = JSON.parse(dumpContent);
    } catch {
      parsedMeta = null;
    }
    const tablesIncluded = parsedMeta?.tables ? Object.keys(parsedMeta.tables) : [];
    const totalRows = parsedMeta?.metadata?.totalRows ?? 0;

    // Upload to Drive if configured
    let driveUrl: string | null = null;
    if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      driveUrl = await uploadToDrive(`${backupName}.json`, dumpBuffer);
    }

    const inserted = await db
      .insert(backupsTable)
      .values({
        name: backupName,
        sizeBytes: dumpSize,
        driveUrl: driveUrl || body.driveUrl || null,
        type: inferredType,
        status: body.status || "ok",
        tables: tablesIncluded.length ? tablesIncluded : undefined,
        rowCount: totalRows,
        createdAt: now,
      })
      .returning();
    if (inserted.length > 0) {
      const r = inserted[0];
      const resp = {
        id: r.id,
        name: r.name,
        sizeBytes: r.sizeBytes,
        driveFileId: r.driveFileId || null,
        driveUrl: r.driveUrl || null,
        type: r.type,
        status: r.status,
        errorMessage: r.errorMessage || null,
        tables: (r.tables as unknown) || null,
        rowCount: r.rowCount ?? 0,
        createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      };
      return NextResponse.json(resp);
    }
    return NextResponse.json(null, { status: 500 });
  } catch (e) {
    console.error("Error creating backup", e);
    return NextResponse.json({ error: "invalid payload" }, { status: 500 });
  }
}

// DELETE with query param ?id=
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const idParam = url.searchParams.get("id");
  if (!idParam) {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }
  const id = Number(idParam);
  try {
    await db.delete(backupsTable).where(eq(backupsTable.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting backup", err);
    return NextResponse.json({ error: "delete failed" }, { status: 500 });
  }
}
