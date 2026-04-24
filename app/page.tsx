"use client";

import { useState } from "react";
import { FloralWreath } from "@/components/FloralWreath";

type Status = "idle" | "sending" | "sent" | "error";

export default function PublicPage() {
  const [song, setSong] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!song.trim()) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song, note }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Não foi possível enviar.");
      }
      setStatus("sent");
      setSong("");
      setNote("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erro desconhecido.");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-start px-5 pb-16 pt-10">
      <header className="flex flex-col items-center text-center">
        <FloralWreath size={160} />
        <p className="mt-4 text-[13px] font-semibold uppercase tracking-[0.22em] text-sage-dark">
          1º aniversário
        </p>
        <h1 className="mt-1 font-script text-[64px] leading-none text-sage-dark">Anna Laura</h1>
        <p className="mt-5 max-w-xs font-serif text-xl font-medium text-ink">
          Qual música você gostaria de ouvir na festa?
        </p>
      </header>

      {status === "sent" ? (
        <section className="floral-card mt-10 w-full p-8 text-center">
          <FloralWreath size={80} className="mx-auto" />
          <h2 className="mt-4 font-script text-5xl text-rose-dark">Pedido enviado!</h2>
          <p className="mt-3 text-base font-medium text-ink">
            A banda já recebeu sua sugestão. Obrigado por celebrar com a gente!
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="btn-ghost mt-6"
          >
            Pedir outra música
          </button>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="floral-card mt-10 w-full space-y-5 p-6">
          <div className="space-y-2">
            <label htmlFor="song" className="ui-label">
              Música
            </label>
            <input
              id="song"
              name="song"
              required
              maxLength={200}
              value={song}
              onChange={(e) => setSong(e.target.value)}
              placeholder="Ex.: Evidências — Chitãozinho &amp; Xororó"
              className="input-field"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="note" className="ui-label">
              Recado <span className="font-normal normal-case tracking-normal text-ink-soft">(opcional)</span>
            </label>
            <textarea
              id="note"
              name="note"
              rows={3}
              maxLength={300}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Para dançar, para a Anna Laura…"
              className="input-field resize-none"
            />
          </div>

          {status === "error" && (
            <p className="rounded-xl bg-rose-light/70 px-4 py-3 text-sm font-semibold text-rose-dark">
              {errorMsg}
            </p>
          )}

          <button type="submit" disabled={status === "sending"} className="btn-primary w-full">
            {status === "sending" ? "Enviando..." : "Enviar pedido"}
          </button>
        </form>
      )}

      <footer className="mt-10 text-center font-script text-3xl text-rose-dark">
        Com amor, Mamãe &amp; Papai
      </footer>
    </main>
  );
}
