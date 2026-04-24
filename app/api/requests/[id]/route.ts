import { NextResponse } from "next/server";
import { deleteRequest } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const ok = await deleteRequest(params.id);
  if (!ok) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
