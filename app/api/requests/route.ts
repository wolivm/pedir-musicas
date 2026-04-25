import { NextResponse } from "next/server";
import { createRequest, listRequests } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET() {
  const requests = await listRequests();
  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const song = typeof body?.song === "string" ? body.song.trim() : "";
  const note = typeof body?.note === "string" ? body.note.trim() : "";

  if (!song) {
    return NextResponse.json({ error: "Informe o nome da música." }, { status: 400 });
  }
  if (song.length > 200 || note.length > 300) {
    return NextResponse.json({ error: "Texto muito longo." }, { status: 400 });
  }

  const created = await createRequest({ song, note: note || undefined });
  return NextResponse.json({ request: created }, { status: 201 });
}
