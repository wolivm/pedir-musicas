import { NextResponse } from "next/server";
import { deleteRequest, updateRequest } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => ({}));
  const played = typeof body?.played === "boolean" ? body.played : undefined;
  if (played === undefined) {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
  }
  const updated = await updateRequest(params.id, { played });
  if (!updated) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  return NextResponse.json({ request: updated });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const ok = await deleteRequest(params.id);
  if (!ok) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
