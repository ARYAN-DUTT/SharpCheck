import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DarkModeToggle } from '../ThemeContext';

export default async function HistoryPage() {
  const session = await getSession();

  if (!session) {
    redirect('/Login');
  }

  const reports = await prisma.complianceReport.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] transition-colors duration-300 bg-[var(--color-bg-page)] dark:bg-[#0F172A] text-[var(--color-dark-blue)] dark:text-[#E2E8F0]">
      {/* ─── Header / Navbar ─── */}
      <header className="flex items-center justify-between py-4 px-6 md:px-8 transition-colors duration-300 bg-[var(--color-light-blue)] dark:bg-[#1E293B] shadow-sm">
        <Link href="/" className="text-2xl md:text-3xl font-[family-name:var(--font-pacifico)] text-[var(--color-dark-blue)] dark:text-[#93C5FD]">
          NavDrishti
        </Link>
        <Link href="/" className="bg-[var(--color-primary-blue)] text-white px-4 py-2 rounded-lg text-sm md:text-base hover:brightness-110 transition-all font-medium shadow-sm cursor-pointer">
          &larr; Back to Home
        </Link>
      </header>

      {/* ─── Main content ─── */}
      <main className="flex-1 flex flex-col items-center py-10 px-4 md:px-0">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-dark-blue)] dark:text-[#E2E8F0] tracking-tight mb-8">
            Your Compliance Reports
          </h1>

          {reports.length === 0 ? (
            <div className="text-center bg-white dark:bg-[#1E293B] p-10 rounded-[1.5rem] border-[3px] border-[var(--color-border-dashed)] dark:border-[#475569]">
              <p className="text-lg text-gray-500 dark:text-gray-400">You haven't checked any products yet.</p>
              <Link href="/" className="mt-4 inline-block text-[var(--color-primary-blue)] font-semibold hover:underline">
                Start your first check
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {reports.map((report) => {
                let parameters: any[] = [];
                try {
                  parameters = JSON.parse(report.missingFields || "[]");
                } catch (e) {}

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
                  // Empty array but new format
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
                  <Link key={report.id} href={`/report/${report.id}`} className="block transition-transform hover:-translate-y-1">
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
                      <div className="text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </main>

      <DarkModeToggle />
    </div>
  );
}
