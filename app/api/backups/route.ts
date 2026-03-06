import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { backups as backupsTable, roles, users } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

// helper to generate a real database dump
async function generateDatabaseDump() {
  try {
    // Get all data from main tables 
    const [rolesData, usersData] = await Promise.all([
      db.select().from(roles),
      db.select().from(users),
    ]);

    const dump = {
      timestamp: new Date().toISOString(),
      tables: {
        roles: rolesData,
        users: usersData,
      },
      metadata: {
        totalRoles: rolesData.length,
        totalUsers: usersData.length,
      },
    };

    return JSON.stringify(dump, null, 2);
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
      driveUrl: r.driveUrl || null,
      type: r.type,
      status: r.status,
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

    // Generate real database dump
    const dumpContent = await generateDatabaseDump();
    const dumpBuffer = Buffer.from(dumpContent);
    const dumpSize = dumpBuffer.length;

    // Upload to Drive if configured
    let driveUrl: string | null = null;
    if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      driveUrl = await uploadToDrive(`backup_${now.getTime()}.json`, dumpBuffer);
    }

    const inserted = await db
      .insert(backupsTable)
      .values({
        name:
          body.name ??
          `backup_manual_${now.toISOString().slice(0, 10).replace(/-/g, "")}`,
        sizeBytes: dumpSize,
        driveUrl: driveUrl || body.driveUrl || null,
        type: body.type || "manual",
        status: body.status || "ok",
        createdAt: now,
      })
      .returning();
    if (inserted.length > 0) {
      const r = inserted[0];
      const resp = {
        id: r.id,
        name: r.name,
        sizeBytes: r.sizeBytes,
        driveUrl: r.driveUrl || null,
        type: r.type,
        status: r.status,
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
