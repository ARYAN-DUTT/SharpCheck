"use client";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="print:hidden bg-[var(--color-primary-blue)] text-white px-4 py-2 rounded-lg text-sm md:text-base hover:brightness-110 transition-all font-medium shadow-sm cursor-pointer flex items-center gap-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
      Export PDF
    </button>
  );
}
