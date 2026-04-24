"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FloralWreath } from "@/components/FloralWreath";
import type { SongRequest } from "@/lib/redis";

const POLL_MS = 3000;
const PLAYED_STORAGE_KEY = "anna-laura-played-count";

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function ArtistPage() {
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCount, setLastCount] = useState(0);
  const [flash, setFlash] = useState(false);
  const [playedCount, setPlayedCount] = useState(0);
  const deletedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(PLAYED_STORAGE_KEY) : null;
    if (stored) setPlayedCount(parseInt(stored, 10) || 0);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(PLAYED_STORAGE_KEY, String(playedCount));
    }
  }, [playedCount]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/requests", { cache: "no-store" });
      const data = await res.json();
      const list: SongRequest[] = data?.requests ?? [];
      setRequests(list.filter((item) => !deletedIdsRef.current.has(item.id)));
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

  useEffect(() => {
    const total = requests.length;
    if (total > lastCount && lastCount !== 0) {
      setFlash(true);
      setTimeout(() => setFlash(false), 1200);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    setLastCount(total);
  }, [requests, lastCount]);

  async function removeFromServer(id: string) {
    deletedIdsRef.current.add(id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    try {
      const res = await fetch(`/api/requests/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
    } catch {
      deletedIdsRef.current.delete(id);
      load();
    }
  }

  function markPlayed(item: SongRequest) {
    setPlayedCount((n) => n + 1);
    removeFromServer(item.id);
  }

  function removeItem(item: SongRequest) {
    if (!confirm(`Apagar o pedido "${item.song}"?`)) return;
    removeFromServer(item.id);
  }

  function resetPlayedCount() {
    if (!confirm("Zerar o contador de músicas tocadas?")) return;
    setPlayedCount(0);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-24 pt-8">
      <header className="flex flex-col items-center text-center">
        <FloralWreath size={110} />
        <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-sage-dark">
          Painel da banda
        </p>
        <h1 className="mt-1 font-script text-5xl leading-none text-sage-dark">Setlist ao vivo</h1>
        <p className="mt-3 text-base font-medium text-ink">
          Pedidos da galera da festa da Anna Laura
        </p>
      </header>

      <div
        className={`mt-6 grid grid-cols-2 gap-3 transition ${flash ? "scale-[1.02]" : ""}`}
      >
        <div className="floral-card px-4 py-4 text-center">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-sage-dark">Pedidos</p>
          <p className="mt-1 font-serif text-5xl font-bold leading-none text-rose-dark">
            {requests.length}
          </p>
        </div>
        <button
          onClick={resetPlayedCount}
          className="floral-card px-4 py-4 text-center transition hover:bg-white/95 active:scale-[0.98]"
          aria-label="Zerar contador de tocadas"
        >
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-sage-dark">
            Tocadas
          </p>
          <p className="mt-1 font-serif text-5xl font-bold leading-none text-sage-dark">
            {playedCount}
          </p>
        </button>
      </div>

      <section className="mt-6 space-y-3">
        {loading ? (
          <p className="text-center text-base font-medium text-ink-soft">Carregando…</p>
        ) : requests.length === 0 ? (
          <div className="floral-card flex flex-col items-center gap-2 px-6 py-10 text-center">
            <FloralWreath size={70} />
            <p className="text-base font-medium text-ink">
              Nenhum pedido por enquanto.
            </p>
            <p className="text-sm font-medium text-ink-soft">A noite está só começando ✦</p>
          </div>
        ) : (
          requests.map((item) => (
            <article
              key={item.id}
              className="floral-card flex items-start gap-3 px-4 py-4"
            >
              <button
                onClick={() => markPlayed(item)}
                aria-label="Marcar como tocada"
                title="Marcar como tocada"
                className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-sage/50 bg-white text-sage-dark transition hover:border-sage hover:bg-sage hover:text-white active:scale-95"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-[19px] font-semibold leading-snug text-ink">
                  {item.song}
                </p>
                {item.note && (
                  <p className="mt-1.5 text-[15px] font-medium leading-snug text-ink-soft">
                    “{item.note}”
                  </p>
                )}
                <p className="mt-2 text-[13px] font-semibold text-sage-dark">
                  {formatTime(item.createdAt)}
                </p>
              </div>
              <button
                onClick={() => removeItem(item)}
                aria-label="Apagar pedido"
                title="Apagar pedido"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-rose-dark transition hover:bg-rose-light/40 active:scale-95"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

      <p className="mt-8 text-center text-[13px] font-medium text-ink-soft">
        Atualiza sozinha a cada {POLL_MS / 1000}s.<br />
        <span className="font-semibold text-sage-dark">✓</span> marca como tocada (remove da fila) · <span className="font-semibold text-rose-dark">🗑</span> apaga o pedido.
      </p>
    </main>
  );
}
