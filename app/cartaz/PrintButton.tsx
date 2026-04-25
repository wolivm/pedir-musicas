"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-sage-dark px-5 py-3 text-sm font-semibold text-white shadow-xl ring-1 ring-black/5 transition hover:bg-sage active:scale-95 print:hidden"
      aria-label="Imprimir ou salvar como PDF"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      Imprimir / PDF
    </button>
  );
}
