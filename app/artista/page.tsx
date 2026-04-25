"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SongRequest } from "@/lib/redis";

const POLL_MS = 3000;
const PLAYED_COUNT_KEY = "anna-laura-played-count";
const DISMISSED_IDS_KEY = "anna-laura-dismissed-ids";

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function readDismissedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DISMISSED_IDS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function writeDismissedIds(set: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DISMISSED_IDS_KEY, JSON.stringify(Array.from(set)));
}

export default function ArtistPage() {
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisibleCount, setLastVisibleCount] = useState(0);
  const [flash, setFlash] = useState(false);
  const [playedCount, setPlayedCount] = useState(0);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const dismissedIdsRef = useRef(dismissedIds);
  dismissedIdsRef.current = dismissedIds;

  // Carrega estado inicial do localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedCount = localStorage.getItem(PLAYED_COUNT_KEY);
    if (storedCount) setPlayedCount(parseInt(storedCount, 10) || 0);
    setDismissedIds(readDismissedIds());
  }, []);

  // Persiste contador
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(PLAYED_COUNT_KEY, String(playedCount));
    }
  }, [playedCount]);

  // Persiste IDs ocultos
  useEffect(() => {
    writeDismissedIds(dismissedIds);
  }, [dismissedIds]);

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

  const visibleRequests = useMemo(
    () => requests.filter((r) => !dismissedIds.has(r.id)),
    [requests, dismissedIds],
  );

  // Auto-scroll + flash quando chega pedido novo (visível)
  useEffect(() => {
    const total = visibleRequests.length;
    if (total > lastVisibleCount && lastVisibleCount !== 0) {
      setFlash(true);
      setTimeout(() => setFlash(false), 1200);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    setLastVisibleCount(total);
  }, [visibleRequests, lastVisibleCount]);

  function dismiss(id: string) {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  function markPlayed(item: SongRequest) {
    setPlayedCount((n) => n + 1);
    dismiss(item.id);
  }

  function removeItem(item: SongRequest) {
    if (!confirm(`Esconder o pedido "${item.song}"?`)) return;
    dismiss(item.id);
  }

  function resetPlayedCount() {
    if (!confirm("Zerar o contador de músicas tocadas?")) return;
    setPlayedCount(0);
  }

  function restoreAll() {
    if (!confirm("Mostrar todos os pedidos novamente (incluindo os já tocados/ocultos)?")) return;
    setDismissedIds(new Set());
  }

  function clearList() {
    if (visibleRequests.length === 0) return;
    const msg = `Limpar todos os ${visibleRequests.length} ${visibleRequests.length === 1 ? "pedido" : "pedidos"} da lista?\n\nEles ficam ocultos só no seu dispositivo — nada é apagado do servidor. Você pode restaurar depois.`;
    if (!confirm(msg)) return;
    setDismissedIds((prev) => {
      const next = new Set(prev);
      visibleRequests.forEach((r) => next.add(r.id));
      return next;
    });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-24 pt-8">
      <header className="flex flex-col items-center text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-sage-dark">
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
            {visibleRequests.length}
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
        ) : visibleRequests.length === 0 ? (
          <div className="floral-card flex flex-col items-center gap-2 px-6 py-10 text-center">
            <p className="text-base font-semibold text-ink">
              Nenhum pedido por enquanto.
            </p>
            <p className="text-sm font-medium text-ink-soft">A noite está só começando ✦</p>
          </div>
        ) : (
          visibleRequests.map((item) => (
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
                aria-label="Esconder pedido"
                title="Esconder pedido"
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

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {visibleRequests.length > 0 && (
          <button
            onClick={clearList}
            className="inline-flex items-center gap-2 rounded-full border border-rose-dark/40 bg-white/70 px-5 py-2 text-sm font-semibold text-rose-dark transition hover:bg-rose-light/40 active:scale-[0.98]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
            </svg>
            Limpar lista
          </button>
        )}
        {dismissedIds.size > 0 && (
          <button
            onClick={restoreAll}
            className="rounded-full border border-sage/40 bg-white/70 px-5 py-2 text-sm font-semibold text-sage-dark transition hover:bg-sage/10 active:scale-[0.98]"
          >
            Restaurar {dismissedIds.size} {dismissedIds.size === 1 ? "pedido oculto" : "pedidos ocultos"}
          </button>
        )}
      </div>

      <p className="mt-8 text-center text-[13px] font-medium text-ink-soft">
        Atualiza sozinha a cada {POLL_MS / 1000}s.<br />
        <span className="font-semibold text-sage-dark">✓</span> marca como tocada · <span className="font-semibold text-rose-dark">🗑</span> esconde.<br />
        <span className="text-ink-soft/80">Os pedidos ficam só ocultos no seu dispositivo — nada é apagado do servidor.</span>
      </p>
    </main>
  );
}
