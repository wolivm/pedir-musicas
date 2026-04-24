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
  // IDs já deletados localmente — filtra respostas stale do polling pra evitar
  // que o pedido reapareça entre o clique e o DELETE confirmar no servidor.
  const deletedIdsRef = useRef<Set<string>>(new Set());

  // carrega contador de tocadas do localStorage (persiste entre refreshes no mesmo dispositivo)
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

  // efeito visual + auto-scroll ao chegar novo pedido
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
      // Se o DELETE falhar, libera o ID pra voltar aparecer no próximo polling
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
          <p className="font-serif text-xs uppercase tracking-widest text-sage-dark/70">Pedidos</p>
          <p className="mt-1 font-script text-4xl leading-none text-rose-dark">{requests.length}</p>
        </div>
        <button
          onClick={resetPlayedCount}
          className="floral-card px-4 py-3 text-center transition hover:bg-white/90"
          aria-label="Zerar contador de tocadas"
        >
          <p className="font-serif text-xs uppercase tracking-widest text-sage-dark/70">Tocadas</p>
          <p className="mt-1 font-script text-4xl leading-none text-sage-dark">{playedCount}</p>
        </button>
      </div>

      <section className="mt-5 space-y-3">
        {loading ? (
          <p className="text-center font-serif italic text-sage-dark/60">Carregando…</p>
        ) : requests.length === 0 ? (
          <div className="floral-card flex flex-col items-center gap-2 px-6 py-10 text-center">
            <FloralWreath size={70} />
            <p className="font-serif italic text-sage-dark/70">
              Nenhum pedido por enquanto. A noite está só começando ✦
            </p>
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
                className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-sage/40 bg-white text-sage-dark transition hover:border-sage hover:bg-sage hover:text-white active:scale-95"
              >
                ✓
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-serif text-lg leading-snug text-[var(--ink)]">
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
                onClick={() => removeItem(item)}
                aria-label="Apagar pedido"
                title="Apagar pedido"
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
        Atualiza sozinha a cada {POLL_MS / 1000}s · ✓ marca como tocada (remove da fila) · 🗑 apaga
      </p>
    </main>
  );
}
