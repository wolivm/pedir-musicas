"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FloralWreath } from "@/components/FloralWreath";
import type { SongRequest } from "@/lib/redis";

const POLL_MS = 3000;

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function ArtistPage() {
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pendentes" | "todas">("pendentes");
  const [lastCount, setLastCount] = useState(0);
  const [flash, setFlash] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/requests", { cache: "no-store" });
      const data = await res.json();
      const list: SongRequest[] = data?.requests ?? [];
      setRequests(list);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  // efeito visual + auto-scroll ao chegar novo pedido
  useEffect(() => {
    const pending = requests.filter((r) => !r.played).length;
    if (pending > lastCount && lastCount !== 0) {
      setFlash(true);
      setTimeout(() => setFlash(false), 1200);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    setLastCount(pending);
  }, [requests, lastCount]);

  const visible = useMemo(() => {
    if (filter === "pendentes") return requests.filter((r) => !r.played);
    return requests;
  }, [requests, filter]);

  const pendingCount = requests.filter((r) => !r.played).length;
  const playedCount = requests.length - pendingCount;

  async function togglePlayed(item: SongRequest) {
    setRequests((prev) => prev.map((r) => (r.id === item.id ? { ...r, played: !r.played } : r)));
    await fetch(`/api/requests/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ played: !item.played }),
    });
    load();
  }

  async function remove(item: SongRequest) {
    if (!confirm(`Apagar o pedido "${item.song}"?`)) return;
    setRequests((prev) => prev.filter((r) => r.id !== item.id));
    await fetch(`/api/requests/${item.id}`, { method: "DELETE" });
    load();
  }

  async function clearPlayed() {
    if (!confirm("Apagar todas as músicas já tocadas?")) return;
    await fetch("/api/requests", { method: "DELETE" });
    load();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-24 pt-8">
      <header className="flex flex-col items-center text-center">
        <FloralWreath size={110} />
        <p className="mt-3 font-serif text-xs uppercase tracking-[0.3em] text-sage-dark">
          Painel da banda
        </p>
        <h1 className="mt-1 font-script text-5xl leading-none text-sage-dark">Setlist ao vivo</h1>
        <p className="mt-2 font-serif text-sm italic text-sage-dark/70">
          Pedidos da galera da festa da Anna Laura
        </p>
      </header>

      <div
        className={`mt-6 grid grid-cols-2 gap-3 transition ${flash ? "scale-[1.02]" : ""}`}
      >
        <div className="floral-card px-4 py-3 text-center">
          <p className="font-serif text-xs uppercase tracking-widest text-sage-dark/70">Pendentes</p>
          <p className="mt-1 font-script text-4xl leading-none text-rose-dark">{pendingCount}</p>
        </div>
        <div className="floral-card px-4 py-3 text-center">
          <p className="font-serif text-xs uppercase tracking-widest text-sage-dark/70">Tocadas</p>
          <p className="mt-1 font-script text-4xl leading-none text-sage-dark">{playedCount}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-2">
        <div className="flex rounded-full border border-sage/30 bg-white/70 p-1">
          {(["pendentes", "todas"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-1.5 font-serif text-sm capitalize transition ${
                filter === key ? "bg-sage text-white shadow" : "text-sage-dark hover:bg-sage/10"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
        {playedCount > 0 && (
          <button onClick={clearPlayed} className="btn-ghost">
            Limpar tocadas
          </button>
        )}
      </div>

      <section className="mt-5 space-y-3">
        {loading ? (
          <p className="text-center font-serif italic text-sage-dark/60">Carregando…</p>
        ) : visible.length === 0 ? (
          <div className="floral-card flex flex-col items-center gap-2 px-6 py-10 text-center">
            <FloralWreath size={70} />
            <p className="font-serif italic text-sage-dark/70">
              {filter === "pendentes"
                ? "Nenhum pedido por enquanto. A noite está só começando ✦"
                : "Ainda não há pedidos."}
            </p>
          </div>
        ) : (
          visible.map((item) => (
            <article
              key={item.id}
              className={`floral-card flex items-start gap-3 px-4 py-4 transition ${
                item.played ? "opacity-60" : ""
              }`}
            >
              <button
                onClick={() => togglePlayed(item)}
                aria-label={item.played ? "Marcar como pendente" : "Marcar como tocada"}
                className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition ${
                  item.played
                    ? "border-sage bg-sage text-white"
                    : "border-sage/40 bg-white hover:border-sage"
                }`}
              >
                {item.played ? "✓" : ""}
              </button>
              <div className="flex-1 min-w-0">
                <p
                  className={`font-serif text-lg leading-snug text-[var(--ink)] ${
                    item.played ? "line-through decoration-sage/60" : ""
                  }`}
                >
                  {item.song}
                </p>
                {item.note && (
                  <p className="mt-1 font-serif text-sm italic text-sage-dark/80">
                    “{item.note}”
                  </p>
                )}
                <p className="mt-1 font-serif text-xs uppercase tracking-widest text-sage-dark/50">
                  {formatTime(item.createdAt)}
                </p>
              </div>
              <button
                onClick={() => remove(item)}
                aria-label="Apagar pedido"
                className="text-rose-dark/70 transition hover:text-rose-dark"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </article>
          ))
        )}
      </section>

      <p className="mt-8 text-center font-serif text-xs italic text-sage-dark/50">
        A lista atualiza sozinha a cada {POLL_MS / 1000} segundos.
      </p>
    </main>
  );
}
