"use client";

export function PrintButton() {
  return (
    <div className="no-print fixed left-1/2 top-3 z-50 -translate-x-1/2">
      <button
        onClick={() => window.print()}
        className="rounded-full bg-sage px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-sage-dark active:scale-95"
      >
        🖨 Imprimir / Salvar PDF
      </button>
    </div>
  );
}
