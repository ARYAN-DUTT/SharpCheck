"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportList({ initialAnalyses }: { initialAnalyses: any[] }) {
  const [analyses, setAnalyses] = useState(initialAnalyses);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this analysis?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/report/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAnalyses(analyses.filter(a => a.id !== id));
        router.refresh();
      } else {
        alert('Failed to delete analysis');
      }
    } catch (err) {
      alert('Error deleting analysis');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-[var(--color-dark-blue)] dark:text-[#E2E8F0]">Recent Analyses</h2>
      {analyses.length === 0 ? (
        <div className="text-center bg-white dark:bg-[#1E293B] p-10 rounded-[1.5rem] border-[3px] border-[var(--color-border-dashed)] dark:border-[#475569]">
          <p className="text-lg text-gray-500 dark:text-gray-400">
            You haven't analyzed any products yet.
          </p>
          <Link href="/" className="mt-4 inline-block text-[var(--color-primary-blue)] font-semibold hover:underline">
            Start your first analysis
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {analyses.map((analysis) => {
            let standards: any[] = [];
            try {
              standards = JSON.parse(analysis.applicableStandards || "[]");
            } catch (e) { }

            let parsedImageUrls: string[] = [];
            if (analysis.imageUrl) {
              try {
                parsedImageUrls = JSON.parse(analysis.imageUrl);
              } catch (e) {
                if (analysis.imageUrl.startsWith('data:image')) {
                  parsedImageUrls = [analysis.imageUrl];
                }
              }
            }
            const firstImage = parsedImageUrls.length > 0 ? parsedImageUrls[0] : null;

            const needsVerification = standards.some(s => s.confidence === "Requires Verification");
            let colorClass = needsVerification ? "bg-orange-500" : "bg-green-500";
            let textClass = needsVerification ? "text-orange-500 dark:text-orange-400" : "text-green-600 dark:text-green-400";

            return (
              <Link key={analysis.id} href={`/report/${analysis.id}`} className="block transition-transform hover:-translate-y-1 relative group">
                <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border-[2px] border-gray-100 dark:border-[#475569] shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`h-3 w-3 rounded-full ${colorClass}`}></div>
                      <h2 className={`text-xl font-bold ${textClass}`}>
                        {standards.length} Standards Found
                      </h2>
                    </div>
                    {analysis.productName && (
                      <p className="text-md font-semibold text-[var(--color-dark-blue)] dark:text-[#E2E8F0] mb-1">
                        {analysis.productName} {analysis.productCategory ? `(${analysis.productCategory})` : ''}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">ID: {analysis.id}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{new Date(analysis.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4 text-gray-400">
                    <button
                      onClick={(e) => handleDelete(e, analysis.id)}
                      disabled={deletingId === analysis.id}
                      className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-all disabled:opacity-50"
                      aria-label="Delete analysis"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    {firstImage && (
                      <div className="w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-100 dark:border-gray-700 shadow-sm hidden sm:block">
                        <img src={firstImage} alt={analysis.productName || "Product"} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
