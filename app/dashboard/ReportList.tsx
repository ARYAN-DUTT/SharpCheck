"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportList({ initialReports }: { initialReports: any[] }) {
  const [reports, setReports] = useState(initialReports);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'compliant' | 'non-compliant'>('all');
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this scan?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/report/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReports(reports.filter(r => r.id !== id));
        router.refresh();
      } else {
        alert('Failed to delete report');
      }
    } catch (err) {
      alert('Error deleting report');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReports = reports.filter(report => {
    if (activeTab === 'compliant') return report.isCompliant;
    if (activeTab === 'non-compliant') return !report.isCompliant;
    return true;
  });

  return (
    <div>
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-2 px-4 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'all' ? 'border-[var(--color-primary-blue)] text-[var(--color-primary-blue)] dark:text-[#93C5FD]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          All History
        </button>
        <button
          onClick={() => setActiveTab('compliant')}
          className={`py-2 px-4 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'compliant' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          Compliant
        </button>
        <button
          onClick={() => setActiveTab('non-compliant')}
          className={`py-2 px-4 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'non-compliant' ? 'border-red-500 text-red-600 dark:text-red-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
          Non-Compliant
        </button>
      </div>

      {filteredReports.length === 0 ? (
        <div className="text-center bg-white dark:bg-[#1E293B] p-10 rounded-[1.5rem] border-[3px] border-[var(--color-border-dashed)] dark:border-[#475569]">
          <p className="text-lg text-gray-500 dark:text-gray-400">
            {activeTab === 'all' ? "You haven't checked any products yet." : `No ${activeTab} products found.`}
          </p>
          {activeTab === 'all' && (
            <Link href="/" className="mt-4 inline-block text-[var(--color-primary-blue)] font-semibold hover:underline">
              Start your first check
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredReports.map((report) => {
            let parameters: any[] = [];
            try {
              parameters = JSON.parse(report.missingFields || "[]");
            } catch (e) { }

            let parsedImageUrls: string[] = [];
            if (report.imageUrl) {
              try {
                parsedImageUrls = JSON.parse(report.imageUrl);
              } catch (e) {
                if (report.imageUrl.startsWith('data:image')) {
                  parsedImageUrls = [report.imageUrl];
                }
              }
            }
            const firstImage = parsedImageUrls.length > 0 ? parsedImageUrls[0] : null;

            const isOldFormat = parameters.length > 0 && typeof parameters[0] === 'string';

            let totalParameters = 6;
            let compliantParameters = 0;

            if (isOldFormat) {
              compliantParameters = 6 - parameters.length;
            } else if (parameters.length > 0) {
              const applicableParams = parameters.filter(p => p.status !== 'Not Applicable');
              totalParameters = applicableParams.length;
              compliantParameters = applicableParams.filter(p => p.status === 'Compliant').length;
            } else {
              totalParameters = 9;
              compliantParameters = report.isCompliant ? 9 : 0;
            }

            let colorClass = "bg-green-500";
            let textClass = "text-green-600 dark:text-green-400";
            if (compliantParameters < totalParameters / 2) {
              colorClass = "bg-red-500";
              textClass = "text-red-600 dark:text-red-400";
            } else if (compliantParameters < totalParameters) {
              colorClass = "bg-orange-500";
              textClass = "text-orange-500 dark:text-orange-400";
            }

            return (
              <Link key={report.id} href={`/report/${report.id}`} className="block transition-transform hover:-translate-y-1 relative group">
                <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border-[2px] border-gray-100 dark:border-[#475569] shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`h-3 w-3 rounded-full ${colorClass}`}></div>
                      <h2 className={`text-xl font-bold ${textClass}`}>
                        {compliantParameters}/{totalParameters} Compliant
                      </h2>
                    </div>
                    {report.productName && (
                      <p className="text-md font-semibold text-[var(--color-dark-blue)] dark:text-[#E2E8F0] mb-1">
                        {report.productName}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">ID: {report.id}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{new Date(report.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4 text-gray-400">
                    <button
                      onClick={(e) => handleDelete(e, report.id)}
                      disabled={deletingId === report.id}
                      className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-all disabled:opacity-50"
                      aria-label="Delete scan"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    {firstImage && (
                      <div className="w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-100 dark:border-gray-700 shadow-sm hidden sm:block">
                        <img src={firstImage} alt={report.productName || "Product"} className="w-full h-full object-cover" />
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
