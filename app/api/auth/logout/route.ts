import { deleteSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST() {
    // Esta función borra la cookie 'session' del navegador
    await deleteSession();
    
    return NextResponse.json({ ok: true });
}